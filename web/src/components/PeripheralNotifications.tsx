import React, { useEffect, useState } from 'react';

/**
 * Peripheral Glow Notifications
 * Ambient awareness indicators that don't require active attention
 */

export type NotificationEdge = 'left' | 'right' | 'top' | 'bottom';
export type NotificationType = 'queue-moved' | 'upvoted' | 'friend-request' | 'song-next';

interface PeripheralNotification {
  id: string;
  type: NotificationType;
  edge: NotificationEdge;
  duration?: number; // milliseconds
}

interface PeripheralNotificationsProps {
  notifications: PeripheralNotification[];
  onNotificationComplete?: (id: string) => void;
}

const notificationConfig: Record<NotificationType, {
  edge: NotificationEdge;
  color: string;
  animation: string;
  message: string;
}> = {
  'queue-moved': {
    edge: 'left',
    color: 'bg-cyan-500',
    animation: 'animate-pulse',
    message: 'Your request moved up!',
  },
  'upvoted': {
    edge: 'right',
    color: 'bg-gold-500',
    animation: 'animate-pulse',
    message: 'Someone upvoted your request',
  },
  'friend-request': {
    edge: 'top',
    color: 'bg-magenta-500',
    animation: 'animate-pulse',
    message: 'Friend just made a request',
  },
  'song-next': {
    edge: 'bottom',
    color: 'bg-green-500',
    animation: 'animate-pulse',
    message: 'Your song is next!',
  },
};

export const PeripheralNotifications: React.FC<PeripheralNotificationsProps> = ({
  notifications,
  onNotificationComplete,
}) => {
  const [activeNotifications, setActiveNotifications] = useState<PeripheralNotification[]>([]);

  useEffect(() => {
    setActiveNotifications(notifications);

    // Auto-dismiss notifications after duration
    notifications.forEach((notification) => {
      const duration = notification.duration || 3000;
      setTimeout(() => {
        setActiveNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        onNotificationComplete?.(notification.id);
      }, duration);
    });
  }, [notifications, onNotificationComplete]);

  const getEdgeStyles = (edge: NotificationEdge): string => {
    switch (edge) {
      case 'left':
        return 'left-0 top-0 bottom-0 w-1';
      case 'right':
        return 'right-0 top-0 bottom-0 w-1';
      case 'top':
        return 'top-0 left-0 right-0 h-1';
      case 'bottom':
        return 'bottom-0 left-0 right-0 h-1';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {activeNotifications.map((notification) => {
        const config = notificationConfig[notification.type];
        return (
          <div
            key={notification.id}
            className={`absolute ${getEdgeStyles(config.edge)} ${config.color} ${config.animation} shadow-glow-cyan`}
            style={{
              boxShadow: `0 0 20px currentColor`,
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * Circular Queue Tracker
 * Thin ring around screen edge showing song position as filling arc
 */

interface CircularQueueTrackerProps {
  progress: number; // 0-100
  className?: string;
}

export const CircularQueueTracker: React.FC<CircularQueueTrackerProps> = ({
  progress,
  className = '',
}) => {
  const radius = 50; // percentage
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`fixed inset-0 pointer-events-none z-40 ${className}`}>
      <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background ring */}
        <circle
          cx="50%"
          cy="50%"
          r={`${radius}%`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="2"
        />
        {/* Progress ring */}
        <circle
          cx="50%"
          cy="50%"
          r={`${radius}%`}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d9ff" />
            <stop offset="100%" stopColor="#9d00ff" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

/**
 * Event Energy Waveform
 * Subtle waveform at bottom showing crowd's request activity over time
 */

interface EventEnergyWaveformProps {
  activityData: number[]; // Array of activity levels (0-100) over time
  className?: string;
}

export const EventEnergyWaveform: React.FC<EventEnergyWaveformProps> = ({
  activityData,
  className = '',
}) => {
  const maxHeight = 40; // pixels
  const barWidth = 100 / activityData.length; // percentage

  return (
    <div className={`fixed bottom-0 left-0 right-0 h-12 pointer-events-none z-30 ${className}`}>
      <div className="relative w-full h-full bg-gradient-to-t from-black/20 to-transparent backdrop-blur-sm">
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-full px-2">
          {activityData.map((level, index) => {
            const height = (level / 100) * maxHeight;
            return (
              <div
                key={index}
                className="flex-1 mx-0.5 bg-gradient-to-t from-primary-500 to-secondary-500 rounded-t transition-all duration-300"
                style={{
                  height: `${height}px`,
                  opacity: 0.6 + (level / 100) * 0.4,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Time-of-Night Progression
 * Color temperature adjusts based on time
 */

interface TimeOfNightProgressionProps {
  currentHour: number; // 0-23
  children: React.ReactNode;
}

export const TimeOfNightProgression: React.FC<TimeOfNightProgressionProps> = ({
  currentHour,
  children,
}) => {
  // Calculate color temperature based on time
  // 8pm (20) = cool blues
  // 2am (2) = warm magentas
  const getColorTemperature = (hour: number): string => {
    if (hour >= 20 || hour < 2) {
      // Evening to midnight: cool to neutral
      const progress = hour >= 20 ? (hour - 20) / 4 : (hour + 4) / 4;
      return `hsl(${220 - progress * 40}, 70%, 15%)`; // Blue to purple
    } else if (hour >= 2 && hour < 6) {
      // Late night: warm colors
      const progress = (hour - 2) / 4;
      return `hsl(${280 + progress * 40}, 70%, 15%)`; // Purple to magenta
    } else {
      // Daytime: neutral
      return 'hsl(240, 70%, 15%)';
    }
  };

  const backgroundColor = getColorTemperature(currentHour);

  return (
    <div
      className="min-h-screen transition-colors duration-1000"
      style={{ backgroundColor }}
    >
      {children}
    </div>
  );
};

/**
 * Device-Ambient Sync Hook
 * Syncs device features with music (vibration, brightness)
 */

export const useDeviceAmbientSync = (
  isPlaying: boolean,
  songEnergy: number, // 0-100
  bpm?: number
) => {
  useEffect(() => {
    if (!isPlaying) return;

    // Beat Pulse - vibrate in rhythm with kick drum
    if (bpm && 'vibrate' in navigator) {
      const beatInterval = (60 / bpm) * 1000; // milliseconds per beat
      const vibratePattern = [50]; // Short vibration

      const intervalId = setInterval(() => {
        navigator.vibrate(vibratePattern);
      }, beatInterval);

      return () => clearInterval(intervalId);
    }
  }, [isPlaying, bpm]);

  useEffect(() => {
    // Brightness Sync (not directly supported, but we can adjust screen overlay)
    // This is a visual simulation since we can't control actual screen brightness
    const brightnessOverlay = document.getElementById('brightness-overlay');
    if (brightnessOverlay) {
      const opacity = 1 - (songEnergy / 100) * 0.3; // Brighter for high energy
      brightnessOverlay.style.opacity = opacity.toString();
    }
  }, [songEnergy]);
};

/**
 * Brightness Overlay Component
 * Visual simulation of brightness adjustment
 */

export const BrightnessOverlay: React.FC = () => {
  return (
    <div
      id="brightness-overlay"
      className="fixed inset-0 bg-black pointer-events-none z-0 transition-opacity duration-500"
      style={{ opacity: 0 }}
    />
  );
};
