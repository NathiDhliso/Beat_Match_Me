/**
 * Settings Component
 * User preferences and configuration
 * Phase 3: CSS Modularization - Using CSS Modules
 */

import React, { useState, useEffect } from 'react';
import { Bell, X, ChevronRight, Vibrate, Moon, Sun, BookOpen, ChevronDown } from 'lucide-react';
import { HapticFeedback, getHapticIntensity, setHapticIntensity, isHapticSupported, type HapticIntensity } from '../utils/haptics';
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
  const [hapticIntensity, setHapticIntensityState] = useState<HapticIntensity>('medium');
  const [showGuide, setShowGuide] = useState(false);
  const { currentTheme, isDark, toggleDarkMode } = useTheme();
  const hapticSupported = isHapticSupported();

  // Phase 7: Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px) to trigger close
  const minSwipeDistance = 50;

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
    setHapticIntensityState(getHapticIntensity());
  }, []);

  const handleHapticChange = (intensity: HapticIntensity) => {
    setHapticIntensity(intensity);
    setHapticIntensityState(intensity);
    if (intensity !== 'off') {
      HapticFeedback.buttonPress();
    }
  };

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
            <div className={styles.settingRowStart}>
              <div className={styles.settingInfo}>
                <div 
                  className={styles.settingIcon}
                  style={{ backgroundColor: isDark ? 'rgb(59 130 246 / 0.2)' : 'rgb(251 191 36 / 0.2)' }}
                >
                  {isDark ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                </div>
                <div className={styles.settingText}>
                  <h3 className={styles.settingTitle}>{isDark ? 'Dark Mode' : 'Light Mode'}</h3>
                  <p className={styles.settingDescription}>Switch between dark and light interface</p>
                </div>
              </div>
              <button
                onClick={() => {
                  HapticFeedback.buttonPress();
                  toggleDarkMode();
                }}
                className={`${styles.darkModeToggle} ${isDark ? '' : styles.darkModeToggleOff}`}
                style={isDark ? { background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})` } : {}}
              >
                <span className={`${styles.darkModeKnob} ${isDark ? styles.darkModeKnobOn : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Haptic Feedback Toggle */}
          {hapticSupported && (
            <div className={styles.settingCard}>
              <div className={styles.settingRowStart}>
                <div className={styles.settingInfo}>
                  <div 
                    className={styles.settingIcon}
                    style={{ backgroundColor: 'rgb(168 85 247 / 0.2)' }}
                  >
                    <Vibrate className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className={styles.settingText}>
                    <h3 className={styles.settingTitle}>Haptic Feedback</h3>
                    <p className={styles.settingDescription}>Vibration on button presses and actions</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {(['off', 'low', 'medium', 'high'] as HapticIntensity[]).map((intensity) => (
                  <button
                    key={intensity}
                    onClick={() => handleHapticChange(intensity)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      hapticIntensity === intensity
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                    }`}
                  >
                    {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
          
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

          {/* How It Works Guide */}
          <div className={styles.settingCard}>
            <button 
              onClick={() => setShowGuide(!showGuide)}
              className={styles.helpButton}
            >
              <div className={styles.settingInfo}>
                <div className={styles.settingIcon} style={{ backgroundColor: 'rgb(168 85 247 / 0.2)' }}>
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <div className={styles.settingText}>
                  <h3 className={styles.settingTitle}>How It Works</h3>
                  <p className={styles.settingDescription}>Quick guide for {mode === 'dj' ? 'DJs' : 'fans'}</p>
                </div>
              </div>
              <ChevronDown className={`${styles.chevronIcon} transition-transform ${showGuide ? 'rotate-180' : ''}`} />
            </button>
            
            {showGuide && (
              <div className="mt-4 space-y-4 text-sm">
                {mode === 'dj' ? (
                  <>
                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <h4 className="font-semibold text-purple-400 mb-2">1. Create Event</h4>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Tap the music icon → Enter venue name and time → Create</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <h4 className="font-semibold text-blue-400 mb-2">2. Import Playlist</h4>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Swipe down to Library → Import from Spotify → Select songs fans can request</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-2">3. Go Live</h4>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Tap GO LIVE → Share QR code → Accept/veto requests as they come in</p>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <h4 className="font-semibold text-orange-400 mb-2">4. Get Paid</h4>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Payments go directly to your account. Swipe left to see revenue stats.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <h4 className="font-semibold text-purple-400 mb-2">1. Find Event</h4>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Scan the DJ's QR code or browse nearby events</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <h4 className="font-semibold text-blue-400 mb-2">2. Pick a Song</h4>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Browse the DJ's playlist → Tap a song to select it</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-2">3. Request & Pay</h4>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Tap REQUEST → Pay with card → Your song joins the queue!</p>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <h4 className="font-semibold text-orange-400 mb-2">4. Track Your Request</h4>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Watch your position in the queue. Get notified when your song plays!</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Contact */}
          <div className={styles.settingCard}>
            <a 
              href="tel:0614509800"
              className={styles.helpButton}
            >
              <div className={styles.settingInfo}>
                <div className={styles.settingIcon} style={{ backgroundColor: 'rgb(34 197 94 / 0.2)' }}>
                  <span className="text-green-400 text-lg">📞</span>
                </div>
                <div className={styles.settingText}>
                  <h3 className={styles.settingTitle}>Contact</h3>
                  <p className={styles.settingDescription}>061 450 9800</p>
                </div>
              </div>
              <ChevronRight className={styles.chevronIcon} />
            </a>
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
