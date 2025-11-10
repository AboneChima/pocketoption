'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { 
  ArrowLeft,
  Download,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Minus,
  Calendar,
  Clock,
  Activity,
  BarChart3,
  RefreshCw,
  Eye,
  ChevronDown,
  FileText,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import MobileBottomNav from '@/components/MobileBottomNav'
import DesktopSidebar from '@/components/DesktopSidebar'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'trade'
  amount: number
  currency?: string
  status: string
  createdAt: string
  pair?: string
  direction?: string
  profit?: number
}

export default function HistoryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'trade'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchTransactions()
    }
  }, [user])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      
      if (!user?.id) {
        console.log('No user ID available, skipping fetch')
        setTransactions([])
        setLoading(false)
        return
      }
      
      console.log('Fetching transactions for user:', user.id)
      
      // Fetch real data from APIs with user ID
      const [depositsRes, withdrawalsRes, tradesRes] = await Promise.all([
        fetch(`/api/deposits?userId=${user.id}`),
        fetch(`/api/withdrawals?userId=${user.id}`),
        fetch(`/api/trades?userId=${user.id}`)
      ])
      
      console.log('API responses:', {
        deposits: depositsRes.status,
        withdrawals: withdrawalsRes.status,
        trades: tradesRes.status
      })

      // Safely parse responses and ensure they are arrays
      let deposits = []
      let withdrawals = []
      let trades = []

      try {
        if (depositsRes.ok) {
          const depositsData = await depositsRes.json()
          deposits = Array.isArray(depositsData) ? depositsData : (depositsData.deposits || [])
        }
      } catch (e) {
        console.error('Error parsing deposits:', e)
      }

      try {
        if (withdrawalsRes.ok) {
          const withdrawalsData = await withdrawalsRes.json()
          withdrawals = Array.isArray(withdrawalsData) ? withdrawalsData : (withdrawalsData.withdrawals || [])
        }
      } catch (e) {
        console.error('Error parsing withdrawals:', e)
      }

      try {
        if (tradesRes.ok) {
          const tradesData = await tradesRes.json()
          trades = Array.isArray(tradesData) ? tradesData : (tradesData.trades || [])
        }
      } catch (e) {
        console.error('Error parsing trades:', e)
      }

      // Transform API data to match Transaction interface
      const allTransactions: Transaction[] = [
        ...deposits.map((deposit: any) => ({
          id: deposit.id,
          type: 'deposit' as const,
          amount: deposit.amount,
          currency: deposit.currency,
          status: deposit.status?.toLowerCase() || 'pending',
          createdAt: deposit.createdAt
        })),
        ...withdrawals.map((withdrawal: any) => ({
          id: withdrawal.id,
          type: 'withdrawal' as const,
          amount: withdrawal.amount,
          currency: withdrawal.currency,
          status: withdrawal.status?.toLowerCase() || 'pending',
          createdAt: withdrawal.createdAt
        })),
        ...trades.map((trade: any) => {
          // Map result to status
          let status = 'pending'
          if (trade.result) {
            const result = trade.result.toLowerCase()
            if (result === 'won' || result === 'win') status = 'won'
            else if (result === 'lost' || result === 'loss') status = 'lost'
          } else if (trade.status) {
            status = trade.status.toLowerCase()
          }
          
          return {
            id: trade.id,
            type: 'trade' as const,
            amount: trade.amount || 0,
            pair: trade.pair || trade.asset || 'Unknown',
            direction: trade.direction,
            profit: trade.profit || 0,
            status,
            createdAt: trade.createdAt || new Date().toISOString()
          }
        })
      ]

      // Sort by creation date (newest first)
      allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      console.log('Fetched transactions:', {
        deposits: deposits.length,
        withdrawals: withdrawals.length,
        trades: trades.length,
        total: allTransactions.length
      })

      setTransactions(allTransactions)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter
    const matchesSearch = searchTerm === '' || 
      transaction.currency?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.pair?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.status.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'approved':
      case 'won':
        return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'rejected':
      case 'lost':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return <ArrowUpRight className="w-4 h-4 text-green-400" />
      case 'withdrawal':
        return <ArrowDownRight className="w-4 h-4 text-red-400" />
      case 'trade':
        return transaction.profit && transaction.profit > 0 
          ? <TrendingUp className="w-4 h-4 text-green-400" />
          : <TrendingDown className="w-4 h-4 text-red-400" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Debug: Log all transactions to see their statuses
  console.log('All transactions:', filteredTransactions.map(t => ({ 
    type: t.type, 
    status: t.status, 
    amount: t.amount 
  })))

  const totalDeposits = filteredTransactions
    .filter(t => t.type === 'deposit' && (
      t.status?.toLowerCase() === 'confirmed' || 
      t.status?.toLowerCase() === 'completed' || 
      t.status?.toLowerCase() === 'approved'
    ))
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  const totalWithdrawals = filteredTransactions
    .filter(t => t.type === 'withdrawal' && (
      t.status?.toLowerCase() === 'approved' || 
      t.status?.toLowerCase() === 'completed' || 
      t.status?.toLowerCase() === 'confirmed'
    ))
    .reduce((sum, t) => sum + (t.amount || 0), 0)
  
  console.log('Totals calculated:', { totalDeposits, totalWithdrawals, tradingPnL: 0 })

  const tradingPnL = filteredTransactions
    .filter(t => t.type === 'trade' && (
      t.status?.toLowerCase() === 'won' || 
      t.status?.toLowerCase() === 'lost' ||
      t.status?.toLowerCase() === 'win' ||
      t.status?.toLowerCase() === 'loss'
    ))
    .reduce((sum, t) => sum + (t.profit || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading transaction history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#12192A] to-[#1A2332] text-white">
      <DesktopSidebar balance={user?.balance || 0} />
      
      <div className="lg:ml-64 flex flex-col min-h-screen pb-20 lg:pb-0">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#12192A] to-[#1A2332] border-b border-[#1e2435] px-4 lg:px-8 py-4 lg:py-6 shadow-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-[#1e2435] rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">Transaction History</h1>
                  <p className="text-sm text-gray-400 mt-1">Complete trading and financial activity</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-[#1e2435] hover:bg-[#252d42] rounded-lg transition-colors text-gray-300"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={fetchTransactions}
                  className="p-2 bg-[#1e2435] hover:bg-[#252d42] rounded-lg transition-colors text-gray-300"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-600/20 via-green-500/10 to-transparent rounded-xl p-6 border border-green-500/30 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium mb-1">Total Deposits</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(totalDeposits)}</p>
                    <p className="text-xs text-green-400 mt-1">
                      {filteredTransactions.filter(t => t.type === 'deposit').length} transactions
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <ArrowUpRight className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-600/20 via-red-500/10 to-transparent rounded-xl p-6 border border-red-500/30 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-sm font-medium mb-1">Total Withdrawals</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(totalWithdrawals)}</p>
                    <p className="text-xs text-red-400 mt-1">
                      {filteredTransactions.filter(t => t.type === 'withdrawal').length} transactions
                    </p>
                  </div>
                  <div className="p-3 bg-red-500/20 rounded-lg">
                    <ArrowDownRight className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </div>

              <div className={`bg-gradient-to-br ${tradingPnL >= 0 ? 'from-blue-600/20 via-blue-500/10' : 'from-purple-600/20 via-purple-500/10'} to-transparent rounded-xl p-6 border ${tradingPnL >= 0 ? 'border-blue-500/30' : 'border-purple-500/30'} backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${tradingPnL >= 0 ? 'text-blue-300' : 'text-purple-300'} text-sm font-medium mb-1`}>Trading P&L</p>
                    <p className={`text-2xl font-bold ${tradingPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tradingPnL >= 0 ? '+' : ''}{formatCurrency(tradingPnL)}
                    </p>
                    <p className={`text-xs ${tradingPnL >= 0 ? 'text-blue-400' : 'text-purple-400'} mt-1`}>
                      {filteredTransactions.filter(t => t.type === 'trade').length} trades
                    </p>
                  </div>
                  <div className={`p-3 ${tradingPnL >= 0 ? 'bg-blue-500/20' : 'bg-purple-500/20'} rounded-lg`}>
                    <BarChart3 className={`w-6 h-6 ${tradingPnL >= 0 ? 'text-blue-400' : 'text-purple-400'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {(['all', 'deposit', 'withdrawal', 'trade'] as const).map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        filter === filterType
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {filterType === 'all' && <Activity className="w-4 h-4" />}
                        {filterType === 'deposit' && <ArrowUpRight className="w-4 h-4" />}
                        {filterType === 'withdrawal' && <ArrowDownRight className="w-4 h-4" />}
                        {filterType === 'trade' && <Target className="w-4 h-4" />}
                        <span className="capitalize">{filterType === 'all' ? 'All Types' : filterType + 's'}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-64"
                  />
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] overflow-hidden">
              <div className="p-6 border-b border-[#1e2435]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-400" />
                    Recent Transactions
                  </h3>
                  <span className="text-sm text-gray-400">
                    {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
                  </span>
                </div>
              </div>

              {/* Modern Grid Container */}
              <div className="p-6">
                {filteredTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-6">
                      <Activity className="w-10 h-10 text-gray-500" />
                    </div>
                    <p className="text-xl font-semibold text-gray-300 mb-2">No transactions found</p>
                    <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredTransactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="group relative bg-gradient-to-br from-[#1e2838] via-[#1a2332] to-[#151d2a] rounded-2xl p-6 border border-[#2d3548] hover:border-[#4a5568] transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
                      >
                        {/* Decorative gradient overlay */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Content */}
                        <div className="relative">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                                transaction.type === 'deposit' 
                                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 shadow-lg shadow-green-500/20' 
                                  : transaction.type === 'withdrawal' 
                                  ? 'bg-gradient-to-br from-red-500/20 to-pink-500/10 border border-red-500/30 shadow-lg shadow-red-500/20' 
                                  : 'bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/30 shadow-lg shadow-blue-500/20'
                              }`}>
                                {getTransactionIcon(transaction)}
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-white capitalize mb-1">
                                  {transaction.type}
                                </h4>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getStatusColor(transaction.status)}`}>
                                  {transaction.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Amount Section */}
                          <div className="mb-5">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className={`text-4xl font-black tracking-tight ${
                                transaction.type === 'deposit' ? 'text-green-400' :
                                transaction.type === 'withdrawal' ? 'text-red-400' :
                                'text-white'
                              }`}>
                                {transaction.type === 'deposit' ? '+' : transaction.type === 'withdrawal' ? '-' : ''}
                                {formatCurrency(transaction.amount)}
                              </span>
                            </div>
                            {transaction.type === 'trade' && transaction.profit !== undefined && (
                              <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                                transaction.profit >= 0 
                                  ? 'bg-green-500/10 border border-green-500/30' 
                                  : 'bg-red-500/10 border border-red-500/30'
                              }`}>
                                <span className="text-xs text-gray-400 font-medium">P&L:</span>
                                <span className={`text-sm font-bold ${
                                  transaction.profit >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {transaction.profit >= 0 ? '+' : ''}{formatCurrency(transaction.profit)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Details Section */}
                          <div className="space-y-3 pt-5 border-t border-[#2d3548]">
                            {/* Currency/Pair */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {transaction.type === 'trade' ? 'Pair' : 'Currency'}
                              </span>
                              <span className="text-sm font-bold text-white">
                                {transaction.type === 'trade' ? transaction.pair : transaction.currency}
                              </span>
                            </div>

                            {/* Direction for Trades */}
                            {transaction.type === 'trade' && transaction.direction && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Direction</span>
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                                  transaction.direction.toLowerCase() === 'up' || transaction.direction.toLowerCase() === 'call'
                                    ? 'bg-green-500/10 border border-green-500/30'
                                    : 'bg-red-500/10 border border-red-500/30'
                                }`}>
                                  {transaction.direction.toLowerCase() === 'up' || transaction.direction.toLowerCase() === 'call' ? (
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4 text-red-400" />
                                  )}
                                  <span className={`text-sm font-bold ${
                                    transaction.direction.toLowerCase() === 'up' || transaction.direction.toLowerCase() === 'call'
                                      ? 'text-green-400'
                                      : 'text-red-400'
                                  }`}>
                                    {transaction.direction.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Date & Time */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</span>
                              <div className="flex items-center gap-1.5 text-gray-300">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium">
                                  {new Date(transaction.createdAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </div>
  )
}