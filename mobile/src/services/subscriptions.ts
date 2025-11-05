/**
 * GraphQL Subscriptions Service for Mobile
 * Handles real-time subscriptions using Apollo Client
 */

import { apolloClient } from './api';
import {
  ON_QUEUE_UPDATE,
  ON_REQUEST_STATUS_CHANGE,
  ON_NEW_REQUEST,
  ON_GROUP_REQUEST_UPDATE,
} from './graphql';

// Subscription return type
interface SubscriptionHandle {
  unsubscribe: () => void;
}

// Queue Update Subscription
export function subscribeToQueueUpdates(
  eventId: string,
  callback: (data: any) => void,
  onError?: (error: any) => void
): SubscriptionHandle {
  console.log(`🔔 Subscribing to queue updates for event: ${eventId}`);

  const observable = apolloClient.subscribe({
    query: ON_QUEUE_UPDATE,
    variables: { eventId },
  });

  const subscription = observable.subscribe({
    next: ({ data }) => {
      if (data && data.onQueueUpdate) {
        console.log('📊 Queue update received');
        callback(data.onQueueUpdate);
      }
    },
    error: (error) => {
      console.error('❌ Queue subscription error:', error);
      if (onError) {
        onError(error);
      } else {
        console.warn('⚠️ Queue subscription not configured:', error.message);
      }
    },
    complete: () => {
      console.log('✅ Queue subscription completed');
    },
  });

  return subscription;
}

// Request Status Change Subscription
export function subscribeToRequestStatus(
  requestId: string,
  callback: (data: any) => void,
  onError?: (error: any) => void
): SubscriptionHandle {
  console.log(`🔔 Subscribing to request status for: ${requestId}`);

  const observable = apolloClient.subscribe({
    query: ON_REQUEST_STATUS_CHANGE,
    variables: { requestId },
  });

  const subscription = observable.subscribe({
    next: ({ data }) => {
      if (data && data.onRequestStatusChange) {
        console.log('🔄 Request status changed');
        callback(data.onRequestStatusChange);
      }
    },
    error: (error) => {
      console.error('❌ Request status subscription error:', error);
      if (onError) {
        onError(error);
      }
    },
    complete: () => {
      console.log('✅ Request status subscription completed');
    },
  });

  return subscription;
}

// New Request Subscription
export function subscribeToNewRequests(
  eventId: string,
  callback: (data: any) => void,
  onError?: (error: any) => void
): SubscriptionHandle {
  console.log(`🔔 Subscribing to new requests for event: ${eventId}`);

  const observable = apolloClient.subscribe({
    query: ON_NEW_REQUEST,
    variables: { eventId },
  });

  const subscription = observable.subscribe({
    next: ({ data }) => {
      if (data && data.onNewRequest) {
        console.log('🎵 New request received');
        callback(data.onNewRequest);
      }
    },
    error: (error) => {
      console.error('❌ New request subscription error:', error);
      if (onError) {
        onError(error);
      }
    },
    complete: () => {
      console.log('✅ New request subscription completed');
    },
  });

  return subscription;
}

// Group Request Update Subscription
export function subscribeToGroupRequest(
  groupRequestId: string,
  callback: (data: any) => void,
  onError?: (error: any) => void
): SubscriptionHandle {
  console.log(`🔔 Subscribing to group request: ${groupRequestId}`);

  const observable = apolloClient.subscribe({
    query: ON_GROUP_REQUEST_UPDATE,
    variables: { groupRequestId },
  });

  const subscription = observable.subscribe({
    next: ({ data }) => {
      if (data && data.onGroupRequestUpdate) {
        console.log('👥 Group request updated');
        callback(data.onGroupRequestUpdate);
      }
    },
    error: (error) => {
      console.error('❌ Group request subscription error:', error);
      if (onError) {
        onError(error);
      }
    },
    complete: () => {
      console.log('✅ Group request subscription completed');
    },
  });

  return subscription;
}

// Subscription Manager (for handling multiple subscriptions)
export class SubscriptionManager {
  private subscriptions: Map<string, SubscriptionHandle> = new Map();

  // Add a subscription with a key
  add(key: string, subscription: SubscriptionHandle) {
    // Unsubscribe from existing subscription with same key
    this.remove(key);
    this.subscriptions.set(key, subscription);
    console.log(`📌 Subscription added: ${key}`);
  }

  // Remove a subscription by key
  remove(key: string) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
      console.log(`🗑️ Subscription removed: ${key}`);
    }
  }

  // Remove all subscriptions
  removeAll() {
    console.log(`🗑️ Removing all ${this.subscriptions.size} subscriptions`);
    this.subscriptions.forEach((subscription, key) => {
      subscription.unsubscribe();
      console.log(`  - Unsubscribed: ${key}`);
    });
    this.subscriptions.clear();
  }

  // Check if a subscription exists
  has(key: string): boolean {
    return this.subscriptions.has(key);
  }

  // Get count of active subscriptions
  count(): number {
    return this.subscriptions.size;
  }
}

// Global subscription manager instance
export const globalSubscriptionManager = new SubscriptionManager();

// Auto-cleanup on app state changes (useful for React Native)
export function setupSubscriptionCleanup() {
  // Clean up all subscriptions when app is unmounted or backgrounded
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      console.log('🧹 App closing - cleaning up subscriptions');
      globalSubscriptionManager.removeAll();
    });
  }
}

// Helper to create a managed subscription
export function createManagedSubscription(
  key: string,
  subscriptionFn: () => SubscriptionHandle
): SubscriptionHandle {
  const subscription = subscriptionFn();
  globalSubscriptionManager.add(key, subscription);
  return subscription;
}

console.log('✅ Subscription service loaded');
