/**
 * Offline Mode Indicator
 * Shows banner when user loses internet connection
 */

import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineBannerProps {
  onRetry?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onRetry }) => {
  return (
    <div className="fixed top-16 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-3 shadow-lg z-50 animate-slide-down">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm sm:text-base">You're Offline</p>
            <p className="text-xs sm:text-sm text-white/90">Some features may not work until you reconnect.</p>
          </div>
        </div>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Retry</span>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Payment Error Modal
 * Enhanced error display with retry functionality
 */

interface PaymentErrorModalProps {
  error: string;
  onRetry: () => void;
  onCancel: () => void;
  isRetrying?: boolean;
}

export const PaymentErrorModal: React.FC<PaymentErrorModalProps> = ({
  error,
  onRetry,
  onCancel,
  isRetrying = false
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="text-4xl">❌</div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white text-center mb-3">
          Payment Failed
        </h3>

        {/* Error Message */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <p className="text-red-300 text-sm text-center">{error}</p>
        </div>

        {/* Common Reasons */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <p className="text-gray-400 text-xs mb-2">Common reasons:</p>
          <ul className="text-gray-300 text-xs space-y-1">
            <li>• Insufficient funds</li>
            <li>• Card declined by bank</li>
            <li>• Network connection issue</li>
            <li>• Invalid card details</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
            disabled={isRetrying}
          >
            Cancel
          </button>
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRetrying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Retrying...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <p className="text-gray-500 text-xs text-center mt-4">
          Need help? Contact support or try a different payment method.
        </p>
      </div>
    </div>
  );
};

/**
 * Success Confirmation Modal
 * Shows after successful request submission
 */

interface SuccessConfirmationProps {
  songTitle: string;
  artist: string;
  queuePosition: number;
  onClose: () => void;
}

export const SuccessConfirmation: React.FC<SuccessConfirmationProps> = ({
  songTitle,
  artist,
  queuePosition,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-green-900/90 to-emerald-900/90 border border-green-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Success Animation */}
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
          <div className="text-5xl">✅</div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white text-center mb-2">
          Request Confirmed!
        </h3>

        {/* Song Details */}
        <div className="bg-white/10 rounded-xl p-4 mb-4">
          <p className="text-white font-semibold text-lg text-center">{songTitle}</p>
          <p className="text-green-300 text-sm text-center mt-1">{artist}</p>
        </div>

        {/* Queue Position */}
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6">
          <p className="text-green-200 text-sm text-center mb-1">You're in the queue!</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-white">#{queuePosition}</span>
            <span className="text-green-300">in line</span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white/5 rounded-xl p-3 mb-6">
          <p className="text-gray-300 text-xs text-center">
            🔔 We'll notify you when your song is coming up!
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
};
