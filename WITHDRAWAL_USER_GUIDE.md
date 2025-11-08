# Withdrawal Module - User Guide

## 🎯 Quick Start

### For Users

#### How to Request a Withdrawal

1. **Access Withdrawal**
   - Click the "Withdraw" button in the dashboard header (mobile)
   - Or click "Withdraw" in the sidebar (desktop)
   - Or navigate to `/withdraw` page

2. **Fill Out the Form**
   - Select your cryptocurrency (BTC, ETH, USDT, BNB)
   - Choose the network (TRC20, ERC20, BEP20, etc.)
   - Enter the amount in USD (or click MAX for full balance)
   - Paste your wallet address
   - Double-check all information

3. **Submit Request**
   - Click "Submit Withdrawal Request"
   - You'll see a success message
   - Your request status will be "Pending"

4. **Track Your Withdrawal**
   - Go to `/withdraw` page
   - View your withdrawal history
   - Check status: Pending → Completed/Rejected
   - Read admin notes if provided

#### Withdrawal Status Meanings

- **🟡 Pending**: Your request is awaiting admin review
- **🟢 Completed**: Approved! Funds sent to your wallet
- **🔴 Rejected**: Request denied (see admin note for reason)

#### Important Notes

⚠️ **Before Submitting**:
- Verify your wallet address is correct
- Ensure you selected the right network
- Check that you have sufficient balance
- Withdrawals cannot be reversed if sent to wrong address

⏱️ **Processing Time**:
- Typical processing: 24-48 hours
- Depends on admin availability
- You'll see status updates in real-time

💰 **Balance**:
- Balance is NOT deducted when you submit
- Balance is deducted only when admin approves
- If rejected, your balance remains unchanged

---

### For Admins

#### How to Process Withdrawals

1. **Access Admin Panel**
   - Navigate to `/admin`
   - Click on "Withdrawals" tab
   - See pending count in the badge

2. **Review Request**
   - Click "Process" on any pending withdrawal
   - Review user details:
     - User email
     - Amount requested
     - Currency and network
     - Wallet address

3. **Make Decision**

   **To Approve**:
   - Click "Approve & Complete"
   - User's balance will be deducted automatically
   - Status changes to "Completed"
   - User receives notification

   **To Reject**:
   - Click "Reject"
   - No balance change occurs
   - Status changes to "Rejected"
   - Default message: "Insufficient balance or gas fee"

4. **Add Notes (Optional)**
   - Type a message in the "Admin Note" field
   - Examples:
     - "Processed successfully"
     - "Insufficient balance"
     - "Invalid wallet address"
     - "KYC verification required"
   - User will see this note in their history

#### Admin Best Practices

✅ **Before Approving**:
- Verify user has sufficient balance
- Check wallet address format
- Confirm network matches currency
- Review user's account status
- Check for suspicious activity

❌ **Rejection Reasons**:
- Insufficient balance
- Invalid wallet address
- Wrong network selected
- Failed KYC verification
- Suspicious activity detected
- Duplicate request

📝 **Note Guidelines**:
- Be clear and professional
- Explain rejection reasons
- Provide next steps if applicable
- Keep messages concise

---

## 🔍 Common Scenarios

### Scenario 1: Successful Withdrawal
```
User submits $100 USDT withdrawal
↓
Admin reviews and approves
↓
$100 deducted from user balance
↓
Status: Completed
↓
User sees success in history
```

### Scenario 2: Insufficient Balance
```
User submits $500 withdrawal
User balance: $300
↓
Admin reviews
↓
Admin rejects with note: "Insufficient balance"
↓
No balance change
↓
User sees rejection and note
```

### Scenario 3: Wrong Network
```
User submits BTC withdrawal
But selects ERC20 network (wrong!)
↓
Admin reviews
↓
Admin rejects with note: "BTC requires Bitcoin Network, not ERC20"
↓
User corrects and resubmits
```

---

## 🛠️ Troubleshooting

### User Issues

**Q: My withdrawal is stuck on "Pending"**
- A: Withdrawals require manual admin approval. Typical processing time is 24-48 hours.

**Q: Can I cancel my withdrawal?**
- A: Contact admin support. If not yet processed, it may be possible.

**Q: I entered the wrong wallet address**
- A: Contact admin immediately. If not yet processed, admin can reject it.

**Q: Why was my withdrawal rejected?**
- A: Check the admin note in your withdrawal history for the specific reason.

**Q: When will I receive my funds?**
- A: After admin approval, blockchain processing time varies by network (5 mins - 1 hour typically).

### Admin Issues

**Q: Can I edit a withdrawal amount?**
- A: No, you can only approve or reject. User must submit a new request for different amount.

**Q: What if user balance changed after request?**
- A: System checks balance again before deducting. If insufficient, approval will fail.

**Q: Can I reverse an approved withdrawal?**
- A: No, approvals are final. Balance is immediately deducted.

**Q: How do I handle duplicate requests?**
- A: Reject duplicates with note: "Duplicate request. Original request is being processed."

---

## 📊 Withdrawal Limits

### Current Limits
- **Minimum**: $1 USD
- **Maximum**: User's available balance
- **Daily Limit**: None (currently)
- **Processing Time**: 24-48 hours

### Future Enhancements
- Daily/weekly withdrawal limits
- Automatic approval for small amounts
- Instant withdrawals for verified users
- Priority processing tiers

---

## 🔐 Security Features

### User Protection
- ✅ Authentication required
- ✅ Balance verification
- ✅ Wallet address validation
- ✅ Network verification
- ✅ Transaction history tracking

### Admin Protection
- ✅ Admin authentication required
- ✅ Double balance check
- ✅ Status validation (prevent double-processing)
- ✅ Audit trail of all actions
- ✅ Atomic database transactions

---

## 📞 Support

### For Users
- Check withdrawal history for status updates
- Read admin notes for rejection reasons
- Contact support if issues persist

### For Admins
- Review user account before processing
- Add clear notes for rejections
- Monitor pending requests regularly
- Report technical issues to development team

---

## 🎓 Tips & Best Practices

### For Users
1. **Double-check everything** before submitting
2. **Use correct network** for your currency
3. **Start with small amounts** to test
4. **Keep wallet addresses** in a secure note
5. **Monitor your email** for notifications (future feature)

### For Admins
1. **Process requests promptly** (within 24 hours)
2. **Always add notes** for rejections
3. **Verify large amounts** carefully
4. **Check user history** before approving
5. **Report suspicious activity** immediately

---

**Need Help?** Contact the development team or refer to `WITHDRAWAL_MODULE.md` for technical details.
