/**
 * Veto Confirmation Modal - DJ Side (Feature 6 & 10)
 * Allows DJ to confirm veto with reason selection
 */

import React, { useState } from 'react';
import { X, AlertCircle, DollarSign, Music, Info } from 'lucide-react';
import type { UserTier } from '../theme/tokens';
import { getTierColor } from '../theme/tokens';

export interface VetoRequest {
  requestId: string;
  songTitle: string;
  artistName: string;
  albumArt?: string;
  duration?: string;
  genre?: string;
  userName: string;
  userTier: UserTier;
  price: number;
  dedication?: string;
}

interface VetoConfirmationProps {
  request: VetoRequest;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

const QUICK_REASONS = [
  "Doesn't fit the vibe",
  "Already played recently",
  "Technical issues",
  "Inappropriate request",
];

export const VetoConfirmation: React.FC<VetoConfirmationProps> = ({
  request,
  onConfirm,
  onCancel,
  isProcessing = false,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [showWarning, setShowWarning] = useState(false);
  
  // Use centralized tier color system
  const tierColor = getTierColor(request.userTier);

  const handleQuickSelect = (reason: string) => {
    setSelectedReason(reason);
    setCustomReason(reason);
    setShowWarning(false);
  };

  const handleConfirm = () => {
    const finalReason = customReason.trim();

    if (!finalReason) {
      setShowWarning(true);
      return;
    }

    onConfirm(finalReason);
  };

  const characterCount = customReason.length;
  const maxChars = 200;

  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-scale-in">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl max-w-lg w-full border border-red-500/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 relative">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center">
              <X className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Veto this request?</h2>
              <p className="text-red-100 text-sm">User will receive full refund</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Song Details Card */}
          <div className="bg-gray-800/50 rounded-2xl p-4">
            <div className="flex items-start gap-4">
              {request.albumArt ? (
                <img
                  src={request.albumArt}
                  alt={request.songTitle}
                  className="w-24 h-24 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Music className="w-12 h-12 text-white" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white truncate">{request.songTitle}</h3>
                <p className="text-gray-400 truncate">{request.artistName}</p>
                
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {request.duration && (
                    <span className="text-xs text-gray-500">{request.duration}</span>
                  )}
                  {request.genre && (
                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                      {request.genre}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* User Info & Price */}
            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Requested by:</span>
                <span className="text-white font-medium">{request.userName}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${tierColor.tailwind}`}>
                  {request.userTier}
                </span>
              </div>

              <div className="flex items-center gap-1 text-yellow-400 font-bold text-lg">
                <DollarSign className="w-5 h-5" />
                <span>R{request.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Dedication */}
            {request.dedication && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-1">💌 Dedication:</p>
                <p className="text-sm text-gray-300 italic">"{request.dedication}"</p>
              </div>
            )}
          </div>

          {/* Veto Reason Section */}
          <div>
            <label className="block text-white font-bold mb-3">
              Reason (optional but recommended)
            </label>

            {/* Quick Select Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {QUICK_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleQuickSelect(reason)}
                  disabled={isProcessing}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedReason === reason
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } disabled:opacity-50`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {/* Custom Text Input */}
            <div className="relative">
              <textarea
                value={customReason}
                onChange={(e) => {
                  if (e.target.value.length <= maxChars) {
                    setCustomReason(e.target.value);
                    setSelectedReason('');
                    setShowWarning(false);
                  }
                }}
                placeholder="Why are you vetoing? (optional)"
                disabled={isProcessing}
                maxLength={maxChars}
                rows={3}
                className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none disabled:opacity-50"
              />
              
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs ${showWarning ? 'text-amber-400' : 'text-gray-500'}`}>
                  {showWarning && '⚠️ Consider adding reason for transparency'}
                </span>
                <span className={`text-xs ${characterCount > maxChars * 0.9 ? 'text-yellow-400' : 'text-gray-500'}`}>
                  {characterCount}/{maxChars}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Section */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <p className="text-yellow-400 font-medium text-sm">
                  This action cannot be undone
                </p>
                <p className="text-gray-400 text-xs">
                  User will be automatically refunded R{request.price.toFixed(2)} within 5-10 business days
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing veto...</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span>Confirm Veto</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
