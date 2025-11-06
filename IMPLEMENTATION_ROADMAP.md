# 🎯 AGGRESSIVE IMPLEMENTATION ROADMAP
**Maximizing Code Reuse - Modify, Don't Create**

**Status:** Ready for immediate implementation  
**Timeline:** 10 days aggressive sprint  
**Strategy:** Enhance existing files, minimal new files

---

## 📋 REFINED TODO LIST (20 Tasks)

### ✅ Code Reuse Strategy
- **MODIFY existing files:** 17 tasks (85%)
- **CREATE new files:** 3 tasks (15%)
- **DELETE files:** 0 tasks
- **Total files touched:** ~15 files

---

## 🔴 P0: CRITICAL FIXES (Day 1-4)

### **P0-1: Enhance processPayment Lambda** ⚡ START HERE
**File:** `aws/lambda/processPayment/index.js` (MODIFY existing)  
**Time:** 4 hours  
**Dependencies:** None

**Current State:** 
- ✅ Has processYocoPayment function
- ✅ Creates transaction record
- ✅ Updates request status
- ❌ NO server-side verification
- ❌ NO idempotency checks
- ❌ NO duplicate payment prevention

**Changes Required:**
```javascript
// ADD at line 85 (before calling processYocoPayment):

// 1. Check idempotency key
const existingTransaction = await dynamodb.get({
  TableName: 'beatmatchme-transactions',
  Key: { idempotencyKey: input.idempotencyKey }
}).promise();

if (existingTransaction.Item) {
  return existingTransaction.Item; // Already processed
}

// 2. Verify charge with Yoco API
async function verifyYocoCharge(apiKey, chargeId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'online.yoco.com',
      path: `/v1/charges/${chargeId}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Yoco verification failed: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// 3. Verify before processing
const chargeVerification = await verifyYocoCharge(apiKey, input.yocoChargeId);

if (chargeVerification.status !== 'successful') {
  throw new Error('Payment verification failed');
}

if (chargeVerification.amount !== Math.round(amount * 100)) {
  throw new Error('Amount mismatch');
}

// 4. Check for duplicate charge
const duplicateCheck = await dynamodb.query({
  TableName: 'beatmatchme-transactions',
  IndexName: 'providerTransactionId-index',
  KeyConditionExpression: 'providerTransactionId = :chargeId',
  ExpressionAttributeValues: { ':chargeId': input.yocoChargeId }
}).promise();

if (duplicateCheck.Items.length > 0) {
  throw new Error('Charge already used');
}
```

**Testing:**
```bash
cd aws/lambda/processPayment
# Test with duplicate charge ID
node test-duplicate.js
# Test with wrong amount
node test-amount-mismatch.js
```

---

### **P0-2: Add Transaction Rollback** ⚡
**File:** `aws/lambda/processPayment/index.js` (MODIFY existing)  
**Time:** 3 hours  
**Dependencies:** P0-1

**Changes Required:**
```javascript
// WRAP entire handler in try-catch (line 75):

exports.handler = async (event) => {
  console.log('Processing payment:', JSON.stringify(event, null, 2));
  
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  let transaction = {
    transactionId,
    status: 'PENDING',
    createdAt: Date.now(),
    ...event.arguments.input
  };
  
  try {
    // Create PENDING transaction first
    await dynamodb.put({
      TableName: 'beatmatchme-transactions',
      Item: transaction
    }).promise();
    
    // ... existing payment logic ...
    
    // Update to COMPLETED
    transaction.status = 'COMPLETED';
    transaction.completedAt = Date.now();
    await dynamodb.put({
      TableName: 'beatmatchme-transactions',
      Item: transaction
    }).promise();
    
    return transaction;
    
  } catch (error) {
    console.error('Payment failed, initiating rollback:', error);
    
    // ROLLBACK: Refund if charge was successful
    if (transaction.providerTransactionId) {
      try {
        const refund = await processRefund({
          chargeId: transaction.providerTransactionId,
          amount: transaction.amount,
          reason: 'Transaction failed - automatic rollback'
        });
        
        transaction.status = 'ROLLED_BACK';
        transaction.refundId = refund.id;
      } catch (refundError) {
        console.error('Refund failed:', refundError);
        transaction.status = 'FAILED_NEEDS_MANUAL_REFUND';
      }
    } else {
      transaction.status = 'FAILED';
    }
    
    transaction.error = error.message;
    transaction.failedAt = Date.now();
    
    // Save failed transaction
    await dynamodb.put({
      TableName: 'beatmatchme-transactions',
      Item: transaction
    }).promise();
    
    throw error;
  }
};
```

---

### **P0-3: Server-Side Business Logic** ⚡
**File:** `aws/lambda/createRequest/index.js` (MODIFY existing)  
**Time:** 4 hours  
**Dependencies:** P0-8 (DynamoDB indexes)

**Changes Required:**
```javascript
// ADD before line 50 (before creating request):

