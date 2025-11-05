 CRITICAL ISSUES (Must Fix Before Launch)
1. Payment Integration is Mock/Incomplete
Location: UserPortalInnovative.tsx - Request Confirmation
typescriptconst handleConfirmRequest = async () => {
  // TODO: Submit request to backend
  try {
    // await submitRequest(currentEventId, selectedSong.id);
    setShowLockedIn(true); // ❌ No actual payment!
Problem:

No actual payment processing
No Yoco integration connected
Users can "request" without paying
No payment verification before queue entry

Real-Life Impact:

💰 Zero revenue - DJs work for free
🎭 Queue spam - Unlimited free requests
⚖️ Legal liability - Promising paid service but not collecting

Fix Required:
typescriptconst handleConfirmRequest = async () => {
  setIsProcessing(true);
  
  try {
    // 1. Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount: selectedSong.basePrice,
      songId: selectedSong.id,
      eventId: currentEventId,
    });
    
    // 2. Process payment via Yoco
    const payment = await processYocoPayment(paymentIntent);
    
    if (payment.status !== 'succeeded') {
      throw new Error('Payment failed');
    }
    
    // 3. Submit request with payment proof
    const request = await submitRequest({
      eventId: currentEventId,
      songId: selectedSong.id,
      paymentTransactionId: payment.transactionId,
      amount: selectedSong.basePrice,
    });
    
    setShowLockedIn(true);
  } catch (error) {
    toast.error('Payment failed. Please try again.');
  } finally {
    setIsProcessing(false);
  }
};
Estimated Fix Time: 2-3 days (Yoco SDK integration + testing)

2. No Request Validation/Deduplication
Location: UserPortalInnovative.tsx - Multiple request prevention
typescript// ❌ User can spam requests for same song
const handleSelectSong = (song: Song) => {
  setSelectedSong(song);
  setViewState('requesting');
};
Problem:

Users can request same song 10 times
No check for "already in queue"
No rate limiting
No duplicate prevention

Real-Life Impact:

💸 Users charged multiple times accidentally
😤 DJs get duplicate requests
🗑️ Queue becomes cluttered

Fix Required:
typescriptconst handleSelectSong = async (song: Song) => {
  // Check if user already has this song in queue
  const existingRequest = queue?.orderedRequests?.find(
    (req: any) => 
      req.songTitle === song.title && 
      req.artistName === song.artist &&
      req.userId === user?.userId
  );
  
  if (existingRequest) {
    toast.warning('You already requested this song!');
    return;
  }
  
  // Check user's request limit (e.g., max 3 active requests)
  const userActiveRequests = queue?.orderedRequests?.filter(
    (req: any) => req.userId === user?.userId && req.status === 'PENDING'
  ).length || 0;
  
  if (userActiveRequests >= 3) {
    toast.warning('Maximum 3 active requests allowed');
    return;
  }
  
  setSelectedSong(song);
  setViewState('requesting');
};

3. Refund System Not Implemented
Location: VetoConfirmation.tsx - Refund promise is a lie
typescript// ✅ Veto mutation works
await submitVeto(selectedRequest.requestId, reason);

// ❌ But where's the refund?
// No refund processing logic anywhere!
Problem:

Fair-Play Promise is false advertising
Veto works but no money returns
RefundConfirmation modal shows but no actual refund API call

Real-Life Impact:

⚖️ Legal liability - Breach of promise
😡 Angry customers - "Where's my refund?!"
💳 Chargeback nightmare - Manual refund requests

Fix Required:
typescript// In graphql.ts - Add refund mutation
export const processRefund = /* GraphQL */ `
  mutation ProcessRefund($requestId: ID!, $reason: String!) {
    processRefund(requestId: $requestId, reason: $reason) {
      refundId
      amount
      status
      transactionId
      estimatedDays
    }
  }
`;

