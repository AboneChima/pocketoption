import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Fetch user's deposits from Firestore
    const depositsSnapshot = await adminDb
      .collection('deposits')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get()

    const deposits = depositsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ deposits })
  } catch (error) {
    console.error('Error fetching deposits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deposits' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, method } = body

    // In a real application, you would:
    // 1. Verify the user's authentication
    // 2. Validate the deposit data
    // 3. Process the deposit with payment provider
    // 4. Update user balance in database
    // 5. Create deposit record

    // For now, return a success response without actually processing
    const deposit = {
      id: Date.now().toString(),
      amount,
      method,
      status: 'pending',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: 'Deposit request created successfully. Pending admin approval.',
      data: deposit
    })
  } catch (error) {
    console.error('Error creating deposit:', error)
    return NextResponse.json(
      { error: 'Failed to create deposit' },
      { status: 500 }
    )
  }
}