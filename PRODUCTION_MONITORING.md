# BeatMatchMe Production Monitoring Setup

## 📊 Overview

This guide covers the complete monitoring infrastructure for BeatMatchMe in production, including error tracking, performance monitoring, logging, analytics, and alerting.

---

## 🚨 Error Tracking with Sentry

### 1. Setup

```bash
npm install --save @sentry/react @sentry/tracing
```

### 2. Configuration

**web/src/monitoring/sentry.ts:**
```typescript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export const initSentry = () => {
  if (process.env.REACT_APP_ENV !== 'production') return;

  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_ENV,
    
    // Performance Monitoring
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.1, // 10% of transactions
    
    // Release tracking
    release: process.env.REACT_APP_VERSION,
    
    // Before send hook (sanitize sensitive data)
    beforeSend(event, hint) {
      // Remove sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      
      // Filter out specific errors
      if (event.exception?.values?.[0]?.value?.includes('Network error')) {
        return null; // Don't send network errors
      }
      
      return event;
    },
    
    // Ignore specific errors
    ignoreErrors: [
      'Non-Error promise rejection',
      'ResizeObserver loop limit exceeded',
      'cancelled', // GraphQL subscription cancellations
    ],
  });
};

// Set user context
export const setSentryUser = (user: { id: string; email: string; role: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
};

// Clear user context on logout
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

// Manual error reporting
export const reportError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Breadcrumb tracking
export const addBreadcrumb = (message: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
  });
};
```

### 3. Integration

**web/src/index.tsx:**
```typescript
import { initSentry } from './monitoring/sentry';

// Initialize Sentry first
initSentry();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**web/src/App.tsx:**
```typescript
import * as Sentry from "@sentry/react";

function App() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <BrowserRouter>
        {/* Your app */}
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}
```

### 4. Usage Examples

```typescript
// Automatic error capture
try {
  await submitRequest(request);
} catch (error) {
  reportError(error, {
    requestId: request.id,
    eventId: event.id,
    userRole: user.role,
  });
  throw error;
}

// Breadcrumbs for debugging
addBreadcrumb('User joined event', { eventId: event.id });
addBreadcrumb('Payment initiated', { amount: request.amount });
addBreadcrumb('Request submitted', { requestId: request.id });
```

### 5. Sentry Dashboard Setup

**Projects:**
- `beatmatchme-web` - Frontend errors
- `beatmatchme-backend` - Backend errors
- `beatmatchme-lambda` - Serverless function errors

**Alerts:**
- New issue created → Slack #engineering
- Error rate > 10/min → PagerDuty
- Unhandled errors → Email tech lead

---

## 📈 Performance Monitoring

### 1. Web Vitals Tracking

**web/src/monitoring/webVitals.ts:**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

// Send to analytics
const sendToAnalytics = (metric: Metric) => {
  const body = JSON.stringify({
    name: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    id: metric.id,
    navigationType: metric.navigationType,
  });

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/web-vitals', body);
  } else {
    fetch('/api/analytics/web-vitals', {
      body,
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Also send to Sentry
  Sentry.captureMessage(`Web Vital: ${metric.name}`, {
    level: 'info',
    tags: {
      web_vital: metric.name,
    },
    extra: {
      value: metric.value,
      rating: getVitalRating(metric),
    },
  });
};

const getVitalRating = (metric: Metric): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds: Record<string, [number, number]> = {
    CLS: [0.1, 0.25],
    FID: [100, 300],
    LCP: [2500, 4000],
    FCP: [1800, 3000],
    TTFB: [800, 1800],
  };

  const [good, poor] = thresholds[metric.name] || [0, 0];
  if (metric.value <= good) return 'good';
  if (metric.value <= poor) return 'needs-improvement';
  return 'poor';
};

// Initialize tracking
export const initWebVitals = () => {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
};
```

**Usage:**
```typescript
// In index.tsx
import { initWebVitals } from './monitoring/webVitals';

initWebVitals();
```

### 2. Custom Performance Tracking

**web/src/monitoring/performance.ts:**
```typescript
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  // Start timing
  startMeasure(name: string) {
    this.marks.set(name, performance.now());
  }

  // End timing and report
  endMeasure(name: string, metadata?: Record<string, any>) {
    const start = this.marks.get(name);
    if (!start) return;

    const duration = performance.now() - start;
    this.marks.delete(name);

    // Log to console in dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    }

    // Send to analytics
    this.reportMetric({
      name,
      duration,
      ...metadata,
    });
  }

  private reportMetric(metric: Record<string, any>) {
    // Send to backend
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
    }).catch(() => {
      // Silently fail
    });

    // Also track in Sentry
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${metric.name}: ${metric.duration.toFixed(2)}ms`,
      level: 'info',
      data: metric,
    });
  }
}

export const perfMonitor = new PerformanceMonitor();
```

**Usage:**
```typescript
import { perfMonitor } from './monitoring/performance';

