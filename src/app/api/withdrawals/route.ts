import { NextRequest, NextResponse } from 'next/server'
import { adminDb, verifyIdToken } from '@/lib/firebaseAdmin'

export async function GET(request: NextRequest) {
  try {
    // Get userId from query params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Fetch user's withdrawals from Firestore
    const withdrawalsSnapshot = await adminDb
      .collection('withdrawals')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get()

    const withdrawals = withdrawalsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ withdrawals })
  } catch (error) {
    console.error('Error fetching withdrawals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    )
  }
}

// Gas fees for different networks (in USD)
const GAS_FEES = {
  'Bitcoin Network': 2.50,
  'ERC20': 5.00,
  'TRC20': 1.00,
  'BEP20': 0.50,
  'BEP2': 0.50,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, currency, walletAddress, network } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (!currency || !walletAddress || !network) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate gas fee
    const gasFee = GAS_FEES[network as keyof typeof GAS_FEES] || 1.00
    const totalAmount = amount + gasFee

    // Get user's current balance
    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userData = userDoc.data()
    const currentBalance = userData?.balance || 0

    // Check if user has sufficient balance (including gas fee)
    if (currentBalance < totalAmount) {
      return NextResponse.json(
        { 
          error: 'Insufficient balance for withdrawal and gas fee',
          details: {
            withdrawalAmount: amount,
            gasFee: gasFee,
            totalRequired: totalAmount,
            currentBalance: currentBalance,
            shortfall: totalAmount - currentBalance
          }
        },
        { status: 400 }
      )
    }

    // Create withdrawal request with PENDING status (admin approval required)
    // DO NOT deduct balance yet - will be deducted when admin approves
    const withdrawalData = {
      userId,
      amount,
      currency,
      walletAddress,
      network,
      gasFee,
      totalAmount,
      status: 'pending', // Changed from 'completed' to 'pending'
      createdAt: new Date().toISOString(),
      user: {
        email: userData?.email || '',
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || ''
      }
    }

    const withdrawalRef = await adminDb.collection('withdrawals').add(withdrawalData)

    return NextResponse.json({
      success: true,
      id: withdrawalRef.id,
      ...withdrawalData,
      message: 'Withdrawal request submitted. Awaiting admin approval.'
    })
  } catch (error) {
    console.error('Error creating withdrawal:', error)
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    )
  }
}