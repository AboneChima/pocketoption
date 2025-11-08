# 🔍 Login Troubleshooting Guide

## ⚠️ Important: Password Issue

**The "Invalid credentials" error is likely because:**

1. **Users set their own passwords** when they registered
2. **You don't know their passwords** (they're hashed in Firebase)
3. **You need to either:**
   - Ask users for their passwords
   - Reset their passwords
   - Create a new test account with a known password

---

## 🎯 Quick Solutions

### Solution 1: Create a New Test Account (Recommended)

1. **Restart your dev server** (important after .env changes):
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Go to registration page:**
   ```
   http://localhost:3000/auth
   ```

3. **Click "Create Account"**

4. **Register with:**
   - Email: `test@example.com`
   - Password: `test123456`
   - First Name: `Test`
   - Last Name: `User`

5. **Login immediately** with those credentials

---

### Solution 2: Reset User Password in Firebase

1. Go to Firebase Console: https://console.firebase.google.com
2. Select project: **pocketoption-feb14**
3. Go to **Authentication** → **Users**
4. Find the user you want to test
5. Click the **three dots** (⋮) → **Reset password**
6. Firebase will send a password reset email
7. User can set a new password

---

### Solution 3: Test Login API Directly

Test if a user's password works:

```bash
node scripts/test-login.js user@example.com their_password
```

This will tell you if:
- ✅ Password is correct
- ❌ Password is wrong
- ❌ Email doesn't exist

---

## 🔍 Diagnostic Steps

### Step 1: Verify Server is Running

```bash
# Make sure dev server is running
npm run dev
```

**Important:** After updating `.env.local`, you MUST restart the server!

### Step 2: Check Browser Console

1. Open your app: http://localhost:3000/auth
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try logging in
5. Look for error messages

**Common errors:**
- `INVALID_PASSWORD` = Wrong password
- `EMAIL_NOT_FOUND` = Email not registered
- `INVALID_LOGIN_CREDENTIALS` = Wrong email or password

### Step 3: Check Network Tab

1. Press **F12** → **Network** tab
2. Try logging in
3. Look for the request to `signInWithPassword`
4. Click on it to see the response

**What to look for:**
- Status 200 = Success
- Status 400 = Bad request (wrong credentials)
- Status 401 = Unauthorized

### Step 4: Test with Known Credentials

Create a test account with known credentials:

**Test Account:**
- Email: `admin@pocketoption.com`
- Password: `admin123`

1. Go to http://localhost:3000/auth
2. Click "Create Account"
3. Register with above credentials
4. Try logging in

---

## 📊 Registered Users

These users exist in your system, but **you don't know their passwords**:

1. abonejoseph@gmail.com (Abone Chima)
2. amybooge112@gmail.com (Napa Gi)
3. shaunaneath41@gmail.com (Shauna Neath)
4. slcdoglover+ae@gmail.com (Mark Young)
5. cajncj9jet@wyoxafp.com (JANUYHNA anuyhan)
6. robertwilliams227@gmail.com (Robert Williams)

**To login as these users:**
- You need to ask them for their passwords
- Or reset their passwords via Firebase Console

---

## 🧪 Test Commands

### Test Firebase Connection
```bash
node scripts/check-firebase.js
```

### List All Users
```bash
node scripts/list-firebase-users.js
```

### Test Login API
```bash
node scripts/test-login.js email@example.com password123
```

---

## 🔧 Common Issues & Fixes

### Issue 1: "Invalid credentials" with correct password

**Cause:** Server not restarted after .env update

**Fix:**
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

### Issue 2: "Invalid credentials" - don't know password

**Cause:** Users set their own passwords

**Fix:**
- Create new test account with known password
- Or reset user password in Firebase Console

### Issue 3: Login works in API test but not in browser

**Cause:** Frontend cache or session issue

**Fix:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Clear localStorage:
   ```javascript
   // In browser console (F12)
   localStorage.clear()
   location.reload()
   ```

### Issue 4: "Email not found"

**Cause:** Trying to login with unregistered email

**Fix:**
- Check registered users list above
- Or register a new account

---

## 🎯 Recommended Testing Flow

### For Development Testing:

1. **Create Admin Account:**
   ```
   Email: admin@pocketoption.com
   Password: admin123
   ```

2. **Create Test User:**
   ```
   Email: test@example.com
   Password: test123456
   ```

3. **Test Login:**
   - Try logging in with test account
   - Should work immediately

4. **Test Admin Panel:**
   - Login as admin
   - Go to `/admin`
   - Should see admin features

---

## 📝 Password Reset Process

### For Users Who Forgot Password:

1. **Via Firebase Console (Admin):**
   - Firebase Console → Authentication → Users
   - Find user → Reset password
   - User receives email

2. **Via App (Future Feature):**
   - Add "Forgot Password" button
   - Implement password reset flow
   - Send reset email via Firebase

---

## 🔐 Security Notes

1. **Passwords are hashed** - Cannot be retrieved
2. **Only users know their passwords**
3. **Admins cannot see passwords**
4. **Password reset is the only way** to recover access

---

## ✅ Verification Checklist

Before testing login:

- [ ] Dev server is running (`npm run dev`)
- [ ] `.env.local` has correct Firebase credentials
- [ ] Server was restarted after .env changes
- [ ] Using correct email (from registered users list)
- [ ] Using correct password (user's actual password)
- [ ] Browser cache is clear
- [ ] No errors in browser console

---

## 🆘 Still Not Working?

### Try This:

1. **Create a completely new account:**
   ```bash
   # Go to registration page
   http://localhost:3000/auth
   
   # Register with:
   Email: yourtest@example.com
   Password: YourPassword123!
   ```

2. **Immediately try logging in** with those exact credentials

3. **If that works:**
   - ✅ System is working
   - ❌ Previous users' passwords are unknown

4. **If that doesn't work:**
   - Check browser console for errors
   - Check server logs
   - Run: `node scripts/test-login.js yourtest@example.com YourPassword123!`

---

## 📞 Debug Information to Collect

If still having issues, collect this info:

1. **Browser console errors** (F12 → Console)
2. **Network tab response** (F12 → Network → signInWithPassword)
3. **Server logs** (terminal where `npm run dev` is running)
4. **Test login output:**
   ```bash
   node scripts/test-login.js test@example.com test123
   ```

---

**TL;DR:** The existing users' passwords are unknown. Create a new test account with a known password to test the system.
