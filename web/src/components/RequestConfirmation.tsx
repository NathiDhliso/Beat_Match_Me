/**
 * Request Confirmation Component
 * Feature 3: Submit a Song Request with Payment
 * Comprehensive confirmation screen with pricing breakdown, tier discounts, and Fair-Play Promise
 * Phase 8: Performance - Lazy loaded album art
 */

import React, { useState } from 'react';
import { Music, Info, X, Zap, Shield, CheckCircle } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useTheme, useThemeClasses } from '../context/ThemeContext';
import type { UserTier } from '../theme/tokens';
import { getTierColor, getTierDiscount, getTierBackgroundColor } from '../theme/tokens';

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
  userTier?: UserTier;
  estimatedQueuePosition?: number;
  estimatedWaitTime?: string;
  onConfirm: (data: RequestData) => Promise<void>;
  onCancel: () => void;
}

interface RequestData {
  songId: string;
  requestType: 'standard' | 'spotlight';
  dedication?: string;
  shoutout?: string;  // NEW: Optional shoutout message
  totalAmount: number;
}

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
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use centralized theme system
  const { currentTheme } = useTheme();
  const themeClasses = useThemeClasses();
  const tierColor = getTierColor(userTier);
  const tierMultiplier = getTierDiscount(userTier);

  const SPOTLIGHT_PRICE = 75;
  const DEDICATION_PRICE = 10;
  
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
              <LazyLoadImage
                src={song.albumArt}
                alt={song.title}
                className="w-48 h-48 mx-auto rounded-xl mb-4 object-cover"
                effect="blur"
                width={192}
                height={192}
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
                <span 
                  className="px-3 py-1 rounded-full text-sm text-white font-semibold"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  {song.genre}
                </span>
              )}
              {song.duration && (
                <span className="text-gray-400 text-sm">{song.duration}</span>
              )}
            </div>
            
            <p className="text-gray-400 text-sm">Base Price: R{song.basePrice}</p>
          </div>

          {/* User Tier Badge - Now using centralized tier colors! */}
          <div
            className="rounded-xl p-4 flex justify-between items-center"
            style={{ backgroundColor: getTierBackgroundColor(userTier, 0.25) }}
          >
            <div>
              <p className="text-white font-bold text-lg">{userTier} MEMBER</p>
              <p className="text-white/80 text-sm">
                {tierDiscount > 0 ? `${tierDiscount}% Discount` : 'No Discount'}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: tierColor.hex }}
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

          {/* Fair-Play Promise - Inline Expandable */}
          <details className="w-full bg-green-600/10 border border-green-600/30 rounded-xl overflow-hidden group">
            <summary className="cursor-pointer p-4 flex items-center gap-3 hover:bg-green-600/20 transition-colors list-none">
              <Shield className="w-6 h-6 text-green-400" />
              <div className="flex-1 text-left">
                <p className="text-white font-bold">Fair-Play Promise</p>
                <p className="text-green-100 text-sm">Full refund if DJ vetoes</p>
              </div>
              <Info className="w-5 h-5 text-green-400 group-open:rotate-180 transition-transform" />
            </summary>
            
            <div className="px-4 pb-4 pt-2 space-y-3 border-t border-green-600/20">
              <p className="text-sm font-semibold text-green-400 mb-3">Your Money is Protected:</p>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">
                  If DJ vetoes your request for any reason, you get an automatic full refund
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">
                  Refunds process within 5-10 business days
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">
                  No questions asked - your satisfaction is guaranteed
                </p>
              </div>
            </div>
          </details>

          <div className="border-t border-gray-700 my-6" />

          {/* Request Type Selection */}
          <div>
            <h4 className="text-lg font-bold text-white mb-3">Request Type</h4>
            
            <div className="space-y-3">
              <button
                onClick={() => setRequestType('standard')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  requestType === 'standard'
                    ? 'bg-opacity-30'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
                style={requestType === 'standard' ? {
                  borderColor: currentTheme.primary,
                  backgroundColor: `${currentTheme.primary}33`
                } : {}}
              >
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <p className="text-white font-bold">Standard Request</p>
                    <p className="text-gray-400 text-sm">Added to queue in order</p>
                  </div>
                  <p 
                    className="font-bold text-xl"
                    style={{ color: currentTheme.accent }}
                  >
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
                        : 'border-gray-700'
                    }`}
                    style={dedication.length <= 100 && !hasWarning ? {
                      ['--tw-ring-color' as string]: currentTheme.primary,
                    } as React.CSSProperties : {}}
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

          {/* Enhanced Pricing Breakdown - Phase 6: Price Transparency */}
          <div 
            className="rounded-xl p-6 space-y-3 border-2"
            style={{ 
              backgroundColor: `${currentTheme.primary}08`,
              borderColor: `${currentTheme.primary}30`
            }}
          >
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              💰 Pricing Breakdown
            </h4>
            
            {/* Base Price */}
            <div className="flex justify-between items-center text-gray-300">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-gray-400" />
                <span>Base Song Price:</span>
              </div>
              <span className="font-semibold">R{song.basePrice.toFixed(2)}</span>
            </div>
            
            {/* Tier Discount - Show savings prominently */}
            {tierDiscount > 0 ? (
              <div 
                className="flex justify-between items-center p-3 rounded-lg"
                style={{ backgroundColor: `${tierColor.hex}20` }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: tierColor.hex }}
                  >
                    {userTier.charAt(0)}
                  </div>
                  <span className="font-semibold" style={{ color: tierColor.hex }}>
                    {userTier} Member Discount ({tierDiscount}%):
                  </span>
                </div>
                <span className="font-bold" style={{ color: tierColor.hex }}>
                  -R{(song.basePrice * (1 - tierMultiplier)).toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center text-gray-400 text-sm">
                <span>💡 Upgrade your tier to unlock discounts!</span>
              </div>
            )}
            
            {/* Discounted Base Price */}
            <div className="flex justify-between items-center text-white bg-gray-800/50 p-3 rounded-lg">
              <span className="font-semibold">Discounted Song Price:</span>
              <span className="font-bold text-lg">R{(song.basePrice * tierMultiplier).toFixed(2)}</span>
            </div>
            
            {/* Spotlight Add-on */}
            {requestType === 'spotlight' && (
              <div className="flex justify-between items-center text-yellow-400 bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="font-semibold">Spotlight Priority:</span>
                </div>
                <span className="font-bold">+R{SPOTLIGHT_PRICE.toFixed(2)}</span>
              </div>
            )}
            
            {/* Dedication Add-on */}
            {showDedication && (
              <div className="flex justify-between items-center text-pink-400 bg-pink-900/20 p-3 rounded-lg border border-pink-500/30">
                <div className="flex items-center gap-2">
                  <span>💝</span>
                  <span className="font-semibold">Dedication Message:</span>
                </div>
                <span className="font-bold">+R{DEDICATION_PRICE.toFixed(2)}</span>
              </div>
            )}
            
            {/* Total with prominent styling */}
            <div className="border-t-2 border-gray-700 my-2" />
            
            <div 
              className="flex justify-between items-center p-4 rounded-xl"
              style={{ 
                background: `linear-gradient(135deg, ${currentTheme.primary}15, ${currentTheme.accent}15)`
              }}
            >
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide">Total Amount</p>
                <p className="text-xs text-gray-500 mt-1">
                  {tierDiscount > 0 && `You saved R${(song.basePrice * (1 - tierMultiplier)).toFixed(2)}!`}
                </p>
              </div>
              <div className="text-right">
                <p 
                  className="text-4xl font-bold"
                  style={{ color: currentTheme.accent }}
                >
                  R{total.toFixed(2)}
                </p>
                {tierDiscount === 0 && (
                  <p className="text-xs text-gray-400 mt-1">Original Price</p>
                )}
              </div>
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
              className={`flex-1 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${themeClasses.gradientPrimary} hover:opacity-90`}
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

      {/* Fair-Play modal removed - now inline expandable section */}
    </div>
  );
};
