/**
 * Payment Service - Yoco Integration
 * Handles payment processing, verification, and refunds
 */

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

// Yoco API configuration
const YOCO_PUBLIC_KEY = import.meta.env.VITE_YOCO_PUBLIC_KEY || '';
// Note: Secret key should only be used in backend/Lambda functions
const YOCO_API_BASE = 'https://payments.yoco.com/api/checkouts';

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
    
    const result: YocoPaymentResult = {
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`,
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
