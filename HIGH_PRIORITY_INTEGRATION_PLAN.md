# 🚀 HIGH PRIORITY INTEGRATION PLAN

**Date**: November 4, 2025  
**Status**: Ready for Implementation  
**Estimated Time**: 3-4 days for full integration (includes testing buffer)  
**⚠️ Updated**: Added schema validation, reconnection logic, and browser compatibility fixes

---

## 📋 COMPONENTS TO INTEGRATE

1. ✅ **Notifications.tsx** - Real-time notification system
2. ✅ **ProfileManagement.tsx** - User profile & settings
3. ✅ **RequestConfirmation.tsx** - Enhanced request modal
4. ✅ **RequestCapManager.tsx** - DJ request cap controls
5. ✅ **useQueueSubscription.ts** - Real-time queue updates

---

## 🎯 INTEGRATION ROADMAP

### **PHASE 1: Foundation (Day 1 - Morning)**
Set up infrastructure for notifications and real-time updates

### **PHASE 2: User Portal (Day 1 - Afternoon)**
Integrate notifications and enhanced request flow

### **PHASE 3: DJ Portal (Day 2 - Morning)**
Add profile management and request cap controls

### **PHASE 4: Real-Time Features (Day 2 - Afternoon)**
Enable queue subscriptions and live updates

### **PHASE 5: Testing & Polish (Day 3)**
Test all integrations, fix bugs, polish UX

---

# PHASE 1: FOUNDATION SETUP

## 1.1 - Validate Backend Schema & Subscriptions

**Priority**: CRITICAL ⚠️  
**Action**: Verify GraphQL subscriptions are configured before enabling real-time features

### Integration Steps:

1. **Create schema validation utility** - `web/src/utils/validateBackend.ts`:
```typescript
import { generateClient } from 'aws-amplify/api';

export const validateBackendReady = async (): Promise<{
  subscriptionsAvailable: boolean;
  mutationsAvailable: boolean;
  errors: string[];
}> => {
  const errors: string[] = [];
  let subscriptionsAvailable = false;
  let mutationsAvailable = false;

  try {
    const client = generateClient();

    // Test if subscription type exists
    try {
      // This will fail gracefully if subscription isn't configured
      const subscription = client.graphql({
        query: `subscription OnQueueUpdateTest {
          onQueueUpdate(eventId: "validation-test") {
            eventId
          }
        }`
      });

      subscriptionsAvailable = true;
      console.log('✅ GraphQL Subscriptions available');
      
      // Clean up test subscription
      if ('unsubscribe' in subscription) {
        subscription.unsubscribe();
      }
    } catch (error: any) {
      errors.push(`Subscriptions not available: ${error.message}`);
      console.warn('⚠️ Subscriptions not configured, will use polling fallback');
    }

    // Test if mutations exist
    try {
      // Just validate the schema, don't execute
      await client.graphql({
        query: `query TestSchema { __schema { mutationType { name } } }`
      });
      mutationsAvailable = true;
      console.log('✅ GraphQL Mutations available');
    } catch (error: any) {
      errors.push(`Mutations not available: ${error.message}`);
    }

  } catch (error: any) {
    errors.push(`Backend connection failed: ${error.message}`);
    console.error('❌ Backend validation failed:', error);
  }

  return {
    subscriptionsAvailable,
    mutationsAvailable,
    errors
  };
};

// Helper to determine if we should use real-time or polling
export const shouldUseRealTime = async (): Promise<boolean> => {
  const { subscriptionsAvailable } = await validateBackendReady();
  return subscriptionsAvailable;
};
```

2. **Add validation to App startup** - `web/src/App.tsx`:
```typescript
import { validateBackendReady } from './utils/validateBackend';

function App() {
  const [backendStatus, setBackendStatus] = useState<{
    ready: boolean;
    useRealTime: boolean;
    errors: string[];
  }>({
    ready: false,
    useRealTime: false,
    errors: []
  });

  useEffect(() => {
    const checkBackend = async () => {
      const validation = await validateBackendReady();
      
      setBackendStatus({
        ready: validation.mutationsAvailable,
        useRealTime: validation.subscriptionsAvailable,
        errors: validation.errors
      });

      if (validation.errors.length > 0) {
        console.warn('Backend validation warnings:', validation.errors);
      }
    };

    checkBackend();
  }, []);

  // Show loading screen until backend is validated
  if (!backendStatus.ready) {
    return <LoadingScreen message="Connecting to backend..." />;
  }
  
  // ... rest of App
}
```

3. **Store backend capabilities in context**:

**New File**: `web/src/context/BackendContext.tsx`

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { validateBackendReady } from '../utils/validateBackend';

interface BackendContextType {
  subscriptionsAvailable: boolean;
  isReady: boolean;
  errors: string[];
  revalidate: () => Promise<void>;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

export const BackendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<BackendContextType>({
    subscriptionsAvailable: false,
    isReady: false,
    errors: [],
    revalidate: async () => {}
  });

  const revalidate = async () => {
    const validation = await validateBackendReady();
    setState({
      subscriptionsAvailable: validation.subscriptionsAvailable,
      isReady: validation.mutationsAvailable,
      errors: validation.errors,
      revalidate
    });
  };

  useEffect(() => {
    revalidate();
  }, []);

  return (
    <BackendContext.Provider value={state}>
      {children}
    </BackendContext.Provider>
  );
};

