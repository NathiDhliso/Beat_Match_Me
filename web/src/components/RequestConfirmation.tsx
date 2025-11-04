/**
 * Request Confirmation Component
 * Feature 3: Submit a Song Request with Payment
 * Comprehensive confirmation screen with pricing breakdown, tier discounts, and Fair-Play Promise
 */

import React, { useState } from 'react';
import { Music, Info, X, Zap, Shield, CheckCircle } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  duration?: string;
  basePrice: number;
  albumArt?: string;
}

interface RequestConfirmationProps {
  song: Song;
  userTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  estimatedQueuePosition?: number;
  estimatedWaitTime?: string;
  onConfirm: (data: RequestData) => Promise<void>;
  onCancel: () => void;
}

interface RequestData {
  songId: string;
  requestType: 'standard' | 'spotlight';
  dedication?: string;
  totalAmount: number;
}

const TIER_MULTIPLIERS = {
  BRONZE: 1.0,
  SILVER: 0.9,
  GOLD: 0.8,
  PLATINUM: 0.7,
};

const TIER_COLORS = {
  BRONZE: '#cd7f32',
  SILVER: '#c0c0c0',
  GOLD: '#ffd700',
  PLATINUM: '#e5e4e2',
};

export const RequestConfirmation: React.FC<RequestConfirmationProps> = ({
  song,
  userTier = 'BRONZE',
  estimatedQueuePosition = 8,
  estimatedWaitTime = '~25 minutes',
  onConfirm,
  onCancel,
}) => {
  const [requestType, setRequestType] = useState<'standard' | 'spotlight'>('standard');
  const [showDedication, setShowDedication] = useState(false);
  const [dedication, setDedication] = useState('');
  const [showFairPlayModal, setShowFairPlayModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const SPOTLIGHT_PRICE = 75;
  const DEDICATION_PRICE = 10;
  
  const tierMultiplier = TIER_MULTIPLIERS[userTier];
  const tierDiscount = Math.round((1 - tierMultiplier) * 100);

  const calculateTotal = () => {
    const discountedBase = song.basePrice * tierMultiplier;
    const spotlight = requestType === 'spotlight' ? SPOTLIGHT_PRICE : 0;
    const dedicationFee = showDedication ? DEDICATION_PRICE : 0;
    return discountedBase + spotlight + dedicationFee;
  };

  const validateDedication = (text: string) => {
    const inappropriateWords = ['badword1', 'badword2']; // Add actual filter
    return inappropriateWords.some(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm({
        songId: song.id,
        requestType,
        dedication: showDedication ? dedication : undefined,
        totalAmount: calculateTotal(),
      });
    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const total = calculateTotal();
  const hasWarning = showDedication && validateDedication(dedication);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white">Confirm Request</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Song Info with Album Art */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 text-center border border-purple-500/30">
            {song.albumArt ? (
              <img
                src={song.albumArt}
                alt={song.title}
                className="w-48 h-48 mx-auto rounded-xl mb-4 object-cover"
              />
            ) : (
              <div className="w-48 h-48 mx-auto rounded-xl mb-4 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Music className="w-24 h-24 text-white/50" />
              </div>
            )}
            
            <h3 className="text-3xl font-bold text-white mb-2">{song.title}</h3>
            <p className="text-xl text-gray-300 mb-3">{song.artist}</p>
            
            <div className="flex items-center justify-center gap-3 mb-2">
              {song.genre && (
                <span className="px-3 py-1 bg-purple-600 rounded-full text-sm text-white font-semibold">
                  {song.genre}
                </span>
              )}
              {song.duration && (
                <span className="text-gray-400 text-sm">{song.duration}</span>
              )}
            </div>
            
            <p className="text-gray-400 text-sm">Base Price: R{song.basePrice}</p>
          </div>

          {/* User Tier Badge */}
          <div
            className="rounded-xl p-4 flex justify-between items-center"
            style={{ backgroundColor: TIER_COLORS[userTier] + '40' }}
          >
            <div>
              <p className="text-white font-bold text-lg">{userTier} MEMBER</p>
              <p className="text-white/80 text-sm">
                {tierDiscount > 0 ? `${tierDiscount}% Discount` : 'No Discount'}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: TIER_COLORS[userTier] }}
            >
              <span className="text-white font-bold text-xl">
                {userTier.charAt(0)}
              </span>
            </div>
          </div>

          {/* Estimated Queue Info */}
          <div className="bg-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Estimated Queue Position:</span>
              <span className="text-white font-bold">#{estimatedQueuePosition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Estimated Wait Time:</span>
              <span className="text-white font-bold">{estimatedWaitTime}</span>
            </div>
          </div>

          {/* Fair-Play Promise */}
          <button
            onClick={() => setShowFairPlayModal(true)}
            className="w-full bg-green-600 hover:bg-green-700 rounded-xl p-4 flex items-center gap-3 transition-colors"
          >
            <Shield className="w-6 h-6 text-white" />
            <div className="flex-1 text-left">
              <p className="text-white font-bold">Fair-Play Promise</p>
              <p className="text-green-100 text-sm">Full refund if DJ vetoes</p>
            </div>
            <Info className="w-5 h-5 text-white" />
          </button>

          <div className="border-t border-gray-700 my-6" />

          {/* Request Type Selection */}
          <div>
            <h4 className="text-lg font-bold text-white mb-3">Request Type</h4>
            
            <div className="space-y-3">
              <button
                onClick={() => setRequestType('standard')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  requestType === 'standard'
                    ? 'border-purple-500 bg-purple-900/30'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <p className="text-white font-bold">Standard Request</p>
                    <p className="text-gray-400 text-sm">Added to queue in order</p>
                  </div>
                  <p className="text-purple-400 font-bold text-xl">
                    R{(song.basePrice * tierMultiplier).toFixed(2)}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setRequestType('spotlight')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  requestType === 'spotlight'
                    ? 'border-yellow-500 bg-yellow-900/30'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <p className="text-white font-bold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      Spotlight Slot
                    </p>
                    <p className="text-gray-400 text-sm">Priority placement</p>
                  </div>
                  <p className="text-yellow-400 font-bold text-xl">+R{SPOTLIGHT_PRICE}</p>
                </div>
              </button>
            </div>
          </div>

          {/* Optional Add-ons */}
          <div>
            <h4 className="text-lg font-bold text-white mb-3">Optional Add-ons</h4>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowDedication(!showDedication)}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  showDedication
                    ? 'border-pink-500 bg-pink-900/30'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <span className="text-white font-semibold">💝 Dedication Message</span>
                <span className="text-pink-400 font-bold">+R{DEDICATION_PRICE}</span>
              </button>

              {showDedication && (
                <div className="space-y-2">
                  <textarea
                    value={dedication}
                    onChange={(e) => setDedication(e.target.value.substring(0, 100))}
                    placeholder="Your dedication message (max 100 characters)"
                    className={`w-full px-4 py-3 bg-gray-800 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none resize-none ${
                      dedication.length > 100
                        ? 'border-red-500'
                        : hasWarning
                        ? 'border-yellow-500'
                        : 'border-gray-700 focus:border-purple-500'
                    }`}
                    rows={3}
                    maxLength={100}
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${dedication.length > 100 ? 'text-red-400' : 'text-gray-400'}`}>
                      {dedication.length}/100
                    </span>
                    {hasWarning && (
                      <span className="text-yellow-400 text-sm flex items-center gap-1">
                        ⚠️ Message may be rejected by DJ
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-gray-800 rounded-xl p-6 space-y-3">
            <h4 className="text-lg font-bold text-white mb-4">Pricing Breakdown</h4>
            
            <div className="flex justify-between text-gray-400">
              <span>Base Price:</span>
              <span>R{song.basePrice}</span>
            </div>
            
            <div className="flex justify-between text-gray-400">
              <span>Tier Multiplier ({userTier}):</span>
              <span>×{tierMultiplier.toFixed(1)}</span>
            </div>
            
            {requestType === 'spotlight' && (
              <div className="flex justify-between text-yellow-400">
                <span>Spotlight:</span>
                <span>+R{SPOTLIGHT_PRICE}</span>
              </div>
            )}
            
            {showDedication && (
              <div className="flex justify-between text-pink-400">
                <span>Dedication:</span>
                <span>+R{DEDICATION_PRICE}</span>
              </div>
            )}
            
            <div className="border-t border-gray-700 my-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-white">Total:</span>
              <span className="text-3xl font-bold text-green-400">
                R{total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 animate-pulse-glow"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Confirm & Pay R{total.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Fair-Play Modal */}
      {showFairPlayModal && (
        <div className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-8 h-8 text-green-400" />
              Your Money is Protected
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <p className="text-gray-300">
                  If DJ vetoes your request for any reason, you get an automatic full refund
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <p className="text-gray-300">
                  Refunds process within 5-10 business days
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <p className="text-gray-300">
                  No questions asked - your satisfaction is guaranteed
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowFairPlayModal(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-bold transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
