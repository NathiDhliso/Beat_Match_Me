/**
 * GraphQL Subscriptions Service
 * Handles real-time subscriptions
 */

import { generateClient } from 'aws-amplify/api';
import {
  onQueueUpdate,
  onRequestStatusChange,
  onNewRequest,
  onGroupRequestUpdate,
} from './graphql';

const client = generateClient();

export function subscribeToQueueUpdates(eventId: string, callback: (data: any) => void) {
  const subscription = (client.graphql({
    query: onQueueUpdate,
    variables: { eventId }
  }) as any).subscribe({
    next: ({ data }: any) => {
      callback(data.onQueueUpdate);
    },
    error: (error: any) => {
      console.warn('⚠️ Queue subscription not configured:', error.errors?.[0]?.message || error.message);
      // Subscriptions not critical, just log warning
    },
  });

  return subscription;
}

export function subscribeToRequestStatus(requestId: string, callback: (data: any) => void) {
  const subscription = (client.graphql({
    query: onRequestStatusChange,
    variables: { requestId }
  }) as any).subscribe({
    next: ({ data }: any) => {
      callback(data.onRequestStatusChange);
    },
    error: (error: any) => {
      console.error('Request status subscription error:', error);
    },
  });

  return subscription;
}

export function subscribeToNewRequests(eventId: string, callback: (data: any) => void) {
  const subscription = (client.graphql({
    query: onNewRequest,
    variables: { eventId }
  }) as any).subscribe({
    next: ({ data }: any) => {
      callback(data.onNewRequest);
    },
    error: (error: any) => {
      console.error('New request subscription error:', error);
    },
  });

  return subscription;
}

export function subscribeToGroupRequest(groupRequestId: string, callback: (data: any) => void) {
  const subscription = (client.graphql({
    query: onGroupRequestUpdate,
    variables: { groupRequestId }
  }) as any).subscribe({
    next: ({ data }: any) => {
      callback(data.onGroupRequestUpdate);
    },
    error: (error: any) => {
      console.error('Group request subscription error:', error);
    },
  });

  return subscription;
}
