import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db, COLLECTIONS } from '@/lib/firebase'
import { getDoc, doc } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // Verify JWT token
      const payload = verifyToken(token)
      if (!payload || !payload.userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      // Get user data from Firestore using the userId from JWT
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, payload.userId))
      
      if (!userDoc.exists()) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const user = userDoc.data()

      return NextResponse.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance,
        isAdmin: user.isAdmin,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt,
        phone: user.phone,
        location: user.location
      })

    } catch (error) {
      console.error('Token verification error:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}