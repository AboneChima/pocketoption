'use client'

import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface CandlestickData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface TradingChartProps {
  pair: string
  currentPrice: number
  className?: string
}

export function TradingChart({ pair, currentPrice, className = '' }: TradingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([])
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h'>('1m')

  // Generate initial candlestick data
  useEffect(() => {
    const generateInitialData = () => {
      const data: CandlestickData[] = []
      let basePrice = currentPrice
      const now = Date.now()
      
      for (let i = 100; i >= 0; i--) {
        const time = now - (i * 60000) // 1 minute intervals
        const volatility = 0.002 // 0.2% volatility
        
        const open = basePrice
        const change = (Math.random() - 0.5) * volatility * basePrice
        const close = open + change
        
        const high = Math.max(open, close) + Math.random() * volatility * basePrice * 0.5
        const low = Math.min(open, close) - Math.random() * volatility * basePrice * 0.5
        
        data.push({
          time,
          open,
          high,
          low,
          close,
          volume: Math.random() * 1000 + 100
        })
        
        basePrice = close
      }
      
      return data
    }

    setCandlestickData(generateInitialData())
  }, [currentPrice, pair])

  // Update chart with new data every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCandlestickData(prev => {
        if (prev.length === 0) return prev
        
        const lastCandle = prev[prev.length - 1]
        const now = Date.now()
        const volatility = 0.002
        
        // Update current candle or create new one
        const timeDiff = now - lastCandle.time
        const shouldCreateNew = timeDiff > 60000 // 1 minute
        
        if (shouldCreateNew) {
          // Create new candle
          const open = lastCandle.close
          const change = (Math.random() - 0.5) * volatility * open
          const close = open + change
          const high = Math.max(open, close) + Math.random() * volatility * open * 0.3
          const low = Math.min(open, close) - Math.random() * volatility * open * 0.3
          
          const newCandle: CandlestickData = {
            time: now,
            open,
            high,
            low,
            close,
            volume: Math.random() * 1000 + 100
          }
          
          return [...prev.slice(-100), newCandle] // Keep last 100 candles
        } else {
          // Update current candle
          const updated = [...prev]
          const current = { ...updated[updated.length - 1] }
          
          const change = (Math.random() - 0.5) * volatility * current.open * 0.5
          current.close = Math.max(current.low, Math.min(current.high, current.close + change))
          current.high = Math.max(current.high, current.close)
          current.low = Math.min(current.low, current.close)
          
          updated[updated.length - 1] = current
          return updated
        }
      })
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || candlestickData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    // Calculate price range
    const prices = candlestickData.flatMap(d => [d.high, d.low])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice
    const padding = priceRange * 0.1

    // Drawing parameters
    const chartHeight = height - 60
    const chartWidth = width - 80
    const candleWidth = Math.max(2, chartWidth / candlestickData.length - 2)

    // Draw grid lines
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = 30 + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(40, y)
      ctx.lineTo(width - 20, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = 40 + (chartWidth / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, 30)
      ctx.lineTo(x, height - 30)
      ctx.stroke()
    }

    // Draw price labels
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '12px monospace'
    ctx.textAlign = 'right'
    
    for (let i = 0; i <= 5; i++) {
      const price = maxPrice + padding - ((maxPrice + padding - (minPrice - padding)) / 5) * i
      const y = 30 + (chartHeight / 5) * i
      ctx.fillText(typeof price === 'number' && !isNaN(price) ? price.toFixed(5) : '0.00000', 35, y + 4)
    }

    // Draw candlesticks
    candlestickData.forEach((candle, index) => {
      const x = 40 + (chartWidth / candlestickData.length) * index
      const openY = 30 + ((maxPrice + padding - candle.open) / (maxPrice + padding - (minPrice - padding))) * chartHeight
      const closeY = 30 + ((maxPrice + padding - candle.close) / (maxPrice + padding - (minPrice - padding))) * chartHeight
      const highY = 30 + ((maxPrice + padding - candle.high) / (maxPrice + padding - (minPrice - padding))) * chartHeight
      const lowY = 30 + ((maxPrice + padding - candle.low) / (maxPrice + padding - (minPrice - padding))) * chartHeight

      const isGreen = candle.close > candle.open
      
      // Draw wick
      ctx.strokeStyle = isGreen ? '#10B981' : '#EF4444'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x + candleWidth / 2, highY)
      ctx.lineTo(x + candleWidth / 2, lowY)
      ctx.stroke()

      // Draw body
      ctx.fillStyle = isGreen ? '#10B981' : '#EF4444'
      const bodyTop = Math.min(openY, closeY)
      const bodyHeight = Math.abs(closeY - openY)
      ctx.fillRect(x, bodyTop, candleWidth, Math.max(1, bodyHeight))
    })

    // Draw current price line
    if (candlestickData.length > 0) {
      const currentPriceY = 30 + ((maxPrice + padding - currentPrice) / (maxPrice + padding - (minPrice - padding))) * chartHeight
      
      ctx.strokeStyle = '#3B82F6'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(40, currentPriceY)
      ctx.lineTo(width - 20, currentPriceY)
      ctx.stroke()
      ctx.setLineDash([])

      // Price label
      ctx.fillStyle = '#3B82F6'
      ctx.fillRect(width - 80, currentPriceY - 10, 60, 20)
      ctx.fillStyle = 'white'
      ctx.textAlign = 'center'
      ctx.fillText(typeof currentPrice === 'number' ? currentPrice.toFixed(5) : '0.00000', width - 50, currentPriceY + 4)
    }

  }, [candlestickData, currentPrice])

  const lastCandle = candlestickData[candlestickData.length - 1]
  const priceChange = lastCandle && typeof lastCandle.close === 'number' && typeof lastCandle.open === 'number' 
    ? lastCandle.close - lastCandle.open 
    : 0
  const isPositive = priceChange >= 0

  return (
    <div className={`bg-gray-900/50 rounded-lg p-4 ${className}`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-white">{pair}</h3>
          <div className="flex items-center space-x-2">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{typeof priceChange === 'number' ? priceChange.toFixed(5) : '0.00000'}
            </span>
          </div>
        </div>
        
        {/* Timeframe selector */}
        <div className="flex space-x-1">
          {(['1m', '5m', '15m', '1h'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs rounded ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="w-full h-[300px] bg-gray-800/30 rounded"
        />
        
        {/* Live indicator */}
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">LIVE</span>
        </div>
      </div>

      {/* Chart info */}
      <div className="mt-4 grid grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-gray-400">Open:</span>
          <span className="text-white ml-1">{lastCandle && typeof lastCandle.open === 'number' ? lastCandle.open.toFixed(5) : '0.00000'}</span>
        </div>
        <div>
          <span className="text-gray-400">High:</span>
          <span className="text-white ml-1">{lastCandle && typeof lastCandle.high === 'number' ? lastCandle.high.toFixed(5) : '0.00000'}</span>
        </div>
        <div>
          <span className="text-gray-400">Low:</span>
          <span className="text-white ml-1">{lastCandle && typeof lastCandle.low === 'number' ? lastCandle.low.toFixed(5) : '0.00000'}</span>
        </div>
        <div>
          <span className="text-gray-400">Close:</span>
          <span className="text-white ml-1">{lastCandle && typeof lastCandle.close === 'number' ? lastCandle.close.toFixed(5) : '0.00000'}</span>
        </div>
      </div>
    </div>
  )
}