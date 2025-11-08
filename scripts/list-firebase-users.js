/**
 * List all Firebase users
 * Run with: node scripts/list-firebase-users.js
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const admin = require('firebase-admin');

console.log('='.repeat(60));
console.log('FIREBASE USERS LIST');
console.log('='.repeat(60));
console.log('');

// Initialize Firebase Admin
try {
  if (!admin.apps.length) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    console.log('🔧 Initializing Firebase Admin...');
    console.log('Project ID:', serviceAccount.projectId);
    console.log('Client Email:', serviceAccount.clientEmail);
    console.log('');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    });

    console.log('✅ Firebase Admin initialized successfully');
    console.log('');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  process.exit(1);
}

// List all users
async function listAllUsers() {
  try {
    console.log('📋 FETCHING ALL USERS FROM FIREBASE AUTH:');
    console.log('-'.repeat(60));
    
    const listUsersResult = await admin.auth().listUsers(1000);
    
    if (listUsersResult.users.length === 0) {
      console.log('❌ No users found in Firebase Authentication');
      console.log('');
      console.log('💡 This means:');
      console.log('   - No one has registered yet');
      console.log('   - Or users are stored elsewhere (localStorage/MongoDB)');
      console.log('');
      console.log('📝 To create a test user:');
      console.log('   1. Go to your app at http://localhost:3000/auth');
      console.log('   2. Click "Create Account"');
      console.log('   3. Fill in the registration form');
      console.log('   4. Submit');
      console.log('');
      return;
    }

    console.log(`✅ Found ${listUsersResult.users.length} user(s):`);
    console.log('');

    listUsersResult.users.forEach((userRecord, index) => {
      console.log(`User ${index + 1}:`);
      console.log('  UID:', userRecord.uid);
      console.log('  Email:', userRecord.email);
      console.log('  Email Verified:', userRecord.emailVerified);
      console.log('  Display Name:', userRecord.displayName || 'Not set');
      console.log('  Created:', new Date(userRecord.metadata.creationTime).toLocaleString());
      console.log('  Last Sign In:', userRecord.metadata.lastSignInTime ? new Date(userRecord.metadata.lastSignInTime).toLocaleString() : 'Never');
      console.log('  Disabled:', userRecord.disabled);
      console.log('');
    });

    console.log('-'.repeat(60));
    console.log('');

    // Now check Firestore for user data
    console.log('📋 CHECKING FIRESTORE FOR USER DATA:');
    console.log('-'.repeat(60));

    const db = admin.firestore();
    const usersSnapshot = await db.collection('users').get();

    if (usersSnapshot.empty) {
      console.log('❌ No user documents found in Firestore');
      console.log('');
      console.log('💡 This means user profiles are not synced to Firestore');
      console.log('   Users can authenticate but have no profile data');
      console.log('');
    } else {
      console.log(`✅ Found ${usersSnapshot.size} user document(s) in Firestore:`);
      console.log('');

      usersSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`User ${index + 1}:`);
        console.log('  Document ID:', doc.id);
        console.log('  Email:', data.email);
        console.log('  Name:', `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Not set');
        console.log('  Balance:', data.balance || 0);
        console.log('  Admin:', data.isAdmin || false);
        console.log('  KYC Status:', data.kycStatus || 'pending');
        console.log('  Created:', data.createdAt);
        console.log('');
      });
    }

    console.log('-'.repeat(60));
    console.log('');

    // Check withdrawals
    console.log('📋 CHECKING WITHDRAWALS:');
    console.log('-'.repeat(60));

    const withdrawalsSnapshot = await db.collection('withdrawals').get();

    if (withdrawalsSnapshot.empty) {
      console.log('No withdrawal requests found');
    } else {
      console.log(`Found ${withdrawalsSnapshot.size} withdrawal(s):`);
      console.log('');

      withdrawalsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Withdrawal ${index + 1}:`);
        console.log('  ID:', doc.id);
        console.log('  User:', data.user?.email || data.userId);
        console.log('  Amount:', data.amount);
        console.log('  Currency:', data.currency);
        console.log('  Status:', data.status);
        console.log('  Created:', data.createdAt);
        console.log('');
      });
    }

    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error listing users:', error.message);
    console.error('');
    console.error('Full error:', error);
  }
}

// Run the script
listAllUsers()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
