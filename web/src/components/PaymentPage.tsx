/**
 * Clean Payment Page Component
 * Simple, trustworthy interface for processing song request payments
 * Shows transparent pricing and builds confidence
 */

import React, { useState } from 'react';
import { Shield, Lock, CreditCard, CheckCircle, Music, Info, Sparkles } from 'lucide-react';
import { YocoCardInput } from './YocoCardInput';
import { getPaymentDisplayInfo } from '../services/paymentSplit';

interface PaymentPageProps {
  songTitle: string;
  artistName: string;
  amount: number;
  requestType?: 'standard' | 'spotlight';
  djName?: string;
  estimatedPosition?: number;
  onSuccess: (paymentToken: string) => void;
  onCancel: () => void;
  onError?: (error: string) => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({
  songTitle,
  artistName,
  amount,
  requestType = 'standard',
  djName = 'the DJ',
  estimatedPosition,
  onSuccess,
  onCancel,
  onError,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);
  
  const displayInfo = getPaymentDisplayInfo(amount);
  const publicKey = import.meta.env.VITE_YOCO_PUBLIC_KEY || '';

  const handlePaymentSuccess = (token: string) => {
    onSuccess(token);
  };

  const handlePaymentError = (error: string) => {
    if (onError) {
      onError(error);
    }
    setPaymentStarted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header - Build Trust */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-4">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Secure Payment</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Request</h1>
          <p className="text-gray-400">Fast. Secure. Transparent.</p>
        </div>

        {/* Main Payment Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 overflow-hidden shadow-2xl">
          
          {/* Song Info Section */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white truncate mb-1">
                  {songTitle}
                </h2>
                <p className="text-gray-400 truncate">{artistName}</p>
                {requestType === 'spotlight' && (
                  <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs font-semibold text-yellow-400">Priority Request</span>
                  </div>
                )}
              </div>
            </div>

            {estimatedPosition && (
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <p className="text-sm text-gray-400">
                  Estimated queue position: <span className="text-white font-semibold">#{estimatedPosition}</span>
                </p>
              </div>
            )}
          </div>

          {/* Amount Section - Big & Clear */}
          <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">You pay</p>
              <div className="text-5xl font-bold text-white mb-1">
                R{amount.toFixed(2)}
              </div>
              
              {/* Trust Message */}
              <div className="flex items-center justify-center gap-2 text-green-400 text-sm mt-3">
                <CheckCircle className="w-4 h-4" />
                <span>{displayInfo.trust.message}</span>
              </div>
              <p className="text-gray-500 text-xs mt-1">{displayInfo.trust.submessage}</p>
            </div>

            {/* Optional Breakdown */}
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full mt-4 text-gray-400 hover:text-white text-sm flex items-center justify-center gap-1 transition-colors"
            >
              <Info className="w-4 h-4" />
              {showBreakdown ? 'Hide' : 'Show'} payment breakdown
            </button>

            {showBreakdown && (
              <div className="mt-4 p-4 bg-gray-900/50 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total amount</span>
                  <span className="text-white font-medium">{displayInfo.customerPays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Platform fee (30%)</span>
                  <span className="text-gray-400">-{displayInfo.platformFee}</span>
                </div>
                <div className="h-px bg-gray-700 my-2"></div>
                <div className="flex justify-between">
                  <span className="text-green-400 font-medium">{djName} receives</span>
                  <span className="text-green-400 font-bold">{displayInfo.performerGets}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="p-6">
            {!paymentStarted ? (
              <button
                onClick={() => setPaymentStarted(true)}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Continue to Payment
              </button>
            ) : (
              <YocoCardInput
                amount={amount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                publicKey={publicKey}
              />
            )}
          </div>

          {/* Trust Indicators */}
          <div className="p-4 bg-gray-900/30 border-t border-gray-700/50">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>256-bit SSL</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>PCI Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>Instant Refunds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Option */}
        <button
          onClick={onCancel}
          className="w-full mt-4 text-gray-400 hover:text-white py-3 transition-colors text-sm"
        >
          Cancel request
        </button>

        {/* Powered by Yoco */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-xs">
            Secured by <span className="text-gray-400 font-semibold">Yoco Payments</span>
          </p>
        </div>
      </div>
    </div>
  );
};