// 1. Rate limiting check
const rateLimitKey = `${userId}:${input.eventId}:${Math.floor(Date.now() / 60000)}`;
const rateLimit = await dynamodb.get({
  TableName: 'beatmatchme-ratelimits',
  Key: { limitKey: rateLimitKey }
}).promise();

const requestCount = rateLimit.Item?.count || 0;
if (requestCount >= 3) {
  throw new Error('RATE_LIMITED: Max 3 requests per minute');
}

// Increment counter
await dynamodb.update({
  TableName: 'beatmatchme-ratelimits',
  Key: { limitKey: rateLimitKey },
  UpdateExpression: 'ADD #count :inc',
  ExpressionAttributeNames: { '#count': 'count' },
  ExpressionAttributeValues: { ':inc': 1 }
}).promise();

// 2. Duplicate check
const duplicateCheck = await dynamodb.query({
  TableName: 'beatmatchme-requests',
  IndexName: 'userId-eventId-songId-index',
  KeyConditionExpression: 'userId = :userId AND eventId = :eventId',
  FilterExpression: 'songId = :songId AND (#status = :pending OR #status = :accepted)',
  ExpressionAttributeNames: { '#status': 'status' },
  ExpressionAttributeValues: {
    ':userId': userId,
    ':eventId': input.eventId,
    ':songId': input.songId,
    ':pending': 'PENDING',
    ':accepted': 'ACCEPTED'
  }
}).promise();

if (duplicateCheck.Items.length > 0) {
  throw new Error('DUPLICATE_REQUEST: Already have active request for this song');
}

// 3. User active request limit (max 3)
const activeRequests = await dynamodb.query({
  TableName: 'beatmatchme-requests',
  IndexName: 'userId-eventId-index',
  KeyConditionExpression: 'userId = :userId AND eventId = :eventId',
  FilterExpression: '#status IN (:pending, :accepted)',
  ExpressionAttributeNames: { '#status': 'status' },
  ExpressionAttributeValues: {
    ':userId': userId,
    ':eventId': input.eventId,
    ':pending': 'PENDING',
    ':accepted': 'ACCEPTED'
  }
}).promise();

if (activeRequests.Items.length >= 3) {
  throw new Error('ACTIVE_LIMIT_EXCEEDED: Max 3 active requests per event');
}

// 4. Capacity check
const hourKey = Math.floor(Date.now() / 3600000);
const capacityKey = `${input.eventId}:${hourKey}`;
const capacityCount = await dynamodb.get({
  TableName: 'beatmatchme-capacity',
  Key: { capacityKey }
}).promise();

const currentCount = capacityCount.Item?.count || 0;
if (currentCount >= eventData.settings.requestCapPerHour) {
  const retryAfter = 3600 - Math.floor((Date.now() % 3600000) / 1000);
  throw new Error(`CAPACITY_EXCEEDED: Retry in ${retryAfter}s`);
}

// Increment capacity counter
await dynamodb.update({
  TableName: 'beatmatchme-capacity',
  Key: { capacityKey },
  UpdateExpression: 'ADD #count :inc',
  ExpressionAttributeNames: { '#count': 'count' },
  ExpressionAttributeValues: { ':inc': 1 }
}).promise();
```

---

### **P0-4: Enhanced WebSocket Reconnection** ⚡
**File:** `web/src/hooks/useQueueSubscription.ts` (MODIFY existing)  
**Time:** 3 hours  
**Dependencies:** None

**Current State:**
- ✅ Has exponential backoff (5 attempts)
- ✅ Has polling fallback
- ❌ NO missed message recovery
- ❌ NO health check ping/pong

**Changes Required:**
```typescript
// ADD after line 38:
const lastUpdateTimestampRef = useRef<number>(Date.now());
const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

