import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

const tradeSchema = z.object({
  pair: z.string().min(1, 'Trading pair is required'),
  amount: z.number().min(1, 'Amount must be at least $1'),
  direction: z.enum(['CALL', 'PUT'], { message: 'Direction must be CALL or PUT' }),
  entryPrice: z.number().min(0, 'Entry price must be positive'),
  duration: z.number().min(30).max(300).default(60) // 30 seconds to 5 minutes
})

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = tradeSchema.parse(body)

    // Check if user has sufficient balance
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.balance < validatedData.amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Deduct trade amount from user balance
    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        balance: {
          decrement: validatedData.amount
        }
      }
    })

    // Create trade record
    const trade = await prisma.trade.create({
      data: {
        userId: payload.userId,
        pair: validatedData.pair,
        amount: validatedData.amount,
        direction: validatedData.direction,
        entryPrice: validatedData.entryPrice,
        duration: validatedData.duration,
        status: 'ACTIVE'
      }
    })

    // Simulate trade execution after duration
    setTimeout(async () => {
      await executeTrade(trade.id)
    }, validatedData.duration * 1000)

    return NextResponse.json({
      message: 'Trade placed successfully',
      trade: {
        id: trade.id,
        pair: trade.pair,
        amount: trade.amount,
        direction: trade.direction,
        entryPrice: trade.entryPrice,
        duration: trade.duration,
        status: trade.status
      }
    })

  } catch (error) {
    console.error('Trade error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user's trade history
    const trades = await prisma.trade.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({ trades })

  } catch (error) {
    console.error('Get trades error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Function to execute trade after duration
async function executeTrade(tradeId: string) {
  try {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { user: true }
    })

    if (!trade || trade.status !== 'ACTIVE') {
      return
    }

    // Generate random exit price (simulate market movement)
    const volatility = 0.002 // 0.2% volatility
    const randomChange = (Math.random() - 0.5) * 2 * volatility
    const exitPrice = trade.entryPrice * (1 + randomChange)

    // Determine if trade won or lost
    const priceMovedUp = exitPrice > trade.entryPrice
    const tradeWon = (trade.direction === 'CALL' && priceMovedUp) || 
                     (trade.direction === 'PUT' && !priceMovedUp)

    // Calculate payout (85% payout ratio for winning trades)
    const payout = tradeWon ? trade.amount * 1.85 : 0
    const profit = payout - trade.amount

    // Update trade record
    await prisma.trade.update({
      where: { id: tradeId },
      data: {
        exitPrice,
        payout,
        profit,
        status: tradeWon ? 'WON' : 'LOST',
        closedAt: new Date()
      }
    })

    // Update user balance if trade won
    if (tradeWon) {
      await prisma.user.update({
        where: { id: trade.userId },
        data: {
          balance: {
            increment: payout
          }
        }
      })
    }

    console.log(`Trade ${tradeId} executed: ${tradeWon ? 'WON' : 'LOST'}, Profit: $${profit.toFixed(2)}`)

  } catch (error) {
    console.error('Execute trade error:', error)
  }
}