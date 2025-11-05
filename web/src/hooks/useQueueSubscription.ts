/**
 * useQueueSubscription Hook (Updated with Reconnection & Fallback)
 * Real-time GraphQL subscription for queue updates with:
 * - Exponential backoff reconnection
 * - Automatic polling fallback
 * - Telemetry tracking
 * - Error handling
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { generateClient } from 'aws-amplify/api';
import { useBackend } from '../context/BackendContext';
import { trackConnectionStart, trackConnectionSuccess, trackPollingFallback } from '../utils/telemetry';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface QueueData {
  eventId: string;
  orderedRequests: Array<{
    requestId: string;
    queuePosition?: number;
    status?: string;
    songTitle?: string;
    artist?: string;
  }>;
  lastUpdated?: number;
}

export function useQueueSubscription(setId: string, eventId: string) {
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<Error | null>(null);
  
  const { subscriptionsAvailable } = useBackend();
  const subscriptionRef = useRef<any>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Polling fallback
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;

    console.log('Starting polling mode (10s interval)');
    setConnectionStatus('connected');

    const poll = async () => {
      try {
        const client = generateClient({
          authMode: 'userPool'
        });
        
        const getQueueQuery = `
          query GetQueue($eventId: ID!) {
            getQueue(eventId: $eventId) {
              setId
              eventId
              orderedRequests {
                requestId
                queuePosition
                status
                songTitle
                artistName
              }
              lastUpdated
            }
          }
        `;

        const response: any = await client.graphql({
          query: getQueueQuery,
          variables: { eventId }
        });

        setQueueData(response.data.getQueue);
        setError(null);
      } catch (err: any) {
        console.error('Polling error:', err);
        setError(err);
      }
    };

    poll();
    pollingIntervalRef.current = setInterval(poll, 10000);
  }, [setId, eventId]);

  // Reconnection with exponential backoff
  const reconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnect attempts reached, switching to polling');
      setConnectionStatus('disconnected');
      startPolling();
      trackPollingFallback();
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
    reconnectAttemptsRef.current++;

    console.log(`Reconnecting... (${reconnectAttemptsRef.current}/${maxReconnectAttempts}) - delay: ${delay}ms`);
    
    setTimeout(() => {
      connectSubscription();
    }, delay);
  }, [startPolling]);

  // Real-time subscription
  const connectSubscription = useCallback(async () => {
    if (!setId || !eventId || !subscriptionsAvailable) {
      startPolling();
      trackPollingFallback();
      return;
    }

    try {
      trackConnectionStart();
      setConnectionStatus('connecting');
      const client = generateClient({
        authMode: 'userPool'
      });

      const subscriptionQuery = `
        subscription OnQueueUpdate($eventId: ID!) {
          onQueueUpdate(eventId: $eventId) {
            eventId
            orderedRequests {
              requestId
              queuePosition
              status
              songTitle
              artist
            }
            lastUpdated
          }
        }
      `;

      const subscription: any = client.graphql({
        query: subscriptionQuery,
        variables: { eventId }
      });

      if (subscription.subscribe) {
        subscriptionRef.current = subscription.subscribe({
          next: ({ data }: any) => {
            setQueueData(data.onQueueUpdate);
            setConnectionStatus('connected');
            reconnectAttemptsRef.current = 0;
            setError(null);
            trackConnectionSuccess();
          },
          error: (err: Error) => {
            console.error('Subscription error:', err);
            setError(err);
            setConnectionStatus('error');
            reconnect();
          }
        });
      } else {
        console.warn('Subscription not available, falling back to polling');
        startPolling();
        trackPollingFallback();
      }

    } catch (err: any) {
      console.error('Failed to connect subscription:', err);
      setError(err);
      setConnectionStatus('error');
      reconnect();
    }
  }, [setId, eventId, subscriptionsAvailable, reconnect, startPolling]);

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

  useEffect(() => {
    if (!setId || !eventId) return;

    if (subscriptionsAvailable) {
      connectSubscription();
    } else {
      startPolling();
      trackPollingFallback();
    }

    return () => {
      if (subscriptionRef.current && subscriptionRef.current.unsubscribe) {
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
}
