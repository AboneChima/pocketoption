const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration (same as in your app)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample user ID (you can replace this with an actual user ID from your Firebase Auth)
const sampleUserId = 'test-user-123';

async function addSampleData() {
  try {
    console.log('Adding sample trades...');
    
    // Add sample trades
    const trades = [
      {
        userId: sampleUserId,
        pair: 'EUR/USD',
        direction: 'BUY',
        amount: 100,
        profit: 85,
        status: 'win',
        createdAt: serverTimestamp()
      },
      {
        userId: sampleUserId,
        pair: 'GBP/USD',
        direction: 'SELL',
        amount: 50,
        profit: -50,
        status: 'loss',
        createdAt: serverTimestamp()
      },
      {
        userId: sampleUserId,
        pair: 'USD/JPY',
        direction: 'BUY',
        amount: 75,
        profit: 60,
        status: 'win',
        createdAt: serverTimestamp()
      },
      {
        userId: sampleUserId,
        pair: 'AUD/USD',
        direction: 'SELL',
        amount: 200,
        profit: 170,
        status: 'win',
        createdAt: serverTimestamp()
      },
      {
        userId: sampleUserId,
        pair: 'USD/CAD',
        direction: 'BUY',
        amount: 150,
        profit: -150,
        status: 'loss',
        createdAt: serverTimestamp()
      }
    ];

    for (const trade of trades) {
      await addDoc(collection(db, 'trades'), trade);
    }

    console.log('Adding sample deposits...');
    
    // Add sample deposits
    const deposits = [
      {
        userId: sampleUserId,
        amount: 1000,
        method: 'credit_card',
        status: 'completed',
        createdAt: serverTimestamp()
      },
      {
        userId: sampleUserId,
        amount: 500,
        method: 'bank_transfer',
        status: 'completed',
        createdAt: serverTimestamp()
      }
    ];

    for (const deposit of deposits) {
      await addDoc(collection(db, 'deposits'), deposit);
    }

    console.log('Adding sample withdrawals...');
    
    // Add sample withdrawals
    const withdrawals = [
      {
        userId: sampleUserId,
        amount: 300,
        method: 'bank_transfer',
        status: 'completed',
        createdAt: serverTimestamp()
      }
    ];

    for (const withdrawal of withdrawals) {
      await addDoc(collection(db, 'withdrawals'), withdrawal);
    }

    console.log('Sample data added successfully!');
    console.log(`User ID used: ${sampleUserId}`);
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

addSampleData();