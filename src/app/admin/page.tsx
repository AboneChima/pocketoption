'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowLeft,
  Edit,
  Menu,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  Activity,
  AlertCircle,
  ChevronRight,
  Calendar,
  Wallet,
  Shield,
  Settings,
  Bell,
  LogOut
} from 'lucide-react'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  balance: number
  isAdmin: boolean
  kycStatus: string
  createdAt: string
}

interface Trade {
  id: string
  pair: string
  amount: number
  direction: string
  status: string
  profit?: number
  createdAt: string
  user: {
    email: string
  }
}

interface Deposit {
  id: string
  amount: number
  currency: string
  address: string
  status: string
  txHash?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
  user: {
    email: string
  }
}

interface Withdrawal {
  id: string
  amount: number
  currency: string
  walletAddress: string
  status: string
  adminNote?: string
  createdAt: string
  processedAt?: string
  user: {
    email: string
    firstName?: string
    lastName?: string
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'trades' | 'deposits' | 'withdrawals'>('overview')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [balanceUpdate, setBalanceUpdate] = useState<string>('')
  const [adminNote, setAdminNote] = useState<string>('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [adminEmail, setAdminEmail] = useState<string>('')
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)

  // Check admin authentication
  useEffect(() => {
    console.log('Admin page: Checking authentication...')
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    const storedEmail = localStorage.getItem('admin_email')
    
    console.log('Admin auth check:', {
      isAuthenticated,
      storedEmail,
      isTrue: isAuthenticated === 'true'
    })
    
    if (!isAuthenticated || isAuthenticated !== 'true') {
      console.log('Not authenticated, redirecting to login...')
      router.push('/admin/login')
      return
    }
    
    console.log('Authenticated! Loading admin panel...')
    
    if (storedEmail) {
      setAdminEmail(storedEmail)
    }
    
    setIsAuthChecking(false)
    fetchAdminData()
  }, [router])

  const fetchAdminData = async () => {
    setIsRefreshing(true)
    try {
      const [usersRes, tradesRes, depositsRes, withdrawalsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/trades'),
        fetch('/api/admin/deposits'),
        fetch('/api/admin/withdrawals', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ])

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(Array.isArray(data) ? data : Array.isArray(data.users) ? data.users : [])
      }

      if (tradesRes.ok) {
        const data = await tradesRes.json()
        setTrades(Array.isArray(data) ? data : Array.isArray(data.trades) ? data.trades : [])
      }

      if (depositsRes.ok) {
        const data = await depositsRes.json()
        setDeposits(Array.isArray(data) ? data : Array.isArray(data.deposits) ? data.deposits : [])
      }

      if (withdrawalsRes.ok) {
        const data = await withdrawalsRes.json()
        setWithdrawals(Array.isArray(data) ? data : Array.isArray(data.withdrawals) ? data.withdrawals : [])
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleUpdateBalance = async (userId: string, amount: number) => {
    try {
      const response = await fetch('/api/admin/users/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount }),
      })

      if (response.ok) {
        alert('Balance updated successfully')
        setBalanceUpdate('')
        setSelectedUser(null)
        fetchAdminData()
      } else {
        alert('Failed to update balance')
      }
    } catch (error) {
      console.error('Balance update error:', error)
      alert('Failed to update balance')
    }
  }

  const handleWithdrawalAction = async (withdrawalId: string, status: 'completed' | 'rejected') => {
    try {
      const response = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ withdrawalId, status, adminNote }),
      })