// In VetoConfirmation.tsx
const handleVetoConfirm = async (reason?: string) => {
  setIsProcessing(true);
  
  try {
    // 1. Veto the request
    await submitVeto(selectedRequest.requestId, reason);
    
    // 2. Process refund automatically
    const refund = await submitRefund({
      requestId: selectedRequest.requestId,
      amount: selectedRequest.price,
      reason: reason || 'DJ vetoed request',
    });
    
    // 3. Show refund confirmation to user
    notifyUser(selectedRequest.userId, {
      type: 'refund_processed',
      refundAmount: refund.amount,
      transactionId: refund.transactionId,
    });
    
    setShowVetoModal(false);
  } catch (error) {
    console.error('Refund failed:', error);
    alert('Veto succeeded but refund failed. Contact support.');
  } finally {
    setIsProcessing(false);
  }
};
Backend Required:
python# Lambda function: ProcessRefund
def process_refund(request_id, amount):
    # 1. Get original payment transaction
    payment = get_payment_by_request_id(request_id)
    
    # 2. Process refund via Yoco
    refund = yoco_client.refund({
        'transaction_id': payment.transaction_id,
        'amount': amount,
    })
    
    # 3. Update DynamoDB
    update_request_status(request_id, 'REFUNDED')
    
    # 4. Send notification
    send_refund_notification(payment.user_id, refund)
    
    return refund
Estimated Fix Time: 3-4 days (Yoco refund API + Lambda + testing)

4. No Queue Position Persistence
Location: UserPortalInnovative.tsx - Queue state
typescriptconst [myRequestPosition, setMyRequestPosition] = useState<number | null>(null);
// ❌ Lost on page refresh!
Problem:

User refreshes page → loses queue position
No persistence between sessions
Can't track request after app closes

Real-Life Impact:

😤 User frustration: "Where's my song?"
📞 Support burden: "What position am I?"
💔 Loss of trust in system

Fix Required:
typescript// Option 1: Fetch from backend on mount
useEffect(() => {
  const loadMyRequests = async () => {
    if (!user?.userId || !currentEventId) return;
    
    try {
      const { generateClient } = await import('aws-amplify/api');
      const client = generateClient();
      
      const response = await client.graphql({
        query: `
          query GetUserActiveRequests($userId: ID!, $eventId: ID!) {
            getUserActiveRequests(userId: $userId, eventId: $eventId) {
              requestId
              songTitle
              artistName
              queuePosition
              status
            }
          }
        `,
        variables: { userId: user.userId, eventId: currentEventId }
      });
      
      const activeRequest = response.data.getUserActiveRequests[0];
      if (activeRequest) {
        setMyRequestPosition(activeRequest.queuePosition);
        setSelectedSong({
          id: activeRequest.songId,
          title: activeRequest.songTitle,
          artist: activeRequest.artistName,
        });
        setViewState('waiting');
      }
    } catch (error) {
      console.error('Failed to load active requests:', error);
    }
  };
  
  loadMyRequests();
}, [user?.userId, currentEventId]);

