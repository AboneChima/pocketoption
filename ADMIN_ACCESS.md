# 🔐 Admin Access Guide

## 🎯 Admin Login

### URL
**http://localhost:3005/admin/login**

### Credentials
- **Email:** `admin@pocketoption.com`
- **Password:** `Admin@2024`

---

## 📋 How to Access Admin Panel

### Step 1: Go to Admin Login
```
http://localhost:3005/admin/login
```

### Step 2: Enter Credentials
- Email: `admin@pocketoption.com`
- Password: `Admin@2024`

### Step 3: Click "Access Admin Dashboard"
- You'll be redirected to: http://localhost:3005/admin
- Admin panel will load with full access

---

## 🎛️ Admin Panel Features

Once logged in, you have access to:

### 1. Overview Tab
- Total users count
- Total platform balance
- Total trades
- Total deposits
- Total withdrawals
- Pending requests counter
- Recent activity feed

### 2. Users Tab
- View all registered users
- See user balances
- Update user balances manually
- View user details
- Search users

### 3. Trades Tab
- Monitor all trading activity
- View active trades
- See trade history
- Track profits/losses

### 4. Deposits Tab ⭐
- **View all deposit requests**
- **Approve deposits** (balance updates automatically)
- **Reject deposits** (with reason)
- See deposit details:
  - User email
  - Amount
  - Currency
  - Wallet address
  - Date/time
  - Status

### 5. Withdrawals Tab ⭐
- **View all withdrawal requests**
- **Approve withdrawals** (balance deducted automatically)
- **Reject withdrawals** (with reason)
- See withdrawal details:
  - User email
  - Amount
  - Currency
  - Wallet address
  - Network
  - Date/time
  - Status

---

## 🔄 Admin Workflow

### Processing Deposits

1. **User submits deposit**
   - User goes to /deposit
   - Selects crypto and amount
   - Submits request

2. **Admin reviews**
   - Login to admin panel
   - Click "Deposits" tab
   - See pending deposit

3. **Admin approves**
   - Click "Confirm" button
   - ✅ User balance increases automatically
   - ✅ Transaction recorded
   - ✅ Status updated to "Confirmed"

4. **Or admin rejects**
   - Click "Reject" button
   - Add rejection reason
   - ❌ No balance change
   - ❌ Status updated to "Rejected"

### Processing Withdrawals

1. **User requests withdrawal**
   - User goes to /withdraw
   - Fills withdrawal form
   - Submits request

2. **Admin reviews**
   - Login to admin panel
   - Click "Withdrawals" tab
   - See pending withdrawal

3. **Admin approves**
   - Click "Approve & Complete"
   - ✅ User balance decreases automatically
   - ✅ Status updated to "Completed"
   - ✅ Processing timestamp recorded

4. **Or admin rejects**
   - Click "Reject" button
   - Add rejection reason
   - ❌ No balance change
   - ❌ Status updated to "Rejected"

---

## 🔒 Security Features

### Session Management
- Admin session stored in localStorage
- Session includes:
  - `admin_authenticated`: true/false
  - `admin_email`: admin email
  - `admin_login_time`: login timestamp

### Auto-Redirect
- If not authenticated, redirects to `/admin/login`
- If authenticated, can access `/admin`

### Logout
- Click "Logout" button in admin panel
- Clears session
- Redirects to login page

---

## 🧪 Testing Admin Features

### Test Deposit Approval

1. **As User:**
   ```
   Login: test@example.com / test123456
   Go to: http://localhost:3005/deposit
   Submit: $1000 USDT deposit
   ```

2. **As Admin:**
   ```
   Login: admin@pocketoption.com / Admin@2024
   Go to: http://localhost:3005/admin
   Click: Deposits tab
   Click: Confirm on pending deposit
   ```

3. **Verify:**
   ```
   Go to Users tab
   Find test@example.com
   Balance should show $1000
   ```

### Test Withdrawal Approval

1. **As User:**
   ```
   Login: test@example.com / test123456
   Go to: http://localhost:3005/withdraw
   Submit: $500 USDT withdrawal
   ```

2. **As Admin:**
   ```
   Go to: Withdrawals tab
   Click: Approve & Complete
   ```

3. **Verify:**
   ```
   Go to Users tab
   User balance should decrease by $500
   ```

---

## 📊 Admin Statistics

The overview tab shows:
- **Total Users:** Count of registered users
- **Total Balance:** Sum of all user balances
- **Total Trades:** Number of trades placed
- **Total Deposits:** Sum of all deposits
- **Total Withdrawals:** Sum of all withdrawals
- **Pending Deposits:** Count needing approval
- **Pending Withdrawals:** Count needing approval
- **Active Trades:** Currently running trades

---

## 🆘 Troubleshooting

### Can't Access Admin Panel

**Issue:** Redirects to /admin/login

**Solution:**
- Make sure you're using correct credentials
- Email: `admin@pocketoption.com`
- Password: `Admin@2024`
- Case-sensitive!

### Forgot Admin Password

**Solution:**
- Password is hardcoded in: `src/app/admin/login/page.tsx`
- Default: `Admin@2024`
- Can be changed in the code

### Session Expired

**Solution:**
- Just login again at `/admin/login`
- Session is stored in localStorage
- Clearing browser data will log you out

### Deposits/Withdrawals Not Showing

**Solution:**
- Click the refresh button (↻) in admin panel
- Check if Firestore has data
- Verify API endpoints are working

---

## 🔧 Customization

### Change Admin Credentials

Edit: `src/app/admin/login/page.tsx`

```typescript
const ADMIN_EMAIL = 'your-admin@email.com'
const ADMIN_PASSWORD = 'YourSecurePassword123!'
```

### Add More Admins

Currently supports single admin. To add multiple:
1. Create admin users table in Firestore
2. Update login logic to check database
3. Add role-based permissions

---

## 📝 Important Notes

### For Production:
- ⚠️ **Change default password!**
- ⚠️ **Use environment variables for credentials**
- ⚠️ **Implement proper authentication (JWT, OAuth)**
- ⚠️ **Add rate limiting**
- ⚠️ **Enable audit logging**
- ⚠️ **Use HTTPS only**

### Current Setup:
- ✅ Demo/development mode
- ✅ Simple localStorage auth
- ✅ Hardcoded credentials
- ✅ No rate limiting
- ✅ HTTP allowed

---

## ✅ Quick Reference

| Action | URL | Credentials |
|--------|-----|-------------|
| Admin Login | http://localhost:3005/admin/login | admin@pocketoption.com / Admin@2024 |
| Admin Panel | http://localhost:3005/admin | (after login) |
| User Login | http://localhost:3005/auth | (any registered user) |

---

**Status:** ✅ Fully Functional
**Last Updated:** November 7, 2025
