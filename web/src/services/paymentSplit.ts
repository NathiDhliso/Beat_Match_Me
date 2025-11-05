/**
 * Payment Split & Commission Service
 * Handles BeatMatchMe's 15% platform fee and performer payout calculations
 */

export interface PaymentBreakdown {
  grossAmount: number;           // Total amount paid by customer
  platformFee: number;            // 15% BeatMatchMe commission
  performerEarnings: number;      // 85% to performer
  processingFee: number;          // Yoco/payment gateway fees (~2.9% + R1)
  netToPerformer: number;         // Final amount performer receives
  netToPlatform: number;          // Final amount platform receives
}

export interface PerformerPayout {
  performerId: string;
  eventId: string;
  setId?: string;
  totalEarnings: number;
  platformFee: number;
  processingFees: number;
  netPayout: number;
  transactionCount: number;
  payoutStatus: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt?: number;
  completedAt?: number;
}

// Platform configuration
const PLATFORM_COMMISSION_RATE = 0.15; // 15%
const PERFORMER_SHARE_RATE = 0.85;     // 85%
const YOCO_RATE = 0.029;                // 2.9%
const YOCO_FIXED_FEE = 1.00;            // R1.00 per transaction

/**
 * Calculate payment breakdown including all fees
 */
export function calculatePaymentBreakdown(grossAmount: number): PaymentBreakdown {
  // Calculate Yoco processing fees (applied to gross)
  const processingFee = (grossAmount * YOCO_RATE) + YOCO_FIXED_FEE;
  
  // Net amount after payment processing
  const netAmount = grossAmount - processingFee;
  
  // Platform commission (15% of net amount)
  const platformFee = netAmount * PLATFORM_COMMISSION_RATE;
  
  // Performer earnings (85% of net amount)
  const performerEarnings = netAmount * PERFORMER_SHARE_RATE;
  
  return {
    grossAmount,
    platformFee,
    performerEarnings,
    processingFee,
    netToPerformer: performerEarnings,
    netToPlatform: platformFee,
  };
}

/**
 * Calculate total payout for a performer
 */
export function calculatePerformerPayout(
  transactions: Array<{ amount: number }>,
  performerId: string,
  eventId: string,
  setId?: string
): PerformerPayout {
  let totalGross = 0;
  let totalPlatformFee = 0;
  let totalProcessingFees = 0;
  let totalNetToPerformer = 0;

  transactions.forEach((transaction) => {
    const breakdown = calculatePaymentBreakdown(transaction.amount);
    totalGross += breakdown.grossAmount;
    totalPlatformFee += breakdown.platformFee;
    totalProcessingFees += breakdown.processingFee;
    totalNetToPerformer += breakdown.netToPerformer;
  });

  return {
    performerId,
    eventId,
    setId,
    totalEarnings: totalGross,
    platformFee: totalPlatformFee,
    processingFees: totalProcessingFees,
    netPayout: totalNetToPerformer,
    transactionCount: transactions.length,
    payoutStatus: 'pending',
  };
}

/**
 * Get display-friendly breakdown for UI
 */
export function getPaymentDisplayInfo(amount: number) {
  const breakdown = calculatePaymentBreakdown(amount);
  
  return {
    customerPays: `R${breakdown.grossAmount.toFixed(2)}`,
    performerGets: `R${breakdown.netToPerformer.toFixed(2)}`,
    platformFee: `R${breakdown.platformFee.toFixed(2)}`,
    feePercentage: '15%',
    trust: {
      icon: '🔒',
      message: '85% goes directly to your DJ',
      submessage: 'Transparent, instant payments'
    }
  };
}

/**
 * Validate minimum payout threshold
 * Performers can only withdraw when they hit minimum threshold
 */
export function canRequestPayout(netPayout: number, minimumPayout: number = 100): boolean {
  return netPayout >= minimumPayout;
}

/**
 * Calculate estimated payout timeline
 */
export function getPayoutTimeline(payoutStatus: PerformerPayout['payoutStatus']): string {
  switch (payoutStatus) {
    case 'pending':
      return '2-3 business days';
    case 'processing':
      return '1-2 business days';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed - Contact Support';
    default:
      return 'Unknown';
  }
}

/**
 * Format earnings for display with proper currency
 */
export function formatEarnings(amount: number, showBreakdown: boolean = false): string {
  const formatted = `R${amount.toFixed(2)}`;
  
  if (showBreakdown && amount > 0) {
    const breakdown = calculatePaymentBreakdown(amount);
    return `${formatted} (You earn: R${breakdown.netToPerformer.toFixed(2)})`;
  }
  
  return formatted;
}

/**
 * Get commission explanation for transparency
 */
export function getCommissionExplanation(): {
  platformCut: string;
  performerCut: string;
  why: string;
  benefits: string[];
} {
  return {
    platformCut: '15%',
    performerCut: '85%',
    why: 'Covers secure payments, real-time queue management, and platform maintenance',
    benefits: [
      'Instant payment processing',
      'Automatic refunds for vetoed songs',
      'Queue management & notifications',
      'Customer support 24/7',
      'Secure data handling',
    ],
  };
}
