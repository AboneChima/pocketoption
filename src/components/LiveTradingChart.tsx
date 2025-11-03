'use client'

import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { marketDataService, type CandlestickData } from '@/lib/marketDataService'

interface LiveCandlestickData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface MarketPair {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  icon: React.ReactNode
}

interface LiveTradingChartProps {
  selectedPair: string
  currentPrice: number
  className?: string
  onPriceUpdate?: (price: number) => void
}

export function LiveTradingChart({ selectedPair, currentPrice, className = '', onPriceUpdate }: LiveTradingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [candlestickData, setCandlestickData] = useState<LiveCandlestickData[]>([])
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h'>('1m')
  const [isLoading, setIsLoading] = useState(true)
  const [livePrice, setLivePrice] = useState(currentPrice)
  const [priceChange, setPriceChange] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [previousPrice, setPreviousPrice] = useState(currentPrice)
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral')
  const animationRef = useRef<number>()
  
  // Panning and interaction states
  const [panOffset, setPanOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [visibleCandleCount, setVisibleCandleCount] = useState(50)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [touchStartDistance, setTouchStartDistance] = useState(0)
  
  // Enhanced data for better historical view
  const [allCandlestickData, setAllCandlestickData] = useState<LiveCandlestickData[]>([])
  
  // Mobile device detection
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const getVisibleData = () => {
    const maxVisible = Math.floor(visibleCandleCount / zoomLevel)
    const startIndex = Math.max(0, allCandlestickData.length - maxVisible - panOffset)
    const endIndex = Math.min(allCandlestickData.length, startIndex + maxVisible)
    return allCandlestickData.slice(startIndex, endIndex)
  }

  // Track price changes for animations
  useEffect(() => {
    if (livePrice !== previousPrice) {
      setPriceDirection(livePrice > previousPrice ? 'up' : 'down')
      setPreviousPrice(livePrice)
      
      // Reset direction after animation
      setTimeout(() => setPriceDirection('neutral'), 500)
    }
  }, [livePrice, previousPrice])

  // Enhanced fetchMarketData to store all data
  const fetchMarketData = async () => {
    setIsLoading(true)
    
    try {
      // Fetch real candlestick data from market data service
      const data = await marketDataService.getCandlestickData(selectedPair, '1m', 200)
      
      // Convert to LiveCandlestickData format
      const liveData: LiveCandlestickData[] = data.map(candle => ({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume
      }))
      
      setAllCandlestickData(liveData)
      setCandlestickData(liveData.slice(-50)) // Show last 50 by default
      
      const latestCandle = liveData[liveData.length - 1]
      if (latestCandle) {
        setLivePrice(latestCandle.close)
        onPriceUpdate?.(latestCandle.close)
        
        const firstCandle = liveData[0]
        if (firstCandle) {
          setPriceChange(latestCandle.close - firstCandle.close)
        }
      }
      
      setIsConnected(true)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch market data:', error)
      setIsConnected(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()
  }, [selectedPair])

  useEffect(() => {
    if (!isConnected) return

    // Subscribe to real-time price updates via WebSocket
    const unsubscribe = marketDataService.subscribeToPrice(selectedPair, (currentPrice) => {
      setCandlestickData(prev => {
        if (prev.length === 0) return prev
        
        const lastCandle = prev[prev.length - 1]
        const now = Date.now()
        const timeDiff = now - lastCandle.time
        const shouldCreateNew = timeDiff > 60000 // Create new candle every minute
        
        if (shouldCreateNew) {
          // Create new candle with real price data
          const open = lastCandle.close
          const close = currentPrice
          
          // Calculate high/low based on price movement
          const high = Math.max(open, close, lastCandle.high)
          const low = Math.min(open, close, lastCandle.low)
          
          const volume = Math.round(100 + Math.random() * 400) // Volume still simulated
          
          const newCandle: LiveCandlestickData = {
            time: now,
            open: Number(open.toFixed(5)),
            high: Number(high.toFixed(5)),
            low: Number(low.toFixed(5)),
            close: Number(close.toFixed(5)),
            volume
          }
          
          const newData = [...prev.slice(-99), newCandle]
          
          // Update live price
          setLivePrice(close)
          onPriceUpdate?.(close)
          
          // Calculate price change
          const firstCandle = newData[0]
          if (firstCandle) {
            setPriceChange(close - firstCandle.close)
          }
          
          return newData
        } else {
          // Update current candle with latest price
          const updated = [...prev]
          const current = { ...updated[updated.length - 1] }
          
          current.close = Number(currentPrice.toFixed(5))
          current.high = Number(Math.max(current.high, currentPrice).toFixed(5))
          current.low = Number(Math.min(current.low, currentPrice).toFixed(5))
          
          updated[updated.length - 1] = current
          
          // Update live price
          setLivePrice(currentPrice)
          onPriceUpdate?.(currentPrice)
          
          return updated
        }
      })
    })

    // Cleanup subscription on unmount or pair change
    return () => {
      unsubscribe()
    }
  }, [isConnected, selectedPair, onPriceUpdate])

  // Additional micro-updates for ultra-smooth price movement
  useEffect(() => {
    if (!isConnected) return

    const microUpdateInterval = setInterval(() => {
      setLivePrice(prev => {
        const microVolatility = 0.00002
        const microChange = (Math.random() - 0.5) * microVolatility * prev
        const newPrice = Number((prev + microChange).toFixed(5))
        onPriceUpdate?.(newPrice)
        return newPrice
      })
    }, 200) // Very fast micro-updates every 200ms

    return () => clearInterval(microUpdateInterval)
  }, [isConnected, onPriceUpdate])

  // Mouse and touch event handlers for panning and zooming
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - dragStart.x
    const sensitivity = 1.2 // Improved sensitivity
    const newOffset = Math.max(0, Math.min(allCandlestickData.length - visibleCandleCount, panOffset - Math.floor(deltaX * sensitivity)))
    
    setPanOffset(newOffset)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const zoomSensitivity = 0.002 // Improved zoom sensitivity
    const deltaZoom = e.deltaY * zoomSensitivity
    const newZoom = Math.max(0.3, Math.min(4, zoomLevel + deltaZoom))
    
    setZoomLevel(newZoom)
    
    // Adjust visible candle count based on zoom
    const baseCandles = 50
    const newVisibleCount = Math.floor(baseCandles / newZoom)
    setVisibleCandleCount(Math.max(10, Math.min(200, newVisibleCount)))
  }

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    
    if (e.touches.length === 1) {
      // Single touch - start panning
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    } else if (e.touches.length === 2) {
      // Two finger touch - start zooming
      const distance = Math.sqrt(
        Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
        Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
      )
      setTouchStartDistance(distance)
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    
    if (e.touches.length === 1 && isDragging) {
      // Single touch - panning with improved sensitivity
      const deltaX = e.touches[0].clientX - dragStart.x
      const sensitivity = 1.5 // Better mobile sensitivity
      const newOffset = Math.max(0, Math.min(allCandlestickData.length - visibleCandleCount, panOffset - Math.floor(deltaX * sensitivity)))
      
      setPanOffset(newOffset)
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    } else if (e.touches.length === 2 && touchStartDistance > 0) {
      // Two finger touch - zooming with improved responsiveness
      const currentDistance = Math.sqrt(
        Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
        Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
      )
      
      const zoomFactor = currentDistance / touchStartDistance
      const newZoom = Math.max(0.3, Math.min(4, zoomLevel * zoomFactor))
      setZoomLevel(newZoom)
      
      // Adjust visible candle count based on zoom
      const baseCandles = 50
      const newVisibleCount = Math.floor(baseCandles / newZoom)
      setVisibleCandleCount(Math.max(10, Math.min(200, newVisibleCount)))
      
      setTouchStartDistance(currentDistance)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDragging(false)
    setTouchStartDistance(0)
  }

  // Update visible data when pan offset or zoom changes
  useEffect(() => {
    setCandlestickData(getVisibleData())
  }, [panOffset, zoomLevel, allCandlestickData])

  // Reset pan when timeframe changes
  useEffect(() => {
    setPanOffset(0)
    setZoomLevel(1)
  }, [timeframe])

  const drawChart = () => {
    const canvas = canvasRef.current
    if (!canvas || candlestickData.length === 0) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Get actual canvas dimensions for responsive drawing
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    // Set canvas size for high DPI displays
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    
    const { width, height } = { width: rect.width, height: rect.height }
    ctx.clearRect(0, 0, width, height)
    
    const prices = candlestickData.flatMap(d => [d.high, d.low])
    const maxPrice = Math.max(...prices)
    const minPrice = Math.min(...prices)
    const padding = (maxPrice - minPrice) * 0.1
    
    // Responsive dimensions - optimized for mobile and desktop
    const isMobile = width < 640
    const leftPadding = isMobile ? 15 : 25  // Reduced padding for more chart space
    const rightPadding = isMobile ? 15 : 25
    const topPadding = isMobile ? 10 : 20
    const bottomPadding = isMobile ? 15 : 30
    
    const chartHeight = height - topPadding - bottomPadding
    const chartWidth = width - leftPadding - rightPadding
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)')
    gradient.addColorStop(1, 'rgba(17, 24, 39, 0.8)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw grid with responsive styling
    ctx.strokeStyle = 'rgba(55, 65, 81, 0.6)'
    ctx.lineWidth = 1
    
    // Horizontal grid lines - more lines for larger screens
    const gridLines = isMobile ? 5 : 8
    for (let i = 0; i <= gridLines; i++) {
      const y = topPadding + (chartHeight / gridLines) * i
      ctx.beginPath()
      ctx.moveTo(leftPadding, y)
      ctx.lineTo(width - rightPadding, y)
      ctx.stroke()
    }
    
    // Vertical grid lines (fewer on mobile)
    const verticalLines = isMobile ? 6 : 10
    for (let i = 0; i < candlestickData.length; i += Math.floor(candlestickData.length / verticalLines)) {
      const x = leftPadding + (chartWidth / candlestickData.length) * i
      ctx.beginPath()
      ctx.moveTo(x, topPadding)
      ctx.lineTo(x, height - bottomPadding)
      ctx.stroke()
    }
    
    // Price labels with responsive font size
    ctx.fillStyle = '#9CA3AF'
    ctx.font = `bold ${isMobile ? '10px' : '12px'} Arial`
    ctx.textAlign = 'right'
    
    for (let i = 0; i <= gridLines; i++) {
      const price = maxPrice + padding - ((maxPrice + padding - (minPrice - padding)) / gridLines) * i
      const y = topPadding + (chartHeight / gridLines) * i
      ctx.fillText(price.toFixed(isMobile ? 3 : 5), leftPadding - 5, y + 4)
    }
    
    // Enhanced candlestick drawing with better visibility
    const candleWidth = Math.max(2, Math.min(12, chartWidth / candlestickData.length * 0.8))
    
    candlestickData.forEach((candle, index) => {
      const x = leftPadding + (chartWidth / candlestickData.length) * index + (chartWidth / candlestickData.length - candleWidth) / 2
      const openY = topPadding + ((maxPrice + padding - candle.open) / (maxPrice + padding - (minPrice - padding))) * chartHeight
      const closeY = topPadding + ((maxPrice + padding - candle.close) / (maxPrice + padding - (minPrice - padding))) * chartHeight
      const highY = topPadding + ((maxPrice + padding - candle.high) / (maxPrice + padding - (minPrice - padding))) * chartHeight
      const lowY = topPadding + ((maxPrice + padding - candle.low) / (maxPrice + padding - (minPrice - padding))) * chartHeight
      
      const isGreen = candle.close > candle.open
      const isLastCandle = index === candlestickData.length - 1
      
      // Enhanced colors with better contrast
      const greenColor = isLastCandle ? '#00FF88' : '#22C55E'
      const redColor = isLastCandle ? '#FF4444' : '#EF4444'
      
      ctx.strokeStyle = isGreen ? greenColor : redColor
      ctx.fillStyle = isGreen ? greenColor : redColor
      ctx.lineWidth = isLastCandle ? (isMobile ? 3 : 3) : (isMobile ? 1.5 : 2)
      
      // Enhanced glow effect for better visibility
      if (isLastCandle) {
        ctx.shadowColor = isGreen ? greenColor : redColor
        ctx.shadowBlur = 15
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      // Draw wick with enhanced thickness
      ctx.beginPath()
      ctx.moveTo(x + candleWidth / 2, highY)
      ctx.lineTo(x + candleWidth / 2, lowY)
      ctx.lineWidth = Math.max(1, candleWidth * 0.2)
      ctx.stroke()
      
      // Draw body with minimum height for visibility
      const bodyTop = Math.min(openY, closeY)
      const bodyHeight = Math.max(Math.abs(closeY - openY), isMobile ? 2 : 3)
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight)
      
      // Add signal indicators for significant price movements
      const priceChange = Math.abs(candle.close - candle.open) / candle.open
      if (priceChange > 0.01) { // 1% change threshold
        ctx.save()
        ctx.fillStyle = isGreen ? '#00FF88' : '#FF4444'
        ctx.shadowBlur = 8
        ctx.shadowColor = ctx.fillStyle
        
        // Draw signal dot
        ctx.beginPath()
        ctx.arc(x + candleWidth / 2, isGreen ? bodyTop - 8 : bodyTop + bodyHeight + 8, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      
      // Reset shadow
      ctx.shadowBlur = 0
    })
    
    // Draw animated current price line
    const currentPriceY = topPadding + ((maxPrice + padding - livePrice) / (maxPrice + padding - (minPrice - padding))) * chartHeight
    
    // Animated dashed line
    const dashOffset = (Date.now() / 50) % 20
    ctx.setLineDash([isMobile ? 5 : 10, isMobile ? 5 : 10])
    ctx.lineDashOffset = -dashOffset
    
    // Price line color based on direction
    const lineColor = priceDirection === 'up' ? '#22C55E' : 
                     priceDirection === 'down' ? '#F87171' : '#3B82F6'
    
    ctx.strokeStyle = lineColor
    ctx.lineWidth = isMobile ? 1.5 : 2
    ctx.shadowColor = lineColor
    ctx.shadowBlur = isMobile ? 3 : 6
    
    ctx.beginPath()
    ctx.moveTo(leftPadding, currentPriceY)
    ctx.lineTo(width - rightPadding, currentPriceY)
    ctx.stroke()
    
    ctx.setLineDash([])
    ctx.shadowBlur = 0
    
    // Enhanced price label with responsive sizing
    const labelWidth = isMobile ? 45 : 60
    const labelHeight = isMobile ? 16 : 20
    
    // Background with gradient
    const labelGradient = ctx.createLinearGradient(width - labelWidth, currentPriceY - labelHeight/2, width, currentPriceY + labelHeight/2)
    labelGradient.addColorStop(0, lineColor)
    labelGradient.addColorStop(1, lineColor + '80')
    
    ctx.fillStyle = labelGradient
    ctx.fillRect(width - labelWidth, currentPriceY - labelHeight/2, labelWidth, labelHeight)
    
    // Price text with responsive font
    ctx.fillStyle = 'white'
    ctx.font = `bold ${isMobile ? '10px' : '12px'} Arial`
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 2
    ctx.fillText(livePrice.toFixed(isMobile ? 3 : 5), width - labelWidth/2, currentPriceY + 4)
    ctx.shadowBlur = 0
    
    // Draw volume bars at the bottom
    const volumeHeight = 40
    const volumeY = height - volumeHeight - 10
    const maxVolume = Math.max(...candlestickData.map(d => d.volume))
    
    candlestickData.forEach((candle, index) => {
      const x = 40 + (chartWidth / candlestickData.length) * index
      const barHeight = (candle.volume / maxVolume) * volumeHeight
      const isGreen = candle.close > candle.open
      
      ctx.fillStyle = isGreen ? 'rgba(34, 197, 94, 0.3)' : 'rgba(248, 113, 113, 0.3)'
      ctx.fillRect(x, volumeY + volumeHeight - barHeight, candleWidth, barHeight)
    })
  }

  useEffect(() => {
    const animate = () => {
      drawChart()
      animationRef.current = requestAnimationFrame(animate)
    }
    
    if (candlestickData.length > 0) {
      animate()
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [candlestickData, livePrice, priceDirection])

  if (isLoading) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-2 h-full flex flex-col ${className}`}>
      {/* Mobile-optimized header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2 flex-shrink-0">
        <div className="flex items-center justify-between sm:block">
          <div>
            <h3 className="text-sm font-semibold text-white">{selectedPair}</h3>
            <p className="text-xs text-gray-400">Live Trading</p>
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-400">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-400">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      {/* Full-screen chart container with enhanced interactions */}
      <div className="flex-1 mb-2 min-h-0 relative">
        {/* Chart interaction instructions */}
        <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {isMobile ? 'Drag to pan • Pinch to zoom' : 'Drag to pan • Scroll to zoom'}
        </div>
        
        {/* Pan/Zoom controls */}
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <button
            onClick={() => setPanOffset(Math.max(0, panOffset - 10))}
            className="bg-black bg-opacity-50 text-white p-1 rounded text-xs hover:bg-opacity-70"
            disabled={panOffset === 0}
          >
            ←
          </button>
          <button
            onClick={() => setPanOffset(Math.min(allCandlestickData.length - visibleCandleCount, panOffset + 10))}
            className="bg-black bg-opacity-50 text-white p-1 rounded text-xs hover:bg-opacity-70"
            disabled={panOffset >= allCandlestickData.length - visibleCandleCount}
          >
            →
          </button>
          <button
            onClick={() => { setPanOffset(0); setZoomLevel(1); }}
            className="bg-black bg-opacity-50 text-white p-1 rounded text-xs hover:bg-opacity-70"
          >
            Reset
          </button>
        </div>
        
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className={`w-full bg-gray-900 rounded cursor-grab ${isDragging ? 'cursor-grabbing' : ''} flex-1`}
          style={{ 
            width: '100%',
            height: '100%',
            minHeight: '300px',
            maxHeight: 'none',
            touchAction: 'none' // Prevent default touch behaviors
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>
      
      {/* Mobile-responsive timeframe and refresh controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2 flex-shrink-0">
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
          {(['1m', '5m', '15m', '1h'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                timeframe === tf
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-102'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom level indicator */}
          <span className="text-xs text-gray-400 hidden sm:block">
            Zoom: {(zoomLevel * 100).toFixed(0)}%
          </span>
          
          <button
            onClick={fetchMarketData}
            className={`p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 hover:scale-105 ${
              isLoading ? 'animate-pulse' : ''
            }`}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 text-gray-300 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      

    </div>
  )
}