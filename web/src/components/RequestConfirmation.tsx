/**
 * Request Confirmation Component
 * Optimized for club environments - minimal UI with expandable details
 */

import React, { useState } from 'react';
import { Music, X, Zap, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { HapticFeedback } from '../utils/haptics';
import styles from './RequestConfirmation.module.css';
import { useTheme, useThemeClasses } from '../context/ThemeContext';
import type { UserTier } from '../theme/tokens';
import { getTierColor, getTierDiscount } from '../theme/tokens';

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
  shoutout?: string;
  totalAmount: number;
}

export const RequestConfirmation: React.FC<RequestConfirmationProps> = ({
  song,
  userTier = 'BRONZE',
  estimatedQueuePosition = 8,
  estimatedWaitTime = '~25 min',
  onConfirm,
  onCancel,
}) => {
  const [requestType, setRequestType] = useState<'standard' | 'spotlight'>('standard');
  const [showDetails, setShowDetails] = useState(false);
  const [showDedication, setShowDedication] = useState(false);
  const [dedication, setDedication] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  const handleConfirm = async () => {
    HapticFeedback.buttonLongPress();
    setIsProcessing(true);
    try {
      await onConfirm({
        songId: song.id,
        requestType,
        dedication: showDedication ? dedication : undefined,
        totalAmount: calculateTotal(),
      });
      HapticFeedback.paymentSuccess();
    } catch (error) {
      console.error('Request failed:', error);
      HapticFeedback.paymentError();
    } finally {
      setIsProcessing(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className={`fixed inset-0 bg-black/90 backdrop-blur-md z-40 flex items-end sm:items-center justify-center ${styles.lazyBlur}`}>
      <div className="bg-gray-900 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] overflow-hidden">
        
        {/* Compact Header - Song Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            {/* Album Art - Small */}
            {song.albumArt ? (
              <LazyLoadImage
                src={song.albumArt}
                alt={song.title}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                effect="blur"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Music className="w-8 h-8 text-white/70" />
              </div>
            )}
            
            {/* Song Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white truncate">{song.title}</h3>
              <p className="text-gray-400 truncate">{song.artist}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                  #{estimatedQueuePosition} • {estimatedWaitTime}
                </span>
              </div>
            </div>
            
            {/* Close */}
            <button onClick={onCancel} className="p-2 text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[50vh]">
          
          {/* Quick Request Type Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setRequestType('standard')}
              className={`p-3 rounded-xl border-2 transition-all ${
                requestType === 'standard'
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-700 bg-gray-800'
              }`}
            >
              <p className="text-white font-bold text-lg">R{(song.basePrice * tierMultiplier).toFixed(0)}</p>
              <p className="text-gray-400 text-xs">Standard</p>
            </button>
            
            <button
              onClick={() => setRequestType('spotlight')}
              className={`p-3 rounded-xl border-2 transition-all ${
                requestType === 'spotlight'
                  ? 'border-yellow-500 bg-yellow-500/20'
                  : 'border-gray-700 bg-gray-800'
              }`}
            >
              <p className="text-yellow-400 font-bold text-lg flex items-center justify-center gap-1">
                <Zap className="w-4 h-4" />
                R{(song.basePrice * tierMultiplier + SPOTLIGHT_PRICE).toFixed(0)}
              </p>
              <p className="text-gray-400 text-xs">Priority</p>
            </button>
          </div>

          {/* Dedication Toggle - Compact */}
          <button
            onClick={() => setShowDedication(!showDedication)}
            className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between ${
              showDedication ? 'border-pink-500 bg-pink-500/10' : 'border-gray-700 bg-gray-800'
            }`}
          >
            <span className="text-white">💝 Add Dedication</span>
            <span className="text-pink-400 font-bold">+R{DEDICATION_PRICE}</span>
          </button>

          {showDedication && (
            <textarea
              value={dedication}
              onChange={(e) => setDedication(e.target.value.substring(0, 100))}
              placeholder="Your message..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 resize-none"
              rows={2}
              maxLength={100}
            />
          )}

          {/* Expandable Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-gray-400 text-sm py-2"
          >
            <span>View pricing details</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDetails && (
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Base price</span>
                <span>R{song.basePrice}</span>
              </div>
              {tierDiscount > 0 && (
                <div className="flex justify-between" style={{ color: tierColor.hex }}>
                  <span>{userTier} discount ({tierDiscount}%)</span>
                  <span>-R{(song.basePrice * (1 - tierMultiplier)).toFixed(2)}</span>
                </div>
              )}
              {requestType === 'spotlight' && (
                <div className="flex justify-between text-yellow-400">
                  <span>Spotlight priority</span>
                  <span>+R{SPOTLIGHT_PRICE}</span>
                </div>
              )}
              {showDedication && (
                <div className="flex justify-between text-pink-400">
                  <span>Dedication</span>
                  <span>+R{DEDICATION_PRICE}</span>
                </div>
              )}
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex items-center gap-2 text-green-400">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs">Full refund if DJ vetoes</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom - Total & Pay Button */}
        <div className="p-4 border-t border-white/10 bg-gray-900">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              {tierDiscount > 0 && (
                <p className="text-xs" style={{ color: tierColor.hex }}>
                  {tierDiscount}% off applied
                </p>
              )}
            </div>
            <p className="text-3xl font-bold" style={{ color: currentTheme.accent }}>
              R{total.toFixed(0)}
            </p>
          </div>
          
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all disabled:opacity-50 ${themeClasses.gradientPrimary}`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Pay R{total.toFixed(0)}
              </span>
            )}
          </button>
          
          <button
            onClick={onCancel}
            className="w-full py-2 mt-2 text-gray-400 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
