/**
 * Request Cap Manager Component
 * Implements "Sold Out" mode and request caps per hour/set
 * CORE VALUE PROP: "Intelligent Queue Management - Request Caps & Sold Out Mode"
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface RequestCapManagerProps {
  currentRequestCount: number;
  requestCapPerHour: number;
  isSoldOut: boolean;
  onUpdateSettings: (settings: { requestCapPerHour: number; isSoldOut: boolean }) => Promise<void>;
  className?: string;
}

export const RequestCapManager: React.FC<RequestCapManagerProps> = ({
  currentRequestCount,
  requestCapPerHour,
  isSoldOut,
  onUpdateSettings,
  className = '',
}) => {
  const [localCap, setLocalCap] = useState(requestCapPerHour);
  const [localSoldOut, setLocalSoldOut] = useState(isSoldOut);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalCap(requestCapPerHour);
    setLocalSoldOut(isSoldOut);
  }, [requestCapPerHour, isSoldOut]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateSettings({
        requestCapPerHour: localCap,
        isSoldOut: localSoldOut,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const percentageFilled = requestCapPerHour > 0 
    ? Math.min((currentRequestCount / requestCapPerHour) * 100, 100)
    : 0;

  const isNearingCap = percentageFilled >= 80;
  const isAtCap = currentRequestCount >= requestCapPerHour;

  return (
    <div className={className}>
      {/* Current Status - Compact */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-medium text-gray-400">
            Current Hour Progress
          </span>
          <span className="text-xs sm:text-sm font-bold text-white">
            {currentRequestCount} / {requestCapPerHour}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isAtCap
                ? 'bg-red-600'
                : isNearingCap
                ? 'bg-yellow-600'
                : 'bg-green-600'
            }`}
            style={{ width: `${percentageFilled}%` }}
          />
        </div>

        {/* Status Message - Compact */}
        <div className="mt-2 flex items-center gap-1.5">
          {isAtCap ? (
            <>
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-medium text-red-600">
                Queue full
              </span>
            </>
          ) : isNearingCap ? (
            <>
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-medium text-yellow-600">
                {requestCapPerHour - currentRequestCount} slots left
              </span>
            </>
          ) : (
            <>
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-medium text-green-600">
                Queue healthy - {requestCapPerHour - currentRequestCount} slots available
              </span>
            </>
          )}
        </div>
      </div>

      {/* Settings - Compact Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-gray-400 mb-1">
            Requests Per Hour Cap
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={localCap}
            onChange={(e) => setLocalCap(parseInt(e.target.value) || 1)}
            className="w-full px-2 py-1 sm:px-3 sm:py-1.5 border border-white/10 rounded-lg bg-white/5 text-white text-xs sm:text-sm"
          />
        </div>

        {/* Sold Out Toggle - Compact */}
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-gray-400 mb-1">
            Manual "Sold Out" Mode
          </label>
          <button
            onClick={() => setLocalSoldOut(!localSoldOut)}
            className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
              localSoldOut ? 'bg-red-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                localSoldOut ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save Button - Compact */}
      <button
        onClick={handleSave}
        disabled={isSaving || (localCap === requestCapPerHour && localSoldOut === isSoldOut)}
        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};

/**
 * Sold Out Banner for Audience View
 * Shows when requests are disabled
 */
interface SoldOutBannerProps {
  message?: string;
  className?: string;
}

export const SoldOutBanner: React.FC<SoldOutBannerProps> = ({
  message = "Request queue is currently full. Please check back soon!",
  className = '',
}) => {
  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-1">
            Requests Sold Out
          </h3>
          <p className="text-red-800 dark:text-red-400">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
