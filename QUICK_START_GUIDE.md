# 🚀 Quick Start Guide - Production Readiness Fixes

**For Developers:** This is your actionable checklist to get BeatMatchMe production-ready.

---

## ⚡ TL;DR - What's Wrong?

Your app has **5 critical security/payment vulnerabilities** that will cause:
1. 💰 **Revenue loss** - Users getting free requests
2. 🔒 **Race conditions** - Duplicate requests, overbooking
3. 📡 **Connection failures** - Lost queue updates, poor UX
4. 🐛 **Data inconsistency** - UI showing fake data after failed syncs
5. ⚖️ **Legal liability** - Failed refunds, payment disputes

**Risk Level:** 🔴 **DO NOT DEPLOY TO PRODUCTION**

---

## 🎯 Start Here - Day 1 Priority

### Step 1: Read the Full Analysis
1. Open `PRODUCTION_READINESS_PLAN.md` for complete overview
2. Review `CRITICAL_FIX_PAYMENT_VERIFICATION.md` for payment fix
3. Check `IMPLEMENTATION_TRACKER.md` for progress tracking

### Step 2: Set Up Your Environment
```bash
# Install dependencies
cd web
npm install @tanstack/react-query @sentry/react

# Set up environment variables
cp .env.example .env
# Add your Yoco test keys:
VITE_YOCO_PUBLIC_KEY=pk_test_YOUR_KEY
VITE_YOCO_SECRET_KEY=sk_test_YOUR_KEY # (Backend only)
```

### Step 3: Choose Your Task
Pick from P0 Critical Issues (in order):
1. **Payment Verification** (Backend - 2 days)
2. **Transaction Rollback** (Backend - 2 days)
3. **Business Logic Validation** (Backend - 2 days)
4. **WebSocket Reconnection** (Frontend - 2 days)
5. **Optimistic Updates** (Frontend - 2 days)

---

## 🛠️ Implementation Guides

### For Backend Developers

#### Task 1: Server-Side Payment Verification
**Files to Create:**
- `aws/lambda/verifyYocoPayment/index.js`
- `aws/lambda/submitRequestWithPayment/index.js`

**Files to Modify:**
- `amplify/data/schema.graphql`
- Add new mutation: `submitRequestWithPayment`

**Code Template:**
```javascript
// aws/lambda/submitRequestWithPayment/index.js
exports.handler = async (event) => {
  const { yocoChargeId, price } = event.arguments.input;
  
  // 1. Verify payment with Yoco API
  const charge = await verifyYocoCharge(yocoChargeId);
  if (charge.status !== 'successful') {
    return { success: false, error: 'PAYMENT_FAILED' };
  }
  
  // 2. Verify amount matches
  if (charge.amount !== Math.round(price * 100)) {
    return { success: false, error: 'AMOUNT_MISMATCH' };
  }
  
  // 3. Create request
  const request = await createRequest({...});
  return { success: true, request };
};
```

**Testing:**
```bash
# Unit test
npm test aws/lambda/submitRequestWithPayment

# Integration test
./scripts/test-payment-flow.sh
```

**Deploy:**
```bash
cd infrastructure
./deploy-lambda.sh submitRequestWithPayment
```

---

#### Task 2: Transaction Rollback
**Files to Create:**
- `aws/lambda/reconcileTransactions/index.js` (cron job)

**Files to Modify:**
- `infrastructure/dynamodb-config.json` (add Transactions table)

**DynamoDB Schema:**
```json
{
  "TableName": "Transactions",
  "KeySchema": [
    { "AttributeName": "transactionId", "KeyType": "HASH" }
  ],
  "AttributeDefinitions": [
    { "AttributeName": "transactionId", "AttributeType": "S" },
    { "AttributeName": "status", "AttributeType": "S" },
    { "AttributeName": "createdAt", "AttributeType": "N" }
  ],
  "GlobalSecondaryIndexes": [
    {
      "IndexName": "status-createdAt-index",
      "KeySchema": [
        { "AttributeName": "status", "KeyType": "HASH" },
        { "AttributeName": "createdAt", "KeyType": "RANGE" }
      ]
    }
  ]
}
```

**Reconciliation Cron:**
```javascript
// Run every hour to find stuck transactions
exports.handler = async () => {
  const oneHourAgo = Date.now() - 3600000;
  
  // Find transactions stuck in PENDING
  const stuck = await queryDynamoDB({
    TableName: 'Transactions',
    IndexName: 'status-createdAt-index',
    KeyConditionExpression: '#status = :pending AND createdAt < :threshold',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':pending': 'PENDING',
      ':threshold': oneHourAgo
    }
  });
  
  // Rollback each stuck transaction
  for (const transaction of stuck.Items) {
    await rollbackTransaction(transaction);
  }
};
```

---

