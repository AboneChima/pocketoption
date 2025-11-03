import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

const withdrawalSchema = z.object({
  amount: z.number().min(10, 'Minimum withdrawal is $10').max(10000000, 'Maximum withdrawal is $10,000,000'),
  currency: z.enum(['BTC', 'ETH', 'BNB', 'USDT'], { required_error: 'Currency is required' }),
  walletAddress: z.string().min(1, 'Wallet address is required')
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
    const validatedData = withdrawalSchema.parse(body)

    // Get user's current balance
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { balance: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has sufficient balance
    if (user.balance < validatedData.amount) {
      return NextResponse.json({ 
        error: 'Insufficient balance',
        details: `Available balance: $${user.balance.toFixed(2)}`
      }, { status: 400 })
    }

    // Create withdrawal record
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: payload.userId,
        amount: validatedData.amount,
        currency: validatedData.currency,
        walletAddress: validatedData.walletAddress,
        status: 'pending' // Admin needs to approve
      }
    })

    // Deduct amount from user balance immediately (hold the funds)
    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        balance: {
          decrement: validatedData.amount
        }
      }
    })

    return NextResponse.json({
      message: 'Withdrawal successful, processing...',
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        currency: withdrawal.currency,
        status: 'pending'
      }
    })

  } catch (error) {
    console.error('Withdrawal error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
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

    // Get user's withdrawal history
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit to last 20 withdrawals
    })

    return NextResponse.json({ withdrawals })

  } catch (error) {
    console.error('Get withdrawals error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}