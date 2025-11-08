// Local API functions (fallback for Firebase Cloud Functions)
import { auth } from './firebase';

// Types for function parameters and responses
export interface DepositRequest {
  amount: number;
  method: 'card' | 'bank' | 'crypto' | 'paypal';
  metadata?: Record<string, any>;
}

export interface WithdrawalRequest {
  amount: number;
  method: 'card' | 'bank' | 'crypto' | 'paypal';
  destination: string;
  metadata?: Record<string, any>;
}

export interface TradeRequest {
  asset: string;
  direction: 'up' | 'down';
  amount: number;
  entryPrice: number;
  duration: number;
  metadata?: Record<string, any>;
}

export interface ProcessDepositRequest {
  depositId: string;
  status: 'completed' | 'failed';
}

export interface CloseTradeRequest {
  tradeId: string;
  exitPrice: number;
  result: 'won' | 'lost';
}

export interface GetUserDataRequest {
  userId?: string;
}

export interface FunctionResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  depositId?: string;
  transactionId?: string;
  tradeId?: string;
  status?: string;
  result?: string;
  payout?: number;
}

// Helper function to get current user ID from session/cookie
async function getCurrentUserId(): Promise<string> {
  try {
    // Try to get user from session API
    const response = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const userData = await response.json();
      if (userData && userData.id) {
        console.log('User authenticated via session:', userData.id);
        return userData.id;
      }
    }
    
    // Fallback to Firebase auth
    return new Promise((resolve, reject) => {
      const user = auth.currentUser;
      if (user) {
        console.log('User authenticated via Firebase:', user.uid);
        resolve(user.uid);
        return;
      }

      console.log('Waiting for auth state...');
      
      // Wait for auth state to initialize
      let timeoutId: NodeJS.Timeout;
      const unsubscribe = auth.onAuthStateChanged((user) => {
        clearTimeout(timeoutId);
        unsubscribe();
        
        if (user) {
          console.log('Auth state changed, user authenticated:', user.uid);
          resolve(user.uid);
        } else {
          console.error('Auth state changed, but no user found');
          reject(new Error('User not authenticated. Please login again.'));
        }
      });

      // Timeout after 10 seconds (increased from 5)
      timeoutId = setTimeout(() => {
        unsubscribe();
        console.error('Authentication timeout - no user found after 10 seconds');
        reject(new Error('Authentication timeout. Please refresh the page and try again.'));
      }, 10000);
    });
  } catch (error: any) {
    console.error('Error getting current user ID:', error);
    throw new Error('Failed to authenticate user');
  }
}

// Helper function to make API calls
async function apiCall(endpoint: string, data: any): Promise<FunctionResponse> {
  try {
    console.log(`Making API call to /api/firebase/${endpoint}`, data);
    
    const response = await fetch(`/api/firebase/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log(`API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error response: ${errorText}`);
      
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || 'API call failed' };
      }
      
      throw new Error(error.error || `API call failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log('API response:', result);
    return result;
  } catch (error: any) {
    console.error('API call error:', error);
    throw error;
  }
}

// Helper functions for easier usage
export async function depositFunds(amount: number, method: 'card' | 'bank' | 'crypto' | 'paypal', metadata?: Record<string, any>) {
  try {
    console.log('depositFunds called with:', { amount, method, metadata });
    
    const userId = await getCurrentUserId();
    console.log('Got user ID:', userId);
    
    const result = await apiCall('deposit', { amount, method, userId, metadata });
    console.log('Deposit API result:', result);
    
    return result.data;
  } catch (error: any) {
    console.error('depositFunds error:', error);
    throw new Error(error.message || 'Failed to create deposit');
  }
}

export async function withdrawFunds(amount: number, method: 'card' | 'bank' | 'crypto' | 'paypal', destination: string, metadata?: Record<string, any>) {
  try {
    const userId = await getCurrentUserId();
    const result = await apiCall('withdrawal', { amount, method, destination, userId, metadata });
    return result.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create withdrawal');
  }
}

export async function placeTrade(asset: string, direction: 'up' | 'down', amount: number, entryPrice: number, duration: number, metadata?: Record<string, any>) {
  try {
    const userId = await getCurrentUserId();
    const result = await apiCall('trade', { asset, direction, amount, entryPrice, duration, userId, metadata });
    return result.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create trade');
  }
}

export async function processDepositAdmin(depositId: string, status: 'completed' | 'failed') {
  try {
    const result = await apiCall('process-deposit', { depositId, status });
    return result.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to process deposit');
  }
}

export async function closeTradeAdmin(tradeId: string, exitPrice: number, result: 'won' | 'lost') {
  try {
    const response = await apiCall('close-trade', { tradeId, exitPrice, result });
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to close trade');
  }
}

export async function fetchUserData(userId?: string) {
  try {
    const targetUserId = userId || await getCurrentUserId();
    const result = await apiCall('user-data', { userId: targetUserId });
    return result.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch user data');
  }
}

// Direct API function exports (for compatibility)
export const createDeposit = depositFunds;
export const createWithdrawal = withdrawFunds;
export const createTrade = placeTrade;
export const processDeposit = processDepositAdmin;
export const closeTrade = closeTradeAdmin;
export const getUserData = fetchUserData;