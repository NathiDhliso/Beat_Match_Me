# 🚨 CRITICAL FIX: Server-Side Payment Verification

**Priority:** P0 - BLOCKING PRODUCTION  
**Risk Level:** 🔴 CRITICAL - Direct revenue loss potential  
**Estimated Time:** 2-3 days  
**Status:** ⚠️ NOT IMPLEMENTED

---

## Problem Statement

Currently, payment verification happens client-side AFTER request creation, creating a vulnerability where users could:
1. Bypass payment verification entirely
2. Receive services even if payment fails
3. Cause revenue loss through failed/fraudulent payments

---

## Current Vulnerable Flow

```typescript
// web/src/pages/UserPortalInnovative.tsx (Lines 1013-1060)
const handleConfirmRequest = async () => {
  // 1. Create payment intent
  const paymentIntent = await createPaymentIntent({
    amount: selectedSong.basePrice,
    songId: selectedSong.id,
    eventId: currentEventId
  });
  
  // 2. Process payment with Yoco (client-side)
  const payment = await processYocoPayment(paymentIntent);
  
  if (payment.status !== 'succeeded') {
    throw new Error('Payment failed');
  }
  
  // 3. Verify payment (client-side only!) ⚠️ VULNERABLE
  const verified = await verifyPayment(payment.transactionId);
  if (!verified) {
    throw new Error('Payment verification failed');
  }
  
  // 4. Submit request (happens regardless of verification)
  const request = await submitRequest({
    eventId: currentEventId,
    setId: currentSetId,
    userId: user.userId,
    songId: selectedSong.id,
    songTitle: selectedSong.title,
    artistName: selectedSong.artist,
    paymentTransactionId: payment.transactionId, // ❌ Just a string, no server verification!
    requestType: requestData.type,
    price: selectedSong.basePrice
  });
  
  // User now has active request, even if payment actually failed
};
```

**Vulnerability:** A malicious user could:
- Modify `verifyPayment()` to always return `true`
- Pass a fake `paymentTransactionId`
- Use browser dev tools to skip payment entirely

---

## Secure Implementation

### Step 1: Create Payment Verification Lambda

**File:** `aws/lambda/verifyYocoPayment/index.js` (NEW)

```javascript
/**
 * Verify Yoco Payment Lambda
 * Calls Yoco API to verify payment status before allowing request creation
 */

const https = require('https');

/**
 * Call Yoco API to verify a charge
 */
async function verifyYocoCharge(apiKey, chargeId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'online.yoco.com',
      path: `/v1/charges/${chargeId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Yoco API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

exports.handler = async (event) => {
  console.log('Verifying payment:', JSON.stringify(event, null, 2));

  try {
    const { chargeId, expectedAmount, userId } = event.arguments.input;

    // Get Yoco API key from environment
    const apiKey = process.env.YOCO_SECRET_KEY;
    if (!apiKey) {
      throw new Error('Yoco API key not configured');
    }

    // Verify charge with Yoco
    const charge = await verifyYocoCharge(apiKey, chargeId);
    
    console.log('Yoco charge details:', charge);

    // Validation checks
    const validations = {
      isSuccessful: charge.status === 'successful',
      amountMatches: charge.amount === Math.round(expectedAmount * 100), // Yoco uses cents
      notRefunded: !charge.refunded,
      currencyIsZAR: charge.currency === 'ZAR',
    };

    const isValid = Object.values(validations).every(v => v === true);

    if (!isValid) {
      console.error('Payment verification failed:', validations);
      return {
        verified: false,
        reason: 'Payment verification failed',
        details: validations
      };
    }

    // Payment is valid
    return {
      verified: true,
      chargeId: charge.id,
      amount: charge.amount / 100, // Convert back to rands
      currency: charge.currency,
      createdAt: charge.created,
      metadata: charge.metadata
    };

  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      verified: false,
      reason: error.message || 'Payment verification failed',
      error: error.toString()
    };
  }
};
```

### Step 2: Update GraphQL Schema

**File:** `amplify/data/schema.graphql`

```graphql
type Mutation {
  # NEW: Secure request submission with payment verification
  submitRequestWithPayment(input: SubmitRequestWithPaymentInput!): SubmitRequestResult
    @function(name: "submitRequestWithPayment")
  
  # Keep old mutation for backwards compatibility (mark as deprecated)
  submitRequest(input: SubmitRequestInput!): Request
    @deprecated(reason: "Use submitRequestWithPayment for secure payment flow")
}

input SubmitRequestWithPaymentInput {
  eventId: ID!
  setId: ID!
  userId: ID!
  songId: ID!
  songTitle: String!
  artistName: String!
  albumArt: String
  requestType: RequestType!
  price: Float!
  
  # Payment details
  yocoChargeId: String! # Yoco charge ID from client
  idempotencyKey: String! # Prevent duplicate charges
}

