import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Fetch user's trades from Firestore
    const tradesSnapshot = await adminDb
      .collection('trades')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()

    const trades = tradesSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        // Calculate profit if trade is completed
        profit: data.result === 'won' || data.result === 'win' 
          ? data.amount * (data.payout || 0.78)
          : data.result === 'lost' || data.result === 'loss'
          ? -data.amount
          : 0
      }
    })

    return NextResponse.json({ trades })
  } catch (error) {
    console.error('Error fetching trades:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In a real application, you would:
    // 1. Verify the user's authentication
    // 2. Validate the trade data
    // 3. Check if user has sufficient balance
    // 4. Execute the trade
    // 5. Update user balance based on trade result
    // 6. Create trade record

    // For now, return a success response without actually processing
    const trade = {
      id: Date.now().toString(),
      ...body,
      timestamp: new Date().toISOString(),
      status: 'pending'
    }

    return NextResponse.json(trade)
  } catch (error) {
    console.error('Error creating trade:', error)
    return NextResponse.json(
      { error: 'Failed to create trade' },
      { status: 500 }
    )
  }
}