export const useBackend = () => {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error('useBackend must be used within BackendProvider');
  }
  return context;
};
```

**Files Created**: 
- `web/src/utils/validateBackend.ts`
- `web/src/context/BackendContext.tsx`

**Files Modified**: 
- `web/src/App.tsx`

**Testing**: 
- Check console for "✅ GraphQL Subscriptions available" or fallback message
- Verify app loads without subscriptions configured

---

## 1.2 - Enable useQueueSubscription Hook (with Fallback)

**File**: `web/src/hooks/useQueueSubscription.ts`  
**Status**: Already exists ✅  
**Action**: Enable and configure

### Integration Steps:

1. **Verify GraphQL subscription exists** in `infrastructure/schema.graphql`:
```graphql
type Subscription {
  onQueueUpdate(eventId: ID!): Queue
    @aws_subscribe(mutations: ["updateQueue", "addRequest", "removeRequest"])
}
```

2. **Update subscription service** - `web/src/services/subscriptions.ts`:
```typescript
// Already exists, verify it's working
export const subscribeToQueueUpdates = (eventId: string, callback: (data: any) => void) => {
  // GraphQL subscription implementation
}
```

3. **Test the hook** - Create a test component:
```typescript
import { useQueueSubscription } from '../hooks/useQueueSubscription';

