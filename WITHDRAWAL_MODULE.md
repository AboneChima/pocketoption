# Withdrawal Module Documentation

## Overview
Complete withdrawal system allowing users to request cryptocurrency withdrawals and admins to approve/reject them with automatic balance management.

## Features Implemented

### User Side

#### 1. Withdraw Button
- **Location**: Dashboard header (mobile) and navigation sidebar (desktop)
- **Action**: Opens withdrawal modal
- **Icon**: Red TrendingDown icon

#### 2. Withdrawal Modal (`/src/components/modals/WithdrawModal.tsx`)
- **Currency Selection**: BTC, ETH, USDT, BNB
- **Network Selection**: 
  - BTC: Bitcoin Network
  - ETH: ERC20
  - USDT: TRC20, ERC20, BEP20
  - BNB: BEP20, BEP2
- **Amount Input**: USD amount with MAX button
- **Wallet Address**: Input with validation (minimum 20 characters)
- **Warnings**: Important notices about address verification
- **Validation**:
  - Minimum amount: $1
  - Balance check before submission
  - Wallet address format validation

#### 3. Withdrawal History (`/src/components/WithdrawalHistory.tsx`)
- **Status Indicators**:
  - Pending (Yellow): Awaiting admin approval
  - Completed (Green): Approved and processed
  - Rejected (Red): Rejected by admin
- **Information Displayed**:
  - Amount and currency
  - Wallet address (truncated)
  - Network type
  - Request timestamp
  - Processing timestamp (if completed/rejected)
  - Admin notes (if any)
- **Auto-refresh**: Manual refresh button available

#### 4. Dedicated Withdraw Page (`/src/app/withdraw/page.tsx`)
- **Route**: `/withdraw`
- **Features**:
  - Balance display card
  - New withdrawal button
  - Complete withdrawal history
  - Responsive design for mobile and desktop

### Admin Side

#### 1. Withdrawals Tab in Admin Panel
- **Location**: Admin dashboard (`/admin`)
- **Features**:
  - View all withdrawal requests
  - Filter by status (pending, completed, rejected)
  - Pending count badge
  - Real-time updates

#### 2. Withdrawal Processing Modal
- **User Information**: Email, name
- **Withdrawal Details**:
  - Amount
  - Currency
  - Network
  - Wallet address
- **Admin Actions**:
  - **Approve & Complete**: 
    - Deducts amount from user balance
    - Updates status to "completed"
    - Records processing timestamp
  - **Reject**: 
    - No balance change
    - Updates status to "rejected"
    - Default message: "Insufficient balance or gas fee"
- **Admin Notes**: Optional notes for both approve/reject actions

### API Endpoints

#### User Endpoints

##### GET `/api/withdrawals`
- **Auth**: Required (Bearer token)
- **Returns**: Array of user's withdrawal requests
- **Sorted**: By creation date (newest first)

##### POST `/api/withdrawals`
- **Auth**: Required (Bearer token)
- **Body**:
  ```json
  {
    "amount": 100,
    "currency": "USDT",
    "walletAddress": "TJxZ...WUN",
    "network": "TRC20"
  }
  ```
- **Validation**:
  - Amount > 0
  - Sufficient balance
  - Valid wallet address
  - Required fields present
- **Returns**: Created withdrawal object

#### Admin Endpoints

##### GET `/api/admin/withdrawals`
- **Returns**: All withdrawal requests from all users
- **Sorted**: By creation date (newest first)

##### POST `/api/admin/withdrawals`
- **Body**:
  ```json
  {
    "withdrawalId": "abc123",
    "status": "completed",
    "adminNote": "Processed successfully"
  }
  ```
- **Status Options**: "completed" or "rejected"
- **Actions**:
  - **Completed**: Deducts balance, updates status
  - **Rejected**: Only updates status, no balance change
- **Validation**:
  - Withdrawal must be in "pending" status
  - User must have sufficient balance (for approval)
  - Withdrawal must exist

