require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function clearTestData() {
  try {
    console.log('🧹 Starting to clear test data...\n');

    // Clear deposits
    console.log('📥 Clearing deposits...');
    const depositsSnapshot = await db.collection('deposits').get();
    const depositBatch = db.batch();
    depositsSnapshot.docs.forEach((doc) => {
      depositBatch.delete(doc.ref);
    });
    await depositBatch.commit();
    console.log(`✅ Deleted ${depositsSnapshot.size} deposits\n`);

    // Clear withdrawals
    console.log('📤 Clearing withdrawals...');
    const withdrawalsSnapshot = await db.collection('withdrawals').get();
    const withdrawalBatch = db.batch();
    withdrawalsSnapshot.docs.forEach((doc) => {
      withdrawalBatch.delete(doc.ref);
    });
    await withdrawalBatch.commit();
    console.log(`✅ Deleted ${withdrawalsSnapshot.size} withdrawals\n`);

    console.log('🎉 All test data cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing test data:', error);
    process.exit(1);
  }
}

clearTestData();
