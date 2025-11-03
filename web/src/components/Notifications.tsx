import React, { useState, useEffect } from 'react';
import { HapticFeedback } from '../utils/haptics';

/**
 * Phase 7: Real-Time Experience & Notifications
 * Push notifications, live updates, real-time sync
 */

export type NotificationType = 
  | 'queue_update'
  | 'coming_up'
  | 'now_playing'
  | 'completed'
  | 'vetoed'
  | 'friend_request'
  | 'friend_at_event'
  | 'achievement'
  | 'milestone';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    requestId?: string;
    eventId?: string;
    userId?: string;
    songTitle?: string;
    venueName?: string;
  };
}

/**
 * Notification Toast Component
 */
interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  onAction?: () => void;
  duration?: number;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onAction,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'queue_update': return '📊';
      case 'coming_up': return '🔜';
      case 'now_playing': return '🎶';
      case 'completed': return '✅';
      case 'vetoed': return '❌';
      case 'friend_request': return '👥';
      case 'friend_at_event': return '📍';
      case 'achievement': return '🏆';
      case 'milestone': return '🎉';
    }
  };

  const getColor = (type: NotificationType) => {
    switch (type) {
      case 'queue_update': return 'from-blue-500 to-blue-600';
      case 'coming_up': return 'from-yellow-500 to-yellow-600';
      case 'now_playing': return 'from-green-500 to-green-600';
      case 'completed': return 'from-green-500 to-green-600';
      case 'vetoed': return 'from-red-500 to-red-600';
      case 'friend_request': return 'from-purple-500 to-purple-600';
      case 'friend_at_event': return 'from-cyan-500 to-cyan-600';
      case 'achievement': return 'from-gold-500 to-gold-600';
      case 'milestone': return 'from-secondary-500 to-accent-500';
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50
        max-w-sm w-full
        transform transition-all duration-300
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`
        bg-gradient-to-r ${getColor(notification.type)}
        rounded-2xl shadow-glow-cyan p-4
        backdrop-blur-xl
      `}>
        <div className="flex items-start gap-3">
          <span className="text-3xl">{getIcon(notification.type)}</span>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold text-sm">{notification.title}</h4>
            <p className="text-white/90 text-sm mt-1">{notification.message}</p>
            
            {onAction && (
              <button
                onClick={() => {
                  onAction();
                  onClose();
                }}
                className="mt-2 text-xs text-white font-semibold underline hover:no-underline"
              >
                View Details
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-white/80 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Notification Center Component
 */
interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n =>
    filter === 'all' || !n.read
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'queue_update': return '📊';
      case 'coming_up': return '🔜';
      case 'now_playing': return '🎶';
      case 'completed': return '✅';
      case 'vetoed': return '❌';
      case 'friend_request': return '👥';
      case 'friend_at_event': return '📍';
      case 'achievement': return '🏆';
      case 'milestone': return '🎉';
    }
  };

  return (
    <div className={`bg-gray-900 rounded-2xl shadow-xl ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
          
          <div className="flex gap-2">
            <button
              onClick={onMarkAllAsRead}
              disabled={unreadCount === 0}
              className="text-sm text-primary-400 hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark all read
            </button>
            <button
              onClick={onClearAll}
              className="text-sm text-gray-400 hover:text-gray-300"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${filter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
            `}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${filter === 'unread' ? 'bg-primary-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
            `}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <span className="text-4xl mb-2 block">🔔</span>
            <p>No notifications</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => {
                if (!notification.read) {
                  onMarkAsRead(notification.id);
                }
                onNotificationClick?.(notification);
              }}
              className={`
                p-4 border-b border-gray-800 cursor-pointer
                transition-colors hover:bg-gray-800
                ${!notification.read ? 'bg-gray-850' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getIcon(notification.type)}</span>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-white font-semibold text-sm">
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    {notification.message}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    {getTimeAgo(notification.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Live Update Indicator
 */
interface LiveUpdateIndicatorProps {
  isLive: boolean;
  lastUpdate?: number;
  className?: string;
}

export const LiveUpdateIndicator: React.FC<LiveUpdateIndicatorProps> = ({
  isLive,
  lastUpdate,
  className = '',
}) => {
  const getLastUpdateText = () => {
    if (!lastUpdate) return '';
    const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className={`
          w-2 h-2 rounded-full
          ${isLive ? 'bg-green-500' : 'bg-gray-500'}
        `} />
        {isLive && (
          <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
        )}
      </div>
      <span className="text-sm text-gray-400">
        {isLive ? 'Live' : 'Offline'}
        {lastUpdate && ` • Updated ${getLastUpdateText()}`}
      </span>
    </div>
  );
};

/**
 * Push Notification Permission Request
 */
interface PushNotificationPromptProps {
  onEnable: () => Promise<void>;
  onDismiss: () => void;
  className?: string;
}

export const PushNotificationPrompt: React.FC<PushNotificationPromptProps> = ({
  onEnable,
  onDismiss,
  className = '',
}) => {
  const [isEnabling, setIsEnabling] = useState(false);

  const handleEnable = async () => {
    setIsEnabling(true);
    try {
      await onEnable();
      HapticFeedback.requestAccepted();
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    } finally {
      setIsEnabling(false);
    }
  };

  return (
    <div className={`bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <span className="text-4xl">🔔</span>
        
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg mb-2">
            Stay in the Loop!
          </h3>
          <p className="text-white/90 text-sm mb-4">
            Get notified when your request is coming up, playing, or when friends join events.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={handleEnable}
              disabled={isEnabling}
              className="px-6 py-2 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isEnabling ? 'Enabling...' : 'Enable Notifications'}
            </button>
            <button
              onClick={onDismiss}
              className="px-6 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Connection Status Banner
 */
interface ConnectionStatusProps {
  isConnected: boolean;
  isReconnecting?: boolean;
  onRetry?: () => void;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isReconnecting = false,
  onRetry,
  className = '',
}) => {
  if (isConnected) return null;

  return (
    <div className={`bg-red-500 text-white px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold">
              {isReconnecting ? 'Reconnecting...' : 'Connection Lost'}
            </p>
            <p className="text-sm text-white/90">
              {isReconnecting ? 'Attempting to restore connection' : 'Real-time updates unavailable'}
            </p>
          </div>
        </div>
        
        {!isReconnecting && onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-white text-red-500 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};
