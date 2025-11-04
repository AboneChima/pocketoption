"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserData = exports.closeTrade = exports.createTrade = exports.createWithdrawal = exports.processDeposit = exports.createDeposit = void 0;
const admin = require("firebase-admin");
const functions = require("firebase-functions");
// Initialize Firebase Admin with service account
const serviceAccount = require('../service-account-key.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'pocketoption-feb14'
});
const db = admin.firestore();
// Collections
const COLLECTIONS = {
    USERS: 'users',
    DEPOSITS: 'deposits',
    WITHDRAWALS: 'withdrawals',
    TRADES: 'trades',
    TRANSACTIONS: 'transactions'
};
// Helper function to verify user authentication (currently unused but may be needed for future features)
// async function verifyUser(idToken: string): Promise<string> {
//   try {
//     const decodedToken = await admin.auth().verifyIdToken(idToken);
//     return decodedToken.uid;
//   } catch (error) {
//     throw new functions.https.HttpsError('unauthenticated', 'Invalid authentication token');
//   }
// }
// Helper function to add transaction
async function addTransaction(userId, transactionData) {
    const transaction = Object.assign(Object.assign({}, transactionData), { userId, createdAt: new Date().toISOString() });
    const docRef = await db.collection(COLLECTIONS.TRANSACTIONS).add(transaction);
    return docRef.id;
}
// Deposit Function
exports.createDeposit = functions.https.onCall(async (data, context) => {
    try {
        // Verify authentication
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const userId = context.auth.uid;
        const { amount, method, metadata } = data;
        // Validate input
        if (!amount || amount <= 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid deposit amount');
        }
        if (!['card', 'bank', 'crypto', 'paypal'].includes(method)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid payment method');
        }
        // Create deposit record
        const deposit = {
            userId,
            amount,
            method,
            status: 'pending',
            createdAt: new Date().toISOString(),
            metadata
        };
        const docRef = await db.collection(COLLECTIONS.DEPOSITS).add(deposit);
        return {
            success: true,
            depositId: docRef.id,
            message: 'Deposit created successfully'
        };
    }
    catch (error) {
        console.error('Deposit error:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to create deposit');
    }
});
// Process Deposit Function (Admin only)
exports.processDeposit = functions.https.onCall(async (data, context) => {
    var _a;
    try {
        // Verify authentication and admin status
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(context.auth.uid).get();
        if (!userDoc.exists || !((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.isAdmin)) {
            throw new functions.https.HttpsError('permission-denied', 'Admin access required');
        }
        const { depositId, status } = data;
        // Get deposit document
        const depositDoc = await db.collection(COLLECTIONS.DEPOSITS).doc(depositId).get();
        if (!depositDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Deposit not found');
        }
        const depositData = depositDoc.data();
        // Update deposit status
        await depositDoc.ref.update({
            status,
            completedAt: new Date().toISOString()
        });
        // If completed, update user balance
        if (status === 'completed') {
            const userDocRef = db.collection(COLLECTIONS.USERS).doc(depositData.userId);
            const userDoc = await userDocRef.get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                const newBalance = userData.balance + depositData.amount;
                // Update user balance
                await userDocRef.update({ balance: newBalance });
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
        return {
            success: true,
            message: `Deposit ${status} successfully`
        };
    }
    catch (error) {
        console.error('Process deposit error:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to process deposit');
    }
});
// Withdrawal Function
exports.createWithdrawal = functions.https.onCall(async (data, context) => {
    try {
        // Verify authentication
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const userId = context.auth.uid;
        const { amount, method, destination, metadata } = data;
        // Validate input
        if (!amount || amount <= 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid withdrawal amount');
        }
        if (!['card', 'bank', 'crypto', 'paypal'].includes(method)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid payment method');
        }
        if (!destination) {
            throw new functions.https.HttpsError('invalid-argument', 'Destination is required');
        }
        // Check user balance
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }
        const userData = userDoc.data();
        if (userData.balance < amount) {
            throw new functions.https.HttpsError('failed-precondition', 'Insufficient balance');
        }
        // Create withdrawal record
        const withdrawal = {
            userId,
            amount,
            method,
            destination,
            status: 'pending',
            createdAt: new Date().toISOString(),
            metadata
        };
        const docRef = await db.collection(COLLECTIONS.WITHDRAWALS).add(withdrawal);
        // Deduct from user balance immediately
        const newBalance = userData.balance - amount;
        await userDoc.ref.update({ balance: newBalance });
        // Create transaction record
        await addTransaction(userId, {
            type: 'withdrawal',
            amount: -amount,
            balanceBefore: userData.balance,
            balanceAfter: newBalance,
            description: `Withdrawal via ${method}`,
            relatedId: docRef.id
        });
        return {
            success: true,
            withdrawalId: docRef.id,
            message: 'Withdrawal created successfully'
        };
    }
    catch (error) {
        console.error('Withdrawal error:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to create withdrawal');
    }
});
// Trade Function
exports.createTrade = functions.https.onCall(async (data, context) => {
    try {
        // Verify authentication
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const userId = context.auth.uid;
        const { asset, direction, amount, entryPrice, duration, metadata } = data;
        // Validate input
        if (!asset || !direction || !amount || !entryPrice || !duration) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing required trade parameters');
        }
        if (!['up', 'down'].includes(direction)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid trade direction');
        }
        if (amount <= 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid trade amount');
        }
        // Check user balance
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }
        const userData = userDoc.data();
        if (userData.balance < amount) {
            throw new functions.https.HttpsError('failed-precondition', 'Insufficient balance');
        }
        // Create trade record
        const now = new Date();
        const expiresAt = new Date(now.getTime() + duration * 1000);
        const trade = {
            userId,
            asset,
            direction,
            amount,
            entryPrice,
            duration,
            status: 'active',
            createdAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            metadata
        };
        const docRef = await db.collection(COLLECTIONS.TRADES).add(trade);
        // Deduct trade amount from user balance
        const newBalance = userData.balance - amount;
        await userDoc.ref.update({ balance: newBalance });
        // Create transaction record
        await addTransaction(userId, {
            type: 'trade_loss',
            amount: -amount,
            balanceBefore: userData.balance,
            balanceAfter: newBalance,
            description: `Trade ${asset} ${direction}`,
            relatedId: docRef.id
        });
        return {
            success: true,
            tradeId: docRef.id,
            expiresAt: expiresAt.toISOString(),
            message: 'Trade created successfully'
        };
    }
    catch (error) {
        console.error('Trade error:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to create trade');
    }
});
// Close Trade Function (Admin or automated)
exports.closeTrade = functions.https.onCall(async (data, context) => {
    try {
        // Verify authentication
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const { tradeId, exitPrice, result } = data;
        // Validate input
        if (!tradeId || !exitPrice || !['won', 'lost'].includes(result)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid trade closure parameters');
        }
        // Get trade document
        const tradeDoc = await db.collection(COLLECTIONS.TRADES).doc(tradeId).get();
        if (!tradeDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Trade not found');
        }
        const tradeData = tradeDoc.data();
        const payout = result === 'won' ? tradeData.amount * 1.8 : 0; // 80% payout
        // Update trade record
        await tradeDoc.ref.update({
            status: result,
            exitPrice,
            payout,
            closedAt: new Date().toISOString()
        });
        // If won, add payout to user balance
        if (result === 'won') {
            const userDoc = await db.collection(COLLECTIONS.USERS).doc(tradeData.userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                const newBalance = userData.balance + payout;
                await userDoc.ref.update({ balance: newBalance });
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
        return {
            success: true,
            result,
            payout,
            message: `Trade ${result} successfully`
        };
    }
    catch (error) {
        console.error('Close trade error:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to close trade');
    }
});
// Get User Data Function
exports.getUserData = functions.https.onCall(async (data, context) => {
    try {
        // Verify authentication
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const userId = context.auth.uid;
        const { dataType } = data; // 'transactions', 'deposits', 'withdrawals', 'trades'
        let result = [];
        switch (dataType) {
            case 'transactions':
                const transactionsSnapshot = await db.collection(COLLECTIONS.TRANSACTIONS)
                    .where('userId', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .limit(50)
                    .get();
                result = transactionsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
                break;
            case 'deposits':
                const depositsSnapshot = await db.collection(COLLECTIONS.DEPOSITS)
                    .where('userId', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .get();
                result = depositsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
                break;
            case 'withdrawals':
                const withdrawalsSnapshot = await db.collection(COLLECTIONS.WITHDRAWALS)
                    .where('userId', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .get();
                result = withdrawalsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
                break;
            case 'trades':
                const tradesSnapshot = await db.collection(COLLECTIONS.TRADES)
                    .where('userId', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .get();
                result = tradesSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
                break;
            default:
                throw new functions.https.HttpsError('invalid-argument', 'Invalid data type');
        }
        return {
            success: true,
            data: result
        };
    }
    catch (error) {
        console.error('Get user data error:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to get user data');
    }
});
//# sourceMappingURL=index.js.map