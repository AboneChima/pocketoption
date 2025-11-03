import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/db'

// Middleware to verify admin access
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || !user.isAdmin) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform withdrawals to match frontend expectations
    const transformedWithdrawals = withdrawals.map(withdrawal => ({
      ...withdrawal,
      user: {
        ...withdrawal.user,
        name: `${withdrawal.user.firstName || ''} ${withdrawal.user.lastName || ''}`.trim() || withdrawal.user.email
      }
    }))

    return NextResponse.json({ withdrawals: transformedWithdrawals })

  } catch (error) {
    console.error('Admin withdrawals fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { withdrawalId, status, adminNotes } = await request.json()

    if (!withdrawalId || !status) {
      return NextResponse.json(
        { error: 'Withdrawal ID and status are required' },
        { status: 400 }
      )
    }

    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status,
        adminNotes: adminNotes || null,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Transform withdrawal to match frontend expectations
    const transformedWithdrawal = {
      ...updatedWithdrawal,
      user: {
        ...updatedWithdrawal.user,
        name: `${updatedWithdrawal.user.firstName || ''} ${updatedWithdrawal.user.lastName || ''}`.trim() || updatedWithdrawal.user.email
      }
    }

    return NextResponse.json({ withdrawal: transformedWithdrawal })

  } catch (error) {
    console.error('Admin withdrawal update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}