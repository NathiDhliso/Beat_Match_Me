/**
 * Offline Indicator Component
 * Phase 10: Offline Handling
 * Shows a persistent banner when the user loses internet connection
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      // Hide "reconnected" message after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't render anything if online and not showing reconnected message
  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isOnline ? 'translate-y-0' : 'translate-y-0'
      }`}
      style={{
        backgroundColor: isOnline ? 'rgb(34 197 94)' : 'rgb(239 68 68)', // green-600 : red-500
        minHeight: '44px', // Phase 7: Touch-friendly
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5 text-white animate-pulse" />
            <p className="text-white font-semibold text-sm">
              ✓ Back online! Syncing data...
            </p>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5 text-white animate-pulse" />
            <p className="text-white font-semibold text-sm">
              No internet connection - Some features may be limited
            </p>
          </>
        )}
      </div>

      {/* Progress bar for offline indicator */}
      {!isOnline && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-900">
          <div
            className="h-full bg-white animate-pulse"
            style={{ width: '30%' }}
          />
        </div>
      )}

      {/* Auto-dismiss animation for "reconnected" */}
      {isOnline && showReconnected && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: 'rgb(21 128 61)' }} // green-700
        >
          <div
            className="h-full bg-white transition-all duration-3000 ease-linear"
            style={{
              width: '0%',
              animation: 'shrink 3s linear forwards'
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
