'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DesktopSidebar from '@/components/DesktopSidebar'
import MobileBottomNav from '@/components/MobileBottomNav'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target, 
  Activity, 
  Award, 
  Clock, 
  Eye,
  RefreshCw,
  ArrowLeft,
  Zap
} from 'lucide-react'

interface Trade {
  id: string
  pair: string
  direction: 'BUY' | 'SELL'
  amount: number
  profit: number
  status: 'win' | 'loss'
  timestamp: string
}

export default function PortfolioPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const fetchPortfolioData = async () => {
    try {
      if (!user?.id) {
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      // Fetch user's trades
      const response = await fetch(`/api/trades?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        const tradesData = Array.isArray(data) ? data : (data.trades || [])
        
        // Transform trades to match interface
        const formattedTrades = tradesData.map((trade: any) => ({
          id: trade.id,
          pair: trade.pair || trade.asset || 'Unknown',
          direction: (trade.direction === 'up' ? 'BUY' : trade.direction === 'down' ? 'SELL' : trade.direction) as 'BUY' | 'SELL',
          amount: trade.amount || 0,
          profit: trade.profit || 0,
          status: (trade.result?.toLowerCase() === 'win' || trade.status?.toLowerCase() === 'won' ? 'win' : 'loss') as 'win' | 'loss',
          timestamp: trade.createdAt || trade.timestamp || new Date().toISOString()
        }))
        
        setTrades(formattedTrades)
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    fetchPortfolioData()
  }, [user, router])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchPortfolioData()
  }

  // Calculate stats
  const totalTrades = trades.length
  const wonTrades = trades.filter(t => t.status === 'win').length
  const totalProfit = trades.reduce((sum, trade) => sum + trade.profit, 0)
  const winRate = totalTrades > 0 ? Math.round((wonTrades / totalTrades) * 100) : 0
  const avgTrade = totalTrades > 0 ? totalProfit / totalTrades : 0
  const bestTrade = trades.length > 0 ? Math.max(...trades.map(t => t.profit)) : 0
  const worstTrade = trades.length > 0 ? Math.min(...trades.map(t => t.profit)) : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#12192A] to-[#1A2332] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#12192A] to-[#1A2332] text-white">
      <DesktopSidebar balance={user?.balance || 0} />

      <div className="lg:ml-64 flex flex-col min-h-screen pb-20 lg:pb-0">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#12192A] to-[#1A2332] border-b border-[#1e2435] px-4 lg:px-8 py-4 lg:py-6 shadow-lg">
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
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">Portfolio</h1>
                  <p className="text-sm text-gray-400 mt-1">Track your trading performance</p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 lg:p-2.5 rounded-xl bg-[#1e2435] hover:bg-[#252d42] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-blue-500/20 shadow-xl">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Total Portfolio Value</p>
                <p className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  {formatCurrency(user?.balance || 0)}
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    totalProfit >= 0 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {totalProfit >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-2" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-2" />
                    )}
                    <span>
                      {formatCurrency(Math.abs(totalProfit))} 
                      {user?.balance && user.balance > 0 && (
                        <span className="ml-1">({((totalProfit / user.balance) * 100).toFixed(1)}%)</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1e2435] hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{totalTrades}</p>
                <p className="text-sm text-gray-400">Total Trades</p>
              </div>

              <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1e2435] hover:border-green-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Target className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-400">{winRate}%</p>
                <p className="text-sm text-gray-400">Win Rate</p>
              </div>

              <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1e2435] hover:border-purple-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(avgTrade)}</p>
                <p className="text-sm text-gray-400">Avg Trade</p>
              </div>

              <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1e2435] hover:border-yellow-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <Award className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-yellow-400">{wonTrades}</p>
                <p className="text-sm text-gray-400">Wins</p>
              </div>
            </div>

            {/* Performance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Best & Worst */}
              <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] overflow-hidden">
                <div className="p-6 border-b border-[#1e2435]">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-blue-400" />
                    Trade Performance
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Best Trade</p>
                        <p className="text-xs text-gray-400">Highest profit</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-green-400">{formatCurrency(bestTrade)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Worst Trade</p>
                        <p className="text-xs text-gray-400">Biggest loss</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-red-400">{formatCurrency(worstTrade)}</p>
                  </div>
                </div>
              </div>

              {/* Recent Trades */}
              <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] overflow-hidden">
                <div className="p-6 border-b border-[#1e2435]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-blue-400" />
                      Recent Trades
                    </h3>
                    <button
                      onClick={() => router.push('/history')}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View All
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {trades.length > 0 ? (
                    <div className="space-y-3">
                      {trades.slice(0, 5).map((trade) => (
                        <div key={trade.id} className="flex items-center justify-between p-4 bg-[#1e2435]/50 rounded-xl border border-[#252d42] hover:border-[#2d3548] transition-all duration-300">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              trade.status === 'win' 
                                ? 'bg-green-500/20' 
                                : 'bg-red-500/20'
                            }`}>
                              {trade.direction === 'BUY' ? (
                                <TrendingUp className={`w-4 h-4 ${trade.status === 'win' ? 'text-green-400' : 'text-red-400'}`} />
                              ) : (
                                <TrendingDown className={`w-4 h-4 ${trade.status === 'win' ? 'text-green-400' : 'text-red-400'}`} />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-white">{trade.pair}</p>
                              <p className="text-xs text-gray-400">{trade.direction}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-white">{formatCurrency(trade.amount)}</p>
                            <p className={`text-sm font-medium ${
                              trade.profit >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {trade.profit >= 0 ? '+' : ''}{formatCurrency(trade.profit)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg mb-2">No trades yet</p>
                      <p className="text-gray-500 text-sm">Start trading to see your portfolio</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </div>
  )
}
