# Authentication Debug Guide

## 🔍 Problem: "Invalid Credentials" Error

Your app is showing "Invalid credentials" because **Firebase is not properly configured**. The app is trying to use Firebase Authentication, but your `.env` file only has MongoDB and admin credentials.

---

## 🎯 Quick Fix Options

### Option 1: Add Firebase Configuration (Recommended)

1. **Create a Firebase Project**
   - Go to https://console.firebase.google.com
   - Click "Add project"
   - Follow the setup wizard

2. **Get Firebase Config**
   - In Firebase Console, go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click the web icon `</>`
   - Copy the config values

3. **Add to `.env.local`** (create this file if it doesn't exist)
   ```bash
   # Firebase Client Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

   # Firebase Admin SDK (for server-side)
   FIREBASE_ADMIN_PROJECT_ID=your-project-id
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
   ```

4. **Enable Authentication in Firebase**
   - In Firebase Console, go to Authentication
   - Click "Get Started"
   - Enable "Email/Password" sign-in method

5. **Restart your dev server**
   ```bash
   npm run dev
   ```

---

### Option 2: Use Mock Authentication (Quick Test)

If you just want to test without Firebase, the app has a fallback mock authentication system.

**Current Mock Users:**
- Email: `admin@pocketoption.com`
- Password: `admin123`

**To check if mock auth is working:**

1. Open browser console (F12)
2. Run this command:
   ```javascript
   localStorage.getItem('pocketoption_users')
   ```

3. If you see users, try logging in with their credentials
4. If empty, the mock system will create a user on first registration

---

## 🔍 Debug Steps

### Step 1: Check Firebase Configuration

Run this command:
```bash
node scripts/check-firebase.js
```

This will show you which Firebase variables are missing.

### Step 2: Check Registered Users

**In Browser Console (F12):**
```javascript
// See all registered users
const users = JSON.parse(localStorage.getItem('pocketoption_users') || '[]');
console.table(users.map(u => ({
  email: u.email,
  name: u.name,
  balance: u.balance,
  created: u.createdAt
})));

// See current logged-in user
const currentUser = JSON.parse(localStorage.getItem('pocketoption_current_user') || 'null');
console.log('Current User:', currentUser);
```

### Step 3: Check Authentication Flow

**In Browser Console:**
```javascript
// Test login function
async function testLogin(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const result = await response.json();
  console.log('Login Result:', result);
  return result;
}

// Try logging in
testLogin('admin@pocketoption.com', 'admin123');
```

### Step 4: Clear Cache and Try Again

Sometimes old data causes issues:

**In Browser Console:**
```javascript
// Clear all authentication data
localStorage.removeItem('pocketoption_current_user');
localStorage.removeItem('pocketoption_users');
localStorage.clear();

// Reload page
location.reload();
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Invalid Credentials" on Login

**Cause:** Firebase not configured OR wrong password

**Solution:**
1. Check if Firebase is configured (run `node scripts/check-firebase.js`)
2. If Firebase is missing, add config to `.env.local`
3. If using mock auth, try registering a new account first

### Issue 2: "User not found"

**Cause:** User doesn't exist in the system

**Solution:**
1. Register a new account
2. Or check localStorage for existing users:
   ```javascript
   JSON.parse(localStorage.getItem('pocketoption_users') || '[]')
   ```

### Issue 3: Firebase errors in console

**Cause:** Firebase config is wrong or incomplete

**Solution:**
1. Double-check all Firebase environment variables
2. Make sure you enabled Email/Password auth in Firebase Console
3. Restart dev server after adding env variables

### Issue 4: Balance shows as 0 after login

**Cause:** This is intentional - new users start with $0

**Solution:**
1. Go to `/deposit` page to add funds
2. Or as admin, update user balance in admin panel

---

## 📊 View All Users (Admin)

### Method 1: Admin Panel
1. Login as admin: `admin@pocketoption.com` / `admin123`
2. Go to `/admin`
3. Click "Users" tab
4. See all registered users

### Method 2: Browser Console
```javascript
// Get all users from localStorage
const users = JSON.parse(localStorage.getItem('pocketoption_users') || '[]');
console.log('Total Users:', users.length);
users.forEach((user, i) => {
  console.log(`\nUser ${i + 1}:`);
  console.log('  Email:', user.email);
  console.log('  Name:', user.name);
  console.log('  Balance:', user.balance);
  console.log('  Created:', user.createdAt);
});
```

### Method 3: API Endpoint (if Firebase is configured)
```javascript
// Fetch users from API
fetch('/api/admin/users')
  .then(r => r.json())
  .then(users => console.table(users));
```

---

## 🔐 Test Accounts

### Admin Account
- **Email:** `admin@pocketoption.com`
- **Password:** `admin123`
- **Access:** Full admin panel access

### Create Test User
1. Go to `/auth` (registration page)
2. Fill in the form:
   - Email: `test@example.com`
   - Password: `test123`
   - First Name: `Test`
   - Last Name: `User`
3. Click "Create Account"
4. Login with the credentials

---

## 🚀 Quick Start (No Firebase)

If you want to test WITHOUT setting up Firebase:

1. **Clear everything:**
   ```javascript
   localStorage.clear();
   ```

2. **Register a new account:**
   - Go to `/auth`
   - Click "Create Account"
   - Fill in details
   - Submit

3. **Login:**
   - Use the email/password you just created
   - Should work with mock authentication

4. **Admin access:**
   - Login with `admin@pocketoption.com` / `admin123`

---

## 📝 Environment File Template

Create `.env.local` with this template:

```bash
# ============================================
# FIREBASE CONFIGURATION (Required for Auth)
# ============================================

# Get these from Firebase Console > Project Settings
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Get these from Firebase Console > Project Settings > Service Accounts
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# ============================================
# DATABASE (Already configured in .env)
# ============================================
# DATABASE_URL is in .env file

# ============================================
# ADMIN CREDENTIALS (Already configured)
# ============================================
# ADMIN_EMAIL and ADMIN_PASSWORD are in .env file
```

---

## 🆘 Still Having Issues?

### Check Browser Console
1. Press F12
2. Go to Console tab
3. Look for red error messages
4. Share the error messages for help

### Check Network Tab
1. Press F12
2. Go to Network tab
3. Try logging in
4. Look for failed requests (red)
5. Click on them to see error details

### Check Application Tab
1. Press F12
2. Go to Application tab
3. Click "Local Storage"
4. See what data is stored
5. Clear if needed

---

## 📞 Need Help?

If you're still stuck, provide:
1. Error messages from console
2. Output from `node scripts/check-firebase.js`
3. Whether you want to use Firebase or mock auth
4. Any error screenshots

---

**TL;DR:** Your app needs Firebase configuration. Either add Firebase config to `.env.local` or use the mock authentication system by registering a new account.