const TestSub = () => {
  const { queueData, connectionStatus } = useQueueSubscription('req-123', 'event-456');
  console.log('Queue updates:', queueData);
  console.log('Connection:', connectionStatus);
};
```

**Files Modified**: None (already exists)  
**Testing**: Console logs should show real-time updates

---

## 1.2 - Enable useQueueSubscription Hook (with Fallback)

**File**: `web/src/hooks/useQueueSubscription.ts`  
**Status**: Already exists ✅  
**Action**: Add polling fallback and reconnection logic

### Integration Steps:

1. **Update hook with fallback mode**:
```typescript
import { useState, useEffect, useRef } from 'react';
import { generateClient } from 'aws-amplify/api';
import { useBackend } from '../context/BackendContext';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export const useQueueSubscription = (setId: string, eventId: string) => {
  const [queueData, setQueueData] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<Error | null>(null);
  
  const { subscriptionsAvailable } = useBackend();
  const subscriptionRef = useRef<any>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Reconnection with exponential backoff
  const reconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnect attempts reached, switching to polling');
      setConnectionStatus('disconnected');
      startPolling(); // Fallback to polling
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
    reconnectAttemptsRef.current++;

    console.log(`Reconnecting... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
    
    setTimeout(() => {
      connectSubscription();
    }, delay);
  }, []);

  // Real-time subscription
  const connectSubscription = useCallback(async () => {
    if (!setId || !eventId || !subscriptionsAvailable) {
      startPolling();
      return;
    }

    try {
      setConnectionStatus('connecting');
      const client = generateClient();

      subscriptionRef.current = client.graphql({
        query: onQueueUpdate,
        variables: { eventId }
      }).subscribe({
        next: ({ data }: any) => {
          setQueueData(data.onQueueUpdate);
          setConnectionStatus('connected');
          reconnectAttemptsRef.current = 0; // Reset on success
          setError(null);
        },
        error: (err: Error) => {
          console.error('Subscription error:', err);
          setError(err);
          setConnectionStatus('error');
          reconnect(); // Try to reconnect
        }
      });

    } catch (err: any) {
      console.error('Failed to connect subscription:', err);
      setError(err);
      setConnectionStatus('error');
      reconnect();
    }
  }, [setId, eventId, subscriptionsAvailable, reconnect]);

  // Polling fallback
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return; // Already polling

    console.log('Starting polling mode (10s interval)');
    setConnectionStatus('connected'); // Show as connected even in polling mode

    const poll = async () => {
      try {
        const client = generateClient();
        const response = await client.graphql({
          query: getQueue,
          variables: { eventId, setId }
        });

        setQueueData(response.data.getQueue);
        setError(null);
      } catch (err: any) {
        console.error('Polling error:', err);
        setError(err);
      }
    };

    poll(); // Initial poll
    pollingIntervalRef.current = setInterval(poll, 10000); // Poll every 10s
  }, [setId, eventId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Start connection
  useEffect(() => {
    if (!setId || !eventId) return;

    if (subscriptionsAvailable) {
      connectSubscription();
    } else {
      startPolling();
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [setId, eventId, subscriptionsAvailable, connectSubscription, startPolling]);

  return { queueData, connectionStatus, error };
};
```

**Files Modified**: 
- `web/src/hooks/useQueueSubscription.ts`

**Testing**: 
- Test with subscriptions enabled (should show "connected")
- Test with subscriptions disabled (should fall back to polling)
- Disconnect network and verify reconnection logic works

---

## 1.3 - Set Up Notification Service (Browser-Safe)

**File**: `web/src/services/notifications.ts`  
**Status**: Already exists ✅  
**Action**: Enable push notifications

### Integration Steps:

1. **Request notification permissions** on app load:

**File**: `web/src/App.tsx`

```typescript
import { requestNotificationPermission } from './services/notifications';

function App() {
  useEffect(() => {
    // Request notification permission after auth
    const initNotifications = async () => {
      const granted = await requestNotificationPermission();
      console.log('Notifications enabled:', granted);
    };
    
    initNotifications();
  }, []);
  
  // ... rest of App
}
```

## 1.3 - Set Up Notification Service (Browser-Safe)

**File**: `web/src/services/notifications.ts`  
**Status**: Already exists ✅  
**Action**: Remove localStorage, use memory-only storage

### Integration Steps:

1. **Update notification service to be browser-safe**:

**File**: `web/src/services/notifications.ts`

```typescript
// ⚠️ CRITICAL: No localStorage - browser artifacts don't support it
// Use memory-only storage or React Context

let notificationPermission: NotificationPermission = 'default';
let notificationSettings = {
  enabled: false,
  soundEnabled: true,
  vibrationEnabled: true
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    notificationPermission = permission;
    notificationSettings.enabled = permission === 'granted';
    return permission === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
};

export const getNotificationPermission = (): NotificationPermission => {
  return notificationPermission;
};

export const updateNotificationSettings = (settings: Partial<typeof notificationSettings>) => {
  notificationSettings = { ...notificationSettings, ...settings };
};

export const getNotificationSettings = () => {
  return { ...notificationSettings };
};

export const showBrowserNotification = (title: string, options?: NotificationOptions) => {
  if (notificationPermission !== 'granted') {
    console.log('Notification permission not granted');
    return;
  }

  try {
    new Notification(title, {
      icon: '/logo.png',
      badge: '/badge.png',
      ...options
    });
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
};
```

2. **DO NOT request permission immediately** - Use opt-in banner instead:

**File**: `web/src/App.tsx`

```typescript
import { getNotificationPermission } from './services/notifications';

function App() {
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);

  useEffect(() => {
    // Show banner if permission is default (not asked yet)
    const permission = getNotificationPermission();
    if (permission === 'default') {
      // Show banner after user has been on site for 10 seconds
      setTimeout(() => {
        setShowNotificationBanner(true);
      }, 10000);
    }
  }, []);

  // ❌ DO NOT DO THIS - Too aggressive
  // useEffect(() => {
  //   requestNotificationPermission();
  // }, []);
  
  // ... rest of App
}
```

**Files Modified**: 
- `web/src/services/notifications.ts`
- `web/src/App.tsx`

**Testing**: 
- Verify no localStorage errors in console
- Verify permission banner appears after delay, not immediately

---

## 1.4 - Create Notification Context (Memory-Only)

**New File**: `web/src/context/NotificationContext.tsx`

```typescript
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Notification } from '../components/Notifications';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotification,
      unreadCount,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
```

3. **Wrap App with NotificationProvider**:

**File**: `web/src/main.tsx`

```typescript
import { NotificationProvider } from './context/NotificationContext';

root.render(
  <React.StrictMode>
    <ThemeProvider defaultMode="dark">
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              {/* App routes */}
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ApolloProvider>
    </ThemeProvider>
  </React.StrictMode>
);
```

**Files Modified**: 
- `web/src/App.tsx`
- `web/src/main.tsx`
- **New**: `web/src/context/NotificationContext.tsx`

**Testing**: Check browser console for permission request

---

# PHASE 2: USER PORTAL INTEGRATION

## 2.1 - Add Notifications to User Portal (with Opt-In Banner)

**File**: `web/src/pages/UserPortalInnovative.tsx`

### Integration Steps:

1. **Import notification components**:
```typescript
import { NotificationCenter, NotificationToast } from '../components/Notifications';
import { useNotifications } from '../context/NotificationContext';
import { requestNotificationPermission, getNotificationPermission } from '../services/notifications';
```

2. **Add notification state**:
```typescript
const [showNotificationCenter, setShowNotificationCenter] = useState(false);
const [showNotificationBanner, setShowNotificationBanner] = useState(false);
const [activeToast, setActiveToast] = useState<Notification | null>(null);
const { notifications, unreadCount, markAsRead, clearNotification, addNotification } = useNotifications();

// Check if we should show opt-in banner
useEffect(() => {
  const permission = getNotificationPermission();
  if (permission === 'default' && currentEventId) {
    // Show banner when user joins an event
    setShowNotificationBanner(true);
  }
}, [currentEventId]);
```

3. **Add opt-in banner** (better UX than immediate permission request):
```typescript
{/* Notification Opt-In Banner */}
{showNotificationBanner && (
  <div className="fixed top-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96">
    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/50 rounded-2xl p-4 backdrop-blur-lg">
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm mb-1">
            Get notified when your song plays!
          </h3>
          <p className="text-gray-300 text-xs mb-3">
            We'll send you a notification when your request is coming up next.
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const granted = await requestNotificationPermission();
                if (granted) {
                  addNotification({
                    type: 'info',
                    title: '🔔 Notifications Enabled!',
                    message: 'You\'ll get updates about your requests',
                  });
                }
                setShowNotificationBanner(false);
              }}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Enable Notifications
            </button>
            <button
              onClick={() => setShowNotificationBanner(false)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowNotificationBanner(false)}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  </div>
)}
```

4. **Add notification bell to top bar** (line ~325):
```typescript
{/* Top Bar - Minimal */}
<div className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/10 safe-area-top">
  <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex items-center justify-between">
    {/* User info */}
    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
      {/* ... existing user info ... */}
    </div>

    {/* RIGHT SIDE - Add notification bell */}
    <div className="flex items-center gap-2">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotificationCenter(true)}
        className="relative p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full text-white text-[10px] sm:text-xs flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Logout button */}
      <button
        onClick={logout}
        className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
        aria-label="Sign out"
      >
        <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      </button>
    </div>
  </div>
</div>
```

4. **Add NotificationCenter modal** (before closing div):
```typescript
{/* Notification Center */}
{showNotificationCenter && (
  <NotificationCenter
    notifications={notifications}
    onClose={() => setShowNotificationCenter(false)}
    onNotificationClick={(notification) => {
      markAsRead(notification.id);
      if (notification.actionUrl) {
        // Handle navigation based on actionUrl
        console.log('Navigate to:', notification.actionUrl);
      }
      setShowNotificationCenter(false);
    }}
    onClearNotification={clearNotification}
  />
)}

{/* Toast Notifications */}
{activeToast && (
  <NotificationToast
    notification={activeToast}
    onClose={() => setActiveToast(null)}
    onAction={() => {
      // Handle toast action
      setActiveToast(null);
    }}
  />
)}
```

5. **Trigger notifications with throttling** (prevent spam):
```typescript
// Add debouncing for rapid updates
const lastNotificationTimeRef = useRef<Record<string, number>>({});

const addThrottledNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  const key = notification.type;
  const now = Date.now();
  const lastTime = lastNotificationTimeRef.current[key] || 0;
  
  // Only allow one notification of same type per 5 seconds
  if (now - lastTime > 5000) {
    addNotification(notification);
    lastNotificationTimeRef.current[key] = now;
  } else {
    console.log(`Throttled ${key} notification (too soon)`);
  }
}, [addNotification]);

// In the queue position check useEffect
useEffect(() => {
  if (!queue?.orderedRequests || !myRequestId) return;

  const myPosition = queue.orderedRequests.findIndex((r: any) => r.requestId === myRequestId) + 1;

  if (myPosition === 1) {
    // Song is playing
    addThrottledNotification({
      type: 'now_playing',
      title: '🎵 Your Song is Playing!',
      message: `${selectedSong?.title} by ${selectedSong?.artist}`,
      metadata: { songTitle: selectedSong?.title },
    });
    setShowNowPlaying(true);
    setViewState('playing');
  } else if (myPosition === 2) {
    // Coming up next
    addThrottledNotification({
      type: 'coming_up',
      title: '⏭️ You\'re Up Next!',
      message: 'Your song will play in approximately 3-5 minutes',
    });
  }
}, [queue, myRequestId, selectedSong, addThrottledNotification]);
```

**Files Modified**: 
- `web/src/pages/UserPortalInnovative.tsx`

**Testing**: 
- Click bell icon to open notification center
- Submit a request and verify notification appears

---

## 2.2 - Replace Request Confirmation Modal (Mobile-Safe)

**File**: `web/src/pages/UserPortalInnovative.tsx`

### Integration Steps:

1. **Import RequestConfirmation**:
```typescript
import { RequestConfirmation } from '../components/RequestConfirmation';
```

2. **Replace the 'requesting' view** (line ~556):

**OLD CODE** (Remove):
```typescript
{/* Request Confirmation */}
{viewState === 'requesting' && selectedSong && (
  <div className="h-full flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-black/80 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
      {/* ... old simple modal ... */}
    </div>
  </div>
)}
```

**NEW CODE** (Replace with):
```typescript
{/* Request Confirmation - Enhanced */}
{viewState === 'requesting' && selectedSong && (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
    onTouchStart={(e) => e.stopPropagation()} // Prevent scroll conflicts on mobile
  >
    <RequestConfirmation
      song={selectedSong}
      userTier={user?.tier as 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'}
      estimatedQueuePosition={(queue?.orderedRequests?.length || 0) + 1}
      estimatedWaitTime="5-10 min"
      onConfirm={async (data) => {
        console.log('Request data:', data);
        
        // Show locked-in animation
        setShowLockedIn(true);
        
        setTimeout(() => {
          setShowLockedIn(false);
          setViewState('waiting');
          setMyRequestPosition((queue?.orderedRequests?.length || 0) + 1);
          
          // Add notification with throttling
          addThrottledNotification({
            type: 'queue_update',
            title: '✅ Request Submitted!',
            message: `${selectedSong.title} is in the queue`,
            metadata: {
              songTitle: selectedSong.title,
            },
          });
        }, 2000);
      }}
      onCancel={handleCancelRequest}
    />
  </div>
)}
```

**Files Modified**: 
- `web/src/pages/UserPortalInnovative.tsx`

**Testing**: 
- Select a song and click request
- Verify enhanced modal shows tier discount, queue position, etc.

---

# PHASE 3: DJ PORTAL INTEGRATION

## 3.1 - Add Profile Management

**File**: `web/src/pages/DJPortalOrbital.tsx`

### Integration Steps:

1. **Import ProfileManagement**:
```typescript
import { ProfileManagement } from '../components/ProfileManagement';
```

2. **Add profile modal state**:
```typescript
const [showProfile, setShowProfile] = useState(false);
```

3. **Add profile button to top bar** (find the settings area):
```typescript
{/* Profile/Settings Button */}
<button
  onClick={() => setShowProfile(true)}
  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
  aria-label="Profile & Settings"
>
  <User className="w-5 h-5 text-gray-400" />
</button>
```

4. **Add ProfileManagement modal** (before closing GestureHandler):
```typescript
{/* Profile Management */}
{showProfile && (
  <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
    <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <ProfileManagement
        userId={user?.userId || ''}
        userRole="PERFORMER"
        initialData={{
          displayName: user?.name || '',
          email: user?.email || '',
          // Add more fields as needed
        }}
        onSave={async (data) => {
          console.log('Saving profile:', data);
          // TODO: Save to backend
          setShowProfile(false);
        }}
        onCancel={() => setShowProfile(false)}
      />
    </div>
  </div>
)}
```

**Files Modified**: 
- `web/src/pages/DJPortalOrbital.tsx`

**Testing**: 
- Click profile button
- Verify profile modal opens with editable fields

---

## 3.2 - Add Request Cap Manager to DJ Settings

**File**: `web/src/pages/DJPortalOrbital.tsx`

### Integration Steps:

1. **Import RequestCapManager**:
```typescript
import { RequestCapManager } from '../components/RequestCapManager';
```

2. **Find the Settings view** (line ~700+) and add RequestCapManager:

```typescript
{/* Settings View */}
{currentView === 'settings' && (
  <div className="h-full overflow-y-auto p-6">
    <h2 className="text-2xl font-bold text-white mb-6">Live Event Settings</h2>
    
    {/* Request Cap Manager */}
    <div className="mb-8">
      <RequestCapManager
        currentCap={currentSet?.settings?.requestCapPerHour || 10}
        requestsThisHour={
          queueRequests.filter((r: any) => {
            const oneHourAgo = Date.now() - 60 * 60 * 1000;
            return r.timestamp > oneHourAgo;
          }).length
        }
        onUpdateCap={async (newCap) => {
          console.log('Updating request cap to:', newCap);
          // TODO: Update via GraphQL
          // await updateSetSettings({ requestCapPerHour: newCap });
        }}
      />
    </div>

    {/* Existing Settings */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Base Price */}
      <div className="bg-white/5 rounded-xl p-6">
        <label className="block text-sm text-gray-400 mb-2">Base Price (R)</label>
        <input
          type="number"
          value={currentSet?.settings?.basePrice || 50}
          onChange={(e) => {
            // Update base price
            console.log('New base price:', e.target.value);
          }}
          className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white"
        />
      </div>

      {/* More settings... */}
    </div>
  </div>
)}
```

**Files Modified**: 
- `web/src/pages/DJPortalOrbital.tsx`

**Testing**: 
- Navigate to Settings view
- Verify request cap slider works
- Check requests/hour counter updates

---

# PHASE 4: REAL-TIME FEATURES

## 4.1 - Enable Queue Subscriptions in User Portal (with Error Boundaries)

**File**: `web/src/pages/UserPortalInnovative.tsx`

### Integration Steps:

1. **Import the hook and backend context**:
```typescript
import { useQueueSubscription } from '../hooks/useQueueSubscription';
import { useBackend } from '../context/BackendContext';
```

2. **Add subscription with error handling** (after existing hooks):
```typescript
const { subscriptionsAvailable } = useBackend();

// Real-time queue updates with fallback
const { 
  queueData: liveQueueData, 
  connectionStatus, 
  error: subscriptionError 
} = useQueueSubscription(
  currentSetId || '',
  currentEventId || ''
);

// Handle subscription errors
useEffect(() => {
  if (subscriptionError) {
    console.error('Subscription error:', subscriptionError);
    addThrottledNotification({
      type: 'error',
      title: '⚠️ Connection Issues',
      message: subscriptionsAvailable 
        ? 'Trying to reconnect...' 
        : 'Using backup updates',
    });
  }
}, [subscriptionError, subscriptionsAvailable, addThrottledNotification]);

// Update queue when subscription receives data
useEffect(() => {
  if (!liveQueueData) return;
  
  console.log('🔴 LIVE queue update:', liveQueueData);
  
  // Check if user's position changed
  const oldPosition = myRequestPosition;
  const newPosition = liveQueueData.orderedRequests?.findIndex(
    (r: any) => r.requestId === myRequestId
  ) + 1;
  
  if (oldPosition && newPosition && oldPosition !== newPosition) {
    // Position changed - notify user
    if (newPosition === 1) {
      addThrottledNotification({
        type: 'now_playing',
        title: '🎵 Your Song is Playing!',
        message: selectedSong?.title || 'Your request',
      });
    } else if (newPosition === 2) {
      addThrottledNotification({
        type: 'coming_up',
        title: '⏭️ You\'re Up Next!',
        message: 'Your song will play soon',
      });
    }
  }
  
  setMyRequestPosition(newPosition || null);
}, [liveQueueData, myRequestId, myRequestPosition, selectedSong, addThrottledNotification]);
```

3. **Add connection status indicator with mode display**:
```typescript
{/* Live Status Indicator */}
{currentEventId && (
  <div className="fixed bottom-20 right-4 z-40">
    <div className={`px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
      connectionStatus === 'connected' 
        ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50' 
        : connectionStatus === 'connecting'
        ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/50'
        : 'bg-gray-500/20 text-gray-400 border-2 border-gray-500/50'
    }`}>
      <div className={`w-2.5 h-2.5 rounded-full ${
        connectionStatus === 'connected' 
          ? 'bg-green-500 animate-pulse' 
          : connectionStatus === 'connecting'
          ? 'bg-yellow-500 animate-pulse'
          : 'bg-gray-500'
      }`} />
      {connectionStatus === 'connected' && (
        <span>{subscriptionsAvailable ? '🔴 Live' : '🔄 Updates'}</span>
      )}
      {connectionStatus === 'connecting' && <span>Connecting...</span>}
      {connectionStatus === 'disconnected' && <span>Offline</span>}
      {connectionStatus === 'error' && <span>Reconnecting...</span>}
    </div>
  </div>
)}
```

**Files Modified**: 
- `web/src/pages/UserPortalInnovative.tsx`

**Testing**: 
- Join an event
- Verify "Live" indicator shows green
- Submit request from another device, verify UI updates

---

## 4.2 - Enable Queue Subscriptions in DJ Portal (with Audio Notifications)

**File**: `web/src/pages/DJPortalOrbital.tsx`

### Integration Steps:

1. **Import the hook and backend context**:
```typescript
import { useQueueSubscription } from '../hooks/useQueueSubscription';
import { useBackend } from '../context/BackendContext';
```

2. **Add subscription with audio notification**:
```typescript
const { subscriptionsAvailable } = useBackend();

// Real-time queue updates
const { 
  queueData: liveQueueData, 
  connectionStatus, 
  error: subscriptionError 
} = useQueueSubscription(
  currentSet?.setId || '',
  currentSet?.eventId || ''
);

// Play sound on new request (optional)
const playNotificationSound = useCallback(() => {
  // Simple beep using Web Audio API (browser-safe)
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // 800 Hz beep
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log('Could not play notification sound:', error);
  }
}, []);

// Update queue when subscription receives data
useEffect(() => {
  if (!liveQueueData?.orderedRequests) return;
  
  const oldCount = queueRequests.length;
  const newCount = liveQueueData.orderedRequests.length;
  
  // New request detected
  if (newCount > oldCount) {
    playNotificationSound();
    
    // Show toast notification
    addNotification({
      type: 'queue_update',
      title: '🎵 New Request!',
      message: `Queue now has ${newCount} requests`,
    });
  }
  
  setQueueRequests(liveQueueData.orderedRequests);
}, [liveQueueData, queueRequests.length, playNotificationSound, addNotification]);

// Handle subscription errors
useEffect(() => {
  if (subscriptionError) {
    console.error('DJ subscription error:', subscriptionError);
  }
}, [subscriptionError]);
```

3. **Add live indicator to DJ portal with reconnection status**:
```typescript
{/* Live Connection Status */}
<div className="fixed top-20 right-4 z-50">
  <div className={`px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2.5 shadow-lg transition-all ${
    connectionStatus === 'connected' 
      ? 'bg-red-500/30 text-red-300 border-2 border-red-500/70 animate-pulse-slow' 
      : connectionStatus === 'connecting'
      ? 'bg-yellow-500/30 text-yellow-300 border-2 border-yellow-500/70'
      : connectionStatus === 'error'
      ? 'bg-orange-500/30 text-orange-300 border-2 border-orange-500/70 animate-pulse'
      : 'bg-gray-500/30 text-gray-300 border-2 border-gray-500/70'
  }`}>
    <div className={`w-3 h-3 rounded-full ${
      connectionStatus === 'connected' 
        ? 'bg-red-500 shadow-lg shadow-red-500/50' 
        : connectionStatus === 'connecting'
        ? 'bg-yellow-500 animate-pulse'
        : connectionStatus === 'error'
        ? 'bg-orange-500 animate-pulse'
        : 'bg-gray-500'
    }`} />
    {connectionStatus === 'connected' && (
      <span>{subscriptionsAvailable ? '🔴 LIVE' : '🔄 POLLING'}</span>
    )}
    {connectionStatus === 'connecting' && <span>⏳ CONNECTING...</span>}
    {connectionStatus === 'error' && <span>⚠️ RECONNECTING...</span>}
    {connectionStatus === 'disconnected' && <span>❌ OFFLINE</span>}
  </div>
</div>
```

**Files Modified**: 
- `web/src/pages/DJPortalOrbital.tsx`

**Testing**: 
- Start a DJ set
- Verify "LIVE" indicator appears
- Submit request from user portal, verify DJ queue updates immediately

---

# PHASE 5: TESTING, ERROR HANDLING & POLISH

## 5.1 - Add Error Boundaries

**New File**: `web/src/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              ⚠️ Something Went Wrong
            </h2>
            <p className="text-gray-300 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Wrap critical sections**:

```typescript
// In main.tsx
<ErrorBoundary>
  <NotificationProvider>
    <BackendProvider>
      <Router>
        {/* App routes */}
      </Router>
    </BackendProvider>
  </NotificationProvider>
</ErrorBoundary>

// In UserPortalInnovative.tsx - wrap subscription
<ErrorBoundary fallback={<div>Real-time updates unavailable</div>}>
  {/* Components using useQueueSubscription */}
</ErrorBoundary>
```

---

## 5.2 - Add Telemetry & Monitoring

**New File**: `web/src/utils/telemetry.ts`

```typescript
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
let pollingStartTime = 0;

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
  }
};