type SubmitRequestResult {
  success: Boolean!
  request: Request
  error: RequestError
}

type RequestError {
  code: RequestErrorCode!
  message: String!
  retryable: Boolean!
  retryAfter: Int # Seconds to wait before retry
}

enum RequestErrorCode {
  PAYMENT_VERIFICATION_FAILED
  PAYMENT_AMOUNT_MISMATCH
  PAYMENT_ALREADY_USED
  DUPLICATE_REQUEST
  CAPACITY_EXCEEDED
  RATE_LIMITED
  INTERNAL_ERROR
}
```

### Step 3: Create Secure Request Submission Lambda

**File:** `aws/lambda/submitRequestWithPayment/index.js` (NEW)

```javascript
/**
 * Submit Request With Payment Verification Lambda
 * Atomic operation: verify payment → create request
 */

const AWS = require('aws-sdk');
const https = require('https');

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Verify payment with Yoco API
async function verifyYocoPayment(apiKey, chargeId) {
  // Same implementation as verifyYocoPayment Lambda
  // (Code omitted for brevity - copy from Step 1)
}

// Check if charge has already been used
async function isChargeAlreadyUsed(chargeId) {
  const result = await dynamodb.query({
    TableName: 'Requests',
    IndexName: 'paymentTransactionId-index',
    KeyConditionExpression: 'paymentTransactionId = :chargeId',
    ExpressionAttributeValues: {
      ':chargeId': chargeId
    }
  }).promise();
  
  return result.Items && result.Items.length > 0;
}

// Check for duplicate request (same user, event, song)
async function checkDuplicateRequest(userId, eventId, songId) {
  const result = await dynamodb.query({
    TableName: 'Requests',
    IndexName: 'userId-eventId-index',
    KeyConditionExpression: 'userId = :userId AND eventId = :eventId',
    FilterExpression: 'songId = :songId AND #status IN (:pending, :accepted)',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':userId': userId,
      ':eventId': eventId,
      ':songId': songId,
      ':pending': 'PENDING',
      ':accepted': 'ACCEPTED'
    }
  }).promise();
  
  return result.Items && result.Items.length > 0;
}

// Check capacity limit
async function checkCapacity(setId) {
  const now = Date.now();
  const hourStart = Math.floor(now / 3600000) * 3600000;
  
  // Get set configuration
  const setResult = await dynamodb.get({
    TableName: 'DJSets',
    Key: { setId }
  }).promise();
  
  if (!setResult.Item) {
    throw new Error('DJ Set not found');
  }
  
  const requestCapPerHour = setResult.Item.settings?.requestCapPerHour || 20;
  
  // Count requests in current hour
  const requestsResult = await dynamodb.query({
    TableName: 'Requests',
    IndexName: 'setId-submittedAt-index',
    KeyConditionExpression: 'setId = :setId AND submittedAt >= :hourStart',
    ExpressionAttributeValues: {
      ':setId': setId,
      ':hourStart': hourStart
    }
  }).promise();
  
  const currentCount = requestsResult.Items?.length || 0;
  
  return {
    available: currentCount < requestCapPerHour,
    current: currentCount,
    limit: requestCapPerHour,
    retryAfter: 3600 - Math.floor((now - hourStart) / 1000) // Seconds until next hour
  };
}

