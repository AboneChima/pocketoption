import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user's trading statistics
    const trades = await prisma.trade.findMany({
      where: { userId: payload.userId },
      select: {
        status: true,
        profit: true,
        amount: true,
        createdAt: true
      }
    })

    // Calculate statistics
    const totalTrades = trades.length
    const wonTrades = trades.filter(trade => trade.status === 'WON').length
    const lostTrades = trades.filter(trade => trade.status === 'LOST').length
    const winRate = totalTrades > 0 ? (wonTrades / totalTrades) * 100 : 0
    
    const totalProfit = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0)
    const totalVolume = trades.reduce((sum, trade) => sum + trade.amount, 0)
    
    const bestTrade = trades.reduce((best, trade) => {
      return (trade.profit || 0) > (best?.profit || 0) ? trade : best
    }, null as any)
    
    const worstTrade = trades.reduce((worst, trade) => {
      return (trade.profit || 0) < (worst?.profit || 0) ? trade : worst
    }, null as any)

    // Calculate current streak
    const recentTrades = trades
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter(trade => trade.status === 'WON' || trade.status === 'LOST')
    
    let currentStreak = 0
    let streakType = 'none'
    
    if (recentTrades.length > 0) {
      const lastTradeStatus = recentTrades[0].status
      streakType = lastTradeStatus === 'WON' ? 'win' : 'loss'
      
      for (const trade of recentTrades) {
        if (trade.status === lastTradeStatus) {
          currentStreak++
        } else {
          break
        }
      }
    }

    // Get deposits and withdrawals for additional stats
    const deposits = await prisma.deposit.findMany({
      where: { 
        userId: payload.userId,
        status: 'Confirmed'
      },
      select: { amount: true }
    })

    const withdrawals = await prisma.withdrawal.findMany({
      where: { 
        userId: payload.userId,
        status: 'completed'
      },
      select: { amount: true }
    })

    const totalDeposits = deposits.reduce((sum, deposit) => sum + deposit.amount, 0)
    const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0)

    return NextResponse.json({
      totalTrades,
      wonTrades,
      lostTrades,
      winRate: Math.round(winRate * 100) / 100, // Round to 2 decimal places
      totalProfit: Math.round(totalProfit * 100) / 100,
      totalVolume: Math.round(totalVolume * 100) / 100,
      bestTrade: bestTrade ? Math.round((bestTrade.profit || 0) * 100) / 100 : 0,
      worstTrade: worstTrade ? Math.round((worstTrade.profit || 0) * 100) / 100 : 0,
      currentStreak,
      streakType,
      totalDeposits: Math.round(totalDeposits * 100) / 100,
      totalWithdrawals: Math.round(totalWithdrawals * 100) / 100,
      averageTrade: totalTrades > 0 ? Math.round((totalVolume / totalTrades) * 100) / 100 : 0
    })

  } catch (error) {
    console.error('Get user stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}