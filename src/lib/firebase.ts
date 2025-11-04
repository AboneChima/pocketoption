import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, orderBy, getDocs, updateDoc, increment, enableNetwork, disableNetwork, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration - Using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "pocketoption-demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "pocketoption-demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "pocketoption-demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable network connectivity and handle offline scenarios
let networkEnabled = true;

// Function to ensure network is enabled
export async function ensureNetworkEnabled() {
  try {
    if (!networkEnabled) {
      console.log('Enabling Firebase network...');
      await enableNetwork(db);
      networkEnabled = true;
      console.log('Firebase network enabled successfully');
    }
  } catch (error) {
    console.warn('Failed to enable Firebase network:', error);
    // Don't throw error, just log it
  }
}

// Function to handle network errors gracefully
export async function handleNetworkError(operation: () => Promise<any>, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      await ensureNetworkEnabled();
      const result = await operation();
      return result;
    } catch (error: any) {
      console.warn(`Network operation failed (attempt ${i + 1}/${retries}):`, error);
      
      // Handle specific Firebase offline errors
      if (error.code === 'unavailable' || 
          error.code === 'failed-precondition' ||
          error.message?.includes('offline') || 
          error.message?.includes('client is offline')) {
        
        console.log('Detected offline error, attempting to reconnect...');
        networkEnabled = false; // Force network re-enable
        
        if (i < retries - 1) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, i), 5000);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // If it's the last retry or not a network error, throw it
      throw error;
    }
  }
}

// Firestore Collections
export const COLLECTIONS = {
  USERS: 'users',
  DEPOSITS: 'deposits',
  WITHDRAWALS: 'withdrawals',
  TRADES: 'trades',
  TRANSACTIONS: 'transactions'
} as const;

// User interface
export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  balance: number;
  isAdmin: boolean;
  kycStatus: string;
  createdAt: string;
  phone: string;
  location: string;
}