// ADD missed message recovery function (line 130):
const recoverMissedUpdates = useCallback(async () => {
  if (!eventId || !setId) return;
  
  try {
    const client = generateClient({ authMode: 'userPool' });
    
    // Fetch updates since last known timestamp
    const response: any = await client.graphql({
      query: `
        query FetchQueueUpdatesSince($eventId: ID!, $since: AWSTimestamp!) {
          fetchQueueUpdatesSince(eventId: $eventId, since: $since) {
            updates {
              eventId
              orderedRequests { requestId queuePosition status }
              timestamp
            }
          }
        }
      `,
      variables: { 
        eventId, 
        since: lastUpdateTimestampRef.current 
      }
    });
    
    const missedUpdates = response.data?.fetchQueueUpdatesSince?.updates || [];
    
    if (missedUpdates.length > 0) {
      console.log(`📦 Recovered ${missedUpdates.length} missed updates`);
      // Apply most recent update
      const latest = missedUpdates[missedUpdates.length - 1];
      setQueueData(latest);
      lastUpdateTimestampRef.current = latest.timestamp;
    }
  } catch (error) {
    console.error('Failed to recover missed updates:', error);
  }
}, [eventId, setId]);

// ADD health check (line 180):
const startHealthCheck = useCallback(() => {
  if (healthCheckIntervalRef.current) return;
  
  healthCheckIntervalRef.current = setInterval(() => {
    if (subscriptionRef.current) {
      // Send ping (implementation depends on AppSync API)
      console.log('🏓 WebSocket health check ping');
    }
  }, 30000); // Every 30 seconds
}, []);

// MODIFY connectSubscription to call recovery (line 200):
next: ({ data }: any) => {
  setQueueData(data.onQueueUpdate);
  lastUpdateTimestampRef.current = Date.now();
  reconnectAttemptsRef.current = 0;
  setConnectionStatus('connected');
  trackConnectionSuccess();
},
error: (err: Error) => {
  console.error('Subscription error:', err);
  setError(err);
  setConnectionStatus('error');
  
  // Attempt recovery before reconnecting
  recoverMissedUpdates();
  
  reconnect();
}
```

---

### **P0-5: Optimistic Update Rollback** ⚡
**File:** `web/src/pages/DJPortalOrbital.tsx` (MODIFY existing)  
**Time:** 2 hours  
**Dependencies:** None

**Changes Required:**
```typescript
// REPLACE handleAddTrack function (line 401):
const handleAddTrack = async (track: Omit<Track, 'id'>) => {
  const newTrack = { ...track, id: `track-${Date.now()}` };
  const previousTracks = [...tracks]; // Capture state
  const updatedTracks = [...tracks, newTrack];
  
  // Optimistic update
  setTracks(updatedTracks);
  
  try {
    await syncTracksToBackend(updatedTracks);
    
    addNotification({
      type: 'success',
      title: '✅ Track Added',
      message: `${track.title} by ${track.artist}`,
    });
  } catch (error) {
    // ROLLBACK on failure
    setTracks(previousTracks);
    
    console.error('Failed to add track:', error);
    addNotification({
      type: 'error',
      title: '❌ Failed to Add Track',
      message: 'Could not sync to server. Please try again.',
      action: {
        label: 'Retry',
        onClick: () => handleAddTrack(track)
      }
    });
  }
};

// APPLY SAME PATTERN to:
// - handleUpdateTrack (line 415)
// - handleDeleteTrack (line 422)
// - handleToggleTrack (line 436)
```

---

## 🟡 P1: HIGH PRIORITY (Day 5-7)

### **P1-4: Install React Query** ⚡
**Files:** `web/package.json`, `web/src/lib/queryClient.ts` (NEW), `web/src/main.tsx` (MODIFY)  
**Time:** 1 hour

```bash
cd web
npm install @tanstack/react-query @tanstack/react-query-devtools
```

**CREATE:** `web/src/lib/queryClient.ts`
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes default
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query keys factory
export const queryKeys = {
  events: ['events'] as const,
  event: (id: string) => ['events', id] as const,
  tracklist: (eventId: string) => ['tracklist', eventId] as const,
  queue: (eventId: string) => ['queue', eventId] as const,
  djSets: (performerId: string) => ['djSets', performerId] as const,
};
```

**MODIFY:** `web/src/main.tsx`
```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AmplifyProvider>
        <AuthProvider>
          {/* ... existing providers ... */}
        </AuthProvider>
      </AmplifyProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

---

### **P1-5: Migrate to React Query** ⚡
**File:** `web/src/hooks/useEvent.ts` (MODIFY existing)  
**Time:** 2 hours

**REPLACE entire file:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchEvent } from '../services/graphql';
import { queryKeys } from '../lib/queryClient';

export function useEvent(eventId: string | null) {
  return useQuery({
    queryKey: queryKeys.event(eventId || ''),
    queryFn: () => fetchEvent(eventId!),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000,
  });
}
```