#### Task 3: Business Logic Validation
**Files to Modify:**
- `aws/lambda/submitRequest/index.js`

**Validation Checklist:**
```javascript
// Add these checks BEFORE creating request
async function validateRequest(input) {
  // 1. Rate limiting
  const rateLimitKey = `rate:${input.userId}:${input.eventId}`;
  const requestCount = await incrementAtomicCounter(rateLimitKey, 60);
  if (requestCount > 3) {
    throw new Error('RATE_LIMITED');
  }
  
  // 2. Duplicate check
  const duplicate = await queryDynamoDB({
    TableName: 'Requests',
    IndexName: 'userId-eventId-songId-index',
    KeyConditionExpression: '...',
    FilterExpression: 'status IN (:pending, :accepted)'
  });
  if (duplicate.Items.length > 0) {
    throw new Error('DUPLICATE_REQUEST');
  }
  
  // 3. Capacity check
  const capacityKey = `capacity:${input.setId}:${currentHour}`;
  const count = await getAtomicCounter(capacityKey);
  const set = await getSet(input.setId);
  if (count >= set.requestCapPerHour) {
    throw new Error('CAPACITY_EXCEEDED');
  }
  
  return true;
}
```

---

### For Frontend Developers

#### Task 4: WebSocket Reconnection
**Files to Modify:**
- `web/src/hooks/useQueueSubscription.ts`
- `mobile/src/hooks/useQueueSubscription.ts`

**Implementation Pattern:**
```typescript
export function useQueueSubscription(setId: string, eventId: string) {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const reconnectAttemptsRef = useRef(0);
  const subscriptionRef = useRef<any>(null);
  
  // Exponential backoff reconnection
  const reconnect = useCallback(() => {
    const maxAttempts = 5;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
    
    if (reconnectAttemptsRef.current >= maxAttempts) {
      startPolling(); // Fallback
      return;
    }
    
    setTimeout(() => {
      reconnectAttemptsRef.current++;
      connectSubscription();
    }, delay);
  }, []);
  
  const connectSubscription = useCallback(() => {
    const subscription = client.graphql({
      query: onQueueUpdate,
      variables: { eventId }
    }).subscribe({
      next: (data) => {
        setQueueData(data);
        reconnectAttemptsRef.current = 0; // Reset on success
        setConnectionStatus('connected');
      },
      error: (error) => {
        setConnectionStatus('reconnecting');
        reconnect();
      },
      complete: () => {
        reconnect();
      }
    });
    
    subscriptionRef.current = subscription;
  }, [eventId, reconnect]);
  
  // Cleanup
  useEffect(() => {
    connectSubscription();
    return () => subscriptionRef.current?.unsubscribe();
  }, [setId, eventId]);
  
  return { queueData, connectionStatus };
}
```

**Add Connection Indicator:**
```tsx
// components/ConnectionStatus.tsx
export const ConnectionStatus = ({ status }) => {
  const statusConfig = {
    connected: { color: 'green', icon: '●', text: 'Live' },
    reconnecting: { color: 'yellow', icon: '◐', text: 'Reconnecting...' },
    polling: { color: 'yellow', icon: '◷', text: 'Polling' },
    disconnected: { color: 'red', icon: '○', text: 'Offline' }
  };
  
  const config = statusConfig[status];
  
  return (
    <div className={`status-indicator status-${config.color}`}>
      <span className="icon">{config.icon}</span>
      <span className="text">{config.text}</span>
    </div>
  );
};
```

---

#### Task 5: Optimistic Updates Rollback
**Files to Modify:**
- `web/src/pages/DJPortalOrbital.tsx`
- `web/src/pages/UserPortalInnovative.tsx`

**Pattern to Apply:**
```typescript
// Before (WRONG):
const handleAddTrack = async (track) => {
  setTracks([...tracks, track]); // Optimistic
  await syncToBackend(track); // If this fails, UI is wrong!
};

// After (CORRECT):
const handleAddTrack = async (track) => {
  const previousTracks = [...tracks];
  setTracks([...tracks, track]); // Optimistic
  
  try {
    await syncToBackend(track);
    // Success - notify user
    showNotification('Track added');
  } catch (error) {
    // ROLLBACK
    setTracks(previousTracks);
    showNotification('Failed to add track', { 
      action: { label: 'Retry', onClick: () => handleAddTrack(track) }
    });
  }
};
```

**Create Generic Hook:**
```typescript
// hooks/useOptimisticUpdate.ts
export function useOptimisticUpdate<T>(
  initialState: T,
  syncFn: (state: T) => Promise<T>
) {
  const [state, setState] = useState(initialState);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const update = async (newState: T) => {
    const previousState = state;
    setState(newState); // Optimistic
    setIsProcessing(true);
    
    try {
      const confirmed = await syncFn(newState);
      setState(confirmed); // Use server response
      return { success: true };
    } catch (error) {
      setState(previousState); // ROLLBACK
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  };
  
  return { state, update, isProcessing };
}

// Usage:
const { state: tracks, update: updateTracks } = useOptimisticUpdate(
  [],
  syncTracksToBackend
);
```

