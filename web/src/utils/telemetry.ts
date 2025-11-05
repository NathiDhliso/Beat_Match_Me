/**
 * Telemetry & Monitoring (Browser-Safe)
 * Tracks performance metrics in memory only (no localStorage)
 */

// Simple in-memory telemetry (no localStorage!)
const metrics = {
  subscriptionUptime: 0,
  notificationDeliveryRate: 0,
  averageReconnectTime: 0,
  pollingFallbackRate: 0,
  totalNotifications: 0,
  deliveredNotifications: 0,
  reconnectAttempts: 0,
  reconnectSuccesses: 0,
  totalConnectionTime: 0,
  pollingModeTime: 0,
};

let connectionStartTime = 0;
// pollingStartTime reserved for future use

export const trackConnectionStart = () => {
  connectionStartTime = Date.now();
};

export const trackConnectionSuccess = () => {
  if (connectionStartTime > 0) {
    const reconnectTime = Date.now() - connectionStartTime;
    metrics.reconnectAttempts++;
    metrics.reconnectSuccesses++;
    metrics.averageReconnectTime = 
      (metrics.averageReconnectTime * (metrics.reconnectSuccesses - 1) + reconnectTime) / 
      metrics.reconnectSuccesses;
    connectionStartTime = 0; // Reset
  }
};

export const trackPollingFallback = () => {
  // Track when we fall back to polling mode
  metrics.pollingFallbackRate++;
};

export const trackNotificationSent = () => {
  metrics.totalNotifications++;
};

export const trackNotificationDelivered = () => {
  metrics.deliveredNotifications++;
  if (metrics.totalNotifications > 0) {
    metrics.notificationDeliveryRate = 
      metrics.deliveredNotifications / metrics.totalNotifications;
  }
};

export const getMetrics = () => ({ ...metrics });

export const logMetrics = () => {
  console.table(getMetrics());
};

export const resetMetrics = () => {
  metrics.subscriptionUptime = 0;
  metrics.notificationDeliveryRate = 0;
  metrics.averageReconnectTime = 0;
  metrics.pollingFallbackRate = 0;
  metrics.totalNotifications = 0;
  metrics.deliveredNotifications = 0;
  metrics.reconnectAttempts = 0;
  metrics.reconnectSuccesses = 0;
  metrics.totalConnectionTime = 0;
  metrics.pollingModeTime = 0;
};

// Call this every 5 minutes for monitoring (development only)
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  setInterval(() => {
    logMetrics();
  }, 5 * 60 * 1000);
}
