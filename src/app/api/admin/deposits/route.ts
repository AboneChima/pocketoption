import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    
    // Get current user to verify admin status
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all deposits with user information
    const deposits = await prisma.deposit.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limit to last 100 deposits for performance
    })

    return NextResponse.json({ deposits })
  } catch (error) {
    console.error('Admin deposits fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Approve or reject deposit
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    
    // Get current user to verify admin status
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { depositId, status, adminNotes } = await request.json()

    if (!depositId || !status) {
      return NextResponse.json({ error: 'Deposit ID and status are required' }, { status: 400 })
    }

    if (!['Confirmed', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get the deposit
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: { user: true }
    })

    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
    }

    if (deposit.status !== 'Pending') {
      return NextResponse.json({ error: 'Deposit already processed' }, { status: 400 })
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update deposit status
      const updatedDeposit = await tx.deposit.update({
        where: { id: depositId },
        data: {
          status,
          adminNotes: adminNotes || null,
          updatedAt: new Date()
        }
      })

      // If approved, add amount to user's balance
      if (status === 'Confirmed') {
        await tx.user.update({
          where: { id: deposit.userId },
          data: {
            balance: {
              increment: deposit.amount
            }
          }
        })
      }

      return updatedDeposit
    })

    return NextResponse.json({ 
      message: `Deposit ${status.toLowerCase()} successfully`,
      deposit: result 
    })
  } catch (error) {
    console.error('Admin deposit update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}