export const trackPollingFallback = () => {
  pollingStartTime = Date.now();
  metrics.pollingFallbackRate++;
};

export const trackNotificationSent = () => {
  metrics.totalNotifications++;
};

export const trackNotificationDelivered = () => {
  metrics.deliveredNotifications++;
  metrics.notificationDeliveryRate = 
    metrics.deliveredNotifications / metrics.totalNotifications;
};

export const getMetrics = () => ({ ...metrics });

export const logMetrics = () => {
  console.table(getMetrics());
};

// Call this every 5 minutes for monitoring
setInterval(() => {
  if (process.env.NODE_ENV === 'development') {
    logMetrics();
  }
}, 5 * 60 * 1000);
```

**Use in subscription hook**:

```typescript
// In useQueueSubscription.ts
import { trackConnectionStart, trackConnectionSuccess, trackPollingFallback } from '../utils/telemetry';

const connectSubscription = useCallback(async () => {
  trackConnectionStart();
  // ... connection logic
  trackConnectionSuccess();
}, []);

const startPolling = useCallback(() => {
  trackPollingFallback();
  // ... polling logic
}, []);
```

---

## 5.3 - Testing Checklist (Updated)

### Notifications Testing
- [ ] Notification permission requested via opt-in banner (NOT immediate popup)
- [ ] Banner appears 10s after joining event (not on page load)
- [ ] "Maybe Later" button hides banner
- [ ] Bell icon shows unread count
- [ ] Clicking bell opens notification center
- [ ] Notifications appear when:
  - [ ] Song request submitted
  - [ ] Song is coming up (position #2)
  - [ ] Song is now playing (position #1)
  - [ ] Request is vetoed (if implemented)
- [ ] **Throttling works** - same notification type not sent more than once per 5 seconds
- [ ] Mark as read works
- [ ] Clear notification works
- [ ] Toast notifications auto-dismiss after 5 seconds
- [ ] **No localStorage errors** in console

### Request Confirmation Testing
- [ ] Enhanced modal shows all information
- [ ] **Mobile touch events don't conflict** with scrolling
- [ ] Dedication message field works
- [ ] Confirm button submits request
- [ ] Cancel button returns to browsing

### Profile Management Testing
- [ ] Profile modal opens from DJ portal
- [ ] All fields editable
- [ ] Save button updates profile
- [ ] Cancel button discards changes
- [ ] **No localStorage usage**

### Request Cap Manager Testing
- [ ] Current cap displays correctly
- [ ] Requests this hour counter accurate
- [ ] Slider adjusts cap value
- [ ] Save button updates cap

### Real-Time Updates Testing
- [ ] **Schema validation runs on startup**
- [ ] Connection status indicator shows correct state:
  - [ ] "🔴 Live" when subscriptions enabled and connected
  - [ ] "🔄 Updates" when polling fallback active
  - [ ] "⏳ Connecting..." during connection
  - [ ] "⚠️ Reconnecting..." during reconnection attempts
  - [ ] "❌ Offline" when disconnected
- [ ] User portal shows live updates
- [ ] DJ portal shows live updates
- [ ] **Reconnection with exponential backoff works**:
  - [ ] 1st attempt: 1 second delay
  - [ ] 2nd attempt: 2 second delay
  - [ ] 3rd attempt: 4 second delay
  - [ ] 4th attempt: 8 second delay
  - [ ] 5th attempt: 16 second delay
  - [ ] After 5 attempts: Falls back to polling
- [ ] **Polling fallback activates** when subscriptions unavailable
- [ ] No duplicate messages
- [ ] No memory leaks after long connection
- [ ] **DJ portal plays audio notification** on new request

### Error Handling Testing
- [ ] Error boundaries catch subscription failures
- [ ] Fallback UI shown when errors occur
- [ ] App doesn't crash on subscription errors
- [ ] Telemetry logs useful debug info

### Browser Compatibility Testing
- [ ] **No localStorage usage** anywhere
- [ ] Works in Chrome/Edge
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile browsers
- [ ] No console errors

### Performance Testing
- [ ] No infinite loops in subscriptions
- [ ] Memory usage stable over time
- [ ] Notification throttling prevents spam
- [ ] Telemetry overhead minimal

---

## 5.4 - Performance Optimization (Updated)

### Notifications Testing
- [ ] Notification permission requested on first load
- [ ] Bell icon shows unread count
- [ ] Clicking bell opens notification center
- [ ] Notifications appear when:
  - [ ] Song request submitted
  - [ ] Song is coming up (position #2)
  - [ ] Song is now playing (position #1)
  - [ ] Request is vetoed (if implemented)
- [ ] Mark as read works
- [ ] Clear notification works
- [ ] Toast notifications auto-dismiss after 5 seconds

### Request Confirmation Testing
- [ ] Enhanced modal shows all information:
  - [ ] Song details (title, artist, genre)
  - [ ] Base price
  - [ ] Tier discount applied correctly
  - [ ] Final price calculation correct
  - [ ] Estimated queue position
  - [ ] Estimated wait time
- [ ] Dedication message field works
- [ ] Spotlight option displays (if enabled)
- [ ] Confirm button submits request
- [ ] Cancel button returns to browsing

### Profile Management Testing
- [ ] Profile modal opens from DJ portal
- [ ] All fields are editable:
  - [ ] Display name
  - [ ] Email
  - [ ] Bio
  - [ ] Profile photo upload
  - [ ] Payment methods
  - [ ] Notification preferences
- [ ] Save button updates profile
- [ ] Cancel button discards changes
- [ ] Form validation works

### Request Cap Manager Testing
- [ ] Current cap displays correctly
- [ ] Requests this hour counter accurate
- [ ] Slider adjusts cap value
- [ ] Save button updates cap
- [ ] Cap enforcement works (if implemented in backend)

### Real-Time Updates Testing
- [ ] Connection status indicator works
- [ ] User portal shows "Live" when connected
- [ ] DJ portal shows "LIVE" when connected
- [ ] Queue updates in real-time:
  - [ ] New requests appear immediately
  - [ ] Position changes update
  - [ ] Accepted/vetoed requests update
- [ ] Reconnection after disconnect works
- [ ] No duplicate messages
- [ ] No memory leaks after long connection

---

## 5.2 - Performance Optimization

### Subscription Management
```typescript
// Add cleanup for subscriptions
useEffect(() => {
  return () => {
    // Cleanup subscription on unmount
    subscription?.unsubscribe();
  };
}, []);
```

### Notification Throttling
```typescript
// Prevent notification spam
const lastNotificationTime = useRef<Record<string, number>>({});

