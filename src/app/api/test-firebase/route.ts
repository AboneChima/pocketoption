import { NextRequest, NextResponse } from 'next/server';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Firebase connection...');
    
    // Test basic Firestore connection by trying to read from collections
    const tradesRef = collection(db, COLLECTIONS.TRADES);
    const tradesQuery = query(tradesRef, limit(1));
    const tradesSnapshot = await getDocs(tradesQuery);
    
    const depositsRef = collection(db, COLLECTIONS.DEPOSITS);
    const depositsQuery = query(depositsRef, limit(1));
    const depositsSnapshot = await getDocs(depositsQuery);
    
    const withdrawalsRef = collection(db, COLLECTIONS.WITHDRAWALS);
    const withdrawalsQuery = query(withdrawalsRef, limit(1));
    const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
    
    console.log('Firebase test results:', {
      tradesCount: tradesSnapshot.size,
      depositsCount: depositsSnapshot.size,
      withdrawalsCount: withdrawalsSnapshot.size
    });
    
    return NextResponse.json({
      success: true,
      message: 'Firebase connection successful',
      collections: {
        trades: tradesSnapshot.size,
        deposits: depositsSnapshot.size,
        withdrawals: withdrawalsSnapshot.size
      }
    });
    
  } catch (error) {
    console.error('Firebase test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Firebase connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}