# Deployment Guide - Pocket Option Clone

## 🚀 Git Deployment

### 1. Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - Trading platform with Firebase integration"
```

### 2. Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (e.g., `pocketoption-clone`)
3. Don't initialize with README (we already have files)

### 3. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/pocketoption-clone.git
git branch -M main
git push -u origin main
```

### 4. Update Changes
```bash
git add .
git commit -m "Add professional trading features and Firebase integration"
git push
```

---

## 🔥 Firebase Configuration

### Required Environment Variables

You need these Firebase credentials in your `.env.local` file:

```env
# Firebase Client (Public - for frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Private - for backend)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

### How to Get Firebase Credentials

#### Client Credentials (NEXT_PUBLIC_*)
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: `pocketoption-feb14`
3. Click ⚙️ → **Project Settings**
4. Scroll to "Your apps" section
5. Click on your web app or create one
6. Copy the config values

#### Admin Credentials (FIREBASE_ADMIN_*)
1. Go to Firebase Console
2. Click ⚙️ → **Project Settings** → **Service Accounts** tab
3. Click **"Generate New Private Key"**
4. Download the JSON file
5. Extract values:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (keep the `\n` characters!)

---

## ☁️ Vercel Deployment

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Deploy via Vercel Dashboard (Recommended)

#### Step 1: Connect GitHub
1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Select `pocketoption-clone`

#### Step 2: Configure Environment Variables
In the Vercel project settings, add ALL environment variables:

**Firebase Client Variables:**
```
NEXT_PUBLIC_FIREBASE_API_KEY = your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID = your_app_id
```

**Firebase Admin Variables:**
```
FIREBASE_ADMIN_PROJECT_ID = your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL = firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
```

⚠️ **IMPORTANT for FIREBASE_ADMIN_PRIVATE_KEY:**
- Keep the quotes: `"-----BEGIN..."`
- Keep the `\n` characters (they represent newlines)
- Don't remove any part of the key

#### Step 3: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Your site will be live at: `https://your-project.vercel.app`

### 3. Deploy via CLI (Alternative)
```bash
cd pocketoption-clone
vercel
```

Follow the prompts and add environment variables when asked.

---

## 🔒 Security Checklist

### Before Deploying:

- [ ] All Firebase credentials are in environment variables (NOT in code)
- [ ] `.env.local` is in `.gitignore` (never commit secrets!)
- [ ] Firebase Admin private key is properly formatted with `\n`
- [ ] Firebase Security Rules are configured
- [ ] Admin routes are protected with authentication

### Firebase Security Rules

Update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Trades - users can create, read their own
    match /trades/{tradeId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow update: if false; // Only server can update
    }
    
    // Deposits - users can create, read their own
    match /deposits/{depositId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Withdrawals - users can create, read their own
    match /withdrawals/{withdrawalId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 🧪 Testing Deployment

### 1. Test Locally First
```bash
npm run build
npm start
```

Visit http://localhost:3000 and test:
- [ ] User registration/login
- [ ] Trading (BUY/SELL)
- [ ] Deposits
- [ ] Withdrawals
- [ ] Admin panel
- [ ] Portfolio
- [ ] History

### 2. Test on Vercel
After deployment, test the same features on your live URL.

---

## 🔄 Updating Deployment

### When you make changes:

```bash
# 1. Commit changes
git add .
git commit -m "Description of changes"
git push

# 2. Vercel auto-deploys from GitHub
# Wait 2-3 minutes for automatic deployment
```

### Manual Redeploy (if needed):
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click "Redeploy" on latest deployment

---

## 📊 Monitoring

### Vercel Dashboard
- View deployment logs
- Monitor performance
- Check error rates
- View analytics

### Firebase Console
- Monitor database usage
- Check authentication logs
- View storage usage
- Monitor API calls

---

## 🆘 Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### Firebase Connection Issues
- Verify all environment variables are set
- Check Firebase Admin private key format (must have `\n`)
- Ensure Firebase project is active and billing is enabled

### 500 Server Errors
- Check Vercel function logs
- Verify Firebase Admin credentials
- Check Firestore security rules

---

## 📝 Environment Variables Checklist

Copy this to Vercel:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

---

## ✅ Deployment Complete!

Your trading platform is now live! 🎉

**Next Steps:**
1. Test all features on production
2. Set up custom domain (optional)
3. Configure Firebase billing alerts
4. Monitor user activity
5. Set up error tracking (Sentry, etc.)

**Support:**
- Vercel Docs: https://vercel.com/docs
- Firebase Docs: https://firebase.google.com/docs
- Next.js Docs: https://nextjs.org/docs
