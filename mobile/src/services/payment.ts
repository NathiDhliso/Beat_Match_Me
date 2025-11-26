/**
 * Payment Service - Yoco Integration for React Native
 * Uses react-native-webview for Yoco popup
 */

const YOCO_PUBLIC_KEY = process.env.YOCO_PUBLIC_KEY || '';

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

export function createPaymentIntent(data: PaymentIntentData): PaymentIntent {
  console.log('💳 Creating payment intent:', data);
  
  return {
    intentId: `pi_${Date.now()}_${Math.random().toString(36).substring(0, 8)}`,
    amount: data.amount,
    currency: data.currency || 'ZAR',
    status: 'pending',
    metadata: {
      songId: data.songId,
      eventId: data.eventId,
      songTitle: data.songTitle,
    },
  };
}

export function getYocoPublicKey(): string {
  return YOCO_PUBLIC_KEY;
}

export function generateYocoPaymentUrl(intent: PaymentIntent): string {
  const params = new URLSearchParams({
    publicKey: YOCO_PUBLIC_KEY,
    amountInCents: String(Math.round(intent.amount * 100)),
    currency: intent.currency || 'ZAR',
    name: 'BeatMatchMe',
    description: intent.metadata?.songTitle 
      ? `Song Request: ${intent.metadata.songTitle}`
      : 'Song Request Payment',
  });
  
  return `https://js.yoco.com/sdk/v1/yoco-sdk-web.js?${params.toString()}`;
}

export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

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

console.log('✅ Mobile payment service loaded');
