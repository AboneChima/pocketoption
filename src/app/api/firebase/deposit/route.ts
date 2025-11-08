import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { COLLECTIONS } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    console.log('Deposit API called');
    const { amount, method, userId, metadata } = await request.json();
    console.log('Deposit request:', { amount, method, userId, metadata });

    if (!userId || !amount || !method) {
      console.error('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: userId, amount, method' },
        { status: 400 }
      );
    }

    // Create deposit record using Admin SDK only (server-side)
    const depositId = `deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const depositData = {
      id: depositId,
      userId,
      amount: Number(amount),
      method,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      metadata: metadata || {}
    };

    console.log('Creating deposit in Firestore:', depositId);
    await adminDb.collection(COLLECTIONS.DEPOSITS).doc(depositId).set(depositData);
    console.log('Deposit created successfully');

    // Create transaction record
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionData = {
      id: transactionId,
      userId,
      type: 'deposit',
      amount: Number(amount),
      status: 'pending',
      description: `Deposit via ${method}`,
      createdAt: now,
      metadata: {
        depositId,
        method,
        ...metadata
      }
    };

    console.log('Creating transaction in Firestore:', transactionId);
    await adminDb.collection(COLLECTIONS.TRANSACTIONS).doc(transactionId).set(transactionData);
    console.log('Transaction created successfully');

    return NextResponse.json({
      success: true,
      data: {
        depositId,
        transactionId,
        status: 'pending',
        message: 'Deposit request created successfully'
      }
    });

  } catch (error: any) {
    console.error('Deposit API error:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}