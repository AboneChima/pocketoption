import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export async function GET(request: NextRequest) {
  try {
    // Fetch all withdrawals from Firestore
    const withdrawalsSnapshot = await adminDb
      .collection('withdrawals')
      .orderBy('createdAt', 'desc')
      .get()

    const withdrawals = withdrawalsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(withdrawals)
  } catch (error) {
    console.error('Error fetching admin withdrawals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { withdrawalId, status, adminNote } = body

    if (!withdrawalId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['completed', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get withdrawal document
    const withdrawalRef = adminDb.collection('withdrawals').doc(withdrawalId)
    const withdrawalDoc = await withdrawalRef.get()

    if (!withdrawalDoc.exists) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      )
    }

    const withdrawalData = withdrawalDoc.data()

    // Check if already processed
    if (withdrawalData?.status !== 'pending') {
      return NextResponse.json(
        { error: 'Withdrawal already processed' },
        { status: 400 }
      )
    }

    const userId = withdrawalData?.userId
    const amount = withdrawalData?.amount

    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'Invalid withdrawal data' },
        { status: 400 }
      )
    }

    // Get user document
    const userRef = adminDb.collection('users').doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userData = userDoc.data()
    const currentBalance = userData?.balance || 0

    // Process based on status
    if (status === 'completed') {
      // Check if user still has sufficient balance
      if (currentBalance < amount) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        )
      }

      // Deduct amount from user balance
      await userRef.update({
        balance: currentBalance - amount,
        updatedAt: new Date().toISOString()
      })

      // Update withdrawal status
      await withdrawalRef.update({
        status: 'completed',
        processedAt: new Date().toISOString(),
        adminNote: adminNote || 'Withdrawal approved and processed'
      })

      return NextResponse.json({
        success: true,
        message: 'Withdrawal approved and balance deducted'
      })
    } else if (status === 'rejected') {
      // Update withdrawal status (no balance change)
      await withdrawalRef.update({
        status: 'rejected',
        processedAt: new Date().toISOString(),
        adminNote: adminNote || 'Insufficient balance or gas fee'
      })

      return NextResponse.json({
        success: true,
        message: 'Withdrawal rejected'
      })
    }

    return NextResponse.json(
      { error: 'Invalid status' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing admin withdrawal:', error)
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    )
  }
}