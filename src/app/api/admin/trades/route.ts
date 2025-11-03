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

    // Get all trades with user information
    const trades = await prisma.trade.findMany({
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
      take: 100 // Limit to last 100 trades for performance
    })

    return NextResponse.json({ trades })
  } catch (error) {
    console.error('Admin trades fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}