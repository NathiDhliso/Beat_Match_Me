import React, { useState } from 'react';
import { YocoCardInput } from '../components/YocoCardInput';

export const YocoTestPage: React.FC = () => {
  const [amount, setAmount] = useState(50); // R50.00 default
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const handleSuccess = (token: string) => {
    console.log('Payment successful! Token:', token);
    setPaymentStatus('success');
    setTransactionId(token);
    setStatusMessage(`Payment successful! Transaction ID: ${token}`);
  };

  const handleError = (error: string) => {
    console.error('Payment error:', error);
    setPaymentStatus('error');
    setStatusMessage(`Payment failed: ${error}`);
  };

  const resetTest = () => {
    setPaymentStatus('idle');
    setStatusMessage('');
    setTransactionId('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎵 Yoco Payment Test</h1>
          <p className="text-purple-300">Test your Yoco integration with live test keys</p>
          <div className="mt-4 p-4 bg-purple-800/30 rounded-lg">
            <p className="text-sm text-purple-200">
              Environment: <span className="font-bold text-green-400">TEST MODE</span>
            </p>
            <p className="text-xs text-purple-300 mt-1">
              Public Key: {import.meta.env.VITE_YOCO_PUBLIC_KEY || 'Not configured'}
            </p>
          </div>
        </div>

        {/* Amount Selector */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
          <label className="block text-white font-semibold mb-3">
            Select Amount to Test:
          </label>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[10, 20, 50, 100].map((testAmount) => (
              <button
                key={testAmount}
                onClick={() => setAmount(testAmount)}
                className={`py-3 px-4 rounded-lg font-bold transition-all ${
                  amount === testAmount
                    ? 'bg-purple-500 text-white shadow-lg scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                R{testAmount}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-300 border border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter custom amount"
              min="1"
              max="10000"
            />
            <span className="text-2xl font-bold text-white">ZAR</span>
          </div>
        </div>

        {/* Payment Component */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Payment Method</h2>
          
          {paymentStatus === 'idle' && (
            <YocoCardInput
              amount={amount}
              onSuccess={handleSuccess}
              onError={handleError}
              publicKey={import.meta.env.VITE_YOCO_PUBLIC_KEY || ''}
            />
          )}

          {paymentStatus === 'success' && (
            <div className="bg-green-500/20 border border-green-500 rounded-xl p-6 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">Payment Successful!</h3>
              <p className="text-white mb-4">{statusMessage}</p>
              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-purple-300 mb-1">Transaction ID:</p>
                <p className="text-xs text-white font-mono break-all">{transactionId}</p>
              </div>
              <button
                onClick={resetTest}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all"
              >
                Test Another Payment
              </button>
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="bg-red-500/20 border border-red-500 rounded-xl p-6 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-2xl font-bold text-red-400 mb-2">Payment Failed</h3>
              <p className="text-white mb-4">{statusMessage}</p>
              <button
                onClick={resetTest}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Test Card Info */}
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-3">🧪 Test Card Details</h3>
          <div className="space-y-2 text-white">
            <p><strong>Card Number:</strong> 4242 4242 4242 4242</p>
            <p><strong>Expiry:</strong> Any future date (e.g., 12/25)</p>
            <p><strong>CVV:</strong> Any 3 digits (e.g., 123)</p>
            <p className="text-sm text-yellow-300 mt-4">
              💡 Tip: These are Yoco test cards that simulate successful payments
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-3">📋 Testing Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-purple-200">
            <li>Select or enter an amount above</li>
            <li>Click "Pay with Card" button</li>
            <li>Enter the test card details provided</li>
            <li>Complete the payment</li>
            <li>Verify success/error handling</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
