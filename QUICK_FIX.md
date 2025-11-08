# 🚨 QUICK FIX: Invalid Credentials Error

## Problem
Your Firebase Admin SDK private key is **invalid/revoked**, causing "Invalid credentials" errors.

## Solution (5 minutes)

### 1. Generate New Firebase Key

1. Go to: https://console.firebase.google.com
2. Select project: **pocketoption-feb14**
3. Click ⚙️ → **Project Settings** → **Service Accounts** tab
4. Click **"Generate New Private Key"**
5. Download the JSON file

### 2. Update .env.local

Open the downloaded JSON file and copy these values to your `.env.local`:

```bash
FIREBASE_ADMIN_PROJECT_ID=pocketoption-feb14
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@pocketoption-feb14.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**⚠️ Keep the quotes and `\n` characters!**

### 3. Restart Server

```bash
npm run dev
```

### 4. Test

```bash
node scripts/list-firebase-users.js
```

Should show users without errors.

---

## Test Login

**Admin Account:**
- Email: `admin@pocketoption.com`
- Password: `admin123`

**Or register a new user at:** http://localhost:3000/auth

---

## Need More Help?

Read the detailed guide: `FIX_AUTH_ISSUE.md`
