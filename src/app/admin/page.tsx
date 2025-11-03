'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Settings,
  ArrowLeft,
  Edit,
  Trash2,
  Menu,
  X
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
  method: string
  status: string
  createdAt: string
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
  const { user, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'trades' | 'deposits' | 'withdrawals'>('users')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [balanceUpdate, setBalanceUpdate] = useState<string>('')
  const [adminNote, setAdminNote] = useState<string>('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/dashboard')
      return
    }

    if (user?.isAdmin) {
      fetchAdminData()
    }
  }, [user, loading, router])

  const fetchAdminData = async () => {
    try {
      // Fetch users
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users)
      }

      // Fetch trades
      const tradesResponse = await fetch('/api/admin/trades')
      if (tradesResponse.ok) {
        const tradesData = await tradesResponse.json()
        setTrades(tradesData.trades)
      }

      // Fetch deposits
      const depositsResponse = await fetch('/api/admin/deposits')
      if (depositsResponse.ok) {
        const depositsData = await depositsResponse.json()
        setDeposits(depositsData.deposits)
      }

      // Fetch withdrawals
      const withdrawalsResponse = await fetch('/api/admin/withdrawals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (withdrawalsResponse.ok) {
        const withdrawalsData = await withdrawalsResponse.json()
        setWithdrawals(withdrawalsData.withdrawals)
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    }
  }

  const handleUpdateBalance = async (userId: string, amount: number) => {
    try {
      const response = await fetch('/api/admin/users/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount
        }),
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
        body: JSON.stringify({
          withdrawalId,
          status,
          adminNote
        }),
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

  const updateWithdrawalStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedWithdrawal) return

    try {
      const response = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          withdrawalId: selectedWithdrawal.id,
          status,
          adminNote
        }),
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          depositId,
          status,
          adminNotes: status === 'Rejected' ? 'Rejected by admin' : 'Approved by admin'
        }),
      })

      if (response.ok) {
        alert(`Deposit ${status.toLowerCase()} successfully`)
        fetchAdminData() // Refresh the data
      } else {
        const errorData = await response.json()
        alert(`Failed to ${status.toLowerCase()} deposit: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Deposit action error:', error)
      alert(`Failed to ${status.toLowerCase()} deposit`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user?.isAdmin) {
    return null
  }

  const stats = {
    totalUsers: users.length,
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    totalTrades: trades.length,
    totalDeposits: deposits.reduce((sum, d) => sum + d.amount, 0),
    totalWithdrawals: withdrawals.reduce((sum, w) => sum + w.amount, 0),
    pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Mobile Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-white border-white/30 hover:bg-white/10 hidden sm:flex"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              
              {/* Mobile back button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-white border-white/30 hover:bg-white/10 sm:hidden p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Panel</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-white text-right hidden sm:block">
                <p className="text-sm opacity-80">Admin</p>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>
              
              {/* Mobile menu button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white border-white/30 hover:bg-white/10 sm:hidden p-2"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm sm:hidden">
          <div className="fixed top-16 left-0 right-0 bg-gray-900 border-b border-white/20 p-4">
            <div className="text-white text-center mb-4">
              <p className="text-sm opacity-80">Admin</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
            
            {/* Mobile Tab Navigation */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'users', label: 'Users', icon: Users },
                { key: 'trades', label: 'Trades', icon: TrendingUp },
                { key: 'deposits', label: 'Deposits', icon: DollarSign },
                { key: 'withdrawals', label: 'Withdrawals', icon: TrendingDown }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key as any)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${
                    activeTab === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards - Mobile Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-6 border border-white/20">
            <div className="flex items-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              <div className="ml-2 sm:ml-4">
                <p className="text-white/60 text-xs sm:text-sm">Users</p>
                <p className="text-lg sm:text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-6 border border-white/20">
            <div className="flex items-center">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              <div className="ml-2 sm:ml-4">
                <p className="text-white/60 text-xs sm:text-sm">Balance</p>
                <p className="text-sm sm:text-2xl font-bold text-white">{formatCurrency(stats.totalBalance)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-6 border border-white/20">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              <div className="ml-2 sm:ml-4">
                <p className="text-white/60 text-xs sm:text-sm">Trades</p>
                <p className="text-lg sm:text-2xl font-bold text-white">{stats.totalTrades}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-6 border border-white/20">
            <div className="flex items-center">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              <div className="ml-2 sm:ml-4">
                <p className="text-white/60 text-xs sm:text-sm">Deposits</p>
                <p className="text-sm sm:text-2xl font-bold text-white">{formatCurrency(stats.totalDeposits)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-6 border border-white/20 col-span-2 sm:col-span-1">
            <div className="flex items-center">
              <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
              <div className="ml-2 sm:ml-4">
                <p className="text-white/60 text-xs sm:text-sm">Pending</p>
                <p className="text-lg sm:text-2xl font-bold text-white">{stats.pendingWithdrawals}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden sm:flex bg-white/10 backdrop-blur-md rounded-xl p-2 mb-6 border border-white/20">
          {[
            { key: 'users', label: 'Users Management', icon: Users },
            { key: 'trades', label: 'Trades History', icon: TrendingUp },
            { key: 'deposits', label: 'Deposits', icon: DollarSign },
            { key: 'withdrawals', label: 'Withdrawals', icon: TrendingDown }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors flex-1 justify-center ${
                activeTab === key
                  ? 'bg-blue-600 text-white'
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Mobile Tab Indicator */}
        <div className="sm:hidden mb-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
            <div className="flex items-center justify-center space-x-2">
              {activeTab === 'users' && <Users className="w-5 h-5 text-blue-400" />}
              {activeTab === 'trades' && <TrendingUp className="w-5 h-5 text-purple-400" />}
              {activeTab === 'deposits' && <DollarSign className="w-5 h-5 text-green-400" />}
              {activeTab === 'withdrawals' && <TrendingDown className="w-5 h-5 text-red-400" />}
              <span className="text-white font-medium capitalize">{activeTab}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="p-4 sm:p-6">
            {/* Users Tab - Mobile Responsive */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Users Management</h3>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="bg-white/5 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm sm:text-base">{user.email}</p>
                          <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-white/60 mt-1">
                            <span>Balance: {formatCurrency(user.balance)}</span>
                            <span>•</span>
                            <span>KYC: {user.kycStatus}</span>
                            <span>•</span>
                            <span>{user.isAdmin ? 'Admin' : 'User'}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10 text-xs sm:text-sm"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trades Tab - Mobile Responsive */}
            {activeTab === 'trades' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Trades</h3>
                <div className="space-y-3">
                  {trades.slice(0, 20).map((trade) => (
                    <div key={trade.id} className="bg-white/5 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm sm:text-base">{trade.pair}</p>
                          <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-white/60 mt-1">
                            <span>{trade.user.email}</span>
                            <span>•</span>
                            <span>{trade.direction}</span>
                            <span>•</span>
                            <span>{formatCurrency(trade.amount)}</span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className={`font-medium text-sm sm:text-base ${
                            trade.status === 'WON' ? 'text-green-400' : 
                            trade.status === 'LOST' ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {trade.status}
                          </p>
                          {trade.profit !== undefined && (
                            <p className="text-white/60 text-xs sm:text-sm">
                              {trade.profit >= 0 ? '+' : ''}{formatCurrency(trade.profit)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deposits Tab - Mobile Responsive */}
            {activeTab === 'deposits' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Deposits</h3>
                <div className="space-y-3">
                  {deposits.slice(0, 20).map((deposit) => (
                    <div key={deposit.id} className="bg-white/5 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm sm:text-base">{deposit.user.email}</p>
                            <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-white/60 mt-1">
                              <span>{deposit.currency || deposit.method}</span>
                              <span>•</span>
                              <span>{formatCurrency(deposit.amount)}</span>
                            </div>
                            {deposit.address && (
                              <p className="text-white/60 text-xs mt-1 break-all">
                                Address: {deposit.address}
                              </p>
                            )}
                          </div>
                          <div className="text-left sm:text-right">
                            <p className={`font-medium text-sm sm:text-base ${
                              deposit.status === 'Confirmed' || deposit.status === 'COMPLETED' ? 'text-green-400' : 
                              deposit.status === 'Pending' || deposit.status === 'PENDING' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {deposit.status}
                            </p>
                            <p className="text-white/60 text-xs sm:text-sm">
                              {new Date(deposit.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {(deposit.status === 'Pending' || deposit.status === 'PENDING') && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDepositAction(deposit.id, 'Confirmed')}
                              className="text-green-400 border-green-400/30 hover:bg-green-400/10 flex-1 sm:flex-none"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDepositAction(deposit.id, 'Rejected')}
                              className="text-red-400 border-red-400/30 hover:bg-red-400/10 flex-1 sm:flex-none"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Withdrawals Tab - Mobile Responsive */}
            {activeTab === 'withdrawals' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Withdrawal Requests</h3>
                <div className="space-y-3">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="bg-white/5 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm sm:text-base">{withdrawal.user.email}</p>
                            <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-white/60 mt-1">
                              <span>{withdrawal.currency}</span>
                              <span>•</span>
                              <span>{formatCurrency(withdrawal.amount)}</span>
                            </div>
                            <p className="text-white/60 text-xs mt-1 break-all">
                              {withdrawal.walletAddress}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className={`font-medium text-sm sm:text-base ${
                              withdrawal.status === 'completed' ? 'text-green-400' : 
                              withdrawal.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                            </p>
                            <p className="text-white/60 text-xs sm:text-sm">
                              {new Date(withdrawal.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {withdrawal.status === 'pending' && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedWithdrawal(withdrawal)}
                              className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10 flex-1 sm:flex-none"
                            >
                              Process
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Balance Update Modal - Mobile Responsive */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-md border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Edit User Balance</h3>
            <div className="space-y-4">
              <div>
                <p className="text-white/60 text-sm">User: {selectedUser.email}</p>
                <p className="text-white/60 text-sm">Current Balance: {formatCurrency(selectedUser.balance)}</p>
              </div>
              <Input
                label="New Balance"
                type="number"
                value={balanceUpdate}
                onChange={(e) => setBalanceUpdate(e.target.value)}
                placeholder="Enter new balance"
              />
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(null)
                    setBalanceUpdate('')
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateBalance(selectedUser.id, parseFloat(balanceUpdate))}
                  className="flex-1"
                  disabled={!balanceUpdate}
                >
                  Update Balance
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Process Modal - Mobile Responsive */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-md border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Process Withdrawal</h3>
            <div className="space-y-4">
              <div className="text-sm text-white/60 space-y-1">
                <p>User: {selectedWithdrawal.user.email}</p>
                <p>Amount: {formatCurrency(selectedWithdrawal.amount)}</p>
                <p>Currency: {selectedWithdrawal.currency}</p>
                <p className="break-all">Address: {selectedWithdrawal.walletAddress}</p>
              </div>
              <Input
                label="Admin Note (Optional)"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add a note..."
              />
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => handleWithdrawalAction(selectedWithdrawal.id, 'completed')}
                  className="bg-green-600 hover:bg-green-700 w-full"
                >
                  Approve & Complete
                </Button>
                <Button
                  onClick={() => handleWithdrawalAction(selectedWithdrawal.id, 'rejected')}
                  className="bg-red-600 hover:bg-red-700 w-full"
                >
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedWithdrawal(null)
                    setAdminNote('')
                  }}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Review Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Review Withdrawal</h3>
            <div className="space-y-3 mb-6">
              <p className="text-gray-600">
                <span className="font-medium">User:</span> {selectedWithdrawal.user.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Amount:</span> {formatCurrency(selectedWithdrawal.amount)} {selectedWithdrawal.currency}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Wallet:</span> {selectedWithdrawal.walletAddress}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Requested:</span> {new Date(selectedWithdrawal.createdAt).toLocaleString()}
              </p>
            </div>
            
            <Input
              label="Admin Note (Optional)"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add a note about this decision..."
            />
            
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedWithdrawal(null)
                  setAdminNote('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => updateWithdrawalStatus('rejected')}
                className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
              >
                Reject
              </Button>
              <Button
                variant="primary"
                onClick={() => updateWithdrawalStatus('approved')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}