5. Request Cap Not Enforced Client-Side
Location: UserPortalInnovative.tsx - No cap checking
typescriptconst handleConfirmRequest = async () => {
  // ❌ No check if request cap reached!
  // ❌ No check if "Sold Out" mode active!
  setShowLockedIn(true);
Problem:

Users can submit when DJ is at capacity
Payment processed but request rejected
Refund required → bad UX

Real-Life Impact:

💸 Payment → Immediate refund cycle (processing fees!)
😤 User confusion: "Why did it let me pay?"
💰 Lost money on payment processor fees

Fix Required:
typescriptconst handleSelectSong = async (song: Song) => {
  // Check DJ set settings before allowing request
  try {
    const djSet = await fetchDJSet(currentSetId);
    
    // Check if sold out
    if (djSet.settings.isSoldOut) {
      toast.error('Request queue is currently full. Try again later!');
      return;
    }
    
    // Check request cap
    const requestsThisHour = queue?.orderedRequests?.filter((req: any) => {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      return req.timestamp > oneHourAgo;
    }).length || 0;
    
    if (requestsThisHour >= djSet.settings.requestCapPerHour) {
      toast.error('Hourly request cap reached. Try again in a few minutes!');
      return;
    }
    
    setSelectedSong(song);
    setViewState('requesting');
  } catch (error) {
    toast.error('Failed to check request availability');
  }
};

6. No Error Recovery for Failed Payments
Location: Payment flow - No retry logic
typescript// ❌ Payment fails → User stuck in loading state
const handleConfirmRequest = async () => {
  setIsProcessing(true);
  // ... payment fails ...
  // ❌ No way to retry without restarting flow
};
Problem:

Network timeout → payment unknown state
User charged but request not submitted
No retry mechanism

Real-Life Impact:

💳 Double charges (user retries manually)
😤 Support tickets: "I paid but song not in queue"
🐛 Database inconsistencies

Fix Required:
typescriptconst handleConfirmRequest = async (retryCount = 0) => {
  const MAX_RETRIES = 3;
  setIsProcessing(true);
  
  try {
    // Idempotent payment with unique key
    const idempotencyKey = `${user?.userId}-${selectedSong.id}-${Date.now()}`;
    
    const payment = await processPayment({
      amount: selectedSong.basePrice,
      idempotencyKey,
    });
    
    // Verify payment before submitting request
    const verified = await verifyPayment(payment.transactionId);
    if (!verified) {
      throw new Error('Payment verification failed');
    }
    
    await submitRequest({
      paymentTransactionId: payment.transactionId,
      // ... other data
    });
    
    setShowLockedIn(true);
  } catch (error) {
    if (retryCount < MAX_RETRIES && isRetryableError(error)) {
      console.log(`Retrying payment (${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return handleConfirmRequest(retryCount + 1);
    }
    
    // Show error with manual retry option
    setShowPaymentError(true);
    setPaymentErrorMessage(error.message);
  } finally {
    setIsProcessing(false);
  }
};

7. DJ Set Lifecycle Not Managed
Location: DJPortalOrbital.tsx - No automatic set end
typescriptconst handleEndSet = () => {
  if (confirm('Are you sure you want to end this DJ set?')) {
    setCurrentSetId(null); // ❌ Just clears local state!
    setCurrentEventId(null);
  }
};
Problem:

No backend update when DJ ends set
Pending requests not refunded
Users stuck waiting forever

Real-Life Impact:

😤 Users waiting for dead set
💸 Money locked in pending requests
📞 Support: "My song never played!"

Fix Required:
typescriptconst handleEndSet = async () => {
  if (!confirm('End set and refund all pending requests?')) return;
  
  setIsProcessing(true);
  
  try {
    // 1. Update set status
    await submitUpdateSetStatus(currentSetId, 'COMPLETED');
    
    // 2. Get all pending requests
    const pendingRequests = queue?.orderedRequests?.filter(
      (req: any) => req.status === 'PENDING' || req.status === 'ACCEPTED'
    ) || [];
    
    // 3. Process refunds for all pending requests
    const refundPromises = pendingRequests.map((req: any) => 
      submitRefund({
        requestId: req.requestId,
        reason: 'DJ set ended',
        amount: req.price,
      })
    );
    
    await Promise.all(refundPromises);
    
    // 4. Notify all affected users
    pendingRequests.forEach((req: any) => {
      notifyUser(req.userId, {
        type: 'dj_set_ended',
        refundAmount: req.price,
      });
    });
    
    toast.success(`Set ended. ${pendingRequests.length} requests refunded.`);
    
    setCurrentSetId(null);
    setCurrentEventId(null);
  } catch (error) {
    console.error('Failed to end set cleanly:', error);
    toast.error('Failed to end set. Contact support.');
  } finally {
    setIsProcessing(false);
  }
};

⚠️ HIGH PRIORITY ISSUES (Fix Within 2 Weeks)
8. No Offline Mode Detection
Problem: App breaks completely when internet drops
Fix:
typescript// Add to App.tsx
useEffect(() => {
  const handleOffline = () => {
    toast.warning('You\'re offline. Some features may not work.');
    setIsOffline(true);
  };
  
  const handleOnline = () => {
    toast.success('Back online!');
    setIsOffline(false);
    // Sync any pending actions
    syncPendingActions();
  };
  
  window.addEventListener('offline', handleOffline);
  window.addEventListener('online', handleOnline);
  
  return () => {
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('online', handleOnline);
  };
}, []);

9. No Rate Limiting
Problem: API abuse possible (spam requests, DDoS)
Fix: Add rate limiting to all mutations
typescript// Simple client-side rate limiter
const requestLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 60000, // 1 minute
});

const handleSubmit = async () => {
  if (!requestLimiter.tryConsume()) {
    toast.error('Too many requests. Please wait a minute.');
    return;
  }
  
  // ... proceed with request
};

10. No Analytics/Monitoring
Problem: No way to track errors, usage, or performance in production
Fix: Add basic monitoring
typescript// Add to services/monitoring.ts
export const trackEvent = (event: string, data?: any) => {
  // Send to analytics service
  console.log('[Analytics]', event, data);
  
  // Optional: Send to CloudWatch, Sentry, etc.
  if (window.gtag) {
    window.gtag('event', event, data);
  }
};

// Usage
trackEvent('request_submitted', {
  songId: song.id,
  amount: song.basePrice,
});