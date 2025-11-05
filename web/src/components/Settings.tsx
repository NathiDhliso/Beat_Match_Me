/**
 * Settings Component
 * User preferences and configuration
 */

import React, { useState, useEffect } from 'react';
import { Bell, HelpCircle, X, ChevronRight } from 'lucide-react';
import { requestNotificationPermission } from '../services/notifications';

interface SettingsProps {
  onClose: () => void;
  mode?: 'fan' | 'dj';
}

export const Settings: React.FC<SettingsProps> = ({ onClose, mode = 'fan' }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // Check current notification permission status
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      // Can't programmatically revoke, show instructions
      alert('To disable notifications, go to your browser settings:\n\nChrome: Settings > Privacy > Site Settings > Notifications\nSafari: Safari > Preferences > Websites > Notifications');
      return;
    }

    setIsRequesting(true);
    try {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
      
      if (granted) {
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-down';
        toast.textContent = '✓ Notifications enabled!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 w-full sm:max-w-md sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Settings List */}
        <div className="p-6 space-y-4">
          
          {/* Notifications Toggle */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold mb-1">Push Notifications</h3>
                  <p className="text-gray-400 text-sm">
                    {mode === 'fan' 
                      ? 'Get notified when your song is coming up in the queue'
                      : 'Get notified about new requests and queue updates'}
                  </p>
                </div>
              </div>
              
              {/* Toggle Switch */}
              <button
                onClick={handleToggleNotifications}
                disabled={isRequesting}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  notificationsEnabled ? 'bg-purple-600' : 'bg-gray-700'
                } ${isRequesting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            {notificationsEnabled && (
              <div className="mt-3 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-xs">✓ You'll be notified about important updates</p>
              </div>
            )}
          </div>

          {/* Help & Support */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <button 
              onClick={() => {
                // Open help in new window or show help modal
                window.open('mailto:support@beatmatchme.com', '_blank');
              }}
              className="flex items-center justify-between w-full group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold">Help & Support</h3>
                  <p className="text-gray-400 text-sm">Get help or contact support</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* App Version */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-gray-500 text-xs">BeatMatchMe v1.0.0</p>
            <p className="text-gray-600 text-xs mt-1">© 2025 All rights reserved</p>
          </div>
        </div>

        {/* Close Button */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
