import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { COLLECTIONS } from '@/lib/firebase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = Number(searchParams.get('limit')) || 100
    const limit = Math.min(Math.max(limitParam, 1), 1000)

    const snapshot = await adminDb
      .collection(COLLECTIONS.USERS)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()

    const users = snapshot.docs.map((doc) => {
      const data = doc.data() || {}
      return {
        id: data.id || doc.id,
        email: data.email || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        balance: data.balance ?? 0,
        isAdmin: !!data.isAdmin,
        kycStatus: data.kycStatus || 'pending',
        createdAt: data.createdAt || new Date().toISOString(),
      }
    })

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}