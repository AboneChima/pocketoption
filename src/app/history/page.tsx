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
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      
      // Fetch real data from APIs
      const [depositsRes, withdrawalsRes, tradesRes] = await Promise.all([
        fetch('/api/deposits'),
        fetch('/api/withdrawals'),
        fetch('/api/trades')
      ])

      // Safely parse responses and ensure they are arrays
      let deposits = []
      let withdrawals = []
      let trades = []

      try {
        if (depositsRes.ok) {
          const depositsData = await depositsRes.json()
          deposits = Array.isArray(depositsData) ? depositsData : []
        }
      } catch (e) {
        console.error('Error parsing deposits:', e)
      }

      try {
        if (withdrawalsRes.ok) {
          const withdrawalsData = await withdrawalsRes.json()
          withdrawals = Array.isArray(withdrawalsData) ? withdrawalsData : []
        }
      } catch (e) {
        console.error('Error parsing withdrawals:', e)
      }

      try {
        if (tradesRes.ok) {
          const tradesData = await tradesRes.json()
          trades = Array.isArray(tradesData) ? tradesData : []
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
        ...trades.map((trade: any) => ({
          id: trade.id,
          type: 'trade' as const,
          amount: trade.amount,
          pair: trade.pair,
          direction: trade.direction,
          profit: trade.profit,
          status: trade.result?.toLowerCase() || 'pending',
          createdAt: trade.createdAt
        }))
      ]

      // Sort by creation date (newest first)
      allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

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

  const totalDeposits = filteredTransactions
    .filter(t => t.type === 'deposit' && t.status === 'confirmed')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalWithdrawals = filteredTransactions
    .filter(t => t.type === 'withdrawal' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0)

  const tradingPnL = filteredTransactions
    .filter(t => t.type === 'trade')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white">
      <div className="flex">
        <DesktopSidebar balance={user?.balance || 0} />
        
        <div className="flex-1 lg:ml-0">
          {/* Header */}
          <div className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
            <div className="max-w-md mx-auto lg:max-w-6xl px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold">Transaction History</h1>
                    <p className="text-sm text-gray-400">Complete trading and financial activity</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden lg:flex items-center space-x-2 text-gray-300 border-gray-600 hover:bg-gray-800"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchTransactions}
                    className="p-2 text-gray-300 border-gray-600 hover:bg-gray-800"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto lg:max-w-6xl px-4 py-6 pb-20 lg:pb-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
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
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
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
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="p-6 border-b border-gray-700/50">
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

              <div className="divide-y divide-gray-700/30">
                {filteredTransactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No transactions found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your filters or search terms</p>
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-6 hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            transaction.type === 'deposit' ? 'bg-green-500/20' :
                            transaction.type === 'withdrawal' ? 'bg-red-500/20' :
                            'bg-blue-500/20'
                          }`}>
                            {getTransactionIcon(transaction)}
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-3">
                              <p className="font-semibold text-white capitalize">
                                {transaction.type}
                              </p>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-sm text-gray-400">
                                {transaction.type === 'trade' ? (
                                  <>
                                    {transaction.pair} • {transaction.direction?.toUpperCase()}
                                  </>
                                ) : (
                                  <>
                                    {transaction.currency} • {transaction.type === 'deposit' ? 'Credit' : 'Debit'}
                                  </>
                                )}
                              </p>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTime(transaction.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {formatCurrency(transaction.amount)}
                          </p>
                          {transaction.type === 'trade' && transaction.profit !== undefined && (
                            <p className={`text-sm font-medium ${
                              transaction.profit >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {transaction.profit >= 0 ? '+' : ''}{formatCurrency(transaction.profit)} P&L
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  )
}