**APPLY SAME PATTERN to:**
- `web/src/hooks/useTracklist.ts`
- `web/src/hooks/useQueue.ts`

---

### **P1-6: Install Sentry** ⚡
**Files:** `web/package.json`, `web/src/lib/sentry.ts` (NEW), `web/src/main.tsx` (MODIFY)  
**Time:** 1 hour

```bash
cd web
npm install @sentry/react
```

**CREATE:** `web/src/lib/sentry.ts`
```typescript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      // Filter out known non-critical errors
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        if ((error as Error).message.includes('Network request failed')) {
          return null;
        }
      }
      return event;
    },
  });
}

export { Sentry };
```

**MODIFY:** `web/src/main.tsx`
```typescript
import { initSentry } from './lib/sentry';

// Initialize Sentry before React
if (import.meta.env.PROD) {
  initSentry();
}

ReactDOM.createRoot(document.getElementById('root')!).render(/* ... */);
```

---

### **P1-7: Add Payment Error Tracking** ⚡
**File:** `web/src/services/payment.ts` (MODIFY existing)  
**Time:** 1 hour

**ADD at top:**
```typescript
import { Sentry } from '../lib/sentry';
```

**MODIFY each function:**
```typescript
export async function processYocoPayment(intent: PaymentIntent): Promise<YocoPaymentResult> {
  try {
    // ... existing code ...
  } catch (error: any) {
    console.error('Payment processing failed:', error);
    
    // Track to Sentry
    Sentry.captureException(error, {
      tags: { 
        category: 'payment',
        payment_stage: 'processing'
      },
      extra: { 
        intentId: intent.intentId,
        amount: intent.amount,
        currency: intent.currency
      },
      level: 'error',
    });
    
    throw new Error(error.message || 'Payment failed. Please try again.');
  }
}

// Apply same pattern to:
// - createPaymentIntent
// - verifyPayment
// - processRefund
```

---

## ⚡ OPTIMIZATION (Day 8-10)

### **OPT-1: Optimize loadPerformerSets** ⚡
**Files:** `web/src/pages/DJPortalOrbital.tsx`, `web/src/services/graphql.ts`  
**Time:** 2 hours

**MODIFY:** `web/src/services/graphql.ts` (line 74)
```typescript
export const listPerformerSets = /* GraphQL */ `
  query ListPerformerSets($performerId: ID!, $limit: Int) {
    listPerformerSets(performerId: $performerId, limit: $limit) {
      setId
      eventId
      performerId
      setStartTime
      setEndTime
      status
      isAcceptingRequests
      # ADD event details here instead of separate query
      event {
        eventId
        venueName
        venueLocation {
          address
          city
        }
      }
      createdAt
    }
  }
`;
```

**MODIFY:** `web/src/pages/DJPortalOrbital.tsx` (line 145)
```typescript
// REPLACE entire loadPerformerSets function:
const loadPerformerSets = async () => {
  if (!user?.userId) return;
  
  try {
    const { generateClient } = await import('aws-amplify/api');
    const client = generateClient({ authMode: 'userPool' });
    
    const response: any = await client.graphql({
      query: listPerformerSets,
      variables: { performerId: user.userId }
    });
    
    const performerSets = response.data.listPerformerSets || [];
    
    // No need for separate getEvent calls!
    setMySets(performerSets);
    
    // Auto-select logic...
  } catch (error) {
    console.error('Failed to load performer sets:', error);
  }
};
```

---

### **OPT-2: Reduce Track Sync Calls** ⚡
**File:** `web/src/pages/DJPortalOrbital.tsx`  
**Time:** 2 hours

**MODIFY:** `syncTracksToBackend` (line 352)
```typescript
const syncTracksToBackend = async (updatedTracks: Track[]) => {
  if (!user?.userId || !currentEventId) return;
  
  try {
    console.log('💾 Syncing tracks to backend...');
    
    // Don't reload - just confirm sync
    const songs = updatedTracks.map(t => ({
      title: t.title,
      artist: t.artist,
      genre: t.genre,
      basePrice: t.basePrice,
      isEnabled: t.isEnabled,
      albumArt: t.albumArt,
      duration: t.duration
    }));
    
    await submitUploadTracklist(user.userId, songs);
    
    // SUCCESS - no need to reload!
    addNotification({
      type: 'info',
      title: '✅ Synced',
      message: `${songs.length} tracks synced`,
    });
    
    // REMOVED: setTracksLoaded(false) and reloadTracklist()
    
  } catch (error) {
    console.error('❌ Failed to sync tracks:', error);
    throw error; // Let caller handle rollback
  }
};
```

