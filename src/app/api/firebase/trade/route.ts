import { NextRequest, NextResponse } from 'next/server';
import { db, COLLECTIONS } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { asset, direction, amount, entryPrice, duration, userId, metadata } = await request.json();

    if (!userId || !asset || !direction || !amount || !entryPrice || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check user balance
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    if (userData.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create trade record
    const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiryTime = new Date(Date.now() + duration * 1000);
    
    const tradeData = {
      id: tradeId,
      userId,
      asset,
      direction,
      amount: Number(amount),
      entryPrice: Number(entryPrice),
      duration: Number(duration),
      status: 'active',
      createdAt: serverTimestamp(),
      expiryTime,
      metadata: metadata || {}
    };

    // Save trade to Firestore
    await setDoc(doc(db, COLLECTIONS.TRADES, tradeId), tradeData);

    // Update user balance
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      balance: increment(-amount),
      updatedAt: serverTimestamp()
    });

    // Create transaction record
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionData = {
      id: transactionId,
      userId,
      type: 'trade',
      amount: -Number(amount),
      status: 'completed',
      description: `Trade placed: ${direction.toUpperCase()} on ${asset}`,
      createdAt: serverTimestamp(),
      metadata: {
        tradeId,
        asset,
        direction,
        entryPrice,
        duration,
        ...metadata
      }
    };

    await setDoc(doc(db, COLLECTIONS.TRANSACTIONS, transactionId), transactionData);

    return NextResponse.json({
      success: true,
      data: {
        tradeId,
        transactionId,
        status: 'active',
        expiryTime: expiryTime.toISOString(),
        message: 'Trade placed successfully'
      }
    });

  } catch (error) {
    console.error('Trade API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}