/**
 * Test Login API
 * Run with: node scripts/test-login.js <email> <password>
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const email = process.argv[2] || 'abonejoseph@gmail.com';
const password = process.argv[3] || 'test123'; // User needs to provide their actual password

console.log('='.repeat(60));
console.log('LOGIN API TEST');
console.log('='.repeat(60));
console.log('');

console.log('Testing login for:', email);
console.log('');

async function testLogin() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Firebase API key not found in environment');
      return;
    }

    console.log('🔑 Firebase API Key:', apiKey.substring(0, 10) + '...');
    console.log('');

    console.log('📡 Sending login request to Firebase...');
    
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ LOGIN FAILED');
      console.log('');
      console.log('Error:', data.error?.message || 'Unknown error');
      console.log('');
      
      if (data.error?.message === 'INVALID_PASSWORD') {
        console.log('💡 The password is incorrect.');
        console.log('');
        console.log('📝 IMPORTANT:');
        console.log('   - Passwords are case-sensitive');
        console.log('   - Make sure you\'re using the correct password');
        console.log('   - Users registered their own passwords');
        console.log('');
        console.log('🔧 To test with a specific user:');
        console.log('   node scripts/test-login.js user@example.com their_password');
        console.log('');
      } else if (data.error?.message === 'EMAIL_NOT_FOUND') {
        console.log('💡 This email is not registered.');
        console.log('');
        console.log('📋 Registered users:');
        console.log('   - abonejoseph@gmail.com');
        console.log('   - amybooge112@gmail.com');
        console.log('   - shaunaneath41@gmail.com');
        console.log('   - slcdoglover+ae@gmail.com');
        console.log('   - cajncj9jet@wyoxafp.com');
        console.log('   - robertwilliams227@gmail.com');
        console.log('');
      } else if (data.error?.message === 'INVALID_LOGIN_CREDENTIALS') {
        console.log('💡 Invalid email or password.');
        console.log('');
        console.log('📝 This could mean:');
        console.log('   - Wrong password');
        console.log('   - Wrong email');
        console.log('   - Account doesn\'t exist');
        console.log('');
      }
      
      console.log('Full error response:');
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    console.log('✅ LOGIN SUCCESSFUL!');
    console.log('');
    console.log('User ID:', data.localId);
    console.log('Email:', data.email);
    console.log('Token:', data.idToken.substring(0, 20) + '...');
    console.log('');
    console.log('🎉 Authentication is working correctly!');
    console.log('');
    console.log('📝 This means:');
    console.log('   - Firebase is configured correctly');
    console.log('   - The user can login with this password');
    console.log('   - The issue might be in the frontend');
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('');
    console.error('Full error:', error);
  }
}

console.log('⚠️  NOTE: You need to provide the actual user password');
console.log('   Users set their own passwords when they registered');
console.log('');
console.log('Usage: node scripts/test-login.js <email> <password>');
console.log('');
console.log('-'.repeat(60));
console.log('');

testLogin()
  .then(() => {
    console.log('='.repeat(60));
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script error:', error);
    process.exit(1);
  });
