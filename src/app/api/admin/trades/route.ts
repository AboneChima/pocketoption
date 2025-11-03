import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { createDatabaseUnavailableResponse, requireDatabase } from '@/lib/api-helpers'

// Middleware to verify admin access
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    const db = requireDatabase()
    
    const user = await db.user.findUnique({
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
    if (!prisma) {
      return createDatabaseUnavailableResponse()
    }

    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const db = requireDatabase()
    const trades = await db.trade.findMany({
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

    // Transform trades to match frontend expectations
    const transformedTrades = trades.map(trade => ({
      ...trade,
      user: {
        ...trade.user,
        name: `${trade.user.firstName || ''} ${trade.user.lastName || ''}`.trim() || trade.user.email
      }
    }))

    return NextResponse.json({ trades: transformedTrades })

  } catch (error) {
    console.error('Admin trades fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}