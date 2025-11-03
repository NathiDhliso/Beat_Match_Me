/**
 * GraphQL Subscriptions Service
 * Handles real-time subscriptions
 */

import { API, graphqlOperation } from 'aws-amplify';
import { Observable } from 'zen-observable-ts';
import {
  onQueueUpdate,
  onRequestStatusChange,
  onNewRequest,
  onGroupRequestUpdate,
} from './graphql';

export function subscribeToQueueUpdates(eventId: string, callback: (data: any) => void) {
  const subscription = API.graphql(
    graphqlOperation(onQueueUpdate, { eventId })
  ) as Observable<any>;

  return subscription.subscribe({
    next: ({ value }) => {
      callback(value.data.onQueueUpdate);
    },
    error: (error) => {
      console.error('Queue subscription error:', error);
    },
  });
}

export function subscribeToRequestStatus(requestId: string, callback: (data: any) => void) {
  const subscription = API.graphql(
    graphqlOperation(onRequestStatusChange, { requestId })
  ) as Observable<any>;

  return subscription.subscribe({
    next: ({ value }) => {
      callback(value.data.onRequestStatusChange);
    },
    error: (error) => {
      console.error('Request status subscription error:', error);
    },
  });
}

export function subscribeToNewRequests(eventId: string, callback: (data: any) => void) {
  const subscription = API.graphql(
    graphqlOperation(onNewRequest, { eventId })
  ) as Observable<any>;

  return subscription.subscribe({
    next: ({ value }) => {
      callback(value.data.onNewRequest);
    },
    error: (error) => {
      console.error('New request subscription error:', error);
    },
  });
}

export function subscribeToGroupRequest(groupRequestId: string, callback: (data: any) => void) {
  const subscription = API.graphql(
    graphqlOperation(onGroupRequestUpdate, { groupRequestId })
  ) as Observable<any>;

  return subscription.subscribe({
    next: ({ value }) => {
      callback(value.data.onGroupRequestUpdate);
    },
    error: (error) => {
      console.error('Group request subscription error:', error);
    },
  });
}
