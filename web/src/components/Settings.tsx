/**
 * Settings Component
 * User preferences and configuration
 * Phase 3: CSS Modularization - Using CSS Modules
 */

import React, { useState, useEffect } from 'react';
import { Bell, HelpCircle, X, ChevronRight } from 'lucide-react';
import { requestNotificationPermission } from '../services/notifications';
import { useTheme } from '../context/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';
import styles from './Settings.module.css';

interface SettingsProps {
  onClose: () => void;
  mode?: 'fan' | 'dj';
}

export const Settings: React.FC<SettingsProps> = ({ onClose, mode = 'fan' }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const { currentTheme, isDark, toggleDarkMode } = useTheme();

  // Phase 7: Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px) to trigger close
  const minSwipeDistance = 50;

  // Check current notification permission status
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Phase 4: Add ESC key listener for dismissing the panel
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  // Phase 7: Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -minSwipeDistance; // Swipe right to close
    
    if (isRightSwipe) {
      onClose();
    }
  };

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
    <div 
      className={styles.overlay}
      onClick={onClose}
    >
      <div 
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header - Now theme-aware! */}
        <div 
          className={styles.header}
          style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})` }}
        >
          <h2 className={styles.headerTitle}>Settings</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Settings List */}
        <div className={styles.content}>
          
          {/* Theme Switcher Section */}
          <div className={styles.settingCard}>
            <ThemeSwitcher />
          </div>

          {/* Dark/Light Mode Toggle */}
          <div className={styles.settingCard}>
            <div className={styles.settingRow}>
              <div>
                <h3 className={styles.settingTitle}>Dark Mode</h3>
                <p className={styles.settingDescription}>Switch between dark and light interface</p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`${styles.darkModeToggle} ${isDark ? '' : styles.darkModeToggleOff}`}
                style={isDark ? { background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})` } : {}}
              >
                <span className={`${styles.darkModeKnob} ${isDark ? styles.darkModeKnobOn : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Notifications Toggle */}
          <div className={styles.settingCard}>
            <div className={styles.settingRowStart}>
              <div className={styles.settingInfo}>
                <div 
                  className={styles.settingIcon}
                  style={{ backgroundColor: `${currentTheme.primary}33` }}
                >
                  <Bell className="w-5 h-5" style={{ color: currentTheme.accent }} />
                </div>
                <div className={styles.settingText}>
                  <h3 className={styles.settingTitle}>Push Notifications</h3>
                  <p className={styles.settingDescription}>
                    {mode === 'fan' 
                      ? 'Get notified when your song is coming up in the queue'
                      : 'Get notified about new requests and queue updates'}
                  </p>
                </div>
              </div>
              
              {/* Toggle Switch - Theme-aware */}
              <button
                onClick={handleToggleNotifications}
                disabled={isRequesting}
                className={`${styles.toggleSwitch} ${notificationsEnabled ? '' : styles.toggleSwitchOff}`}
                style={notificationsEnabled ? {
                  backgroundColor: currentTheme.primary,
                  ['--theme-primary' as string]: currentTheme.primary,
                } : {}}
              >
                <span className={`${styles.toggleKnob} ${notificationsEnabled ? styles.toggleKnobOn : ''}`} />
              </button>
            </div>
            
            {notificationsEnabled && (
              <div className={styles.successBadge}>
                <p className={styles.successText}>✓ You'll be notified about important updates</p>
              </div>
            )}
          </div>

          {/* Help & Support */}
          <div className={styles.settingCard}>
            <button 
              onClick={() => {
                // Open help in new window or show help modal
                window.open('mailto:support@beatmatchme.com', '_blank');
              }}
              className={styles.helpButton}
            >
              <div className={styles.settingInfo}>
                <div className={styles.settingIcon} style={{ backgroundColor: 'rgb(59 130 246 / 0.2)' }}>
                  <HelpCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div className={styles.settingText}>
                  <h3 className={styles.settingTitle}>Help & Support</h3>
                  <p className={styles.settingDescription}>Get help or contact support</p>
                </div>
              </div>
              <ChevronRight className={styles.chevronIcon} />
            </button>
          </div>

          {/* App Version */}
          <div className={styles.footer}>
            <p className={styles.versionText}>BeatMatchMe v1.0.0</p>
            <p className={styles.copyrightText}>© 2025 All rights reserved</p>
          </div>
        </div>

        {/* Close Button */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className={styles.actionButton}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
