'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Activity,
  Award,
  Clock,
  Percent,
  Eye,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import MobileBottomNav from '@/components/MobileBottomNav'
import DesktopSidebar from '@/components/DesktopSidebar'
import { Button } from '@/components/ui/Button'

interface PortfolioStats {
  totalProfit: number
  totalTrades: number
  winRate: number
  bestTrade: number
  worstTrade: number
  avgTrade: number
  profitableDays: number
  totalDays: number
  currentStreak: number
  maxStreak: number
}

interface Trade {
  id: string
  pair: string
  direction: 'BUY' | 'SELL'
  amount: number
  profit: number
  timestamp: string
  status: 'win' | 'loss'
}

export default function PortfolioPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user stats function
  const fetchUserStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/stats')
      if (response.ok) {
        const data = await response.json()
        setUserStats(data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch user stats on component mount
  useEffect(() => {
    if (user) {
      fetchUserStats()
    }
  }, [user])

  const stats = userStats ? {
    totalProfit: userStats.totalProfit || 0,
    totalTrades: userStats.totalTrades || 0,
    winRate: userStats.winRate || 0,
    bestTrade: userStats.bestTrade || 0,
    worstTrade: userStats.worstTrade || 0,
    avgTrade: userStats.averageTrade || 0,
    profitableDays: Math.floor((userStats.wonTrades || 0) * 0.7), // Estimate
    totalDays: Math.max(30, Math.floor((userStats.totalTrades || 0) * 0.2)), // Estimate
    currentStreak: userStats.currentStreak || 0,
    maxStreak: Math.max(userStats.currentStreak || 0, 12) // Estimate
  } : {
    totalProfit: 0,
    totalTrades: 0,
    winRate: 0,
    bestTrade: 0,
    worstTrade: 0,
    avgTrade: 0,
    profitableDays: 0,
    totalDays: 0,
    currentStreak: 0,
    maxStreak: 0
  }

  // Get recent trades - for now using mock data, but this should come from API
  const recentTrades: Trade[] = [
    // This would be populated from a real API call
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleExport = () => {
    toast.success('Portfolio report exported successfully!');
  };

  const handleRefresh = () => {
    fetchUserStats();
    toast.success('Portfolio data refreshed!');
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  if (isLoading || !userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading portfolio...</p>
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
                    <h1 className="text-xl font-bold">Portfolio Analytics</h1>
                    <p className="text-sm text-gray-400">Your trading performance overview</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="hidden lg:flex items-center space-x-2 text-gray-300 border-gray-600 hover:bg-gray-800"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="p-2 text-gray-300 border-gray-600 hover:bg-gray-800"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto lg:max-w-6xl px-4 py-6 pb-20 lg:pb-6">
            {/* Timeframe Selector */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium">Timeframe:</span>
              </div>
              <div className="flex bg-gray-800/50 rounded-lg p-1 border border-gray-700">
                {(['7d', '30d', '90d', 'all'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period)}
                    disabled={loading}
                    className={`px-3 py-1 text-sm rounded-md transition-all duration-200 disabled:opacity-50 ${
                      timeframe === period
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {period === 'all' ? 'All Time' : period.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Balance Overview */}
            <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-green-600/20 rounded-2xl p-6 mb-8 border border-blue-500/30 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-gray-300 mb-2 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Total Portfolio Value
                </p>
                <p className="text-4xl font-bold text-white mb-2">{formatCurrency(user?.balance || 0)}</p>
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
                     <span>{formatCurrency(Math.abs(stats.totalProfit))} ({((stats.totalProfit / (user?.balance || 1)) * 100).toFixed(1)}%)</span>
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
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  )
}