# BeatMatchMe Payment Flow & Commission System

## Overview
BeatMatchMe uses a transparent 85/15 revenue split where performers earn 85% of each song request payment, and the platform takes 15% to cover operations, payment processing, and platform maintenance.

---

## 💰 Revenue Split

### Commission Structure
- **Performer receives:** 85% of net amount
- **Platform fee:** 15% of net amount
- **Payment processing:** ~2.9% + R1 (deducted by Yoco)

### Example: R100 Song Request
```
Customer pays:          R100.00
Payment processing:     - R3.90  (2.9% + R1)
Net amount:             R96.10
--------------------------------
Platform fee (15%):     - R14.42
Performer receives:      R81.68  (85%)
```

---

## 🎵 How Audiences Access Payment

### 1. QR Code (Primary for Venues)
- DJ displays QR code at their booth/on screen
- Audience scans with phone camera
- Instantly opens request portal
- **Best for:** Live events, nightclubs, weddings

### 2. Direct Link (Social Media)
- Share unique event link on Instagram/Twitter/WhatsApp
- Click to access request portal
- **Best for:** Pre-event promotion, online presence

### 3. Event Discovery (App Feature)
- Users browse nearby events in BeatMatchMe app
- Filter by venue, DJ, or music genre
- **Best for:** Discovery, repeat customers

---

## 🔄 Payment Flow

### User Journey
```
1. User accesses portal (QR/Link/App)
   ↓
2. Browse songs or search
   ↓
3. Select song + optional dedication
   ↓
4. See payment page
   - Clean, trustworthy design
   - Clear pricing breakdown
   - "85% goes to DJ" message
   ↓
5. Pay with card (Yoco)
   - One-click payment
   - Secure, PCI-compliant
   ↓
6. Request in queue immediately
   ↓
7. DJ accepts/declines
   ↓
8. Money credited to DJ balance
```

### Payment Page Design Principles
✅ **Simple** - No clutter, just essentials  
✅ **Trustworthy** - Security badges, clear breakdown  
✅ **Fast** - One-tap payment, no forms  
✅ **Transparent** - Show where money goes  
✅ **Confident** - Handle large amounts without worry  

---

## 💳 Payment Processing

### Integration: Yoco
- South Africa's #1 payment gateway
- Supports Visa, Mastercard, instant EFT
- PCI-DSS Level 1 certified
- Instant payment confirmation

### Security Features
- 256-bit SSL encryption
- Tokenized card data
- No card details stored
- Automatic fraud detection

---

## 💸 Performer Payouts

### How DJs Get Paid

1. **Real-time Balance Tracking**
   - Every accepted request adds to balance
   - Live dashboard shows available earnings
   - Transparent breakdown of fees

2. **Payout Requests**
   - Minimum payout: **R100**
   - DJs request payout when ready
   - Funds transferred to bank account

3. **Payout Timeline**
   - Request submitted: Instant
   - Processing: 2-3 business days
   - In bank account: 3-5 business days total

4. **Payout Methods**
   - Direct bank transfer (EFT)
   - Future: Instant EFT, SnapScan, etc.

### Dashboard Features
```typescript
// Performer sees:
- Available Balance:      R850.00  (can withdraw)
- Pending Payouts:        R200.00  (processing)
- Total Lifetime:         R12,450
- Platform Fees Paid:     R2,198
- Transaction Count:      147 requests
- Last Payout:            Nov 1, 2025
```

---

## 📊 Commission Explanation (For Users)

### Why 15%?
The platform fee covers:
- ✅ Secure payment processing
- ✅ Real-time queue management
- ✅ Instant refunds for vetoed songs
- ✅ Live notifications & updates
- ✅ Customer support 24/7
- ✅ Platform hosting & maintenance
- ✅ Data security & backups

### Transparency
- Fees shown before payment
- Breakdown available on request
- No hidden charges
- Clear performer cut displayed

---

## 🔐 Trust & Security

### User Trust Elements
1. **"85% goes to your DJ"** - Front and center
2. **Security badges** - Lock icons, SSL, PCI logos
3. **Payment gateway branding** - "Powered by Yoco"
4. **Clear breakdown** - Optional detailed view
5. **Refund guarantee** - Automatic if DJ declines

### Large Amount Confidence
- No transaction limits shown
- Clean, professional design
- Corporate-grade security indicators
- Bank-level encryption messaging

---

## 🎯 Implementation Files

### Frontend Components
- `PaymentPage.tsx` - Main payment interface
- `PaymentAccess.tsx` - QR/Link sharing components
- `PayoutDashboard.tsx` - DJ earnings dashboard
- `YocoCardInput.tsx` - Card payment form

### Backend Services
- `paymentSplit.ts` - Commission calculation logic
- `processPayment/index.js` - Lambda function
- `processRefund/index.js` - Refund handling

### GraphQL Schema
```graphql
type Transaction {
  transactionId: ID!
  amount: Float!
  platformFee: Float!
  performerEarnings: Float!
  status: TransactionStatus!
  paymentProvider: PaymentProvider!
}
```

---

## 🧪 Testing Checklist

### Payment Flow
- [ ] QR code generates correctly
- [ ] Direct link works
- [ ] Payment page loads fast (<2s)
- [ ] Breakdown calculates correctly
- [ ] Yoco integration works
- [ ] Transaction saved to DB
- [ ] Request added to queue
- [ ] DJ balance updated

### Payout Flow
- [ ] Balance displays correctly
- [ ] Minimum threshold enforced (R100)
- [ ] Payout request created
- [ ] Status updates properly
- [ ] Bank transfer initiates
- [ ] Confirmation email sent

### Edge Cases
- [ ] Failed payments handled
- [ ] Refunds processed correctly
- [ ] Network errors graceful
- [ ] Duplicate prevention
- [ ] Concurrent transactions

---

## 📈 Future Enhancements

### Phase 2
- [ ] Split payments (group requests)
- [ ] Tips for DJs (100% to performer)
- [ ] Multi-currency support
- [ ] Subscription pricing for frequent requesters

### Phase 3
- [ ] Analytics dashboard
- [ ] Tax reporting for DJs
- [ ] Automated payouts (weekly/monthly)
- [ ] Multiple payout methods

---

## 🆘 Support & Resources

### Documentation
- Yoco API: https://developer.yoco.com
- Payment Security: PCI-DSS standards
- South African Payments: PASA guidelines

### Contact
- Platform support: support@beatmatchme.com
- Payment issues: payments@beatmatchme.com
- DJ payouts: payouts@beatmatchme.com

---

**Last Updated:** November 5, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅
