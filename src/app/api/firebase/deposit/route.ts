import { NextRequest, NextResponse } from 'next/server';
import { db, COLLECTIONS } from '@/lib/firebase';
import { adminDb } from '@/lib/firebaseAdmin';
import { doc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { amount, method, userId, metadata } = await request.json();

    if (!userId || !amount || !method) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, amount, method' },
        { status: 400 }
      );
    }

    // Create deposit record
    const depositId = `deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const depositData = {
      id: depositId,
      userId,
      amount: Number(amount),
      method,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      metadata: metadata || {}
    };

    // Save deposit to Firestore
    await setDoc(doc(db, COLLECTIONS.DEPOSITS, depositId), depositData);

    // Also save via Firebase Admin SDK for server-side verification
    try {
      await adminDb.collection(COLLECTIONS.DEPOSITS).doc(depositId).set({
        ...depositData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Deposit record created via Admin SDK');
    } catch (adminError) {
      console.warn('Failed to create deposit via Admin SDK, client-side creation succeeded:', adminError);
    }

    // Create transaction record
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionData = {
      id: transactionId,
      userId,
      type: 'deposit',
      amount: Number(amount),
      status: 'pending',
      description: `Deposit via ${method}`,
      createdAt: serverTimestamp(),
      metadata: {
        depositId,
        method,
        ...metadata
      }
    };

    await setDoc(doc(db, COLLECTIONS.TRANSACTIONS, transactionId), transactionData);

    // Also save transaction via Firebase Admin SDK
    try {
      await adminDb.collection(COLLECTIONS.TRANSACTIONS).doc(transactionId).set({
        ...transactionData,
        createdAt: new Date()
      });
      console.log('Transaction record created via Admin SDK');
    } catch (adminError) {
      console.warn('Failed to create transaction via Admin SDK, client-side creation succeeded:', adminError);
    }

    return NextResponse.json({
      success: true,
      data: {
        depositId,
        transactionId,
        status: 'pending',
        message: 'Deposit request created successfully'
      }
    });

  } catch (error) {
    console.error('Deposit API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}