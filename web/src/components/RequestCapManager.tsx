/**
 * Request Cap Manager Component
 * Implements "Sold Out" mode and request caps per hour/set
 * CORE VALUE PROP: "Intelligent Queue Management - Request Caps & Sold Out Mode"
 */

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

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
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Request Management</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Control queue capacity</p>
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Hour Progress
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {currentRequestCount} / {requestCapPerHour}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
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

        {/* Status Message */}
        <div className="mt-3 flex items-center gap-2">
          {isAtCap ? (
            <>
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">
                Request cap reached - Queue is full
              </span>
            </>
          ) : isNearingCap ? (
            <>
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-600">
                Nearing capacity - {requestCapPerHour - currentRequestCount} slots remaining
              </span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                Queue healthy - {requestCapPerHour - currentRequestCount} slots available
              </span>
            </>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Requests Per Hour Cap
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={localCap}
            onChange={(e) => setLocalCap(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Maximum number of requests you can handle per hour
          </p>
        </div>

        {/* Sold Out Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Manual "Sold Out" Mode</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Temporarily disable new requests
            </p>
          </div>
          <button
            onClick={() => setLocalSoldOut(!localSoldOut)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localSoldOut ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localSoldOut ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• When cap is reached, audience sees "Sold Out" message</li>
          <li>• Prevents queue overload and unplayable requests</li>
          <li>• Resets automatically each hour</li>
          <li>• Manual override available for breaks or set changes</li>
        </ul>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving || (localCap === requestCapPerHour && localSoldOut === isSoldOut)}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
