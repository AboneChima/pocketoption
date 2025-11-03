'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { LiveTradingChart } from '@/components/LiveTradingChart'
import { UnifiedLoader, PageLoader } from '@/components/ui/UnifiedLoader'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { 
  ChevronDown, 
  Gift, 
  Wallet, 
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Clock,
  DollarSign,
  Zap,
  TrendingUp,
  TrendingDown,
  User,
  Plus,
  Minus,
  Users,
  BarChart3,
  Trophy,
  FileText,
  Circle,
  X
} from 'lucide-react'
import DesktopSidebar from '@/components/DesktopSidebar'
import MobileBottomNav from '@/components/MobileBottomNav'

interface TradingPair {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  isOTC?: boolean
}

interface Trade {
  id: string
  pair: string
  direction: 'BUY' | 'SELL'
  amount: number
  payout: number
  entry: number
  exit?: number
  result?: 'Win' | 'Loss'
  timestamp: number
  expiryTime: number
}

interface BottomTab {
  id: string
  label: string
  icon: React.ReactNode
  badge?: number
}

export default function DashboardPage() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  
  // Trading state
  const [selectedPair, setSelectedPair] = useState<TradingPair>({
    symbol: 'EUR/USD',
    name: 'EUR/USD OTC',
    price: 1.14797,
    change: 0.00023,
    changePercent: 0.02,
    isOTC: true
  })
  const [balance, setBalance] = useState(1000)
  const [tradeAmount, setTradeAmount] = useState(1)
  const [selectedTime, setSelectedTime] = useState(5) // seconds
  const [payoutPercent, setPayoutPercent] = useState(78)
  const [activeTrades, setActiveTrades] = useState<Trade[]>([])
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([])
  const [isTrading, setIsTrading] = useState(false)
  
  // UI state
  const [showPairSelector, setShowPairSelector] = useState(false)
  const [showBalanceDropdown, setShowBalanceDropdown] = useState(false)
  const [activeBottomTab, setActiveBottomTab] = useState('trades')
  const [showBottomSheet, setShowBottomSheet] = useState(false)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Available trading pairs
  const tradingPairs: TradingPair[] = [
    { symbol: 'EUR/USD', name: 'EUR/USD OTC', price: 1.14797, change: 0.00023, changePercent: 0.02, isOTC: true },
    { symbol: 'GBP/USD', name: 'GBP/USD OTC', price: 1.27845, change: -0.00156, changePercent: -0.12, isOTC: true },
    { symbol: 'USD/JPY', name: 'USD/JPY OTC', price: 149.234, change: 0.456, changePercent: 0.31, isOTC: true },
    { symbol: 'AUD/USD', name: 'AUD/USD OTC', price: 0.67234, change: 0.00089, changePercent: 0.13, isOTC: true },
    { symbol: 'USD/CAD', name: 'USD/CAD OTC', price: 1.35678, change: -0.00234, changePercent: -0.17, isOTC: true },
    { symbol: 'BTC/USD', name: 'Bitcoin OTC', price: 43567.89, change: 1234.56, changePercent: 2.91, isOTC: true },
    { symbol: 'ETH/USD', name: 'Ethereum OTC', price: 2456.78, change: -89.45, changePercent: -3.52, isOTC: true },
  ]

  // Time options for expiry
  const timeOptions = [
    { value: 5, label: '00:00:05' },
    { value: 60, label: '00:01:00' },
    { value: 300, label: '00:05:00' },
    { value: 900, label: '00:15:00' },
    { value: 1800, label: '00:30:00' },
    { value: 3600, label: '01:00:00' },
  ]

  // Bottom tabs
  const bottomTabs: BottomTab[] = [
    { id: 'trades', label: 'Trades', icon: <BarChart3 className="w-5 h-5" />, badge: activeTrades.length },
    { id: 'signals', label: 'Signals', icon: <Zap className="w-5 h-5" /> },
    { id: 'social', label: 'Social Trading', icon: <Users className="w-5 h-5" /> },
    { id: 'express', label: 'Express Trades', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'tournaments', label: 'Tournaments', icon: <Trophy className="w-5 h-5" /> },
    { id: 'pending', label: 'Pending Trades', icon: <FileText className="w-5 h-5" /> },
  ]

  // Trading logic
  const calculatePayout = () => {
    return tradeAmount * (payoutPercent / 100)
  }

  const calculateProfit = () => {
    return calculatePayout() - tradeAmount
  }

  const openTrade = (direction: 'BUY' | 'SELL') => {
    // Validate minimum trade amount
    if (tradeAmount < 1) {
      toast.error('Minimum trade amount is $1')
      return
    }

    // Check if user has sufficient balance
    if (balance < tradeAmount) {
      toast.error(
        `Insufficient balance. You need $${tradeAmount.toLocaleString()} but only have $${balance.toLocaleString()}. Please top up your account first.`,
        {
          duration: 4000,
          icon: '💰',
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151'
          }
        }
      )
      
      // Show top-up suggestion after a short delay
      setTimeout(() => {
        toast((t) => (
          <div className="flex items-center space-x-3">
            <span>💡 Ready to add funds?</span>
            <button
              onClick={() => {
                toast.dismiss(t.id)
                router.push('/deposit')
              }}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Top Up Now
            </button>
          </div>
        ), {
          duration: 6000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #3b82f6'
          }
        })
      }, 1000)
      return
    }

    const trade: Trade = {
      id: Date.now().toString(),
      pair: selectedPair.symbol,
      direction,
      amount: tradeAmount,
      payout: payoutPercent / 100,
      entry: selectedPair.price,
      timestamp: Date.now(),
      expiryTime: Date.now() + (selectedTime * 1000)
    }

    setActiveTrades(prev => [...prev, trade])
    setBalance(prev => prev - tradeAmount)
    setIsTrading(true)

    // Show success message
    toast.success(
      `${direction} order placed for $${tradeAmount.toLocaleString()} on ${selectedPair.symbol}`,
      {
        duration: 3000,
        icon: direction === 'BUY' ? '📈' : '📉',
        style: {
          background: '#1f2937',
          color: '#fff',
          border: `1px solid ${direction === 'BUY' ? '#10b981' : '#ef4444'}`
        }
      }
    )

    // Simulate trade expiry
    setTimeout(() => {
      resolveTrade(trade.id)
    }, selectedTime * 1000)
  }

  const resolveTrade = (tradeId: string) => {
    setActiveTrades(prev => {
      const trade = prev.find(t => t.id === tradeId)
      if (!trade) return prev

      // More realistic price simulation based on direction and market volatility
      const volatility = 0.0005 // Base volatility
      const timeDecay = Math.min(selectedTime / 60, 1) // Longer trades have more movement
      const priceMovement = (Math.random() - 0.5) * volatility * timeDecay * 2
      
      // Current price at expiry
      const exitPrice = trade.entry + priceMovement
      
      // Determine win/loss based on direction and price movement
      let isWin = false
      if (trade.direction === 'BUY') {
        isWin = exitPrice > trade.entry
      } else {
        isWin = exitPrice < trade.entry
      }
      
      // Add some randomness to make it more realistic (52% win rate)
      if (Math.abs(exitPrice - trade.entry) < 0.0001) {
        isWin = Math.random() < 0.52
      }

      const resolvedTrade: Trade = {
        ...trade,
        exit: exitPrice,
        result: isWin ? 'Win' : 'Loss'
      }

      if (isWin) {
        const profit = trade.amount * trade.payout
        const totalReturn = trade.amount + profit
        setBalance(prev => prev + totalReturn)
        
        // Show win notification
        toast.success(
          `🎉 Trade Won! +$${profit.toLocaleString()} profit (${(trade.payout * 100).toFixed(0)}% return)`,
          {
            duration: 5000,
            style: {
              background: '#065f46',
              color: '#fff',
              border: '1px solid #10b981'
            }
          }
        )
      } else {
        // Show loss notification
        toast.error(
          `📉 Trade Lost. -$${trade.amount.toLocaleString()} on ${trade.pair}`,
          {
            duration: 4000,
            style: {
              background: '#7f1d1d',
              color: '#fff',
              border: '1px solid #ef4444'
            }
          }
        )
      }

      setTradeHistory(prev => [resolvedTrade, ...prev])
      setIsTrading(false)
      return prev.filter(t => t.id !== tradeId)
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setDashboardLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Update selected pair price periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedPair(prev => ({
        ...prev,
        price: prev.price + (Math.random() - 0.5) * 0.001
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Update timer every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading || dashboardLoading) {
    return <PageLoader />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#12192A] to-[#1A2332] text-white flex">
      {/* Desktop Sidebar Navigation */}
      <DesktopSidebar balance={balance} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pb-20 lg:pb-0">
        {/* Mobile Header - Only show on mobile */}
        <header className="lg:hidden bg-gradient-to-r from-[#12192A] to-[#1A2332] border-b border-[#1e2435] px-4 py-2 flex items-center justify-between shadow-lg backdrop-blur-sm">
        {/* Left: User Avatar */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-3 h-3 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#12192A] animate-pulse" />
          </div>
        </div>

        {/* Center: Compact Pair Selector */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPairSelector(!showPairSelector)}
            className="flex items-center space-x-2 bg-[#1e2435] px-2 py-1.5 rounded-md hover:bg-[#252d42] transition-colors"
          >
            <span className="text-sm font-medium">{selectedPair.symbol}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          
          <button className="p-1.5 hover:bg-[#1e2435] rounded-md transition-colors">
            <MoreHorizontal className="w-3 h-3" />
          </button>
        </div>

        {/* Right: Compact Balance & Deposit */}
        <div className="flex items-center space-x-2">
          <button className="p-1.5 hover:bg-[#1e2435] rounded-md transition-colors">
            <Gift className="w-3 h-3 text-yellow-500" />
          </button>
          
          <button
            onClick={() => setShowBalanceDropdown(!showBalanceDropdown)}
            className="flex items-center space-x-1 bg-[#1e2435] px-2 py-1.5 rounded-md hover:bg-[#252d42] transition-colors"
          >
            <span className="text-xs text-[#9AA6BC]">USD</span>
            <span className="text-sm font-medium">${balance.toFixed(0)}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          
          <button className="bg-green-600 hover:bg-green-700 px-2 py-1.5 rounded-md transition-colors flex items-center space-x-1">
            <Wallet className="w-3 h-3" />
            <span className="text-xs font-medium">Deposit</span>
          </button>
        </div>
      </header>

      {/* Pair Selector Dropdown */}
      {showPairSelector && (
        <div className="absolute top-16 left-4 right-4 bg-[#12192A] border border-[#1e2435] rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          <div className="p-4 border-b border-[#1e2435]">
            <h3 className="text-lg font-semibold">Select Trading Pair</h3>
            <p className="text-sm text-[#9AA6BC]">Choose a pair (OTC available 24/7)</p>
          </div>
          <div className="p-2">
            {tradingPairs.map((pair) => (
              <button
                key={pair.symbol}
                onClick={() => {
                  setSelectedPair(pair)
                  setShowPairSelector(false)
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#1e2435] transition-colors ${
                  selectedPair.symbol === pair.symbol ? 'bg-[#1e2435]' : ''
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{pair.name}</span>
                  <span className="text-sm text-[#9AA6BC]">{pair.price.toFixed(5)}</span>
                </div>
                <div className={`text-sm ${pair.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {pair.changePercent >= 0 ? '+' : ''}{pair.changePercent.toFixed(2)}%
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content - Simplified Layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chart Section - Optimized height for mobile */}
        <div className="relative h-[60vh] lg:h-[500px]">
          <LiveTradingChart 
            selectedPair={selectedPair.symbol}
            currentPrice={selectedPair.price}
          />
          
          {/* Compact Timer Overlay */}
          {activeTrades.length > 0 && (
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-md px-2 py-1 border border-red-500/30">
              <div className="text-xs text-red-400 font-mono">
                {formatTime(Math.max(0, Math.floor((activeTrades[0].expiryTime - currentTime) / 1000)))}
              </div>
            </div>
          )}
        </div>

        {/* Simple Trading Controls Below Chart - Compact for mobile */}
        <div className="bg-[#12192A] border-t border-[#1e2435] p-3 lg:p-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            {/* Payout Info - More compact on mobile */}
            <div className="flex items-center justify-center mb-3">
              <div className="bg-[#1e2435] rounded-lg px-3 py-1.5 lg:px-4 lg:py-2">
                <span className="text-xs lg:text-sm text-[#9AA6BC] mr-2">Payout:</span>
                <span className="text-base lg:text-lg font-bold text-green-400">+{payoutPercent}%</span>
                <span className="text-xs lg:text-sm text-white ml-2">
                  (${calculatePayout().toFixed(2)})
                </span>
              </div>
            </div>

            {/* Trading Controls Row - Responsive layout */}
            <div className="flex flex-col lg:flex-row items-center justify-center space-y-3 lg:space-y-0 lg:space-x-6 mb-3">
              {/* Time Selection */}
              <div className="flex items-center space-x-2">
                <label className="text-xs lg:text-sm text-[#9AA6BC]">Time:</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(Number(e.target.value))}
                  className="bg-[#1e2435] border border-[#252d42] rounded-md px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm focus:outline-none focus:border-blue-500"
                >
                  {timeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Amount Input */}
              <div className="flex items-center space-x-2">
                <label className="text-xs lg:text-sm text-[#9AA6BC]">Amount:</label>
                <div className="flex items-center bg-[#1e2435] border border-[#252d42] rounded-md">
                  <button
                    onClick={() => setTradeAmount(Math.max(1, tradeAmount - 1))}
                    className="p-1.5 lg:p-2 text-[#9AA6BC] hover:text-white"
                  >
                    <Minus className="w-3 h-3 lg:w-4 lg:h-4" />
                  </button>
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(Math.max(1, Number(e.target.value)))}
                    min="1"
                    className="w-16 lg:w-20 bg-transparent px-1 lg:px-2 py-1.5 lg:py-2 text-xs lg:text-sm focus:outline-none text-center"
                  />
                  <button
                    onClick={() => setTradeAmount(tradeAmount + 1)}
                    className="p-1.5 lg:p-2 text-[#9AA6BC] hover:text-white"
                  >
                    <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                  </button>
                </div>
                <span className="text-xs lg:text-sm text-[#9AA6BC]">USD</span>
              </div>
            </div>

            {/* Simple Buy/Sell Buttons with AI - Compact mobile layout */}
            <div className="flex items-center justify-center space-x-2 lg:space-x-4">
              <button
                onClick={() => openTrade('BUY')}
                disabled={tradeAmount < 1 || balance < tradeAmount || isTrading}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed px-4 py-2 lg:px-8 lg:py-3 rounded-lg font-bold text-white transition-all duration-200 flex items-center space-x-1 lg:space-x-2 shadow-lg hover:shadow-green-500/25 text-sm lg:text-base"
              >
                <ArrowUp className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>BUY</span>
              </button>
              
              {/* AI Button */}
              <div className="flex flex-col items-center px-1 lg:px-2">
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                </div>
                <span className="text-xs text-[#9AA6BC] mt-1">AI</span>
              </div>
              
              <button
                onClick={() => openTrade('SELL')}
                disabled={tradeAmount < 1 || balance < tradeAmount || isTrading}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed px-4 py-2 lg:px-8 lg:py-3 rounded-lg font-bold text-white transition-all duration-200 flex items-center space-x-1 lg:space-x-2 shadow-lg hover:shadow-red-500/25 text-sm lg:text-base"
              >
                <ArrowDown className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>SELL</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div className="bg-gradient-to-r from-[#12192A] to-[#1a1f2e] border-t border-[#1e2435] px-4 py-2 shadow-lg">
        <div className="flex justify-between">
          {bottomTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveBottomTab(tab.id)
                setShowBottomSheet(true)
              }}
              className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                activeBottomTab === tab.id 
                  ? 'text-blue-400 bg-blue-500/10 shadow-lg' 
                  : 'text-[#9AA6BC] hover:text-[#E6EDF7] hover:bg-[#1e2435]/50'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge && tab.badge > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <span className="text-xs text-white font-bold">{tab.badge}</span>
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Sheet */}
      {showBottomSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end animate-in fade-in duration-200">
          <div className="w-full bg-gradient-to-b from-[#12192A] to-[#0E1320] rounded-t-xl max-h-[70vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between p-4 border-b border-[#1e2435]">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {bottomTabs.find(tab => tab.id === activeBottomTab)?.label}
              </h3>
              <button
                onClick={() => setShowBottomSheet(false)}
                className="p-2 hover:bg-[#1e2435] rounded-lg transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              {activeBottomTab === 'trades' && (
                <div className="space-y-3">
                  {activeTrades.length === 0 && tradeHistory.length === 0 ? (
                    <p className="text-center text-[#9AA6BC] py-8">No trades yet</p>
                  ) : (
                    <>
                      {activeTrades.map((trade) => (
                        <div key={trade.id} className="bg-[#1e2435] rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{trade.pair}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              trade.direction === 'BUY' ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                              {trade.direction}
                            </span>
                          </div>
                          <div className="text-sm text-[#9AA6BC] mt-1">
                            ${trade.amount} • Entry: {trade.entry.toFixed(5)}
                          </div>
                        </div>
                      ))}
                      
                      {tradeHistory.map((trade) => (
                        <div key={trade.id} className="bg-[#1e2435] rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{trade.pair}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              trade.result === 'Win' ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                              {trade.result}
                            </span>
                          </div>
                          <div className="text-sm text-[#9AA6BC] mt-1">
                            ${trade.amount} • {trade.direction} • {trade.entry.toFixed(5)} → {trade.exit?.toFixed(5)}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
              
              {activeBottomTab !== 'trades' && (
                <div className="space-y-4">
                  {activeBottomTab === 'signals' && (
                    <div className="space-y-3">
                      <div className="bg-[#1e2435] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-green-400">EUR/USD Signal</span>
                          <span className="text-xs text-[#9AA6BC]">2 min ago</span>
                        </div>
                        <div className="text-sm text-[#9AA6BC]">
                          Strong BUY signal • 85% accuracy • 5min expiry
                        </div>
                      </div>
                      <div className="bg-[#1e2435] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-red-400">GBP/USD Signal</span>
                          <span className="text-xs text-[#9AA6BC]">5 min ago</span>
                        </div>
                        <div className="text-sm text-[#9AA6BC]">
                          SELL signal • 78% accuracy • 3min expiry
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeBottomTab === 'social' && (
                    <div className="space-y-3">
                      <div className="bg-[#1e2435] rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">TraderPro123</div>
                            <div className="text-xs text-green-400">+$245 today</div>
                          </div>
                        </div>
                        <div className="text-sm text-[#9AA6BC]">
                          Just opened EUR/USD BUY position
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeBottomTab === 'tournaments' && (
                    <div className="space-y-3">
                      <div className="bg-[#1e2435] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Weekly Championship</span>
                          <span className="text-xs bg-yellow-600 px-2 py-1 rounded">Live</span>
                        </div>
                        <div className="text-sm text-[#9AA6BC]">
                          Prize Pool: $10,000 • 234 participants
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!['signals', 'social', 'tournaments'].includes(activeBottomTab) && (
                    <div className="text-center text-[#9AA6BC] py-8">
                      <p>Coming soon...</p>
                      <p className="text-sm mt-2">This feature is under development</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <MobileBottomNav />
      </div>
    </div>
  )
}