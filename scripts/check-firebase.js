/**
 * Check Firebase Configuration
 * Run with: node scripts/check-firebase.js
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

console.log('='.repeat(60));
console.log('FIREBASE CONFIGURATION CHECK');
console.log('='.repeat(60));
console.log('');

console.log('📋 CHECKING ENVIRONMENT VARIABLES:');
console.log('-'.repeat(60));

const firebaseVars = {
  'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  'FIREBASE_ADMIN_PROJECT_ID': process.env.FIREBASE_ADMIN_PROJECT_ID,
  'FIREBASE_ADMIN_CLIENT_EMAIL': process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  'FIREBASE_ADMIN_PRIVATE_KEY': process.env.FIREBASE_ADMIN_PRIVATE_KEY ? '***SET***' : undefined,
};

let missingVars = [];

Object.entries(firebaseVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  console.log(`${status} ${key}: ${value ? (key.includes('KEY') ? '***SET***' : value) : 'NOT SET'}`);
  if (!value) missingVars.push(key);
});

console.log('');

if (missingVars.length > 0) {
  console.log('❌ MISSING FIREBASE CONFIGURATION');
  console.log('-'.repeat(60));
  console.log('The following environment variables are missing:');
  missingVars.forEach(v => console.log(`  - ${v}`));
  console.log('');
  console.log('⚠️  Your app is using DEMO/FALLBACK Firebase config!');
  console.log('');
  console.log('📝 TO FIX:');
  console.log('1. Create a Firebase project at https://console.firebase.google.com');
  console.log('2. Get your Firebase config from Project Settings');
  console.log('3. Add the variables to your .env.local file');
  console.log('');
  console.log('Example .env.local:');
  console.log('');
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key');
  console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com');
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id');
  console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com');
  console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789');
  console.log('NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef');
  console.log('');
} else {
  console.log('✅ ALL FIREBASE VARIABLES ARE SET');
  console.log('');
}

console.log('='.repeat(60));
console.log('');

// Check other auth variables
console.log('📋 OTHER AUTH CONFIGURATION:');
console.log('-'.repeat(60));

const otherVars = {
  'DATABASE_URL': process.env.DATABASE_URL ? '***SET***' : undefined,
  'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET ? '***SET***' : undefined,
  'NEXTAUTH_URL': process.env.NEXTAUTH_URL,
  'JWT_SECRET': process.env.JWT_SECRET ? '***SET***' : undefined,
  'ADMIN_EMAIL': process.env.ADMIN_EMAIL,
  'ADMIN_PASSWORD': process.env.ADMIN_PASSWORD ? '***SET***' : undefined,
};

Object.entries(otherVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  console.log(`${status} ${key}: ${value || 'NOT SET'}`);
});

console.log('');
console.log('='.repeat(60));
