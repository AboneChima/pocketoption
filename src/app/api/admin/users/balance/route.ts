import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount } = body

    if (!userId || amount === undefined || amount === 0) {
      return NextResponse.json(
        { error: 'User ID and non-zero amount are required' },
        { status: 400 }
      )
    }

    // Get current user data
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
    const newBalance = currentBalance + amount
    const timestamp = new Date().toISOString()

    // Update user balance in Firestore
    await userRef.update({
      balance: newBalance,
      updatedAt: timestamp
    })

    // Create a deposit transaction record for positive amounts (top-up)
    if (amount > 0) {
      const depositData = {
        userId,
        amount: Math.abs(amount),
        currency: 'USD',
        status: 'completed',
        method: 'admin_credit',
        address: 'N/A',
        txHash: `admin-credit-${Date.now()}`,
        adminNotes: `Admin balance adjustment: +$${amount.toFixed(2)}`,
        createdAt: timestamp,
        updatedAt: timestamp,
        user: {
          email: userData?.email || 'Unknown',
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || ''
        }
      }

      await adminDb.collection('deposits').add(depositData)
      
      console.log('Deposit record created for admin credit:', depositData)
    }
    // Create a withdrawal transaction record for negative amounts (deduction)
    else if (amount < 0) {
      const withdrawalData = {
        userId,
        amount: Math.abs(amount),
        currency: 'USD',
        status: 'completed',
        walletAddress: 'N/A',
        network: 'admin_debit',
        gasFee: 0,
        totalAmount: Math.abs(amount),
        adminNote: `Admin balance adjustment: -$${Math.abs(amount).toFixed(2)}`,
        createdAt: timestamp,
        processedAt: timestamp,
        user: {
          email: userData?.email || 'Unknown',
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || ''
        }
      }

      await adminDb.collection('withdrawals').add(withdrawalData)
      
      console.log('Withdrawal record created for admin debit:', withdrawalData)
    }

    console.log('Balance updated:', {
      userId,
      oldBalance: currentBalance,
      adjustment: amount,
      newBalance,
      transactionType: amount > 0 ? 'deposit' : 'withdrawal'
    })

    return NextResponse.json({ 
      success: true, 
      message: `Balance ${amount > 0 ? 'credited' : 'debited'} successfully`,
      userId,
      oldBalance: currentBalance,
      adjustment: amount,
      newBalance,
      transactionCreated: true
    })
  } catch (error) {
    console.error('Error updating user balance:', error)
    return NextResponse.json(
      { error: 'Failed to update user balance' },
      { status: 500 }
    )
  }
}