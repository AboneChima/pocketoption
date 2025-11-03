import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Fetch all withdrawals for admin
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch all withdrawals with user information
    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ withdrawals })
  } catch (error) {
    console.error('Admin withdrawals fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Update withdrawal status (approve/reject)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { withdrawalId, status, adminNote } = await request.json()

    if (!withdrawalId || !status) {
      return NextResponse.json({ error: 'Withdrawal ID and status are required' }, { status: 400 })
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get the withdrawal
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true }
    })

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 })
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json({ error: 'Withdrawal already processed' }, { status: 400 })
    }

    // Update withdrawal status
    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status,
        adminNotes: adminNote || null
      }
    })

    // If rejected, refund the amount to user's balance
    if (status === 'rejected') {
      await prisma.user.update({
        where: { id: withdrawal.userId },
        data: {
          balance: {
            increment: withdrawal.amount
          }
        }
      })
    }

    return NextResponse.json({ 
      message: `Withdrawal ${status} successfully`,
      withdrawal: updatedWithdrawal 
    })
  } catch (error) {
    console.error('Admin withdrawal update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}