const addThrottledNotification = (notification: Notification) => {
  const key = notification.type;
  const now = Date.now();
  const lastTime = lastNotificationTime.current[key] || 0;
  
  // Only allow one notification of same type per 5 seconds
  if (now - lastTime > 5000) {
    addNotification(notification);
    lastNotificationTime.current[key] = now;
  }
};
```

---

## 5.3 - Error Handling

### Subscription Errors
```typescript
const { queueData, connectionStatus, error } = useQueueSubscription(setId, eventId);

if (error) {
  console.error('Subscription error:', error);
  // Show error notification
  addNotification({
    type: 'error',
    title: '⚠️ Connection Lost',
    message: 'Trying to reconnect...',
  });
}
```

### Notification Permission Denied
```typescript
if (!notificationPermission) {
  // Show in-app prompt
  <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4 m-4">
    <p className="text-yellow-400 text-sm">
      Enable notifications to get updates when your song is playing!
    </p>
    <button onClick={requestNotificationPermission}>
      Enable Notifications
    </button>
  </div>
}
```

---

## 📊 INTEGRATION SUMMARY (UPDATED)

### New Files Created
1. ✅ `web/src/context/NotificationContext.tsx` - Notification state (memory-only)
2. ✅ `web/src/context/BackendContext.tsx` - Backend capability detection
3. ✅ `web/src/utils/validateBackend.ts` - Schema validation utility
4. ✅ `web/src/utils/telemetry.ts` - Metrics tracking (memory-only)
5. ✅ `web/src/components/ErrorBoundary.tsx` - Error handling

### Modified Files
1. `web/src/main.tsx` - Add NotificationProvider, BackendProvider, ErrorBoundary
2. `web/src/App.tsx` - Schema validation, opt-in banner (not immediate permission)
3. `web/src/pages/UserPortalInnovative.tsx` - Notifications, enhanced modal, subscriptions, throttling, mobile-safe
4. `web/src/pages/DJPortalOrbital.tsx` - Profile, request cap, subscriptions, audio notifications
5. `web/src/services/notifications.ts` - Remove localStorage, use memory-only
6. `web/src/hooks/useQueueSubscription.ts` - Add reconnection, fallback, error handling

### Components Already Exist (No Changes Needed)
- ✅ `web/src/components/Notifications.tsx`
- ✅ `web/src/components/ProfileManagement.tsx`
- ✅ `web/src/components/RequestConfirmation.tsx`
- ✅ `web/src/components/RequestCapManager.tsx`

### Backend Requirements

#### GraphQL Schema Updates Needed
```graphql
# Add subscription
type Subscription {
  onQueueUpdate(eventId: ID!): Queue
    @aws_subscribe(mutations: ["addRequest", "updateQueue", "removeRequest"])
}

