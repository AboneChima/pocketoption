'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { LiveTradingChart } from '@/components/LiveTradingChart'
import { UnifiedLoader, PageLoader } from '@/components/ui/UnifiedLoader'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { placeTrade } from '@/lib/firebaseFunctions'
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
  X,
  Activity,
  Target,
  Percent
} from 'lucide-react'
import DesktopSidebar from '@/components/DesktopSidebar'
import MobileBottomNav from '@/components/MobileBottomNav'
import WithdrawModal from '@/components/modals/WithdrawModal'
import WithdrawalHistoryDashboard from '@/components/WithdrawalHistoryDashboard'

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
  const { user, logout, loading, updateBalance } = useAuth()
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
  const [balance, setBalance] = useState(0)
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
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

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

  // Removed cluttered bottom tabs for cleaner UI

  // Trading logic
  const calculatePayout = () => {
    return tradeAmount * (payoutPercent / 100)
  }

  const calculateProfit = () => {
    return calculatePayout() - tradeAmount
  }

  const openTrade = async (direction: 'BUY' | 'SELL') => {
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

    setIsTrading(true)

    try {
      // Create trade using Firebase Cloud Function
      const result = await placeTrade(
        selectedPair.symbol,
        direction === 'BUY' ? 'up' : 'down',
        tradeAmount,
        selectedPair.price,
        selectedTime,
        {
          payout: payoutPercent / 100,
          platform: 'web'
        }
      )

      // Create local trade object for UI
      const trade: Trade = {
        id: result.tradeId || Date.now().toString(),
        pair: selectedPair.symbol,
        direction,
        amount: tradeAmount,
        payout: payoutPercent / 100,
        entry: selectedPair.price,
        timestamp: Date.now(),
        expiryTime: Date.now() + (selectedTime * 1000)
      }

      setActiveTrades(prev => [...prev, trade])
      
      // Update local balance (will be synced with server)
      const newBalance = balance - tradeAmount
      setBalance(newBalance)
      
      // Update balance in AuthContext to keep it synchronized
      if (updateBalance) {
        updateBalance(newBalance)
      }

      // Trade placed - will show result notification when complete
      // toast.dismiss('trade-processing')
      /* toast.success(
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
      ) */

      // Simulate trade expiry (in real app, this would be handled by server)
      setTimeout(() => {
        resolveTrade(trade.id)
      }, selectedTime * 1000)

    } catch (error: any) {
      toast.error(error.message || 'Failed to place trade. Please try again.')
    } finally {
      setIsTrading(false)
    }
  }

  const resolveTrade = (tradeId: string) => {
    setActiveTrades(prev => {
      const trade = prev.find(t => t.id === tradeId)
      if (!trade) return prev

      // Check if already resolved to prevent duplicates
      if (tradeHistory.some(t => t.id === tradeId)) {
        console.log('Trade already resolved, skipping:', tradeId)
        return prev.filter(t => t.id !== tradeId)
      }

      // Realistic house edge - users lose 70% of the time
      const randomChance = Math.random()
      const isWin = randomChance <= 0.30 // Only 30% chance to win
      
      // Calculate exit price for display
      const volatility = 0.0005
      const timeDecay = Math.min(selectedTime / 60, 1)
      let priceMovement
      
      if (isWin) {
        // If winning, price moves in user's favor
        priceMovement = trade.direction === 'BUY' 
          ? Math.abs(Math.random() * volatility * timeDecay) // Price goes up
          : -Math.abs(Math.random() * volatility * timeDecay) // Price goes down
      } else {
        // If losing, price moves against user
        priceMovement = trade.direction === 'BUY'
          ? -Math.abs(Math.random() * volatility * timeDecay) // Price goes down
          : Math.abs(Math.random() * volatility * timeDecay) // Price goes up
      }
      
      const exitPrice = trade.entry + priceMovement

      const resolvedTrade: Trade = {
        ...trade,
        exit: exitPrice,
        result: isWin ? 'Win' : 'Loss'
      }

      if (isWin) {
        const profit = trade.amount * trade.payout
        const totalReturn = trade.amount + profit
        const newBalance = balance + totalReturn
        setBalance(newBalance)
        
        // Update balance in AuthContext to keep it synchronized
        if (updateBalance) {
          updateBalance(newBalance)
        }
        
        // Show win notification
        toast.success(
          `🎉 Trade Won! +$${profit.toFixed(2)} profit (${(trade.payout * 100).toFixed(0)}% return)`,
          {
            id: `win-${tradeId}`,
            duration: 5000,
            style: {
              background: '#065f46',
              color: '#fff',
              border: '1px solid #10b981'
            }
          }
        )
      } else {
        // For losses, no balance change needed since amount was already deducted when trade was opened
        // Show loss notification
        toast.error(
          `📉 Trade Lost. -$${trade.amount.toFixed(2)} on ${trade.pair}`,
          {
            id: `loss-${tradeId}`,
            duration: 4000,
            style: {
              background: '#7f1d1d',
              color: '#fff',
              border: '1px solid #ef4444'
            }
          }
        )
      }

      // Update trade in Firebase
      const updateTradeInFirebase = async () => {
        try {
          const profit = isWin ? trade.amount * trade.payout : -trade.amount
          await fetch(`/api/firebase/close-trade`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tradeId: trade.id,
              exitPrice,
              result: isWin ? 'won' : 'lost',
              profit
            })
          })
        } catch (error) {
          console.error('Failed to update trade in Firebase:', error)
        }
      }
      updateTradeInFirebase()

      // Move state updates outside to avoid setState during render
      setTimeout(() => {
        setTradeHistory(prev => [resolvedTrade, ...prev])
        setIsTrading(false)
      }, 0)
      
      return prev.filter(t => t.id !== tradeId)
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    // Add a small delay to prevent race conditions during login
    if (!loading && !user) {
      const timer = setTimeout(() => {
        if (!user) {
          router.push('/auth')
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user, loading, router])

  // Sync balance with user's actual balance
  useEffect(() => {
    if (user && user.balance !== undefined) {
      setBalance(user.balance)
    }
  }, [user])

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
          
          <button
            onClick={() => router.push('/deposit')}
            className="bg-green-600 hover:bg-green-700 px-2 py-1.5 rounded-md transition-colors flex items-center space-x-1"
          >
            <Wallet className="w-3 h-3" />
            <span className="text-xs font-medium">Deposit</span>
          </button>
          
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="bg-red-600 hover:bg-red-700 px-2 py-1.5 rounded-md transition-colors flex items-center space-x-1"
          >
            <TrendingDown className="w-3 h-3" />
            <span className="text-xs font-medium">Withdraw</span>
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

      {/* Professional Trading Features - Responsive */}
      <div className="bg-[#12192A] border-t border-[#1e2435] lg:hidden">
        {/* Market Sentiment */}
        <div className="px-4 py-3 border-b border-[#1e2435]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Market Sentiment</span>
            <span className="text-xs text-gray-500">{selectedPair.symbol}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-2 bg-[#1e2435] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: '58%' }}></div>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <ArrowUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400 font-medium">58%</span>
              </div>
              <div className="flex items-center space-x-1">
                <ArrowDown className="w-3 h-3 text-red-400" />
                <span className="text-red-400 font-medium">42%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="px-4 py-3 border-b border-[#1e2435]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Quick Amount</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 5, 10, 25].map((amt) => (
              <button
                key={amt}
                onClick={() => setTradeAmount(amt)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  tradeAmount === amt
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1e2435] text-gray-300 hover:bg-[#252d42]'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        {/* Active Trades with Timer */}
        {activeTrades.length > 0 && (
          <div className="px-4 py-3 border-b border-[#1e2435]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Active Positions</span>
              <span className="text-xs text-blue-400">{activeTrades.length}</span>
            </div>
            <div className="space-y-2">
              {activeTrades.map((trade) => {
                const timeLeft = Math.max(0, Math.floor((trade.expiryTime - currentTime) / 1000))
                const progress = (timeLeft / selectedTime) * 100
                return (
                  <div key={trade.id} className="bg-[#1e2435] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          trade.direction === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.direction}
                        </span>
                        <span className="text-sm font-medium text-white">{trade.pair}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-300 font-mono">{formatTime(timeLeft)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span>${trade.amount}</span>
                      <span className="text-green-400">+{(trade.payout * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1 bg-[#0E1320] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Trades Feed */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Recent Trades</span>
            <button
              onClick={() => router.push('/history')}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All
            </button>
          </div>
          {tradeHistory.length > 0 ? (
            <div className="space-y-2">
              {tradeHistory.slice(0, 3).map((trade) => (
                <div key={trade.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${trade.result === 'Win' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-gray-400">{trade.pair}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      trade.direction === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {trade.direction}
                    </span>
                  </div>
                  <span className={`font-medium ${trade.result === 'Win' ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.result === 'Win' ? '+' : '-'}${Math.abs(trade.amount * (trade.result === 'Win' ? trade.payout : 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-4">No trades yet</p>
          )}
        </div>
      </div>

      {/* Desktop Trading Info - Clean and Professional */}
      <div className="hidden lg:block bg-[#12192A] border-t border-[#1e2435] px-8 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-6">
          {/* Market Sentiment */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Market Sentiment</span>
              <span className="text-xs text-gray-500">{selectedPair.symbol}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 h-3 bg-[#1e2435] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: '58%' }}></div>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <ArrowUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">58%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ArrowDown className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium">42%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Positions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Active Positions</span>
              <span className="text-sm text-blue-400">{activeTrades.length}</span>
            </div>
            {activeTrades.length > 0 ? (
              <div className="text-sm text-gray-300">
                {activeTrades[0].pair} • ${activeTrades[0].amount} • {activeTrades[0].direction}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No active trades</div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Quick Actions</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push('/portfolio')}
                className="flex-1 px-3 py-2 bg-[#1e2435] hover:bg-[#252d42] rounded-lg text-sm text-gray-300 transition-colors"
              >
                Portfolio
              </button>
              <button
                onClick={() => router.push('/history')}
                className="flex-1 px-3 py-2 bg-[#1e2435] hover:bg-[#252d42] rounded-lg text-sm text-gray-300 transition-colors"
              >
                History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Removed cluttered bottom tabs - keeping it simple */}
      {false && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end lg:items-center lg:justify-center animate-in fade-in duration-200" onClick={() => setShowBottomSheet(false)}>
          <div className="w-full lg:max-w-4xl bg-gradient-to-b from-[#12192A] to-[#0E1320] rounded-t-2xl lg:rounded-2xl max-h-[85vh] lg:max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom lg:slide-in-from-top duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-[#1e2435] flex-shrink-0">
              <h3 className="text-lg lg:text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {activeBottomTab}
              </h3>
              <button
                onClick={() => setShowBottomSheet(false)}
                className="p-2 hover:bg-[#1e2435] rounded-lg transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 lg:p-6 overflow-y-auto flex-1">
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
              
              {activeBottomTab === 'withdrawals' && (
                <WithdrawalHistoryDashboard />
              )}
              
              {activeBottomTab !== 'trades' && activeBottomTab !== 'withdrawals' && (
                <div className="space-y-4">
                  {activeBottomTab === 'signals' && (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl p-4 hover:border-green-500/40 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="font-semibold text-white">EUR/USD</span>
                          </div>
                          <span className="text-xs text-gray-400 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>2m ago</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">BUY Signal</span>
                            <p className="text-xs text-gray-400 mt-2">85% accuracy • 5min expiry</p>
                          </div>
                          <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
                            Trade Now
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-red-500/10 to-pink-500/5 border border-red-500/20 rounded-xl p-4 hover:border-red-500/40 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            </div>
                            <span className="font-semibold text-white">GBP/USD</span>
                          </div>
                          <span className="text-xs text-gray-400 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>5m ago</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">SELL Signal</span>
                            <p className="text-xs text-gray-400 mt-2">78% accuracy • 3min expiry</p>
                          </div>
                          <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors">
                            Trade Now
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-[#1e2435]/50 border border-[#252d42] rounded-xl p-4 text-center">
                        <Zap className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-300 font-medium">AI-Powered Signals</p>
                        <p className="text-xs text-gray-400 mt-1">Real-time market analysis</p>
                      </div>
                    </div>
                  )}
                  
                  {activeBottomTab === 'social' && (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/5 border border-blue-500/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-white">TraderPro123</div>
                              <div className="text-xs text-green-400 flex items-center space-x-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>+$245 today</span>
                              </div>
                            </div>
                          </div>
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                            Follow
                          </button>
                        </div>
                        <div className="text-sm text-gray-300 bg-[#1e2435]/50 rounded-lg p-2">
                          Just opened <span className="text-green-400 font-medium">EUR/USD BUY</span> position
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-white">CryptoKing</div>
                              <div className="text-xs text-green-400 flex items-center space-x-1">
                                <Trophy className="w-3 h-3" />
                                <span>Top Trader</span>
                              </div>
                            </div>
                          </div>
                          <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors">
                            Follow
                          </button>
                        </div>
                        <div className="text-sm text-gray-300 bg-[#1e2435]/50 rounded-lg p-2">
                          Closed <span className="text-green-400 font-medium">BTC/USD</span> with +$180 profit
                        </div>
                      </div>
                      
                      <div className="bg-[#1e2435]/50 border border-[#252d42] rounded-xl p-4 text-center">
                        <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-300 font-medium">Copy Top Traders</p>
                        <p className="text-xs text-gray-400 mt-1">Follow and replicate successful strategies</p>
                      </div>
                    </div>
                  )}
                  
                  {activeBottomTab === 'tournaments' && (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/5 border border-yellow-500/30 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                              <Trophy className="w-4 h-4 text-yellow-400" />
                            </div>
                            <span className="font-semibold text-white">Weekly Championship</span>
                          </div>
                          <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-medium rounded animate-pulse">LIVE</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Prize Pool:</span>
                            <span className="text-yellow-400 font-semibold">$10,000</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Participants:</span>
                            <span className="text-white font-medium">234 traders</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Ends in:</span>
                            <span className="text-white font-medium">2d 14h</span>
                          </div>
                        </div>
                        <button className="w-full mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors">
                          Join Tournament
                        </button>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/5 border border-purple-500/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              <Trophy className="w-4 h-4 text-purple-400" />
                            </div>
                            <span className="font-semibold text-white">Daily Sprint</span>
                          </div>
                          <span className="px-2 py-1 bg-gray-600 text-white text-xs font-medium rounded">Upcoming</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Prize Pool:</span>
                            <span className="text-purple-400 font-semibold">$2,500</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Starts in:</span>
                            <span className="text-white font-medium">6h 30m</span>
                          </div>
                        </div>
                        <button className="w-full mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
                          Set Reminder
                        </button>
                      </div>
                      
                      <div className="bg-[#1e2435]/50 border border-[#252d42] rounded-xl p-4 text-center">
                        <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-300 font-medium">Compete & Win</p>
                        <p className="text-xs text-gray-400 mt-1">Join tournaments and win real prizes</p>
                      </div>
                    </div>
                  )}
                  
                  {activeBottomTab === 'express' && (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="font-semibold text-white">Quick Trade</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">Trade with one click using preset amounts</p>
                        <div className="grid grid-cols-3 gap-2">
                          <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                            $10
                          </button>
                          <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                            $25
                          </button>
                          <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                            $50
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-green-400" />
                          </div>
                          <span className="font-semibold text-white">Auto Trade</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">Set conditions and let the system trade for you</p>
                        <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                          Configure Auto Trade
                        </button>
                      </div>
                      
                      <div className="bg-[#1e2435]/50 border border-[#252d42] rounded-xl p-4 text-center">
                        <Zap className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-300 font-medium">Express Trading</p>
                        <p className="text-xs text-gray-400 mt-1">Fast execution with minimal clicks</p>
                      </div>
                    </div>
                  )}
                  
                  {!['signals', 'social', 'tournaments', 'express'].includes(activeBottomTab) && (
                    <div className="text-center text-[#9AA6BC] py-8">
                      <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="font-medium">Coming Soon</p>
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

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        balance={balance}
        onWithdrawSuccess={() => {
          // Refresh balance after successful withdrawal
          if (user && user.balance !== undefined) {
            setBalance(user.balance)
          }
        }}
      />
    </div>
  )
}