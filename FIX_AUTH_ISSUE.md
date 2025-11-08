# 🔧 FIX: Invalid Credentials Issue

## 🎯 Problem Identified

Your Firebase Admin SDK private key is **invalid or revoked**. This is causing authentication to fail.

**Error:** `Invalid JWT Signature` - Your certificate key file has been revoked or is incorrect.

---

## ✅ Solution: Generate New Firebase Service Account Key

### Step 1: Go to Firebase Console

1. Open https://console.firebase.google.com
2. Select your project: **pocketoption-feb14**

### Step 2: Generate New Service Account Key

1. Click the **gear icon** (⚙️) → **Project Settings**
2. Go to the **Service Accounts** tab
3. Click **"Generate New Private Key"** button
4. Click **"Generate Key"** in the confirmation dialog
5. A JSON file will download (e.g., `pocketoption-feb14-firebase-adminsdk-xxxxx.json`)

### Step 3: Update Your .env.local File

Open the downloaded JSON file and copy the values:

```json
{
  "type": "service_account",
  "project_id": "pocketoption-feb14",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@pocketoption-feb14.iam.gserviceaccount.com",
  ...
}
```

Update your `.env.local` file with these values:

```bash
# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=pocketoption-feb14
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@pocketoption-feb14.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**⚠️ IMPORTANT:** 
- Keep the quotes around the private key
- Keep the `\n` characters (they represent line breaks)
- Don't add extra spaces or line breaks

### Step 4: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Test Authentication

Run the user list script again:
```bash
node scripts/list-firebase-users.js
```

You should now see users listed without errors.

---

## 🧪 Test Login

### Option 1: Register a New User

1. Go to http://localhost:3000/auth
2. Click "Create Account"
3. Fill in:
   - Email: `test@example.com`
   - Password: `test123456`
   - First Name: `Test`
   - Last Name: `User`
4. Click "Create Account"
5. You should be logged in automatically

### Option 2: Use Admin Account

1. Go to http://localhost:3000/auth
2. Enter:
   - Email: `admin@pocketoption.com`
   - Password: `admin123`
3. Click "Sign In"

---

## 🔍 Verify It's Working

### Check 1: Run User List Script
```bash
node scripts/list-firebase-users.js
```

Should show:
- ✅ Firebase Admin initialized successfully
- ✅ Found X user(s)
- User details listed

### Check 2: Check Browser Console

1. Open your app
2. Press F12
3. Go to Console tab
4. Try logging in
5. Should see:
   - "Firebase Auth successful"
   - "User document found in Firestore"
   - No red errors

### Check 3: Test Withdrawal Module

1. Login to your account
2. Go to `/withdraw`
3. Try creating a withdrawal request
4. Should work without errors

---

## 📝 Complete .env.local Template

Here's what your `.env.local` should look like:

```bash
# ============================================
# FIREBASE CLIENT CONFIG
# ============================================
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pocketoption-feb14.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pocketoption-feb14
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pocketoption-feb14.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=310908785074
NEXT_PUBLIC_FIREBASE_APP_ID=1:310908785074:web:9b49a952b67132638ed4ab

# ============================================
# FIREBASE ADMIN SDK (UPDATE THESE!)
# ============================================
FIREBASE_ADMIN_PROJECT_ID=pocketoption-feb14
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@pocketoption-feb14.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

---

## 🚨 Common Mistakes

### Mistake 1: Wrong Private Key Format

❌ **Wrong:**
```bash
FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----
```

✅ **Correct:**
```bash
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### Mistake 2: Missing Quotes

❌ **Wrong:**
```bash
FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

✅ **Correct:**
```bash
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Mistake 3: Extra Spaces

❌ **Wrong:**
```bash
FIREBASE_ADMIN_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

✅ **Correct:**
```bash
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 🔐 Security Notes

1. **Never commit** `.env.local` to Git
2. **Never share** your private key publicly
3. **Regenerate keys** if accidentally exposed
4. **Use different keys** for development and production

---

## 📊 After Fixing

Once you've updated the private key, you should be able to:

✅ Register new users
✅ Login with existing users
✅ View users in admin panel
✅ Process withdrawals
✅ All Firebase features working

---

## 🆘 Still Not Working?

### Check System Time

The error mentioned "server time not properly synced". Check if your system time is correct:

**Windows:**
1. Right-click clock in taskbar
2. Click "Adjust date/time"
3. Turn on "Set time automatically"

**Mac:**
1. System Preferences → Date & Time
2. Check "Set date and time automatically"

### Regenerate Key Again

If the key still doesn't work:
1. Go back to Firebase Console
2. Delete the old service account
3. Create a new one
4. Generate a new key
5. Update `.env.local` again

### Contact Firebase Support

If nothing works, there might be an issue with your Firebase project. Contact Firebase support or create a new project.

---

## 📞 Quick Help Commands

```bash
# Check Firebase config
node scripts/check-firebase.js

# List all users
node scripts/list-firebase-users.js

# Check if server is running
curl http://localhost:3000/api/health

# Clear browser cache
# In browser: Ctrl+Shift+Delete → Clear cache
```

---

**TL;DR:** Your Firebase Admin private key is invalid. Generate a new one from Firebase Console → Project Settings → Service Accounts → Generate New Private Key, then update `FIREBASE_ADMIN_PRIVATE_KEY` in `.env.local` and restart your server.
