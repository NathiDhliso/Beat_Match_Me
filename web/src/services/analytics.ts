/**
 * Analytics and Monitoring Service
 * Tracks events, errors, and usage for production monitoring
 */

interface AnalyticsEvent {
  event: string;
  category?: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

interface ErrorData {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceMetric {
  name: string;
  duration: number;
  metadata?: Record<string, any>;
}

/**
 * Track an analytics event
 */
export function trackEvent(
  event: string,
  data?: Omit<AnalyticsEvent, 'event'>
): void {
  const eventData: AnalyticsEvent = {
    event,
    ...data,
  };

  // Console log for development
  console.log('[Analytics]', eventData);

  // Google Analytics 4 (if available)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, {
      event_category: data?.category,
      event_label: data?.label,
      value: data?.value,
      ...data?.metadata,
    });
  }

  // Can also send to custom backend
  sendToBackend('events', eventData);
}

/**
 * Track an error
 */
export function trackError(
  error: Error | string,
  context?: Record<string, any>
): void {
  const errorData: ErrorData = {
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'object' ? error.stack : undefined,
    context,
    severity: 'medium',
  };

  console.error('[Error]', errorData);

  // Send to error tracking service (e.g., Sentry)
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      extra: context,
    });
  }

  sendToBackend('errors', errorData);
}

/**
 * Track performance metrics
 */
export function trackPerformance(
  name: string,
  duration: number,
  metadata?: Record<string, any>
): void {
  const metric: PerformanceMetric = {
    name,
    duration,
    metadata,
  };

  console.log('[Performance]', metric);

  // Send to analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'timing_complete', {
      name,
      value: duration,
      event_category: 'performance',
      ...metadata,
    });
  }

  sendToBackend('metrics', metric);
}

/**
 * Track user action
 */
export function trackUserAction(
  action: string,
  metadata?: Record<string, any>
): void {
  trackEvent('user_action', {
    category: 'engagement',
    label: action,
    metadata,
  });
}

/**
 * Track page view
 */
export function trackPageView(
  page: string,
  metadata?: Record<string, any>
): void {
  console.log('[PageView]', page, metadata);

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_title: page,
      page_location: window.location.href,
      ...metadata,
    });
  }

  sendToBackend('pageviews', { page, ...metadata });
}

/**
 * Measure execution time of a function
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T> | T,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    trackPerformance(name, duration, metadata);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    trackPerformance(name, duration, { ...metadata, error: true });
    throw error;
  }
}

/**
 * Send data to backend for persistent storage
 */
async function sendToBackend(
  _type: string,
  _data: any
): Promise<void> {
  try {
    // Only send in production
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    // TODO: Implement backend endpoint for analytics
    // await fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ type: _type, data: _data, timestamp: Date.now() }),
    // });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.warn('Failed to send analytics:', error);
  }
}

/**
 * Initialize analytics
 */
export function initAnalytics(userId?: string): void {
  console.log('[Analytics] Initialized', { userId });

  // Set user ID if available
  if (userId && typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
      user_id: userId,
    });
  }

  // Track app initialization
  trackEvent('app_initialized', {
    category: 'lifecycle',
    metadata: {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    },
  });
}

/**
 * Track business metrics
 */
export const BusinessMetrics = {
  requestSubmitted: (songTitle: string, amount: number, eventId: string) => {
    trackEvent('request_submitted', {
      category: 'revenue',
      value: amount,
      metadata: { songTitle, eventId },
    });
  },

  requestAccepted: (requestId: string, amount: number) => {
    trackEvent('request_accepted', {
      category: 'revenue',
      value: amount,
      metadata: { requestId },
    });
  },

  requestVetoed: (requestId: string, reason?: string) => {
    trackEvent('request_vetoed', {
      category: 'moderation',
      metadata: { requestId, reason },
    });
  },

  requestPlayed: (requestId: string, waitTime: number) => {
    trackEvent('request_played', {
      category: 'fulfillment',
      value: waitTime,
      metadata: { requestId },
    });
  },

  paymentProcessed: (amount: number, transactionId: string) => {
    trackEvent('payment_processed', {
      category: 'revenue',
      value: amount,
      metadata: { transactionId },
    });
  },

  refundProcessed: (amount: number, refundId: string) => {
    trackEvent('refund_processed', {
      category: 'revenue',
      value: -amount,
      metadata: { refundId },
    });
  },

  eventCreated: (eventId: string, venueName: string) => {
    trackEvent('event_created', {
      category: 'events',
      metadata: { eventId, venueName },
    });
  },

  djSetStarted: (setId: string, eventId: string) => {
    trackEvent('dj_set_started', {
      category: 'events',
      metadata: { setId, eventId },
    });
  },

  djSetEnded: (setId: string, totalRevenue: number, totalRequests: number) => {
    trackEvent('dj_set_ended', {
      category: 'events',
      value: totalRevenue,
      metadata: { setId, totalRequests },
    });
  },
};
