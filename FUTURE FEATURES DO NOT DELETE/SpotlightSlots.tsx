/**
 * Spotlight Slots Component
 * Premium, limited-availability priority request slots
 * CORE VALUE PROP: "Dynamic Priority Slots - limited premium slots at higher price"
 */

import React, { useState, useEffect } from 'react';
import { Star, Clock, Zap, TrendingUp } from 'lucide-react';

interface SpotlightSlot {
  slotNumber: number;
  isAvailable: boolean;
  expiresAt?: number;
  requestId?: string;
  songTitle?: string;
}

interface SpotlightSlotsProps {
  slotsPerBlock: number; // e.g., 1 per 15 minutes
  blockDurationMinutes: number; // e.g., 15
  basePrice: number;
  spotlightMultiplier: number; // e.g., 2.5x
  currentSlots: SpotlightSlot[];
  onPurchaseSlot: (slotNumber: number) => void;
  className?: string;
}

export const SpotlightSlots: React.FC<SpotlightSlotsProps> = ({
  slotsPerBlock,
  blockDurationMinutes,
  basePrice,
  spotlightMultiplier,
  currentSlots,
  onPurchaseSlot,
  className = '',
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Calculate time remaining in current block
      const now = Date.now();
      const blockMs = blockDurationMinutes * 60 * 1000;
      const elapsed = now % blockMs;
      const remaining = blockMs - elapsed;
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [blockDurationMinutes]);

  const spotlightPrice = Math.round(basePrice * spotlightMultiplier);
  const availableSlots = currentSlots.filter(s => s.isAvailable).length;
  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  return (
    <div className={`bg-gradient-to-br from-gold-500/20 to-orange-500/20 border-2 border-gold-500 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Spotlight Slots</h3>
            <p className="text-sm text-gold-700 dark:text-gold-300">Premium Priority Requests</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gold-600 dark:text-gold-400">
            R{spotlightPrice}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {spotlightMultiplier}x base price
          </div>
        </div>
      </div>

      {/* Availability Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-gold-600" />
            <span className="font-semibold text-gray-900 dark:text-white">
              {availableSlots} of {slotsPerBlock} Available
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="font-mono">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-1000"
            style={{ width: `${((slotsPerBlock - availableSlots) / slotsPerBlock) * 100}%` }}
          />
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Resets every {blockDurationMinutes} minutes
        </p>
      </div>

      {/* Slot Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {currentSlots.map((slot) => (
          <button
            key={slot.slotNumber}
            onClick={() => slot.isAvailable && onPurchaseSlot(slot.slotNumber)}
            disabled={!slot.isAvailable}
            className={`p-4 rounded-lg border-2 transition-all ${
              slot.isAvailable
                ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20 hover:bg-gold-100 dark:hover:bg-gold-900/30 cursor-pointer'
                : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Slot #{slot.slotNumber}
              </span>
              {slot.isAvailable ? (
                <Star className="w-5 h-5 text-gold-600" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-red-500" />
              )}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {slot.isAvailable ? (
                <span className="text-green-600 dark:text-green-400 font-medium">Available Now</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">Reserved</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Benefits */}
      <div className="bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-lg p-4">
        <h4 className="font-semibold text-gold-900 dark:text-gold-300 mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Spotlight Benefits:
        </h4>
        <ul className="text-sm text-gold-800 dark:text-gold-400 space-y-1">
          <li>• Guaranteed to play next in queue</li>
          <li>• Limited availability creates exclusivity</li>
          <li>• Perfect for special moments</li>
          <li>• Skip the regular queue entirely</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Spotlight Settings Manager for DJ Portal
 */
interface SpotlightSettingsProps {
  slotsPerBlock: number;
  blockDurationMinutes: number;
  priceMultiplier: number;
  onSave: (settings: {
    slotsPerBlock: number;
    blockDurationMinutes: number;
    priceMultiplier: number;
  }) => Promise<void>;
  className?: string;
}

export const SpotlightSettings: React.FC<SpotlightSettingsProps> = ({
  slotsPerBlock,
  blockDurationMinutes,
  priceMultiplier,
  onSave,
  className = '',
}) => {
  const [localSlots, setLocalSlots] = useState(slotsPerBlock);
  const [localDuration, setLocalDuration] = useState(blockDurationMinutes);
  const [localMultiplier, setLocalMultiplier] = useState(priceMultiplier);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        slotsPerBlock: localSlots,
        blockDurationMinutes: localDuration,
        priceMultiplier: localMultiplier,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gold-100 dark:bg-gold-900/30 rounded-full flex items-center justify-center">
          <Star className="w-6 h-6 text-gold-600 dark:text-gold-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Spotlight Settings</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Configure premium slots</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Slots Per Time Block
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={localSlots}
            onChange={(e) => setLocalSlots(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            How many spotlight slots available per block (recommended: 1-2)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Block Duration (minutes)
          </label>
          <select
            value={localDuration}
            onChange={(e) => setLocalDuration(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            How often slots reset
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Price Multiplier
          </label>
          <input
            type="number"
            min="1.5"
            max="5"
            step="0.5"
            value={localMultiplier}
            onChange={(e) => setLocalMultiplier(parseFloat(e.target.value) || 2)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Multiply base price by this amount (recommended: 2-3x)
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full mt-6 px-6 py-3 bg-gold-600 hover:bg-gold-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving...' : 'Save Spotlight Settings'}
      </button>
    </div>
  );
};
