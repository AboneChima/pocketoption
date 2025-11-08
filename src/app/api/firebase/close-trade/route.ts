import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tradeId, exitPrice, result, profit } = body

    if (!tradeId || !result) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update trade in Firestore
    const tradeRef = adminDb.collection('trades').doc(tradeId)
    const tradeDoc = await tradeRef.get()

    if (!tradeDoc.exists) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      )
    }

    const tradeData = tradeDoc.data()
    
    await tradeRef.update({
      status: 'completed',
      result,
      exitPrice,
      profit,
      closedAt: new Date().toISOString()
    })

    // If won, add profit to user balance
    if (result === 'won' && tradeData?.userId) {
      const userRef = adminDb.collection('users').doc(tradeData.userId)
      const userDoc = await userRef.get()
      
      if (userDoc.exists) {
        const currentBalance = userDoc.data()?.balance || 0
        const totalReturn = tradeData.amount + profit
        await userRef.update({
          balance: currentBalance + totalReturn
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        tradeId,
        result,
        profit
      }
    })
  } catch (error: any) {
    console.error('Error closing trade:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to close trade' },
      { status: 500 }
    )
  }
}
