/**
 * Payment Service - Yoco Integration
 * Handles payment processing, verification, and refunds
 */

import { generateClient } from 'aws-amplify/api';

const client = generateClient();

interface PaymentIntentData {
  amount: number;
  songId: string;
  eventId: string;
  userId?: string;
  currency?: string;
}

interface PaymentIntent {
  intentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
}

interface YocoPaymentResult {
  transactionId: string;
  chargeId: string;           // NEW: Yoco charge ID for server-side verification
  status: 'succeeded' | 'failed';
  amount: number;
  currency: string;
  errorMessage?: string;
}

interface RefundData {
  requestId: string;
  amount: number;
  reason?: string;
}

interface RefundResult {
  refundId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId: string;
  estimatedDays: string;
}

/**
 * Create a payment intent for a song request
 */
export async function createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntent> {
  try {
    console.log('Creating payment intent:', data);
    
    // TODO: Replace with actual Yoco API call
    // For now, return a mock intent for development
    const intent: PaymentIntent = {
      intentId: `pi_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      amount: data.amount,
      currency: data.currency || 'ZAR',
      status: 'pending',
    };
    
    // In production, you would make an API call:
    // const response = await fetch(`${YOCO_API_BASE}/payment-intents`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     amount: Math.round(data.amount * 100), // Yoco expects cents
    //     currency: data.currency || 'ZAR',
    //     metadata: {
    //       songId: data.songId,
    //       eventId: data.eventId,
    //       userId: data.userId,
    //     },
    //   }),
    // });
    // const result = await response.json();
    // return result;
    
    return intent;
  } catch (error) {
    console.error('Failed to create payment intent:', error);
    throw new Error('Payment initialization failed. Please try again.');
  }
}

/**
 * Process payment via Yoco
 */
export async function processYocoPayment(intent: PaymentIntent): Promise<YocoPaymentResult> {
  try {
    console.log('Processing Yoco payment:', intent);
    
    // TODO: Replace with actual Yoco payment processing
    // For development, simulate successful payment
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    
    const chargeId = `ch_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const result: YocoPaymentResult = {
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      chargeId: chargeId,  // NEW: Yoco charge ID (in production, from Yoco SDK)
      status: 'succeeded',
      amount: intent.amount,
      currency: intent.currency,
    };
    
    // In production, you would integrate Yoco SDK:
    // const yoco = new window.YocoSDK({
    //   publicKey: YOCO_PUBLIC_KEY,
    // });
    // 
    // const paymentResult = await yoco.showPopup({
    //   amountInCents: Math.round(intent.amount * 100),
    //   currency: intent.currency,
    //   name: 'Song Request',
    //   description: `Request for ${intent.metadata?.songTitle}`,
    //   callback: (result) => {
    //     if (result.error) {
    //       throw new Error(result.error.message);
    //     }
    //     return result;
    //   },
    // });
    // return paymentResult;
    
    return result;
  } catch (error: any) {
    console.error('Payment processing failed:', error);
    throw new Error(error.message || 'Payment failed. Please try again.');
  }
}

/**
 * Verify payment was successful
 */
export async function verifyPayment(transactionId: string): Promise<boolean> {
  try {
    console.log('Verifying payment:', transactionId);
    
    // TODO: Replace with actual verification API call
    // For development, always return true
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production:
    // const response = await fetch(`${YOCO_API_BASE}/charges/${transactionId}`, {
    //   headers: {
    //     'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
    //   },
    // });
    // const charge = await response.json();
    // return charge.status === 'successful';
    
    return true;
  } catch (error) {
    console.error('Payment verification failed:', error);
    return false;
  }
}

/**
 * Process a refund for a vetoed or cancelled request
 */
export async function processRefund(data: RefundData): Promise<RefundResult> {
  try {
    console.log('Processing refund:', data);
    
    // TODO: Replace with actual refund API call
    // For development, return a mock refund
    const refund: RefundResult = {
      refundId: `rf_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      amount: data.amount,
      status: 'completed',
      transactionId: `txn_refund_${Date.now()}`,
      estimatedDays: '5-10 business days',
    };
    
    // In production:
    // const response = await fetch(`${YOCO_API_BASE}/refunds`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     chargeId: data.transactionId,
    //     amount: Math.round(data.amount * 100),
    //     metadata: {
    //       requestId: data.requestId,
    //       reason: data.reason,
    //     },
    //   }),
    // });
    // const result = await response.json();
    // return result;
    
    return refund;
  } catch (error) {
    console.error('Refund processing failed:', error);
    throw new Error('Refund failed. Please contact support.');
  }
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  const retryableMessages = [
    'network',
    'timeout',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    '502',
    '503',
    '504',
  ];
  
  const errorMessage = error.message?.toLowerCase() || '';
  return retryableMessages.some(msg => errorMessage.includes(msg.toLowerCase()));
}

/**
 * CRITICAL FIX: Poll payment status with exponential backoff
 * Handles network delays and async payment processing
 * 
 * @param transactionId - The transaction ID to poll
 * @param maxAttempts - Maximum polling attempts (default: 10)
 * @returns Payment status or throws after max attempts
 */
export async function verifyPaymentStatus(
  transactionId: string,
  maxAttempts: number = 10
): Promise<'succeeded' | 'failed' | 'pending'> {
  console.log(`🔄 Starting payment verification polling for ${transactionId}`);
  
  const getTransactionQuery = /* GraphQL */ `
    query GetTransaction($transactionId: ID!) {
      getTransaction(transactionId: $transactionId) {
        transactionId
        amount
        status
        paymentMethod
        providerTransactionId
        failureReason
        createdAt
        updatedAt
      }
    }
  `;
  
  let attempt = 0;
  let delay = 1000; // Start with 1 second
  
  while (attempt < maxAttempts) {
    attempt++;
    
    try {
      console.log(`📡 Payment status poll attempt ${attempt}/${maxAttempts} (delay: ${delay}ms)`);
      
      // Query Transactions table via AppSync
      const response: any = await client.graphql({
        query: getTransactionQuery,
        variables: { transactionId }
      });
      
      const transaction = response.data?.getTransaction;
      
      if (!transaction) {
        console.warn(`⚠️ Transaction ${transactionId} not found (attempt ${attempt})`);
        
        // If transaction not found after 5 attempts, it likely doesn't exist
        if (attempt >= 5) {
          throw new Error('Transaction not found in database');
        }
      } else {
        const status = transaction.status;
        console.log(`📊 Transaction status: ${status} (attempt ${attempt})`);
        
        // Terminal states - return immediately
        if (status === 'succeeded' || status === 'completed') {
          console.log(`✅ Payment verified as succeeded after ${attempt} attempts`);
          return 'succeeded';
        }
        
        if (status === 'failed' || status === 'refunded') {
          console.error(`❌ Payment failed/refunded: ${transaction.failureReason || 'Unknown reason'}`);
          return 'failed';
        }
        
        // Still processing
        console.log(`⏳ Payment still processing (status: ${status})`);
      }
      
      // Wait before next attempt (exponential backoff: 1s → 2s → 4s → 8s → 16s → 30s cap)
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, 30000); // Cap at 30 seconds
      }
      
    } catch (error) {
      console.error(`❌ Error polling payment status (attempt ${attempt}):`, error);
      
      // If final attempt, rethrow error
      if (attempt >= maxAttempts) {
        throw new Error(`Payment verification failed after ${maxAttempts} attempts: ${error}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 30000);
    }
  }
  
  // Max attempts reached without terminal status
  console.error(`⏱️ Payment verification timed out after ${maxAttempts} attempts`);
  return 'pending'; // Return pending instead of throwing (graceful degradation)
}
