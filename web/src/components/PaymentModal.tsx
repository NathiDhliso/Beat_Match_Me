import React, { useState } from 'react';
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentModalProps {
  amount: number;
  songTitle: string;
  artist: string;
  onConfirm: (paymentData: PaymentData) => Promise<void>;
  onCancel: () => void;
}

export interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  saveCard: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  amount,
  songTitle,
  artist,
  onConfirm,
  onCancel,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substring(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      await onConfirm({
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiryDate,
        cvv,
        saveCard,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Payment</h2>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-sm text-gray-400">Request for</p>
            <p className="font-bold text-white">{songTitle}</p>
            <p className="text-sm text-gray-400">{artist}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 mb-6">
          <p className="text-sm text-purple-100 mb-1">Total Amount</p>
          <p className="text-4xl font-bold text-white">R{amount}</p>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Card Number
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                maxLength={19}
              />
            </div>
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                placeholder="MM/YY"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                CVV
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                placeholder="123"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                maxLength={3}
              />
            </div>
          </div>

          {/* Save Card */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <span className="text-sm text-gray-300">Save card for future requests</span>
          </label>

          {/* Security Notice */}
          <div className="flex items-start gap-2 bg-gray-900/50 rounded-lg p-3">
            <Lock className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400">
              Your payment is secured with 256-bit encryption. We never store your full card details.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Pay R{amount}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface PaymentSuccessModalProps {
  amount: number;
  songTitle: string;
  onClose: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  amount,
  songTitle,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
        <div className="mb-6">
          <div className="inline-block bg-green-500 rounded-full p-4 mb-4">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-400">Your request has been added to the queue</p>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-400 mb-1">You requested</p>
          <p className="text-xl font-bold text-white">{songTitle}</p>
          <p className="text-sm text-gray-400 mt-3">Amount paid</p>
          <p className="text-2xl font-bold text-green-400">R{amount}</p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          View Queue
        </button>
      </div>
    </div>
  );
};
