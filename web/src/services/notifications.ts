/**
 * Notification Service
 * Handles push notifications and in-app alerts for queue position changes
 */

// Types
export type NotificationType = 
  | 'position_changed'
  | 'coming_up_next' // Position #2
  | 'youre_next' // Position #1
  | 'now_playing'
  | 'vetoed'
  | 'dj_set_ended'
  | 'refund_processed';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Send browser notification
export function sendNotification(payload: NotificationPayload): void {
  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  const notification = new Notification(payload.title, {
    body: payload.message,
    icon: '/logo.png',
    badge: '/badge.png',
    tag: payload.type,
    requireInteraction: ['youre_next', 'vetoed', 'dj_set_ended'].includes(payload.type),
    data: payload.data,
  } as NotificationOptions);

  // Trigger vibration if available
  if ('vibrate' in navigator) {
    navigator.vibrate(getVibrationPattern(payload.type));
  }

  notification.onclick = () => {
    window.focus();
    notification.close();
    
    // Navigate based on notification type
    if (payload.data?.url) {
      window.location.href = payload.data.url;
    }
  };

  // Auto-close after 5 seconds for non-critical notifications
  if (!['vetoed', 'dj_set_ended'].includes(payload.type)) {
    setTimeout(() => notification.close(), 5000);
  }
}

// Get vibration pattern based on notification type
function getVibrationPattern(type: NotificationType): number[] {
  switch (type) {
    case 'youre_next':
      return [200, 100, 200, 100, 200]; // 3 strong pulses
    case 'coming_up_next':
      return [200, 100, 200]; // 2 pulses
    case 'now_playing':
      return [300, 100, 300, 100, 300]; // Victory pattern
    case 'vetoed':
      return [500]; // Single long vibration
    case 'position_changed':
      return [100]; // Single short pulse
    default:
      return [100, 50, 100];
  }
}

// Queue position notifications
export const QueueNotifications = {
  positionChanged: (oldPosition: number, newPosition: number) => {
    if (newPosition < oldPosition) {
      sendNotification({
        type: 'position_changed',
        title: 'Queue Update',
        message: `You moved up to position #${newPosition}!`,
        data: { oldPosition, newPosition },
      });
    }
  },

  comingUpNext: (songTitle: string, artist: string) => {
    sendNotification({
      type: 'coming_up_next',
      title: '🔜 Coming Up Next!',
      message: `"${songTitle}" by ${artist} is almost up!`,
      data: { songTitle, artist },
    });
  },

  youreNext: (songTitle: string, artist: string) => {
    sendNotification({
      type: 'youre_next',
      title: "🎵 YOU'RE NEXT!",
      message: `"${songTitle}" by ${artist} will play next!`,
      data: { songTitle, artist },
    });
  },

  nowPlaying: (songTitle: string, artist: string) => {
    sendNotification({
      type: 'now_playing',
      title: '🎶 NOW PLAYING',
      message: `Your song "${songTitle}" by ${artist} is playing!`,
      data: { songTitle, artist },
    });
  },

  vetoed: (songTitle: string, reason?: string) => {
    sendNotification({
      type: 'vetoed',
      title: '❌ Request Vetoed',
      message: `"${songTitle}" was vetoed. ${reason || 'Full refund processing automatically.'}`,
      data: { songTitle, reason },
    });
  },

  djSetEnded: (refundAmount: number) => {
    sendNotification({
      type: 'dj_set_ended',
      title: 'DJ Set Ended',
      message: `The DJ set has ended. Refund of R${refundAmount.toFixed(2)} is processing.`,
      data: { refundAmount },
    });
  },

  refundProcessed: (amount: number, requestId: string) => {
    sendNotification({
      type: 'refund_processed',
      title: '✅ Refund Processed',
      message: `R${amount.toFixed(2)} has been refunded to your card.`,
      data: { amount, requestId },
    });
  },
};

// In-app toast notifications
export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

class ToastManager {
  private container: HTMLElement | null = null;

  private getContainer(): HTMLElement {
    if (!this.container) {
      this.container = document.getElementById('toast-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'fixed top-4 right-4 z-[9999] space-y-2';
        document.body.appendChild(this.container);
      }
    }
    return this.container;
  }

  show(options: ToastOptions): void {
    const toast = document.createElement('div');
    const duration = options.duration || 3000;

    const colors = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      warning: 'bg-yellow-600',
      info: 'bg-blue-600',
    };

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠️',
      info: 'ℹ️',
    };

    toast.className = `${colors[options.type]} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in-right`;
    toast.innerHTML = `
      <span class="text-2xl">${icons[options.type]}</span>
      <span class="flex-1">${options.message}</span>
      <button class="text-white/80 hover:text-white transition-colors">✕</button>
    `;

    const closeBtn = toast.querySelector('button');
    const close = () => {
      toast.classList.add('animate-slide-out-right');
      setTimeout(() => toast.remove(), 300);
    };

    closeBtn?.addEventListener('click', close);

    this.getContainer().appendChild(toast);

    // Auto-close
    setTimeout(close, duration);
  }

  success(message: string, duration?: number): void {
    this.show({ type: 'success', message, duration });
  }

  error(message: string, duration?: number): void {
    this.show({ type: 'error', message, duration });
  }

  warning(message: string, duration?: number): void {
    this.show({ type: 'warning', message, duration });
  }

  info(message: string, duration?: number): void {
    this.show({ type: 'info', message, duration });
  }
}

export const toast = new ToastManager();

// Initialize notification service
export async function initializeNotifications(): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  
  if (hasPermission) {
    console.log('✅ Notifications enabled');
  } else {
    console.warn('⚠️ Notifications disabled');
    toast.info('Enable notifications to get queue updates');
  }

  // Listen for visibility changes
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // Clear notifications when app becomes visible
      if ('Notification' in window) {
        // Close all notifications
        // Note: There's no standard way to close all notifications
        // Each browser handles this differently
      }
    }
  });
}

// Export singleton instance
export default {
  requestPermission: requestNotificationPermission,
  send: sendNotification,
  queue: QueueNotifications,
  toast,
  initialize: initializeNotifications,
};
