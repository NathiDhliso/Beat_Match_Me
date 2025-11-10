/**
 * Refund Confirmation Modal - Feature 6
 * Displays when DJ vetoes a request and automatic refund is processed
 */

import React, { useEffect } from 'react';
import { X, CheckCircle, DollarSign, Info, Music, Shield } from 'lucide-react';

export interface RefundDetails {
  requestId: string;
  songTitle: string;
  artistName: string;
  albumArt?: string;
  venueName: string;
  eventDate: string;
  originalAmount: number;
  refundAmount: number;
  paymentMethod: string;
  paymentLast4?: string;
  vetoReason?: string;
  refundReferenceId: string;
  refundedAt: number;
  estimatedDays: string;
}

interface RefundConfirmationProps {
  refund: RefundDetails;
  onDismiss: () => void;
  onViewHistory?: () => void;
  onContactSupport?: () => void;
}

export const RefundConfirmation: React.FC<RefundConfirmationProps> = ({
  refund,
  onDismiss,
  onViewHistory,
  onContactSupport,
}) => {
  // Auto-trigger medium haptic feedback when modal appears
  useEffect(() => {
    // Trigger haptic if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-scale-in">
      {/* Modal Container */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl max-w-md w-full border border-gray-700 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-center relative">
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Request Refunded</h2>
          <p className="text-green-100 text-lg flex items-center justify-center gap-2">
            <Shield className="w-5 h-5" />
            Fair-Play Promise fulfilled ✓
          </p>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* Song Details */}
          <div className="flex items-start gap-4">
            {refund.albumArt ? (
              <img
                src={refund.albumArt}
                alt={refund.songTitle}
                className="w-20 h-20 rounded-xl object-cover shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Music className="w-10 h-10 text-white" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white truncate">{refund.songTitle}</h3>
              <p className="text-gray-400 truncate">{refund.artistName}</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <span>{refund.venueName}</span>
                <span>•</span>
                <span>{refund.eventDate}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700"></div>

          {/* Financial Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Original payment:</span>
              <span className="text-gray-400">R{refund.originalAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white font-bold">Refund amount:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-400">
                  R{refund.refundAmount.toFixed(2)}
                </span>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Processing timeline:</span>
                <span className="text-white font-medium">{refund.estimatedDays}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Payment method:</span>
                <span className="text-white">
                  {refund.paymentMethod} {refund.paymentLast4 && `****${refund.paymentLast4}`}
                </span>
              </div>
            </div>
          </div>

          {/* DJ Reason Section */}
          {refund.vetoReason ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-amber-400 font-bold mb-2 text-sm">DJ's message:</p>
              <p className="text-gray-300 italic">"{refund.vetoReason}"</p>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-gray-400 text-sm text-center italic">
                No reason provided by DJ
              </p>
            </div>
          )}

          {/* Information Section */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-blue-400 font-medium text-sm">
                  Your refund has been submitted to your bank
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  The amount will appear in your account within {refund.estimatedDays}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-500/20">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Refund reference:</span>
                <code className="text-blue-400 font-mono bg-blue-500/10 px-2 py-1 rounded">
                  {refund.refundReferenceId}
                </code>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onDismiss}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
            >
              Got It
            </button>

            {onViewHistory && (
              <button
                onClick={() => {
                  onDismiss();
                  onViewHistory();
                }}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-all"
              >
                View Request History
              </button>
            )}

            {onContactSupport && (
              <button
                onClick={onContactSupport}
                className="w-full text-gray-400 hover:text-white text-sm py-2 transition-colors"
              >
                Questions? Contact Support
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Mini Refund Toast - Quick notification version
 */
interface RefundToastProps {
  songTitle: string;
  amount: number;
  onClose: () => void;
}

export const RefundToast: React.FC<RefundToastProps> = ({ songTitle, amount, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div className="bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <DollarSign className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="font-bold">Request Refunded</p>
          <p className="text-sm text-red-100">"{songTitle}" - R{amount.toFixed(2)}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
