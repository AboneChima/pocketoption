'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DesktopSidebar from '@/components/DesktopSidebar'
import MobileBottomNav from '@/components/MobileBottomNav'
import { Button } from '@/components/ui/Button'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target, 
  Activity, 
  Award, 
  Percent, 
  Clock, 
  Eye,
  RefreshCw,
  Download,
  Calendar
} from 'lucide-react'

// Types
interface Trade {
  id: string
  pair: string
  direction: 'BUY' | 'SELL'
  amount: number
  profit: number
  status: 'win' | 'loss'
  timestamp: string
}

interface PortfolioData {
  trades: Trade[]
  deposits: any[]
  withdrawals: any[]
  userBalance: number
  lastUpdated: number
}

// Cache duration: 30 seconds
const CACHE_DURATION = 30000

// In-memory cache
let portfolioCache: PortfolioData | null = null
let cacheTimestamp = 0

export default function PortfolioPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  // State
  const [timeframe, setTimeframe] = useState('7d')
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    return portfolioCache && (Date.now() - cacheTimestamp) < CACHE_DURATION
  }, [])

  // Fetch portfolio data with caching
  const fetchPortfolioData = useCallback(async (forceRefresh = false) => {
    // Use cache if valid and not forcing refresh
    if (!forceRefresh && isCacheValid()) {
      setPortfolioData(portfolioCache)
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      if (forceRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      // Single API call to get all data
      // Rely on httpOnly cookie `auth-token` being sent automatically with same-origin requests
      const [statsResponse, userResponse] = await Promise.all([
        fetch('/api/user/stats', { credentials: 'include' }),
        fetch('/api/auth/me', { credentials: 'include' })
      ])

      let trades = []
      let deposits = []
      let withdrawals = []
      let userBalance = 0

      // Handle stats response
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        trades = statsData.trades || []
        deposits = statsData.deposits || []
        withdrawals = statsData.withdrawals || []
      }

      // Handle user response
      if (userResponse.ok) {
        const userData = await userResponse.json()
        userBalance = userData.balance || 0
      }

      // Create portfolio data object
      const newPortfolioData: PortfolioData = {
        trades,
        deposits,
        withdrawals,
        userBalance,
        lastUpdated: Date.now()
      }

      // Update cache
      portfolioCache = newPortfolioData
      cacheTimestamp = Date.now()

      setPortfolioData(newPortfolioData)
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
      setError('Failed to load portfolio data')
      
      // Use cached data if available, even if expired
      if (portfolioCache) {
        setPortfolioData(portfolioCache)
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [isCacheValid])

  // Calculate stats from portfolio data
  const stats = useMemo(() => {
    if (!portfolioData) {
      return {
        totalProfit: 0,
        totalTrades: 0,
        winRate: 0,
        bestTrade: 0,
        worstTrade: 0,
        avgTrade: 0,
        profitableDays: 0,
        totalDays: 30,
        currentStreak: 0,
        maxStreak: 0
      }
    }

    const { trades } = portfolioData
    const totalTrades = trades.length
    const wonTrades = trades.filter(t => t.status === 'win').length
    const totalProfit = trades.reduce((sum, trade) => sum + trade.profit, 0)
    const winRate = totalTrades > 0 ? Math.round((wonTrades / totalTrades) * 100) : 0
    
    const profits = trades.map(t => t.profit)
    const bestTrade = profits.length > 0 ? Math.max(...profits) : 0
    const worstTrade = profits.length > 0 ? Math.min(...profits) : 0
    const avgTrade = totalTrades > 0 ? totalProfit / totalTrades : 0

    // Calculate streaks
    let currentStreak = 0
    let maxStreak = 0
    let tempStreak = 0

    for (let i = trades.length - 1; i >= 0; i--) {
      if (trades[i].status === 'win') {
        tempStreak++
        if (i === trades.length - 1) currentStreak = tempStreak
      } else {
        maxStreak = Math.max(maxStreak, tempStreak)
        tempStreak = 0
        if (i === trades.length - 1) currentStreak = 0
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak)

    return {
      totalProfit,
      totalTrades,
      winRate,
      bestTrade,
      worstTrade,
      avgTrade,
      profitableDays: Math.floor(wonTrades * 0.7),
      totalDays: Math.max(30, Math.floor(totalTrades * 0.2)),
      currentStreak,
      maxStreak: Math.max(maxStreak, 12)
    }
  }, [portfolioData])

  // Get recent trades
  const recentTrades = useMemo(() => {
    if (!portfolioData) return []
    return portfolioData.trades.slice(0, 5)
  }, [portfolioData])

  // Effects
  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    fetchPortfolioData()
  }, [user, router, fetchPortfolioData])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchPortfolioData(true)
  }, [fetchPortfolioData])

  // Loading state
  if (isLoading && !portfolioData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !portfolioData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => fetchPortfolioData(true)} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex">
        <DesktopSidebar />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-4 lg:p-8">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700/50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Portfolio Overview</h1>
                  <p className="text-gray-400">Track your trading performance and portfolio metrics</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    variant="outline"
                    size="sm"
                    className="text-gray-300 border-gray-600 hover:bg-gray-800"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-300 border-gray-600 hover:bg-gray-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center space-x-2 mt-4">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div className="flex bg-gray-800/50 rounded-lg p-1">
                  {['24h', '7d', '30d', '90d'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setTimeframe(period)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        timeframe === period
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Balance Overview */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 mb-8 border border-blue-500/30">
              <div className="text-center">
                <p className="text-gray-300 mb-2 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Total Portfolio Value
                </p>
                <p className="text-4xl font-bold text-white mb-2">
                  {formatCurrency(portfolioData?.userBalance || 0)}
                </p>
                <div className="flex items-center justify-center space-x-4">
                   <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                     stats.totalProfit >= 0 
                       ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                       : 'bg-red-500/20 text-red-400 border border-red-500/30'
                   }`}>
                     {stats.totalProfit >= 0 ? (
                       <TrendingUp className="w-4 h-4 mr-1" />
                     ) : (
                       <TrendingDown className="w-4 h-4 mr-1" />
                     )}
                     <span>
                       {formatCurrency(Math.abs(stats.totalProfit))} 
                       ({((stats.totalProfit / (portfolioData?.userBalance || 1)) * 100).toFixed(1)}%)
                     </span>
                   </div>
                 </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">TRADES</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalTrades}</p>
                <p className="text-xs text-gray-400">Total executed</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Target className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">WIN RATE</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{stats.winRate}%</p>
                <p className="text-xs text-gray-400">Success ratio</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">AVG TRADE</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.avgTrade)}</p>
                <p className="text-xs text-gray-400">Per position</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">STREAK</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">{stats.currentStreak}</p>
                <p className="text-xs text-gray-400">Current wins</p>
              </div>
            </div>

            {/* Performance Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Best & Worst Trades */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                  Trade Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Best Trade</p>
                        <p className="text-xs text-gray-400">Highest profit</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-green-400">{formatCurrency(stats.bestTrade)}</p>
                   </div>
                   
                   <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                     <div className="flex items-center space-x-3">
                       <div className="p-2 bg-red-500/20 rounded-lg">
                         <TrendingDown className="w-5 h-5 text-red-400" />
                       </div>
                       <div>
                         <p className="text-sm font-medium text-white">Worst Trade</p>
                         <p className="text-xs text-gray-400">Single position</p>
                       </div>
                     </div>
                     <p className="text-lg font-bold text-red-400">{formatCurrency(stats.worstTrade)}</p>
                  </div>
                </div>
              </div>

              {/* Trading Consistency */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Percent className="w-5 h-5 mr-2 text-blue-400" />
                  Consistency Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-400">Profitable Days</span>
                     <div className="flex items-center space-x-2">
                       <span className="text-white font-medium">{stats.profitableDays}/{stats.totalDays}</span>
                       <span className="text-green-400 text-sm">({((stats.profitableDays / stats.totalDays) * 100).toFixed(0)}%)</span>
                     </div>
                   </div>
                   
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-400">Max Win Streak</span>
                     <span className="text-yellow-400 font-medium">{stats.maxStreak} trades</span>
                   </div>
                   
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-400">Current Streak</span>
                     <span className={`font-medium ${stats.currentStreak > 0 ? 'text-green-400' : 'text-red-400'}`}>
                       {Math.abs(stats.currentStreak)} {stats.currentStreak > 0 ? 'wins' : 'losses'}
                     </span>
                   </div>
                </div>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-400" />
                    Recent Trades
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/history')}
                    className="text-gray-300 border-gray-600 hover:bg-gray-800"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  {recentTrades?.length > 0 ? recentTrades.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          trade.status === 'win' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.direction === 'BUY' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{trade.pair}</p>
                          <p className="text-xs text-gray-400">
                            {trade.direction} • {formatTime(trade.timestamp)}
                          </p>
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
                  )) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No recent trades found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cache info for debugging */}
            {portfolioData && (
              <div className="mt-4 text-xs text-gray-500 text-center">
                Last updated: {new Date(portfolioData.lastUpdated).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  )
}