---

### **OPT-3: Simplify Notifications** ⚡
**File:** `web/src/pages/DJPortalOrbital.tsx`  
**Time:** 1 hour

**REPLACE useEffect (line 107):**
```typescript
// Watch live subscription updates and notify on new requests
useEffect(() => {
  const newCount = liveQueueData?.orderedRequests?.length || 0;
  const oldCount = lastQueueCountRef.current;
  
  // SIMPLE RULES:
  // 1. New request arrived
  if (newCount > oldCount) {
    playNotificationSound();
    addNotification({
      type: 'queue_update',
      title: '🎵 New Request',
      message: `Queue now has ${newCount} request${newCount === 1 ? '' : 's'}`,
    });
  }
  
  // 2. Position 1 reached
  if (newCount > 0 && liveQueueData?.orderedRequests?.[0]) {
    const topRequest = liveQueueData.orderedRequests[0];
    if (topRequest.queuePosition === 1 && topRequest.requestId !== lastTopRequestRef.current) {
      playNotificationSound();
      addNotification({
        type: 'queue_update',
        title: '🔥 Next Up!',
        message: `${topRequest.songTitle} is ready to play`,
      });
      lastTopRequestRef.current = topRequest.requestId;
    }
  }
  
  lastQueueCountRef.current = newCount;
}, [liveQueueData]);

// REMOVED: canNotify function and complex throttling
```

---

## 📝 IMPLEMENTATION ORDER

### **Day 1-2: P0 Payment Security**
1. ✅ P0-1: Enhance processPayment (4h)
2. ✅ P0-2: Add rollback (3h)
3. ✅ P0-6: Update schema (2h)
4. ✅ P0-7: Update frontend (3h)
**Total:** 12 hours

### **Day 3-4: P0 Business Logic**
5. ✅ P0-8: Add DynamoDB indexes (2h)
6. ✅ P0-3: Server validations (4h)
7. ✅ P0-9: Reconciliation cron (3h)
**Total:** 9 hours

### **Day 5: P0 WebSocket & UI**
8. ✅ P0-4: Enhanced reconnection (3h)
9. ✅ P0-5: Optimistic rollback (2h)
10. ✅ P0-10: Connection UI (2h)
**Total:** 7 hours

### **Day 6-7: P1 Infrastructure**
11. ✅ P1-4: Install React Query (1h)
12. ✅ P1-5: Migrate queries (2h)
13. ✅ P1-6: Install Sentry (1h)
14. ✅ P1-7: Payment tracking (1h)
15. ✅ P1-1: Search UI (3h)
**Total:** 8 hours

### **Day 8-10: Optimization**
16. ✅ OPT-1: Query optimization (2h)
17. ✅ OPT-2: Sync optimization (2h)
18. ✅ OPT-3: Notification simplification (1h)
19. ✅ P1-2: Analytics service (2h)
20. ✅ P1-3: Analytics dashboard (3h)
**Total:** 10 hours

---

## 🚀 QUICK START COMMANDS

### **Setup**
```bash
# Install dependencies
cd web
npm install @tanstack/react-query @sentry/react

# Set environment variables
echo "VITE_SENTRY_DSN=your_dsn_here" >> .env
```

### **Testing**
```bash
# Test Lambda locally
cd aws/lambda/processPayment
node test-verification.js

# Test frontend
cd web
npm test -- payment.test.ts
```

### **Deployment**
```bash
# Deploy Lambda
cd aws/lambda/processPayment
zip -r function.zip .
aws lambda update-function-code \
  --function-name beatmatchme-processPayment \
  --zip-file fileb://function.zip

# Deploy frontend
cd web
npm run build
aws s3 sync dist/ s3://your-bucket/
```

---

## ✅ DEFINITION OF DONE

Each task is complete when:
- [ ] Code modified/created as specified
- [ ] Local testing passes
- [ ] No new TypeScript errors
- [ ] Deployed to staging
- [ ] Manually tested in staging
- [ ] Todo marked as complete

---

**Ready to start? Begin with P0-1! 🚀**