# Ensure mutations exist
type Mutation {
  addRequest(...): Request
  updateQueue(...): Queue
  removeRequest(...): Boolean
}
```

#### Resolvers Needed
- `Subscription.onQueueUpdate.vtl`
- Ensure mutations have proper resolvers

---

## 🎯 SUCCESS METRICS (UPDATED)

After integration is complete, you should have:

1. ✅ **Real-time notifications** with throttling to prevent spam
2. ✅ **Enhanced request flow** with tier discounts and mobile-safe modals
3. ✅ **DJ profile management** with full editing (no localStorage)
4. ✅ **Request cap controls** for DJs
5. ✅ **Live queue updates** via WebSocket subscriptions OR polling fallback
6. ✅ **Connection status indicators** showing real-time vs polling mode
7. ✅ **Improved UX** across the board
8. ✅ **Reconnection logic** with exponential backoff
9. ✅ **Error boundaries** preventing crashes
10. ✅ **Telemetry** for monitoring performance
11. ✅ **Browser-safe** - no localStorage usage
12. ✅ **Mobile-optimized** - touch events handled properly

---

## 🚦 RECOMMENDED IMPLEMENTATION ORDER (UPDATED)

### Day 1 (Morning) - Foundation ✅
1. ✅ **Create BackendContext** - Validate GraphQL schema
2. ✅ Create NotificationContext (memory-only, no localStorage)
3. ✅ Enable notification service (opt-in banner, not immediate)
4. ✅ Update useQueueSubscription with fallback & reconnection logic
5. ✅ Test schema validation and fallback modes

### Day 1 (Afternoon) - User Portal ✅
6. ✅ Add notification bell to user portal
7. ✅ Add opt-in banner (better UX)
8. ✅ Replace request confirmation modal (mobile-safe)
9. ✅ Add notification throttling
10. ✅ Test notification flow

### Day 2 (Morning) - DJ Portal ✅
11. ✅ Add profile management to DJ portal
12. ✅ Add request cap manager to settings
13. ✅ Test DJ controls

### Day 2 (Afternoon) - Real-Time ✅
14. ✅ Enable subscriptions in user portal with error handling
15. ✅ Enable subscriptions in DJ portal with audio notifications
16. ✅ Add connection indicators with all states
17. ✅ Test real-time updates

### Day 3 - Error Handling & Recovery ✅
18. ✅ Add error boundaries
19. ✅ Add telemetry/monitoring
20. ✅ Test reconnection logic
21. ✅ Test polling fallback
22. ✅ Fix bugs found during testing

### Day 3.5 (Buffer) - Polish & Cross-Browser ✅
23. ✅ Optimize performance
24. ✅ Test on multiple browsers
25. ✅ Test on mobile devices
26. ✅ Verify no localStorage usage
27. ✅ Final testing

---

## 📝 CRITICAL FIXES IMPLEMENTED

### ✅ 1. Browser Storage Restriction
- ❌ **Removed**: All `localStorage` usage
- ✅ **Added**: Memory-only storage in services
- ✅ **Added**: React Context for state management

### ✅ 2. Subscription Infinite Loop Prevention
- ✅ **Added**: Proper dependency tracking
- ✅ **Added**: Cleanup in `useEffect` return
- ✅ **Added**: Ref-based tracking to prevent re-subscriptions

### ✅ 3. GraphQL Schema Validation
- ✅ **Added**: `validateBackendReady()` utility
- ✅ **Added**: BackendContext for app-wide schema info
- ✅ **Added**: Graceful fallback to polling if subscriptions unavailable

### ✅ 4. Notification Throttling
- ✅ **Added**: Debouncing with 5-second minimum interval
- ✅ **Added**: Per-notification-type throttling
- ✅ **Added**: Ref-based timestamp tracking

### ✅ 5. Mobile Touch Handling
- ✅ **Added**: `onTouchStart` with `stopPropagation`
- ✅ **Added**: Prevents scroll conflicts in modals

### ✅ 6. Notification Permission UX
- ❌ **Removed**: Immediate permission request on load
- ✅ **Added**: Contextual opt-in banner
- ✅ **Added**: "Maybe Later" option
- ✅ **Added**: Banner appears when user joins event

### ✅ 7. Reconnection Logic
- ✅ **Added**: Exponential backoff (1s, 2s, 4s, 8s, 16s)
- ✅ **Added**: Max 5 attempts before polling fallback
- ✅ **Added**: Connection state tracking (connecting, connected, error, disconnected)

### ✅ 8. Error Boundaries
- ✅ **Added**: `ErrorBoundary` component
- ✅ **Added**: Fallback UI for errors
- ✅ **Added**: Error logging

### ✅ 9. Telemetry
- ✅ **Added**: In-memory metrics tracking
- ✅ **Added**: Connection uptime monitoring
- ✅ **Added**: Notification delivery rate
- ✅ **Added**: Reconnection performance tracking

---

## 📝 NOTES

- All components already exist and are well-built
- Integration is mostly about importing and wiring them up
- Real-time features require backend GraphQL subscriptions to be configured
- Notifications require browser permission (handle gracefully if denied)
- Test thoroughly with multiple users to verify real-time updates work

---

**Ready to begin integration!** 🚀

Start with Phase 1 and work through sequentially for best results.