// Track component mount time
useEffect(() => {
  perfMonitor.startMeasure('DJPortal:mount');
  
  // Component setup...
  
  perfMonitor.endMeasure('DJPortal:mount', {
    component: 'DJPortal',
    tracksCount: tracks.length,
  });
}, []);

// Track API call time
perfMonitor.startMeasure('submitRequest');
await submitRequest(request);
perfMonitor.endMeasure('submitRequest', {
  requestId: request.id,
  eventId: event.id,
});
```

---

## 📝 Logging Infrastructure

### 1. Structured Logging

**web/src/monitoring/logger.ts:**
```typescript
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId: this.userId,
      sessionId: this.sessionId,
    };

    // Console output
    const consoleMethod = level === LogLevel.ERROR ? 'error' : 
                         level === LogLevel.WARN ? 'warn' : 'log';
    console[consoleMethod](`[${level.toUpperCase()}]`, message, context || '');

    // Send to backend in production
    if (process.env.REACT_APP_ENV === 'production') {
      this.sendToBackend(entry);
    }

    // Add Sentry breadcrumb
    Sentry.addBreadcrumb({
      category: 'log',
      message,
      level: level as any,
      data: context,
    });
  }

  private async sendToBackend(entry: LogEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        keepalive: true,
      });
    } catch (error) {
      // Silently fail - don't want logging to break the app
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context);
  }
}

export const logger = new Logger();
```

**Usage:**
```typescript
import { logger } from './monitoring/logger';

// Set user ID on login
logger.setUserId(user.id);

// Log events
logger.info('User joined event', { eventId: event.id });
logger.warn('Payment retry attempt', { attempt: 2, requestId: request.id });
logger.error('Failed to submit request', { error: error.message });
```

### 2. AWS CloudWatch Integration

**Backend logging (Lambda functions):**
```typescript
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({
  serviceName: 'beatmatchme-api',
  logLevel: process.env.LOG_LEVEL || 'INFO',
});

export const handler = async (event: any) => {
  logger.addContext({
    requestId: event.requestContext.requestId,
    userId: event.requestContext.authorizer?.claims?.sub,
  });

  logger.info('Processing request', { path: event.path });

  try {
    // Your logic
    logger.info('Request successful');
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    logger.error('Request failed', { error });
    throw error;
  }
};
```

---

## 📊 Analytics Tracking

### 1. Custom Events

**web/src/monitoring/analytics.ts:**
```typescript
export enum AnalyticsEvent {
  // User actions
  USER_JOINED_EVENT = 'user_joined_event',
  REQUEST_SUBMITTED = 'request_submitted',
  PAYMENT_COMPLETED = 'payment_completed',
  
  // DJ actions
  EVENT_CREATED = 'event_created',
  TRACKLIST_UPLOADED = 'tracklist_uploaded',
  REQUEST_ACCEPTED = 'request_accepted',
  REQUEST_VETOED = 'request_vetoed',
  SONG_PLAYED = 'song_played',
  
  // Performance
  PAGE_LOAD = 'page_load',
  API_ERROR = 'api_error',
}

interface EventData {
  event: AnalyticsEvent;
  timestamp: string;
  userId?: string;
  sessionId: string;
  properties?: Record<string, any>;
}

class Analytics {
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  track(event: AnalyticsEvent, properties?: Record<string, any>) {
    const data: EventData = {
      event,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties,
    };

    // Log to console in dev
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics:', event, properties);
    }

    // Send to backend
    this.sendToBackend(data);

    // Also track in Sentry as breadcrumb
    Sentry.addBreadcrumb({
      category: 'analytics',
      message: event,
      data: properties,
    });
  }

  private async sendToBackend(data: EventData) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      });
    } catch (error) {
      // Silently fail
    }
  }

  // Page view tracking
  pageView(page: string, properties?: Record<string, any>) {
    this.track(AnalyticsEvent.PAGE_LOAD, {
      page,
      ...properties,
    });
  }
}

export const analytics = new Analytics();
```

**Usage:**
```typescript
import { analytics, AnalyticsEvent } from './monitoring/analytics';

// Track user actions
analytics.track(AnalyticsEvent.USER_JOINED_EVENT, {
  eventId: event.id,
  venueName: event.venueName,
});

analytics.track(AnalyticsEvent.REQUEST_SUBMITTED, {
  requestId: request.id,
  amount: request.amount,
  tier: request.tier,
});

// Track page views
useEffect(() => {
  analytics.pageView('/dj-portal', { 
    eventId: currentEvent?.id 
  });
}, [currentEvent]);
```

### 2. Backend Analytics Processing

**Lambda function to process analytics:**
```typescript
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

const dynamodb = new DynamoDB({ region: process.env.AWS_REGION });