### Database Structure (Firestore)

#### Collection: `withdrawals`
```javascript
{
  id: "auto-generated",
  userId: "user-uid",
  amount: 100,
  currency: "USDT",
  walletAddress: "TJxZ...WUN",
  network: "TRC20",
  status: "pending", // "pending" | "completed" | "rejected"
  createdAt: "2025-11-07T14:00:00Z",
  processedAt: "2025-11-07T15:00:00Z", // optional
  adminNote: "Processed successfully", // optional
  user: {
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe"
  }
}
```

#### Collection: `users` (Balance Update)
```javascript
{
  id: "user-uid",
  balance: 1000, // Updated when withdrawal is approved
  // ... other user fields
}
```

## User Flow

1. **Request Withdrawal**:
   - User clicks "Withdraw" button
   - Fills out withdrawal form
   - Submits request
   - Status: "Pending"

2. **View Status**:
   - User navigates to `/withdraw` page
   - Views withdrawal history
   - Sees current status and admin notes

3. **Admin Processing**:
   - Admin views pending withdrawals
   - Reviews details
   - Approves or rejects
   - Adds optional note

4. **Completion**:
   - If approved: Balance deducted, status "Completed"
   - If rejected: No balance change, status "Rejected"
   - User sees updated status and admin note

## Balance Management

### On Withdrawal Request
- **No balance deduction**
- Balance check performed
- Request stored as "pending"

### On Admin Approval
- **Balance deducted**: `newBalance = currentBalance - withdrawalAmount`
- Firestore transaction ensures atomicity
- Balance check performed again before deduction

### On Admin Rejection
- **No balance change**
- User can submit new request

## Security Features

1. **Authentication**: All endpoints require valid Firebase auth token
2. **Authorization**: Users can only view their own withdrawals
3. **Balance Verification**: Double-checked on request and approval
4. **Status Validation**: Prevents processing already-processed withdrawals
5. **Atomic Operations**: Firestore transactions for balance updates

## UI/UX Features

1. **Responsive Design**: Works on mobile and desktop
2. **Real-time Updates**: Manual refresh available
3. **Status Colors**: Visual indicators for different statuses
4. **Toast Notifications**: Success/error feedback
5. **Loading States**: Spinners during API calls
6. **Validation Messages**: Clear error messages
7. **Confirmation Modals**: Admin confirmation before processing

## Navigation

### User Navigation
- Dashboard header: Withdraw button
- Desktop sidebar: Withdraw link
- Mobile bottom nav: Withdraw tab
- Direct URL: `/withdraw`

### Admin Navigation
- Admin panel: Withdrawals tab
- Pending badge: Shows count of pending requests
- Quick access from overview stats

## Testing Checklist

- [ ] User can submit withdrawal request
- [ ] Insufficient balance shows error
- [ ] Invalid wallet address shows error
- [ ] Withdrawal appears in history
- [ ] Admin can view all withdrawals
- [ ] Admin can approve withdrawal
- [ ] Balance deducted on approval
- [ ] Admin can reject withdrawal
- [ ] No balance change on rejection
- [ ] Admin notes appear in user history
- [ ] Status updates in real-time
- [ ] Mobile responsive design works
- [ ] Desktop layout works
- [ ] Authentication required for all actions

## Future Enhancements

1. **Email Notifications**: Notify users when status changes
2. **Withdrawal Limits**: Daily/weekly limits per user
3. **KYC Verification**: Require KYC for large withdrawals
4. **Transaction Hash**: Store blockchain transaction hash
5. **Automatic Processing**: Auto-approve small amounts
6. **Fee Calculation**: Dynamic network fee calculation
7. **Multi-signature**: Require multiple admin approvals
8. **Audit Log**: Track all admin actions
9. **Export**: CSV export of withdrawal history
10. **Analytics**: Withdrawal statistics and trends

## Support

For issues or questions about the withdrawal module, contact the development team.
