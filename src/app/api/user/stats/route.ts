import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Accept token from Authorization header OR cookie for same-origin requests
    const authHeader = request.headers.get('authorization');
    const token = (authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : request.cookies.get('auth-token')?.value) || '';

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the JWT token
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    console.log('User Stats API: Fetching data for userId:', userId);

    try {
      // Create queries for user's trades, deposits, and withdrawals
      const tradesQuery = query(
        collection(db, COLLECTIONS.TRADES),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const depositsQuery = query(
        collection(db, COLLECTIONS.DEPOSITS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const withdrawalsQuery = query(
        collection(db, COLLECTIONS.WITHDRAWALS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      // Execute all queries in parallel
      const [tradesSnapshot, depositsSnapshot, withdrawalsSnapshot] = await Promise.all([
        getDocs(tradesQuery),
        getDocs(depositsQuery),
        getDocs(withdrawalsQuery)
      ]);

      // Convert Firestore documents to arrays
      const trades = tradesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const deposits = depositsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const withdrawals = withdrawalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('User Stats API: Query results:');
      console.log('- Trades:', trades.length);
      console.log('- Deposits:', deposits.length);
      console.log('- Withdrawals:', withdrawals.length);

      return NextResponse.json({
        trades,
        deposits,
        withdrawals
      });
    } catch (dbError) {
      console.error('User Stats API: Firestore error:', dbError);
      
      // Return empty arrays if database is unavailable
      return NextResponse.json({
        trades: [],
        deposits: [],
        withdrawals: []
      });
    }
  } catch (error) {
    console.error('User Stats API: Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}