---

## 🧪 Testing Guide

### Run Tests Before Committing
```bash
# Backend tests
cd aws/lambda
npm test

# Frontend tests
cd web
npm test

# Integration tests
./scripts/test-integration.sh

# E2E tests
npm run test:e2e
```

### Manual Testing Checklist
- [ ] Payment flow works end-to-end
- [ ] Failed payment shows clear error
- [ ] Request created only after payment verified
- [ ] WebSocket reconnects after network loss
- [ ] Optimistic updates rollback on failure
- [ ] Rate limiting works (try >3 requests/min)
- [ ] Duplicate request blocked
- [ ] Capacity limit enforced

---

## 📊 Monitoring & Debugging

### CloudWatch Logs
```bash
# View payment verification logs
aws logs tail /aws/lambda/submitRequestWithPayment --follow

# View errors
aws logs filter-pattern "ERROR" --log-group-name /aws/lambda/submitRequestWithPayment
```

### Sentry Errors
```typescript
// Track specific errors
import * as Sentry from '@sentry/react';

try {
  await submitRequest();
} catch (error) {
  Sentry.captureException(error, {
    tags: { category: 'payment' },
    extra: { userId, amount }
  });
}
```

### Performance Monitoring
```typescript
// Track slow operations
const start = Date.now();
await submitRequest();
const duration = Date.now() - start;

if (duration > 3000) {
  console.warn('Slow request submission:', duration);
  trackMetric('request.slow', duration);
}
```

---

## 🚨 Common Pitfalls

### 1. Forgetting Server-Side Validation
❌ **WRONG:**
```typescript
// Client-side only
if (requests.length >= 3) {
  alert('Too many requests');
  return;
}
await submitRequest(); // Can be bypassed!
```

✅ **CORRECT:**
```typescript
const result = await submitRequest();
if (!result.success && result.error.code === 'RATE_LIMITED') {
  alert('Too many requests');
}
```

### 2. Not Handling Payment Failures
❌ **WRONG:**
```typescript
await processPayment();
await submitRequest(); // What if payment failed?
```

✅ **CORRECT:**
```typescript
const payment = await processPayment();
if (payment.status !== 'succeeded') {
  throw new Error('Payment failed');
}
const result = await submitRequest({ paymentId: payment.id });
if (!result.success) {
  await refundPayment(payment.id); // Rollback!
}
```

### 3. Ignoring WebSocket Errors
❌ **WRONG:**
```typescript
subscription.subscribe({
  next: (data) => setQueue(data),
  error: (err) => console.error(err) // ❌ Just logs, doesn't reconnect!
});
```

✅ **CORRECT:**
```typescript
subscription.subscribe({
  next: (data) => setQueue(data),
  error: (err) => {
    console.error(err);
    reconnect(); // ✅ Attempt to reconnect
  }
});
```

---

## 📚 Resources

### Documentation
- [Yoco API Docs](https://developer.yoco.com/online/resources/api-reference)
- [AWS Amplify GraphQL](https://docs.amplify.aws/cli/graphql/overview/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Sentry React SDK](https://docs.sentry.io/platforms/javascript/guides/react/)

### Internal Docs
- `PRODUCTION_READINESS_PLAN.md` - Full analysis and fixes
- `CRITICAL_FIX_PAYMENT_VERIFICATION.md` - Payment security guide
- `IMPLEMENTATION_TRACKER.md` - Progress tracking
- `PAYMENT_FLOW_GUIDE.md` - Payment architecture

### Support
- **Questions?** Ask in #dev-help Slack channel
- **Blockers?** Ping @tech-lead immediately
- **Emergencies?** Call on-call engineer

---

## ✅ Definition of Done

Before marking a task complete:
- [ ] Code written and peer-reviewed
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] QA approval
- [ ] No new Sentry errors
- [ ] Performance benchmarks met

---

## 🎯 Daily Routine

**Morning (30 min):**
1. Check `IMPLEMENTATION_TRACKER.md` for your tasks
2. Review overnight Sentry errors
3. Update task status (Not Started → In Progress)

**Development (6-7 hours):**
1. Write code following patterns in this guide
2. Run tests locally before committing
3. Create small, focused PRs

**End of Day (30 min):**
1. Update `IMPLEMENTATION_TRACKER.md` with progress
2. Push work-in-progress to feature branch
3. Note blockers for tomorrow's standup

---

**Good luck! Let's make BeatMatchMe production-ready! 🚀**

**Questions?** Read the docs first, then ask in Slack.  
**Found a bug?** Create an issue with reproduction steps.  
**Need help?** Tag your team lead.
