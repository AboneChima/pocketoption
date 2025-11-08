# 🔄 Start Fresh - Complete Reset Guide

## The Issue

You're getting "Invalid credentials" because you're trying to login with **passwords you don't know**. The 6 registered users set their own passwords, and those passwords are encrypted.

---

## ✅ SOLUTION: Create a New Account

Follow these exact steps:

### Step 1: Stop All Node Processes

```bash
# Windows (PowerShell)
Stop-Process -Name node -Force

# Or just close all terminal windows running npm
```

### Step 2: Start Fresh Dev Server

```bash
# In your project directory
npm run dev
```

Wait for it to say "Ready" or show the local URL.

### Step 3: Clear Browser Data

1. Open your browser
2. Press `Ctrl + Shift + Delete`
3. Select:
   - ✅ Cookies and site data
   - ✅ Cached images and files
4. Click "Clear data"

**OR** use Incognito/Private mode

### Step 4: Register a NEW Account

1. Go to: `http://localhost:3000/auth`

2. Click **"Create Account"** button

3. Fill in the form:
   ```
   Email: test@example.com
   Password: Test123456!
   First Name: Test
   Last Name: User
   ```

4. Click **"Create Account"**

5. You should be automatically logged in and redirected to dashboard

### Step 5: Test Login

1. Logout (if logged in)
2. Go back to: `http://localhost:3000/auth`
3. Login with:
   ```
   Email: test@example.com
   Password: Test123456!
   ```
4. Should work! ✅

---

## 🎯 Why This Will Work

- ✅ You're creating a NEW account
- ✅ You KNOW the password (you just set it)
- ✅ Firebase is configured correctly
- ✅ System is working properly

The problem was never the system - it was trying to use unknown passwords!

---

## 🔐 About Existing Users

The 6 existing users:
- abonejoseph@gmail.com
- amybooge112@gmail.com
- shaunaneath41@gmail.com
- slcdoglover+ae@gmail.com
- cajncj9jet@wyoxafp.com
- robertwilliams227@gmail.com

**You CANNOT login as them** unless:
1. They tell you their passwords
2. You reset their passwords via Firebase Console
3. They use password reset feature

---

## 🧪 Verify It's Working

### Test 1: Check Firebase Connection
```bash
node scripts/list-firebase-users.js
```
Should show 6 users (or 7 after you register)

### Test 2: Test Login API
```bash
node scripts/test-login.js test@example.com Test123456!
```
Should show "LOGIN SUCCESSFUL"

### Test 3: Browser Test
1. Register new account
2. Logout
3. Login again
4. Should work!

---

## 📝 Common Mistakes

### ❌ Mistake 1: Using Old Passwords
Don't try to login as existing users - you don't know their passwords!

### ❌ Mistake 2: Not Restarting Server
After changing .env, you MUST restart the dev server.

### ❌ Mistake 3: Browser Cache
Clear browser cache or use incognito mode.

### ❌ Mistake 4: Wrong Credentials
Make sure you're using the EXACT email and password you just registered with.

---

## 🎯 Quick Start Commands

```bash
# 1. Stop all node processes
Stop-Process -Name node -Force

# 2. Start dev server
npm run dev

# 3. Open browser (incognito mode recommended)
# Go to: http://localhost:3000/auth

# 4. Register new account
# Email: test@example.com
# Password: Test123456!

# 5. Login with same credentials
```

---

## ✅ Success Checklist

- [ ] All node processes stopped
- [ ] Dev server restarted (`npm run dev`)
- [ ] Browser cache cleared (or using incognito)
- [ ] Registered NEW account with known password
- [ ] Can login with the new account
- [ ] Redirected to dashboard after login

---

## 🆘 If Still Not Working

### Check Browser Console

1. Press `F12`
2. Go to Console tab
3. Try logging in
4. Look for errors

**Common errors:**
- `INVALID_PASSWORD` = Wrong password
- `EMAIL_NOT_FOUND` = Email not registered
- `INVALID_LOGIN_CREDENTIALS` = Wrong credentials

### Check Server Logs

Look at the terminal where `npm run dev` is running.

**Look for:**
- "Login attempt for email: ..."
- Any error messages
- Firebase connection status

### Test API Directly

```bash
# Test with your new account
node scripts/test-login.js test@example.com Test123456!
```

If this works but browser doesn't:
- Clear browser cache completely
- Try different browser
- Use incognito mode

---

## 📞 Debug Info

If you need help, provide:

1. **Browser console errors** (F12 → Console)
2. **Server logs** (terminal output)
3. **Test login output:**
   ```bash
   node scripts/test-login.js test@example.com Test123456!
   ```
4. **Which step failed?**

---

## 🎉 Expected Result

After following these steps:

1. ✅ New account created
2. ✅ Can login successfully
3. ✅ Redirected to dashboard
4. ✅ Can see balance ($0)
5. ✅ Can access all features
6. ✅ Withdrawal module works

---

**Remember:** The system is working! You just need to use credentials you actually know. Create a new account and it will work immediately! 🚀