export const handler = async (event: any) => {
  const body = JSON.parse(event.body);
  
  // Store in DynamoDB
  await dynamodb.putItem({
    TableName: 'BeatMatchMe-Analytics',
    Item: marshall({
      id: `${body.event}#${Date.now()}`,
      event: body.event,
      timestamp: body.timestamp,
      userId: body.userId,
      sessionId: body.sessionId,
      properties: body.properties,
      ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90 days
    }),
  });

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
```

---

## 🔔 Alerting Configuration

### 1. CloudWatch Alarms

```bash
# High error rate
aws cloudwatch put-metric-alarm \
  --alarm-name beatmatchme-high-error-rate \
  --alarm-description "API error rate above threshold" \
  --metric-name Errors \
  --namespace AWS/ApiGateway \
  --statistic Sum \
  --period 300 \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:123456789:alerts

# High latency
aws cloudwatch put-metric-alarm \
  --alarm-name beatmatchme-high-latency \
  --alarm-description "API latency above threshold" \
  --metric-name Latency \
  --namespace AWS/ApiGateway \
  --statistic Average \
  --period 300 \
  --threshold 1000 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:123456789:alerts
```

### 2. Slack Integration

**SNS → Lambda → Slack:**
```typescript
import { WebClient } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_TOKEN);

export const handler = async (event: any) => {
  const message = JSON.parse(event.Records[0].Sns.Message);
  
  await slack.chat.postMessage({
    channel: '#engineering-alerts',
    text: `🚨 ${message.AlarmName}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${message.AlarmName}*\n${message.AlarmDescription}`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Metric:* ${message.Trigger.MetricName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Threshold:* ${message.Trigger.Threshold}`,
          },
          {
            type: 'mrkdwn',
            text: `*Current Value:* ${message.NewStateValue}`,
          },
        ],
      },
    ],
  });
};
```

---

## 📊 Dashboard Setup

### 1. CloudWatch Dashboard

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "title": "API Requests",
        "metrics": [
          ["AWS/ApiGateway", "Count", { "stat": "Sum" }]
        ],
        "period": 300,
        "region": "us-east-1"
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "Error Rate",
        "metrics": [
          ["AWS/ApiGateway", "4XXError", { "stat": "Sum", "color": "#ff7f0e" }],
          [".", "5XXError", { "stat": "Sum", "color": "#d62728" }]
        ],
        "period": 300
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "DynamoDB Latency",
        "metrics": [
          ["AWS/DynamoDB", "SuccessfulRequestLatency", { "stat": "Average" }]
        ],
        "period": 300
      }
    }
  ]
}
```

### 2. Grafana Dashboard (Optional)

**Metrics to track:**
- Request rate (requests/second)
- Error rate (%)
- P50/P95/P99 latencies
- Active users
- Payment success rate
- Queue depth

---

## 🔍 Debugging in Production

### 1. Session Replay (Sentry)

Enable session replay for debugging user issues:
```typescript
Sentry.init({
  // ... other config
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions
});
```

### 2. Feature Flags

For gradual rollouts and debugging:
```typescript
export const featureFlags = {
  newOrbitalInterface: process.env.REACT_APP_FF_ORBITAL === 'true',
  enhancedAnalytics: process.env.REACT_APP_FF_ANALYTICS === 'true',
};

// Usage
if (featureFlags.newOrbitalInterface) {
  return <NewOrbitalInterface />;
}
return <OrbitalInterface />;
```

---

## 📈 Metrics to Track

### Business Metrics
- **Events Created:** Count per day
- **Requests Submitted:** Count per event/day
- **Payment Success Rate:** %
- **Average Request Amount:** $
- **Revenue:** $ per day/week/month

### Technical Metrics
- **API Latency:** P50, P95, P99
- **Error Rate:** 4xx, 5xx counts
- **DynamoDB Throttles:** Count
- **Lambda Cold Starts:** %
- **CloudFront Cache Hit Rate:** %

### User Metrics
- **Daily Active Users:** Count
- **Session Duration:** Average minutes
- **Bounce Rate:** %
- **Conversion Rate:** % (visitors → requesters)

---

## 🛠️ Tools Reference

### Installed Packages
```bash
npm install --save @sentry/react @sentry/tracing
npm install --save web-vitals
npm install --save @aws-lambda-powertools/logger
npm install --save @slack/web-api
```

### AWS Services
- **CloudWatch:** Logs, metrics, alarms
- **CloudWatch Insights:** Log analysis
- **X-Ray:** Distributed tracing
- **SNS:** Alert notifications
- **DynamoDB:** Analytics storage

### External Services
- **Sentry:** Error tracking, performance monitoring
- **Datadog:** (Optional) Full observability platform
- **Grafana:** (Optional) Custom dashboards

---

## 📋 Monitoring Checklist

- [ ] Sentry configured with DSN
- [ ] Web Vitals tracking enabled
- [ ] CloudWatch dashboard created
- [ ] Alarms configured (errors, latency, throttles)
- [ ] Slack alerts working
- [ ] Analytics tracking implemented
- [ ] Structured logging in place
- [ ] Session replay enabled
- [ ] Source maps uploaded to Sentry
- [ ] PagerDuty/on-call setup (if needed)

---

**Last Updated:** November 6, 2025  
**Maintained by:** BeatMatchMe DevOps Team
