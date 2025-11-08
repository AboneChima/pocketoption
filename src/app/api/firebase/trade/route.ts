import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { asset, direction, amount, entryPrice, duration, userId, metadata } = body

    if (!userId || !asset || !direction || !amount || !entryPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create trade in Firestore
    const tradeData = {
      userId,
      pair: asset,
      asset,
      direction,
      amount,
      entryPrice,
      duration,
      status: 'active',
      result: null,
      profit: null,
      exitPrice: null,
      payout: metadata?.payout || 0.78,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + duration * 1000).toISOString(),
      metadata: metadata || {}
    }

    const tradeRef = await adminDb.collection('trades').add(tradeData)

    // Deduct amount from user balance
    const userRef = adminDb.collection('users').doc(userId)
    const userDoc = await userRef.get()
    
    if (userDoc.exists) {
      const currentBalance = userDoc.data()?.balance || 0
      await userRef.update({
        balance: currentBalance - amount
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        tradeId: tradeRef.id,
        ...tradeData
      }
    })
  } catch (error: any) {
    console.error('Error creating trade:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create trade' },
      { status: 500 }
    )
  }
}
