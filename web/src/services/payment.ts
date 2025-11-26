/**
 * Payment Service - Yoco Integration (Production Ready)
 * Handles payment processing, verification, and refunds via Yoco API
 */

import { generateClient } from 'aws-amplify/api';

const client = generateClient({
  authMode: 'userPool'
});

const YOCO_PUBLIC_KEY = import.meta.env.VITE_YOCO_PUBLIC_KEY || '';

interface PaymentIntentData {
  amount: number;
  songId: string;
  eventId: string;
  setId?: string;
  performerId?: string;
  userId?: string;
  currency?: string;
  songTitle?: string;
  artistName?: string;
}

interface PaymentIntent {
  intentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  metadata?: {
    songId: string;
    eventId: string;
    songTitle?: string;
  };
}

interface YocoPaymentResult {
  transactionId: string;
  chargeId: string;
  status: 'succeeded' | 'failed';
  amount: number;
  currency: string;
  errorMessage?: string;
}

interface RefundData {
  requestId: string;
  amount: number;
  reason?: string;
  chargeId?: string;
}

interface RefundResult {
  refundId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId: string;
  estimatedDays: string;
}

let yocoSDKInstance: any = null;
let yocoSDKLoading: Promise<void> | null = null;

async function loadYocoSDK(): Promise<void> {
  if (yocoSDKInstance) return;
  
  if (yocoSDKLoading) {
    await yocoSDKLoading;
    return;
  }
  
  yocoSDKLoading = new Promise((resolve, reject) => {
    if (window.YocoSDK) {
      try {
        yocoSDKInstance = new window.YocoSDK({
          publicKey: YOCO_PUBLIC_KEY,
        });
        resolve();
      } catch (error) {
        reject(new Error('Failed to initialize Yoco SDK'));
      }
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js';
    script.async = true;
    
    script.onload = () => {
      if (window.YocoSDK) {
        try {
          yocoSDKInstance = new window.YocoSDK({
            publicKey: YOCO_PUBLIC_KEY,
          });
          resolve();
        } catch (error) {
          reject(new Error('Failed to initialize Yoco SDK'));
        }
      } else {
        reject(new Error('Yoco SDK not available'));
      }
    };
    
    script.onerror = () => reject(new Error('Failed to load Yoco SDK'));
    document.body.appendChild(script);
  });
  
  await yocoSDKLoading;
}

export async function createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntent> {
  console.log('💳 Creating payment intent:', data);
  
  await loadYocoSDK();
  
  const intent: PaymentIntent = {
    intentId: `pi_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`,
    amount: data.amount,
    currency: data.currency || 'ZAR',
    status: 'pending',
    metadata: {
      songId: data.songId,
      eventId: data.eventId,
      songTitle: data.songTitle,
    },
  };
  
  return intent;
}

export async function processYocoPayment(intent: PaymentIntent): Promise<YocoPaymentResult> {
  console.log('⚡ Processing Yoco payment:', intent);
  
  await loadYocoSDK();
  
  if (!yocoSDKInstance) {
    throw new Error('Payment system not initialized. Please refresh and try again.');
  }
  
  return new Promise((resolve, reject) => {
    yocoSDKInstance.showPopup({
      amountInCents: Math.round(intent.amount * 100),
      currency: intent.currency || 'ZAR',
      name: 'BeatMatchMe',
      description: intent.metadata?.songTitle 
        ? `Song Request: ${intent.metadata.songTitle}`
        : 'Song Request Payment',
      callback: (result: any) => {
        if (result.error) {
          console.error('❌ Yoco payment error:', result.error);
          reject(new Error(result.error.message || 'Payment failed'));
          return;
        }
        
        if (result.id) {
          console.log('✅ Yoco payment successful, charge ID:', result.id);
          resolve({
            transactionId: result.id,
            chargeId: result.id,
            status: 'succeeded',
            amount: intent.amount,
            currency: intent.currency,
          });
        } else {
          reject(new Error('Payment failed - no charge ID received'));
        }
      },
    });
  });
}

export async function verifyPayment(chargeId: string): Promise<boolean> {
  console.log('🔍 Verifying payment:', chargeId);
  
  try {
    const verifyQuery = `
      query VerifyPayment($chargeId: String!) {
        verifyPayment(chargeId: $chargeId) {
          valid
          status
          amount
        }
      }
    `;
    
    const response: any = await client.graphql({
      query: verifyQuery,
      variables: { chargeId }
    });
    
    return response.data?.verifyPayment?.valid === true;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
}

export async function processRefund(data: RefundData): Promise<RefundResult> {
  console.log('💸 Processing refund:', data);
  
  const refundMutation = `
    mutation ProcessRefund($requestId: ID!, $reason: String) {
      processRefund(requestId: $requestId, reason: $reason) {
        refundId
        amount
        status
        transactionId
        estimatedDays
        refundedAt
      }
    }
  `;
  
  try {
    const response: any = await client.graphql({
      query: refundMutation,
      variables: {
        requestId: data.requestId,
        reason: data.reason || 'Request cancelled',
      }
    });
    
    const result = response.data?.processRefund;
    
    if (!result) {
      throw new Error('Refund processing failed - no response from server');
    }
    
    console.log('✅ Refund processed:', result);
    
    return {
      refundId: result.refundId,
      amount: result.amount,
      status: result.status === 'COMPLETED' ? 'completed' : 'pending',
      transactionId: result.transactionId,
      estimatedDays: result.estimatedDays || '5-10 business days',
    };
  } catch (error: any) {
    console.error('❌ Refund failed:', error);
    throw new Error(error.message || 'Refund failed. Please contact support.');
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