// Deposit interface
export interface DepositData {
  id?: string;
  userId: string;
  amount: number;
  method: 'card' | 'bank' | 'crypto' | 'paypal';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

// Withdrawal interface
export interface WithdrawalData {
  id?: string;
  userId: string;
  amount: number;
  method: 'card' | 'bank' | 'crypto' | 'paypal';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  destination: string; // Account details, wallet address, etc.
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

// Trade interface
export interface TradeData {
  id?: string;
  userId: string;
  asset: string; // e.g., 'EUR/USD', 'BTC/USD'
  direction: 'up' | 'down';
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  duration: number; // in seconds
  status: 'active' | 'won' | 'lost' | 'cancelled';
  payout?: number;
  createdAt: string;
  expiresAt: string;
  closedAt?: string;
  metadata?: Record<string, any>;
}

// Transaction interface (for general transaction history)
export interface TransactionData {
  id?: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'trade_win' | 'trade_loss' | 'bonus' | 'fee';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  relatedId?: string; // ID of related deposit, withdrawal, or trade
  createdAt: string;
  metadata?: Record<string, any>;
}

// Register user with Firebase Auth and Firestore
export async function registerUser(email: string, password: string): Promise<{ user: UserData; token: string }> {
  try {
    console.log('Firebase registerUser called with email:', email)
    console.log('Firebase config check:')
    console.log('- API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Present' : 'Missing')
    console.log('- Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
    console.log('- Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('Firebase Auth registration successful, user UID:', user.uid)
    console.log('Firebase Auth user email:', user.email)

    // Create user document in Firestore
    const userData: UserData = {
      id: user.uid,
      email: user.email || '',
      firstName: '',
      lastName: '',
      balance: 0, // Users start with 0 balance
      isAdmin: email.toLowerCase() === 'admin@pocketoption.com',
      kycStatus: 'pending',
      createdAt: new Date().toISOString(),
      phone: '',
      location: ''
    };

    console.log('Creating user document in Firestore:', JSON.stringify(userData, null, 2))

    // Use network error handling for Firestore operations
    await handleNetworkError(async () => {
      return await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userData);
    });

    console.log('User document created in Firestore successfully')

    // Get Firebase token
    const token = await user.getIdToken();
    console.log('Firebase token generated successfully')

    return { user: userData, token };
  } catch (error: any) {
    console.error('Firebase registerUser error details:')
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Full error object:', JSON.stringify(error, null, 2))
    throw new Error(error.message || 'Registration failed');
  }
}

// Login user with Firebase Auth
export async function loginUser(email: string, password: string): Promise<{ user: UserData; token: string }> {
  try {
    console.log('Firebase loginUser called with email:', email)
    console.log('Firebase config check:')
    console.log('- API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Present' : 'Missing')
    console.log('- Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
    console.log('- Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('Firebase Auth successful, user UID:', user.uid)
    console.log('Firebase Auth user email:', user.email)

    // Get user data from Firestore with network error handling
    const userDoc = await handleNetworkError(async () => {
      return await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
    });
    
    let userData: UserData;
    
    if (!userDoc.exists()) {
      console.log('User document not found in Firestore for UID:', user.uid, '- Creating new document')
      
      // Create missing user document
      userData = {
        id: user.uid,
        email: user.email || '',
        firstName: '',
        lastName: '',
        balance: 0,
        isAdmin: (user.email || '').toLowerCase() === 'admin@pocketoption.com',
        kycStatus: 'pending',
        createdAt: new Date().toISOString(),
        phone: '',
        location: ''
      };

      // Save the user document to Firestore with network error handling
      await handleNetworkError(async () => {
        return await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userData);
      });
      console.log('Created missing user document for UID:', user.uid)
    } else {
      console.log('User document found in Firestore')
      userData = userDoc.data() as UserData;
      console.log('Firestore user data:', JSON.stringify(userData, null, 2))
    }
    
    // Get Firebase token
    const token = await user.getIdToken();
    console.log('Firebase token generated successfully')

    return { user: userData, token };
  } catch (error: any) {
    console.error('Firebase loginUser error details:')
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Full error object:', JSON.stringify(error, null, 2))
    throw new Error(error.message || 'Login failed');
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Logout failed');
  }
}

// Get current user data
export async function getCurrentUser(): Promise<UserData | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
    
    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as UserData;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Firestore Functions for Deposits, Withdrawals, and Trades

// Create a deposit record
export async function createDeposit(depositData: Omit<DepositData, 'id' | 'createdAt'>): Promise<string> {
  try {
    const deposit: DepositData = {
      ...depositData,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.DEPOSITS), deposit);
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create deposit');
  }
}

// Process deposit (update status and user balance)
export async function processDeposit(depositId: string, status: 'completed' | 'failed'): Promise<void> {
  try {
    const depositDoc = await getDoc(doc(db, COLLECTIONS.DEPOSITS, depositId));
    if (!depositDoc.exists()) {
      throw new Error('Deposit not found');
    }

    const depositData = depositDoc.data() as DepositData;
    
    // Update deposit status
    await updateDoc(doc(db, COLLECTIONS.DEPOSITS, depositId), {
      status,
      completedAt: new Date().toISOString()
    });

    // If completed, update user balance and create transaction
    if (status === 'completed') {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, depositData.userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        const newBalance = userData.balance + depositData.amount;

        // Update user balance
        await updateDoc(doc(db, COLLECTIONS.USERS, depositData.userId), {
          balance: newBalance
        });

        // Create transaction record
        await addTransaction(depositData.userId, {
          type: 'deposit',
          amount: depositData.amount,
          balanceBefore: userData.balance,
          balanceAfter: newBalance,
          description: `Deposit via ${depositData.method}`,
          relatedId: depositId
        });
      }
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to process deposit');
  }
}

// Create a withdrawal record
export async function createWithdrawal(withdrawalData: Omit<WithdrawalData, 'id' | 'createdAt'>): Promise<string> {
  try {
    // Check if user has sufficient balance
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, withdrawalData.userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data() as UserData;
    if (userData.balance < withdrawalData.amount) {
      throw new Error('Insufficient balance');
    }

    const withdrawal: WithdrawalData = {
      ...withdrawalData,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.WITHDRAWALS), withdrawal);
    
    // Immediately deduct from user balance (pending withdrawal)
    const newBalance = userData.balance - withdrawalData.amount;
    await updateDoc(doc(db, COLLECTIONS.USERS, withdrawalData.userId), {
      balance: newBalance
    });

    // Create transaction record
    await addTransaction(withdrawalData.userId, {
      type: 'withdrawal',
      amount: -withdrawalData.amount,
      balanceBefore: userData.balance,
      balanceAfter: newBalance,
      description: `Withdrawal via ${withdrawalData.method}`,
      relatedId: docRef.id
    });

    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create withdrawal');
  }
}

// Create a trade record
export async function createTrade(tradeData: Omit<TradeData, 'id' | 'createdAt' | 'expiresAt'>): Promise<string> {
  try {
    // Check if user has sufficient balance
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, tradeData.userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data() as UserData;
    if (userData.balance < tradeData.amount) {
      throw new Error('Insufficient balance');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + tradeData.duration * 1000);

    const trade: TradeData = {
      ...tradeData,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.TRADES), trade);
    
    // Deduct trade amount from user balance
    const newBalance = userData.balance - tradeData.amount;
    await updateDoc(doc(db, COLLECTIONS.USERS, tradeData.userId), {
      balance: newBalance
    });

    // Create transaction record
    await addTransaction(tradeData.userId, {
      type: 'trade_loss', // Initially recorded as loss, will be updated if won
      amount: -tradeData.amount,
      balanceBefore: userData.balance,
      balanceAfter: newBalance,
      description: `Trade ${tradeData.asset} ${tradeData.direction}`,
      relatedId: docRef.id
    });

    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create trade');
  }
}

// Close a trade (win/loss)
export async function closeTrade(tradeId: string, exitPrice: number, result: 'won' | 'lost'): Promise<void> {
  try {
    const tradeDoc = await getDoc(doc(db, COLLECTIONS.TRADES, tradeId));
    if (!tradeDoc.exists()) {
      throw new Error('Trade not found');
    }

    const tradeData = tradeDoc.data() as TradeData;
    const payout = result === 'won' ? tradeData.amount * 1.8 : 0; // 80% payout

    // Update trade record
    await updateDoc(doc(db, COLLECTIONS.TRADES, tradeId), {
      status: result,
      exitPrice,
      payout,
      closedAt: new Date().toISOString()
    });

    // If won, add payout to user balance
    if (result === 'won') {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, tradeData.userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        const newBalance = userData.balance + payout;

        await updateDoc(doc(db, COLLECTIONS.USERS, tradeData.userId), {
          balance: newBalance
        });

        // Create win transaction record
        await addTransaction(tradeData.userId, {
          type: 'trade_win',
          amount: payout,
          balanceBefore: userData.balance,
          balanceAfter: newBalance,
          description: `Trade win: ${tradeData.asset} ${tradeData.direction}`,
          relatedId: tradeId
        });
      }
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to close trade');
  }
}

// Add transaction record
export async function addTransaction(userId: string, transactionData: Omit<TransactionData, 'id' | 'userId' | 'createdAt'>): Promise<string> {
  try {
    const transaction: TransactionData = {
      ...transactionData,
      userId,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), transaction);
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add transaction');
  }
}

// Get user's transaction history
export async function getUserTransactions(userId: string, limit: number = 50): Promise<TransactionData[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TransactionData));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get transactions');
  }
}

// Get user's deposits
export async function getUserDeposits(userId: string): Promise<DepositData[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.DEPOSITS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DepositData));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get deposits');
  }
}

// Get user's withdrawals
export async function getUserWithdrawals(userId: string): Promise<WithdrawalData[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.WITHDRAWALS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as WithdrawalData));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get withdrawals');
  }
}

// Get user's trades
export async function getUserTrades(userId: string): Promise<TradeData[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.TRADES),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TradeData));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get trades');
  }
}