exports.handler = async (event) => {
  console.log('Submit request with payment:', JSON.stringify(event, null, 2));

  try {
    const {
      eventId,
      setId,
      userId,
      songId,
      songTitle,
      artistName,
      albumArt,
      requestType,
      price,
      yocoChargeId,
      idempotencyKey
    } = event.arguments.input;

    const apiKey = process.env.YOCO_SECRET_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Payment system not configured',
          retryable: false
        }
      };
    }

    // 1. Check if charge already used (prevent replay attacks)
    const chargeUsed = await isChargeAlreadyUsed(yocoChargeId);
    if (chargeUsed) {
      return {
        success: false,
        error: {
          code: 'PAYMENT_ALREADY_USED',
          message: 'This payment has already been used for another request',
          retryable: false
        }
      };
    }

    // 2. Verify payment with Yoco
    const charge = await verifyYocoPayment(apiKey, yocoChargeId);
    
    if (charge.status !== 'successful') {
      return {
        success: false,
        error: {
          code: 'PAYMENT_VERIFICATION_FAILED',
          message: `Payment status: ${charge.status}`,
          retryable: false
        }
      };
    }

    // 3. Verify amount matches
    const expectedAmountCents = Math.round(price * 100);
    if (charge.amount !== expectedAmountCents) {
      console.error(`Amount mismatch: expected ${expectedAmountCents}, got ${charge.amount}`);
      return {
        success: false,
        error: {
          code: 'PAYMENT_AMOUNT_MISMATCH',
          message: 'Payment amount does not match request price',
          retryable: false
        }
      };
    }

    // 4. Check for duplicate request
    const isDuplicate = await checkDuplicateRequest(userId, eventId, songId);
    if (isDuplicate) {
      // Refund the payment since it's a duplicate
      // (Refund logic would go here in production)
      return {
        success: false,
        error: {
          code: 'DUPLICATE_REQUEST',
          message: 'You already have an active request for this song',
          retryable: false
        }
      };
    }

    // 5. Check capacity
    const capacity = await checkCapacity(setId);
    if (!capacity.available) {
      // Refund the payment since capacity is full
      // (Refund logic would go here in production)
      return {
        success: false,
        error: {
          code: 'CAPACITY_EXCEEDED',
          message: 'Request capacity reached for this hour',
          retryable: true,
          retryAfter: capacity.retryAfter
        }
      };
    }

    // 6. Create request atomically
    const now = Date.now();
    const requestId = `req_${now}_${Math.random().toString(36).substring(7)}`;
    
    const request = {
      requestId,
      eventId,
      setId,
      userId,
      songId,
      songTitle,
      artistName,
      albumArt,
      requestType,
      price,
      status: 'PENDING',
      paymentTransactionId: yocoChargeId,
      paymentVerified: true,
      paymentAmount: charge.amount / 100,
      paymentCurrency: charge.currency,
      idempotencyKey,
      submittedAt: now,
      createdAt: now,
      updatedAt: now
    };

    await dynamodb.put({
      TableName: 'Requests',
      Item: request,
      ConditionExpression: 'attribute_not_exists(requestId)' // Prevent duplicates
    }).promise();

    console.log('✅ Request created successfully:', requestId);

    return {
      success: true,
      request
    };

  } catch (error) {
    console.error('Failed to submit request:', error);
    
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process request',
        retryable: true
      }
    };
  }
};
```

### Step 4: Update Frontend to Use Secure Flow

**File:** `web/src/pages/UserPortalInnovative.tsx`

```typescript
// Replace lines 1013-1060 with secure implementation
const handleConfirmRequest = async (requestData: RequestData) => {
  setIsProcessing(true);
  setPaymentError(null);
  
  try {
    // 1. Generate idempotency key (prevent double charges)
    const idempotencyKey = `${user?.userId}-${selectedSong.id}-${Date.now()}`;
    
    // 2. Create Yoco payment intent
    console.log('Creating payment intent...');
    const paymentIntent = await createPaymentIntent({
      amount: selectedSong.basePrice,
      songId: selectedSong.id,
      eventId: currentEventId!,
      userId: user?.userId,
    });
    
    // 3. Process payment with Yoco (client-side popup)
    console.log('Processing payment...');
    const payment = await processYocoPayment(paymentIntent);
    
    if (payment.status !== 'succeeded') {
      throw new Error('Payment failed');
    }
    
    // 4. Submit request with payment verification (server-side)
    console.log('Submitting request with payment verification...');
    
    const result = await submitRequestWithPayment({
      eventId: currentEventId!,
      setId: currentSetId!,
      userId: user!.userId,
      songId: selectedSong.id,
      songTitle: selectedSong.title,
      artistName: selectedSong.artist,
      albumArt: selectedSong.albumArt,
      requestType: requestData.type,
      price: selectedSong.basePrice,
      yocoChargeId: payment.transactionId, // Send to backend for verification
      idempotencyKey
    });
    
    // 5. Handle result
    if (!result.success) {
      // Payment was valid but request failed (e.g., capacity full)
      setPaymentError(result.error.message);
      
      if (result.error.code === 'CAPACITY_EXCEEDED') {
        // Show retry option
        setShowRetryOption(true);
      }
      
      // Note: Backend should handle refund automatically
      return;
    }
    
    // 6. Success!
    console.log('✅ Request submitted successfully:', result.request);
    
    // Track my request
    setMyActiveRequests(prev => [...prev, result.request]);
    
    // Update view
    setViewState('waiting');
    setSelectedSong(null);
    
    // Show success notification
    addNotification({
      type: 'success',
      title: '🎵 Request Submitted!',
      message: `${selectedSong.title} by ${selectedSong.artist}`,
    });
    
  } catch (error: any) {
    console.error('❌ Request submission failed:', error);
    setPaymentError(error.message || 'Failed to submit request');
    
    // Show error with retry option
    setShowErrorModal(true);
    
  } finally {
    setIsProcessing(false);
  }
};
```

### Step 5: Create GraphQL Mutation Service

**File:** `web/src/services/graphql.ts`

```typescript
// Add new secure mutation
export async function submitRequestWithPayment(input: {
  eventId: string;
  setId: string;
  userId: string;
  songId: string;
  songTitle: string;
  artistName: string;
  albumArt?: string;
  requestType: 'standard' | 'spotlight';
  price: number;
  yocoChargeId: string;
  idempotencyKey: string;
}): Promise<{
  success: boolean;
  request?: any;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
    retryAfter?: number;
  };
}> {
  const client = generateClient({
    authMode: 'userPool'
  });

  const mutation = `
    mutation SubmitRequestWithPayment($input: SubmitRequestWithPaymentInput!) {
      submitRequestWithPayment(input: $input) {
        success
        request {
          requestId
          songTitle
          artistName
          status
          queuePosition
          submittedAt
        }
        error {
          code
          message
          retryable
          retryAfter
        }
      }
    }
  `;

  try {
    const response: any = await client.graphql({
      query: mutation,
      variables: { input }
    });

    return response.data.submitRequestWithPayment;
  } catch (error: any) {
    console.error('GraphQL mutation failed:', error);
    throw error;
  }
}
```

---

## Testing Plan

### Unit Tests

```typescript
// tests/payment-verification.test.ts
describe('Payment Verification', () => {
  test('should reject invalid charge ID', async () => {
    const result = await submitRequestWithPayment({
      ...validInput,
      yocoChargeId: 'invalid_charge_id'
    });
    
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('PAYMENT_VERIFICATION_FAILED');
  });
  
  test('should reject amount mismatch', async () => {
    // Mock Yoco to return different amount
    const result = await submitRequestWithPayment({
      ...validInput,
      price: 50 // But Yoco shows 20
    });
    
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('PAYMENT_AMOUNT_MISMATCH');
  });
  
  test('should prevent charge reuse', async () => {
    // First request succeeds
    const first = await submitRequestWithPayment(validInput);
    expect(first.success).toBe(true);
    
    // Second request with same charge fails
    const second = await submitRequestWithPayment(validInput);
    expect(second.success).toBe(false);
    expect(second.error.code).toBe('PAYMENT_ALREADY_USED');
  });
  
  test('should refund on capacity exceeded', async () => {
    // Fill capacity
    await fillSetCapacity(setId);
    
    const result = await submitRequestWithPayment(validInput);
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('CAPACITY_EXCEEDED');
    
    // Verify refund was initiated
    const refund = await getRefund(validInput.yocoChargeId);
    expect(refund).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// tests/integration/payment-flow.test.ts
describe('End-to-End Payment Flow', () => {
  test('successful payment and request creation', async () => {
    // 1. Create payment intent
    const intent = await createPaymentIntent({ amount: 20 });
    
    // 2. Process payment with Yoco (using test API)
    const payment = await processYocoPayment(intent);
    expect(payment.status).toBe('succeeded');
    
    // 3. Submit request with verification
    const result = await submitRequestWithPayment({
      yocoChargeId: payment.transactionId,
      // ...other fields
    });
    
    expect(result.success).toBe(true);
    expect(result.request.status).toBe('PENDING');
  });
});
```

---

## Deployment Checklist

- [ ] Create `verifyYocoPayment` Lambda function
- [ ] Create `submitRequestWithPayment` Lambda function
- [ ] Deploy updated GraphQL schema
- [ ] Add DynamoDB indexes (paymentTransactionId, userId-eventId)
- [ ] Set Yoco API key in Lambda environment variables
- [ ] Update frontend to use new mutation
- [ ] Run integration tests in staging
- [ ] Monitor error rates in CloudWatch
- [ ] Gradual rollout: 10% → 50% → 100% traffic
- [ ] Monitor for 24 hours before full rollout

---

## Rollback Plan

If issues occur:

1. **Immediate:** Route all traffic back to old flow
2. **Quick fix:** Deploy hotfix to Lambda
3. **Communication:** Notify users of temporary payment issues
4. **Investigation:** Analyze CloudWatch logs and Sentry errors
5. **Resolution:** Fix root cause and redeploy

---

## Success Metrics

- ✅ 0% of requests created without payment verification
- ✅ <0.1% payment verification failures
- ✅ 100% of failed payments automatically refunded
- ✅ <500ms latency added to request submission
- ✅ 99.9% payment success rate maintained

---

**Priority:** P0 - START IMMEDIATELY  
**Dependencies:** Yoco API access, DynamoDB tables, Lambda execution  
**Risk:** HIGH - Revenue protection
