/**
 * Debug Script - View All Registered Users
 * Run with: node scripts/debug-users.js
 */

// Check localStorage users (browser-based)
console.log('='.repeat(60))
console.log('USER DEBUG SCRIPT')
console.log('='.repeat(60))
console.log('')

console.log('📋 CHECKING LOCALSTORAGE USERS:')
console.log('-'.repeat(60))

// This script needs to be run in the browser console
// Copy and paste this into your browser console on the app page:

const debugScript = `
console.log('='.repeat(60));
console.log('USER DEBUG SCRIPT - BROWSER VERSION');
console.log('='.repeat(60));
console.log('');

// Get current user
const currentUser = localStorage.getItem('pocketoption_current_user');
console.log('📍 CURRENT USER:');
if (currentUser) {
  const user = JSON.parse(currentUser);
  console.log(JSON.stringify(user, null, 2));
} else {
  console.log('No user currently logged in');
}
console.log('');

// Get all users
const allUsers = localStorage.getItem('pocketoption_users');
console.log('👥 ALL REGISTERED USERS:');
if (allUsers) {
  const users = JSON.parse(allUsers);
  console.log('Total users:', users.length);
  console.log('');
  users.forEach((user, index) => {
    console.log(\`User \${index + 1}:\`);
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Balance:', user.balance);
    console.log('  Created:', user.createdAt);
    console.log('  Admin:', user.email === 'admin@pocketoption.com');
    console.log('');
  });
} else {
  console.log('No users found in localStorage');
}
console.log('');

// Check for authentication issues
console.log('🔍 AUTHENTICATION CHECK:');
console.log('-'.repeat(60));

// Test login with stored credentials
if (allUsers) {
  const users = JSON.parse(allUsers);
  console.log('Testing stored user credentials...');
  console.log('');
  
  users.forEach((user, index) => {
    console.log(\`User \${index + 1}: \${user.email}\`);
    console.log('  Has password stored:', !!user.password);
    console.log('  Password (hashed):', user.password ? '***' + user.password.slice(-4) : 'N/A');
  });
}
console.log('');

// Check environment
console.log('🌍 ENVIRONMENT CHECK:');
console.log('-'.repeat(60));
console.log('Current URL:', window.location.href);
console.log('LocalStorage available:', typeof localStorage !== 'undefined');
console.log('SessionStorage available:', typeof sessionStorage !== 'undefined');
console.log('');

console.log('='.repeat(60));
console.log('DEBUG COMPLETE');
console.log('='.repeat(60));
`;

console.log('⚠️  This script needs to run in the BROWSER CONSOLE');
console.log('');
console.log('📋 INSTRUCTIONS:');
console.log('1. Open your app in the browser');
console.log('2. Press F12 to open Developer Tools');
console.log('3. Go to the Console tab');
console.log('4. Copy and paste the code below:');
console.log('');
console.log('-'.repeat(60));
console.log(debugScript);
console.log('-'.repeat(60));
console.log('');
console.log('Or run this command in your browser console:');
console.log('');
console.log('localStorage.getItem("pocketoption_users")');
console.log('');