      if (response.ok) {
        alert(`Withdrawal ${status} successfully`)
        setSelectedWithdrawal(null)
        setAdminNote('')
        fetchAdminData()
      } else {
        const errorData = await response.json()
        alert(`Failed to ${status} withdrawal: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Withdrawal update error:', error)
      alert(`Failed to ${status} withdrawal`)
    }
  }

  const handleDepositAction = async (depositId: string, status: 'Confirmed' | 'Rejected') => {
    try {
      const response = await fetch('/api/admin/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depositId,
          status,
          adminNotes: status === 'Rejected' ? 'Rejected by admin' : 'Approved by admin'
        }),
      })

      if (response.ok) {
        alert(`Deposit ${status.toLowerCase()} successfully`)
        fetchAdminData()
      } else {
        const errorData = await response.json()
        alert(`Failed to ${status.toLowerCase()} deposit: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Deposit action error:', error)
      alert(`Failed to ${status.toLowerCase()} deposit`)
    }
  }

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#12192A] to-[#1A2332] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white mt-4 text-lg">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  const stats = {
    totalUsers: users.length,
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    totalTrades: trades.length,
    totalDeposits: deposits.reduce((sum, d) => sum + d.amount, 0),
    totalWithdrawals: withdrawals.reduce((sum, w) => sum + w.amount, 0),
    pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').length,
    pendingDeposits: deposits.filter(d => d.status === 'Pending' || d.status === 'PENDING').length,
    activeTrades: trades.filter(t => t.status === 'ACTIVE').length
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0F1419] flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen bg-gradient-to-b from-[#12192A] to-[#0F1419] border-r border-[#1e2435] transition-all duration-300 z-50 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#1e2435]">
            <div className="flex items-center justify-between">
              {isSidebarOpen && (
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">Management Dashboard</p>
                </div>
              )}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg bg-[#1e2435] hover:bg-[#252d42] transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Back to User Dashboard Button */}
          <div className="p-4 border-b border-[#1e2435]">
            <button
              onClick={() => router.push('/dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 bg-gradient-to-r from-green-500/20 to-emerald-600/10 border border-green-500/30 text-white hover:from-green-500/30 hover:to-emerald-600/20 ${
                !isSidebarOpen ? 'justify-center' : ''
              }`}
            >
              <ArrowLeft className="w-5 h-5 text-green-400" />
              {isSidebarOpen && <span className="font-medium">Back to Dashboard</span>}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3, color: 'blue' },
              { key: 'users', label: 'Users', icon: Users, color: 'purple' },
              { key: 'trades', label: 'Trades', icon: TrendingUp, color: 'green' },
              { key: 'deposits', label: 'Deposits', icon: DollarSign, color: 'yellow' },
              { key: 'withdrawals', label: 'Withdrawals', icon: TrendingDown, color: 'red' }
            ].map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  activeTab === key
                    ? `bg-gradient-to-r from-${color}-500/20 to-${color}-600/10 border border-${color}-500/30 text-white`
                    : 'text-gray-400 hover:text-white hover:bg-[#1e2435]'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === key ? `text-${color}-400` : ''}`} />
                {isSidebarOpen && <span className="font-medium">{label}</span>}
                {isSidebarOpen && activeTab === key && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-[#1e2435]">
            {isSidebarOpen ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{adminEmail || 'Admin'}</p>
                    <p className="text-xs text-blue-400">Administrator</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('admin_authenticated')
                    localStorage.removeItem('admin_email')
                    localStorage.removeItem('admin_login_time')
                    router.push('/admin/login')
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-full p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
                  <Shield className="w-5 h-5 mx-auto text-blue-400" />
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('admin_authenticated')
                    localStorage.removeItem('admin_email')
                    localStorage.removeItem('admin_login_time')
                    router.push('/admin/login')
                  }}
                  className="w-full p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all duration-300"
                >
                  <LogOut className="w-5 h-5 mx-auto" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#12192A]/95 backdrop-blur-xl border-b border-[#1e2435] shadow-lg">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg bg-[#1e2435] hover:bg-[#252d42] transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-400" />
                </button>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white capitalize">{activeTab}</h2>
                  <p className="text-sm text-gray-400 hidden sm:block">
                    {activeTab === 'overview' && 'Platform statistics and insights'}
                    {activeTab === 'users' && 'Manage user accounts and balances'}
                    {activeTab === 'trades' && 'Monitor trading activity'}
                    {activeTab === 'deposits' && 'Review and approve deposits'}
                    {activeTab === 'withdrawals' && 'Process withdrawal requests'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 sm:p-2.5 rounded-xl bg-[#1e2435] hover:bg-[#252d42] transition-colors relative"
                  >
                    <Bell className="w-5 h-5 text-gray-400" />
                    {(stats.pendingDeposits + stats.pendingWithdrawals) > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse">
                        {stats.pendingDeposits + stats.pendingWithdrawals}
                      </span>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-[#12192A] border border-[#1e2435] rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-[#1e2435]">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {stats.pendingDeposits + stats.pendingWithdrawals} pending actions
                        </p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {stats.pendingDeposits > 0 && (
                          <button
                            onClick={() => {
                              setActiveTab('deposits')
                              setShowNotifications(false)
                            }}
                            className="w-full p-4 hover:bg-[#1e2435] transition-colors text-left border-b border-[#1e2435]"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <DollarSign className="w-5 h-5 text-yellow-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white">Pending Deposits</p>
                                <p className="text-xs text-gray-400">{stats.pendingDeposits} deposits awaiting approval</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </button>
                        )}
                        {stats.pendingWithdrawals > 0 && (
                          <button
                            onClick={() => {
                              setActiveTab('withdrawals')
                              setShowNotifications(false)
                            }}
                            className="w-full p-4 hover:bg-[#1e2435] transition-colors text-left border-b border-[#1e2435]"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-red-500/20 rounded-lg">
                                <TrendingDown className="w-5 h-5 text-red-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white">Pending Withdrawals</p>
                                <p className="text-xs text-gray-400">{stats.pendingWithdrawals} withdrawals need processing</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </button>
                        )}
                        {(stats.pendingDeposits + stats.pendingWithdrawals) === 0 && (
                          <div className="p-8 text-center">
                            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-sm text-gray-400">No pending notifications</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={fetchAdminData}
                  disabled={isRefreshing}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#1e2435] hover:bg-[#252d42] transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl text-blue-400 hover:border-blue-500/50 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid - Full Width */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-8 h-8 text-blue-400" />
                      </div>
                      <Activity className="w-5 h-5 text-blue-400/50" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</p>
                    <p className="text-sm text-gray-400">Total Users</p>
                    <div className="mt-3 pt-3 border-t border-blue-500/20">
                      <p className="text-xs text-blue-400">+12% this month</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent backdrop-blur-xl rounded-2xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-green-500/20 group-hover:scale-110 transition-transform duration-300">
                        <Wallet className="w-8 h-8 text-green-400" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-400/50" />
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{formatCurrency(stats.totalBalance)}</p>
                    <p className="text-sm text-gray-400">Total Balance</p>
                    <div className="mt-3 pt-3 border-t border-green-500/20">
                      <p className="text-xs text-green-400">Platform liquidity</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                        <BarChart3 className="w-8 h-8 text-purple-400" />
                      </div>
                      {stats.activeTrades > 0 && (
                        <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium animate-pulse">
                          {stats.activeTrades} live
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{stats.totalTrades}</p>
                    <p className="text-sm text-gray-400">Total Trades</p>
                    <div className="mt-3 pt-3 border-t border-purple-500/20">
                      <p className="text-xs text-purple-400">Trading volume</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:scale-105 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-yellow-500/20 group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="w-8 h-8 text-yellow-400" />
                      </div>
                      {stats.pendingDeposits > 0 && (
                        <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium animate-pulse">
                          {stats.pendingDeposits}
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{formatCurrency(stats.totalDeposits)}</p>
                    <p className="text-sm text-gray-400">Total Deposits</p>
                    <div className="mt-3 pt-3 border-t border-yellow-500/20">
                      <p className="text-xs text-yellow-400">Incoming funds</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-500/10 via-pink-500/5 to-transparent backdrop-blur-xl rounded-2xl p-6 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:scale-105 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-red-500/20 group-hover:scale-110 transition-transform duration-300">
                        <TrendingDown className="w-8 h-8 text-red-400" />
                      </div>
                      {stats.pendingWithdrawals > 0 && (
                        <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium animate-pulse">
                          {stats.pendingWithdrawals}
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{formatCurrency(stats.totalWithdrawals)}</p>
                    <p className="text-sm text-gray-400">Total Withdrawals</p>
                    <div className="mt-3 pt-3 border-t border-red-500/20">
                      <p className="text-xs text-red-400">Outgoing funds</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] overflow-hidden">
                  <div className="p-6 border-b border-[#1e2435]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Activity className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                          <p className="text-sm text-gray-400">Latest platform transactions</p>
                        </div>
                      </div>
                      <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View All</button>
                    </div>
                  </div>
                  <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                    {(() => {
                      // Combine all activities
                      const allActivities = [
                        ...trades.map(t => ({ ...t, type: 'trade', timestamp: t.createdAt })),
                        ...deposits.map(d => ({ ...d, type: 'deposit', timestamp: d.createdAt })),
                        ...withdrawals.map(w => ({ ...w, type: 'withdrawal', timestamp: w.createdAt }))
                      ]
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 10)

                      if (allActivities.length === 0) {
                        return (
                          <div className="text-center py-12">
                            <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg mb-2">No recent activity</p>
                            <p className="text-gray-500 text-sm">Platform activity will appear here</p>
                          </div>
                        )
                      }

                      return allActivities.map((activity: any) => (
                        <div key={activity.id} className="flex items-center justify-between p-4 bg-[#1e2435]/50 rounded-xl hover:bg-[#1e2435] transition-all duration-300 group">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              activity.type === 'deposit' ? 'bg-green-500/20' :
                              activity.type === 'withdrawal' ? 'bg-red-500/20' :
                              activity.status === 'WON' ? 'bg-green-500/20' :
                              activity.status === 'LOST' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                            }`}>
                              {activity.type === 'deposit' ? <DollarSign className="w-5 h-5 text-green-400" /> :
                               activity.type === 'withdrawal' ? <TrendingDown className="w-5 h-5 text-red-400" /> :
                               activity.status === 'WON' ? <TrendingUp className="w-5 h-5 text-green-400" /> :
                               activity.status === 'LOST' ? <TrendingDown className="w-5 h-5 text-red-400" /> :
                               <Clock className="w-5 h-5 text-yellow-400" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {activity.type === 'trade' ? activity.pair : 
                                 activity.type === 'deposit' ? `Deposit ${activity.currency}` :
                                 `Withdrawal ${activity.currency}`}
                              </p>
                              <p className="text-xs text-gray-400">{activity.user?.email || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">{formatCurrency(activity.amount)}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              activity.type === 'deposit' ? 'bg-green-500/20 text-green-400' :
                              activity.type === 'withdrawal' ? 'bg-red-500/20 text-red-400' :
                              activity.status === 'WON' ? 'bg-green-500/20 text-green-400' :
                              activity.status === 'LOST' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {activity.type === 'trade' ? activity.status : activity.type.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                </div>

                {/* Pending Actions */}
                <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] overflow-hidden">
                  <div className="p-6 border-b border-[#1e2435]">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-yellow-500/10">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Pending Actions</h3>
                        <p className="text-sm text-gray-400">Requires attention</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/5 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 cursor-pointer"
                         onClick={() => setActiveTab('deposits')}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-5 h-5 text-yellow-400" />
                          <span className="text-sm font-medium text-white">Pending Deposits</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-2xl font-bold text-yellow-400">{stats.pendingDeposits}</p>
                      <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/5 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300 cursor-pointer"
                         onClick={() => setActiveTab('withdrawals')}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <TrendingDown className="w-5 h-5 text-red-400" />
                          <span className="text-sm font-medium text-white">Pending Withdrawals</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-2xl font-bold text-red-400">{stats.pendingWithdrawals}</p>
                      <p className="text-xs text-gray-400 mt-1">Needs processing</p>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/5 rounded-xl border border-purple-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5 text-purple-400" />
                          <span className="text-sm font-medium text-white">Active Trades</span>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-purple-400">{stats.activeTrades}</p>
                      <p className="text-xs text-gray-400 mt-1">Currently running</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Health & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Health */}
                <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] overflow-hidden">
                  <div className="p-6 border-b border-[#1e2435]">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Activity className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">System Health</h3>
                        <p className="text-sm text-gray-400">Platform status</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#1e2435]/50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-sm text-gray-300">API Status</span>
                      </div>
                      <span className="text-sm font-medium text-green-400">Operational</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#1e2435]/50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-sm text-gray-300">Database</span>
                      </div>
                      <span className="text-sm font-medium text-green-400">Connected</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#1e2435]/50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-sm text-gray-300">Trading Engine</span>
                      </div>
                      <span className="text-sm font-medium text-green-400">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#1e2435]/50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                        <span className="text-sm text-gray-300">Active Users</span>
                      </div>
                      <span className="text-sm font-medium text-blue-400">{users.length} online</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] overflow-hidden">
                  <div className="p-6 border-b border-[#1e2435]">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Settings className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                        <p className="text-sm text-gray-400">Common tasks</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl text-white hover:border-blue-500/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span className="font-medium">Manage Users</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </button>
                    <button
                      onClick={() => setActiveTab('deposits')}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl text-white hover:border-green-500/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <div className="text-left">
                          <p className="font-medium">Review Deposits</p>
                          {stats.pendingDeposits > 0 && (
                            <p className="text-xs text-green-400">{stats.pendingDeposits} pending</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" />
                    </button>
                    <button
                      onClick={() => setActiveTab('withdrawals')}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-xl text-white hover:border-red-500/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-3">
                        <TrendingDown className="w-5 h-5 text-red-400" />
                        <div className="text-left">
                          <p className="font-medium">Process Withdrawals</p>
                          {stats.pendingWithdrawals > 0 && (
                            <p className="text-xs text-red-400">{stats.pendingWithdrawals} pending</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
                    </button>
                    <button
                      onClick={() => setActiveTab('trades')}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl text-white hover:border-purple-500/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                        <div className="text-left">
                          <p className="font-medium">View Trades</p>
                          {stats.activeTrades > 0 && (
                            <p className="text-xs text-purple-400">{stats.activeTrades} active</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Platform Statistics */}
              <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] overflow-hidden">
                <div className="p-6 border-b border-[#1e2435]">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Platform Statistics</h3>
                      <p className="text-sm text-gray-400">Key performance metrics</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-[#1e2435]/50 rounded-xl">
                      <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                      <p className="text-2xl font-bold text-green-400">
                        {trades.length > 0 
                          ? ((trades.filter(t => t.status === 'WON').length / trades.length) * 100).toFixed(1)
                          : '0'}%
                      </p>
                    </div>
                    <div className="p-4 bg-[#1e2435]/50 rounded-xl">
                      <p className="text-xs text-gray-400 mb-1">Avg Trade</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {trades.length > 0
                          ? formatCurrency(trades.reduce((sum, t) => sum + t.amount, 0) / trades.length)
                          : '$0'}
                      </p>
                    </div>
                    <div className="p-4 bg-[#1e2435]/50 rounded-xl">
                      <p className="text-xs text-gray-400 mb-1">Avg Balance</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {users.length > 0
                          ? formatCurrency(stats.totalBalance / users.length)
                          : '$0'}
                      </p>
                    </div>
                    <div className="p-4 bg-[#1e2435]/50 rounded-xl">
                      <p className="text-xs text-gray-400 mb-1">Total Volume</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {formatCurrency(trades.reduce((sum, t) => sum + t.amount, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Users */}
              <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] overflow-hidden">
                <div className="p-6 border-b border-[#1e2435]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Recent Users</h3>
                        <p className="text-sm text-gray-400">Latest registrations</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('users')}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {users.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No users registered yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-4 bg-[#1e2435]/50 rounded-xl hover:bg-[#1e2435] transition-all duration-300">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {user.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{user.email}</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-green-400">{formatCurrency(user.balance)}</p>
                              {user.isAdmin && (
                                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                                  Admin
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search and Filter Bar */}
              <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users by email or name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#1e2435] border border-[#252d42] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center space-x-2 px-4 py-3 bg-[#1e2435] border border-[#252d42] rounded-xl text-gray-400 hover:text-white hover:border-blue-500 transition-all duration-300">
                      <Filter className="w-5 h-5" />
                      <span className="hidden sm:inline">Filter</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl text-green-400 hover:border-green-500/50 transition-all duration-300">
                      <Download className="w-5 h-5" />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] hover:border-blue-500/30 transition-all duration-300 overflow-hidden group">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-lg">
                              {user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{user.email}</p>
                            <p className="text-xs text-gray-400">
                              {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : 'No name'}
                            </p>
                          </div>
                        </div>
                        {user.isAdmin && (
                          <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
                            Admin
                          </span>
                        )}
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between p-3 bg-[#1e2435]/50 rounded-lg">
                          <span className="text-sm text-gray-400">Balance</span>
                          <span className="text-lg font-bold text-green-400">{formatCurrency(user.balance)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#1e2435]/50 rounded-lg">
                          <span className="text-sm text-gray-400">KYC Status</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.kycStatus === 'verified' ? 'bg-green-500/20 text-green-400' :
                            user.kycStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {user.kycStatus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#1e2435]/50 rounded-lg">
                          <span className="text-sm text-gray-400">Joined</span>
                          <span className="text-sm text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all duration-300"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button className="px-4 py-2 bg-[#1e2435] border border-[#252d42] rounded-lg text-gray-400 hover:text-white hover:border-blue-500/30 transition-all duration-300">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trades Tab */}
          {activeTab === 'trades' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Trading History</h3>
                  <p className="text-sm text-gray-400 mt-1">Monitor all platform trades</p>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl text-green-400 hover:border-green-500/50 transition-all duration-300">
                  <Download className="w-5 h-5" />
                  <span>Export</span>
                </button>
              </div>

              <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1e2435]/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Pair</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Direction</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Profit/Loss</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2435]">
                      {trades.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center">
                            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg mb-2">No trades yet</p>
                            <p className="text-gray-500 text-sm">Trading activity will appear here</p>
                          </td>
                        </tr>
                      ) : (
                        trades.slice(0, 50).map((trade) => (
                          <tr key={trade.id} className="hover:bg-[#1e2435]/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-white font-medium">{trade.pair}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-400">{trade.user?.email || 'Unknown'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                trade.direction === 'up' || trade.direction === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {trade.direction === 'up' ? 'BUY' : trade.direction === 'down' ? 'SELL' : trade.direction}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-white font-medium">{formatCurrency(trade.amount)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {trade.profit !== undefined && trade.profit !== null ? (
                                <span className={`font-medium ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {trade.profit >= 0 ? '+' : ''}{formatCurrency(trade.profit)}
                                </span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                trade.status?.toUpperCase() === 'WON' || trade.status?.toLowerCase() === 'win' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                trade.status?.toUpperCase() === 'LOST' || trade.status?.toLowerCase() === 'loss' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                trade.status?.toUpperCase() === 'ACTIVE' || trade.status?.toLowerCase() === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              }`}>
                                {trade.status?.toUpperCase() || 'PENDING'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-400">{new Date(trade.createdAt).toLocaleString()}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Deposits Tab */}
          {activeTab === 'deposits' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Deposit Requests</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    <span className="text-yellow-400 font-medium">{stats.pendingDeposits}</span> pending approval
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {deposits.slice(0, 50).map((deposit) => (
                  <div key={deposit.id} className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] hover:border-green-500/30 transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{deposit.user.email}</p>
                            <p className="text-xs text-gray-400">{new Date(deposit.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          deposit.status === 'Confirmed' || deposit.status === 'COMPLETED'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          deposit.status === 'Pending' || deposit.status === 'PENDING'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {deposit.status}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between p-3 bg-[#1e2435]/50 rounded-lg">
                          <span className="text-sm text-gray-400">Amount</span>
                          <span className="text-xl font-bold text-green-400">{formatCurrency(deposit.amount)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#1e2435]/50 rounded-lg">
                          <span className="text-sm text-gray-400">Currency</span>
                          <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                            {deposit.currency}
                          </span>
                        </div>
                        {deposit.address && (
                          <div className="p-3 bg-[#1e2435]/50 rounded-lg">
                            <p className="text-xs text-gray-400 mb-1">Address</p>
                            <p className="text-xs text-white break-all font-mono">{deposit.address}</p>
                          </div>
                        )}
                        {deposit.txHash && (
                          <div className="p-3 bg-[#1e2435]/50 rounded-lg">
                            <p className="text-xs text-gray-400 mb-1">Transaction Hash</p>
                            <p className="text-xs text-white break-all font-mono">{deposit.txHash}</p>
                          </div>
                        )}
                      </div>

                      {(deposit.status === 'Pending' || deposit.status === 'PENDING') && (
                        <div className="flex gap-2 pt-4 border-t border-[#1e2435]">
                          <button
                            onClick={() => handleDepositAction(deposit.id, 'Confirmed')}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/20 transition-all duration-300"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleDepositAction(deposit.id, 'Rejected')}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all duration-300"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Withdrawals Tab */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Withdrawal Requests</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    <span className="text-red-400 font-medium">{stats.pendingWithdrawals}</span> pending processing
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] hover:border-red-500/30 transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center">
                            <TrendingDown className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{withdrawal.user.email}</p>
                            <p className="text-xs text-gray-400">{new Date(withdrawal.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          withdrawal.status === 'completed'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          withdrawal.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between p-3 bg-[#1e2435]/50 rounded-lg">
                          <span className="text-sm text-gray-400">Amount</span>
                          <span className="text-xl font-bold text-red-400">{formatCurrency(withdrawal.amount)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#1e2435]/50 rounded-lg">
                          <span className="text-sm text-gray-400">Currency</span>
                          <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                            {withdrawal.currency}
                          </span>
                        </div>
                        <div className="p-3 bg-[#1e2435]/50 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">Wallet Address</p>
                          <p className="text-xs text-white break-all font-mono">{withdrawal.walletAddress}</p>
                        </div>
                        {withdrawal.adminNote && (
                          <div className="p-3 bg-[#1e2435]/50 rounded-lg">
                            <p className="text-xs text-gray-400 mb-1">Admin Note</p>
                            <p className="text-xs text-white">{withdrawal.adminNote}</p>
                          </div>
                        )}
                      </div>

                      {withdrawal.status === 'pending' && (
                        <div className="flex gap-2 pt-4 border-t border-[#1e2435]">
                          <button
                            onClick={() => setSelectedWithdrawal(withdrawal)}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all duration-300"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Process</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Balance Update Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-[#12192A] to-[#0F1419] rounded-2xl p-6 w-full max-w-md border border-[#252d42] shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Update User Balance</h3>
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setBalanceUpdate('')
                }}
                className="p-2 rounded-lg bg-[#1e2435] hover:bg-[#252d42] transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-[#1e2435]/50 rounded-xl border border-[#252d42]">
                <p className="text-sm text-gray-400 mb-1">User</p>
                <p className="text-white font-medium">{selectedUser.email}</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/5 rounded-xl border border-green-500/20">
                <p className="text-sm text-gray-400 mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(selectedUser.balance)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">New Balance</label>
                <input
                  type="number"
                  value={balanceUpdate}
                  onChange={(e) => setBalanceUpdate(e.target.value)}
                  placeholder="Enter new balance"
                  className="w-full px-4 py-3 bg-[#1e2435] border border-[#252d42] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedUser(null)
                    setBalanceUpdate('')
                  }}
                  className="flex-1 px-4 py-3 bg-[#1e2435] border border-[#252d42] rounded-xl text-gray-400 hover:text-white hover:border-gray-400 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateBalance(selectedUser.id, parseFloat(balanceUpdate))}
                  disabled={!balanceUpdate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Balance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Process Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-[#12192A] to-[#0F1419] rounded-2xl p-6 w-full max-w-md border border-[#252d42] shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Process Withdrawal</h3>
              <button
                onClick={() => {
                  setSelectedWithdrawal(null)
                  setAdminNote('')
                }}
                className="p-2 rounded-lg bg-[#1e2435] hover:bg-[#252d42] transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-[#1e2435]/50 rounded-xl border border-[#252d42] space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">User</span>
                  <span className="text-white font-medium">{selectedWithdrawal.user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Amount</span>
                  <span className="text-xl font-bold text-red-400">{formatCurrency(selectedWithdrawal.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Currency</span>
                  <span className="text-white">{selectedWithdrawal.currency}</span>
                </div>
                <div className="pt-3 border-t border-[#252d42]">
                  <p className="text-xs text-gray-400 mb-1">Wallet Address</p>
                  <p className="text-xs text-white break-all font-mono">{selectedWithdrawal.walletAddress}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Admin Note (Optional)</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add a note about this withdrawal..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#1e2435] border border-[#252d42] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
              <div className="flex flex-col space-y-2 pt-4">
                <button
                  onClick={() => handleWithdrawalAction(selectedWithdrawal.id, 'completed')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Approve & Complete</span>
                </button>
                <button
                  onClick={() => handleWithdrawalAction(selectedWithdrawal.id, 'rejected')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl text-white font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedWithdrawal(null)
                    setAdminNote('')
                  }}
                  className="w-full px-4 py-3 bg-[#1e2435] border border-[#252d42] rounded-xl text-gray-400 hover:text-white hover:border-gray-400 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
