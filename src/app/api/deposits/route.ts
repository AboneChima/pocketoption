import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { currency, amount, address } = await request.json()

    // Validate input
    if (!currency || !amount || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount < 500) {
      return NextResponse.json({ error: 'Minimum deposit amount is $500' }, { status: 400 })
    }

    if (amount > 10000000) {
      return NextResponse.json({ error: 'Maximum deposit amount is $10,000,000' }, { status: 400 })
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create deposit record with Pending status (no balance update)
    const deposit = await prisma.deposit.create({
      data: {
        userId: user.id,
        currency,
        amount,
        address,
        status: 'Pending', // Always pending for admin approval
        createdAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      deposit,
      message: 'Deposit request submitted successfully. Waiting for admin approval.'
    })

  } catch (error) {
    console.error('Deposit error:', error)
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

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user's deposit history
    const deposits = await prisma.deposit.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 deposits
    })

    return NextResponse.json({ deposits })

  } catch (error) {
    console.error('Get deposits error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}