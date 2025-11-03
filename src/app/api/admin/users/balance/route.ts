import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const balanceUpdateSchema = z.object({
  userId: z.string(),
  amount: z.number().min(0)
})

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

    const body = await request.json()
    const { userId, amount } = balanceUpdateSchema.parse(body)

    // Update user balance
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { balance: amount }
    })

    return NextResponse.json({ 
      message: 'Balance updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        balance: updatedUser.balance
      }
    })
  } catch (error) {
    console.error('Balance update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}