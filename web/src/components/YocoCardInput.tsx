import React, { useEffect, useRef, useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import type { YocoSDKInstance, YocoResult } from '../types/yoco';

interface YocoCardInputProps {
  amount: number;
  onSuccess: (token: string) => void;
  onError: (error: string) => void;
  publicKey: string;
}

export const YocoCardInput: React.FC<YocoCardInputProps> = ({
  amount,
  onSuccess,
  onError,
  publicKey,
}) => {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const sdkRef = useRef<YocoSDKInstance | null>(null);
  
  // Get Yoco public key from props or environment
  const yocoPublicKey = publicKey || import.meta.env.VITE_YOCO_PUBLIC_KEY || '';

  useEffect(() => {
    // Load Yoco SDK
    const script = document.createElement('script');
    script.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js';
    script.async = true;
    
    script.onload = () => {
      if (window.YocoSDK) {
        try {
          sdkRef.current = new window.YocoSDK({
            publicKey: yocoPublicKey,
          });
          setLoading(false);
        } catch {
          onError('Failed to initialize payment');
          setLoading(false);
        }
      }
    };

    script.onerror = () => {
      onError('Failed to load payment system');
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [yocoPublicKey, onError]);

  const handlePayment = async () => {
    if (!sdkRef.current) {
      onError('Payment system not ready');
      return;
    }

    setProcessing(true);

    try {
      sdkRef.current.showPopup({
        amountInCents: Math.round(amount * 100),
        currency: 'ZAR',
        name: 'BeatMatchMe',
        description: 'Song Request Payment',
        callback: function (result: YocoResult) {
          if (result.error) {
            onError(result.error.message || 'Payment failed');
            setProcessing(false);
          } else if (result.id) {
            onSuccess(result.id);
            setProcessing(false);
          }
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onError(errorMessage);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading payment system...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-white">Payment Details</h3>
          </div>
          <div className="flex items-center gap-1 text-green-500 text-sm">
            <Lock className="w-4 h-4" />
            <span>Secure</span>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Amount</span>
            <span className="text-2xl font-bold text-white">R{amount.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Powered by Yoco - South Africa's leading payment gateway
        </p>

        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-4 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay R{amount.toFixed(2)}
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 text-gray-500 text-xs">
        <span>🔒 Secure Payment</span>
        <span>•</span>
        <span>💳 Visa & Mastercard</span>
        <span>•</span>
        <span>✓ Instant Refunds</span>
      </div>
    </div>
  );
};
