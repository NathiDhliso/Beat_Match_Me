/**
 * useQueueSubscription Hook - Mobile
 * Real-time GraphQL subscription for queue updates with:
 * - Exponential backoff reconnection
 * - Automatic polling fallback
 * - Network status monitoring
 * - Error handling
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { apolloClient } from '../services/api';
import { GET_QUEUE, ON_QUEUE_UPDATE } from '../services/graphql';

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
  
  const subscriptionRef = useRef<any>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const isConnectedRef = useRef(true);

  // Polling fallback
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;

    console.log('[Queue Subscription] Starting polling mode (10s interval)');
    setConnectionStatus('connected');

    const poll = async () => {
      try {
        const response = await apolloClient.query({
          query: GET_QUEUE,
          variables: { eventId },
          fetchPolicy: 'network-only'
        });

        if (response.data?.getQueue) {
          setQueueData(response.data.getQueue);
          setError(null);
        }
      } catch (err: any) {
        console.error('[Queue Subscription] Polling error:', err);
        setError(err);
      }
    };

    poll();
    pollingIntervalRef.current = setInterval(poll, 10000);
  }, [eventId]);

  // Reconnection with exponential backoff
  const reconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('[Queue Subscription] Max reconnect attempts reached, switching to polling');
      setConnectionStatus('disconnected');
      startPolling();
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
    reconnectAttemptsRef.current++;

    console.log(`[Queue Subscription] Reconnecting... (${reconnectAttemptsRef.current}/${maxReconnectAttempts}) - delay: ${delay}ms`);
    
    setTimeout(() => {
      connectSubscription();
    }, delay);
  }, [startPolling]);

  // Real-time subscription
  const connectSubscription = useCallback(() => {
    if (!setId || !eventId || !isConnectedRef.current) {
      startPolling();
      return;
    }

    try {
      console.log('[Queue Subscription] Connecting to real-time subscription...');
      setConnectionStatus('connecting');

      const subscription = apolloClient.subscribe({
        query: ON_QUEUE_UPDATE,
        variables: { eventId }
      });

      subscriptionRef.current = subscription.subscribe({
        next: ({ data }: any) => {
          if (data?.onQueueUpdate) {
            console.log('[Queue Subscription] Received update:', data.onQueueUpdate);
            setQueueData(data.onQueueUpdate);
            setConnectionStatus('connected');
            reconnectAttemptsRef.current = 0;
            setError(null);
          }
        },
        error: (err: Error) => {
          console.error('[Queue Subscription] Subscription error:', err);
          setError(err);
          setConnectionStatus('error');
          reconnect();
        },
        complete: () => {
          console.log('[Queue Subscription] Subscription completed, reconnecting...');
          reconnect();
        }
      });

    } catch (err: any) {
      console.error('[Queue Subscription] Failed to connect subscription:', err);
      setError(err);
      setConnectionStatus('error');
      reconnect();
    }
  }, [setId, eventId, reconnect, startPolling]);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      isConnectedRef.current = state.isConnected ?? true;
      
      if (!state.isConnected) {
        console.log('[Queue Subscription] Network disconnected');
        setConnectionStatus('disconnected');
        
        // Clean up subscription
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }
      } else {
        console.log('[Queue Subscription] Network reconnected, attempting to reconnect subscription');
        reconnectAttemptsRef.current = 0;
        connectSubscription();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [connectSubscription]);

  // Cleanup
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

  // Initialize subscription
  useEffect(() => {
    if (!setId || !eventId) return;

    connectSubscription();

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
  }, [setId, eventId, connectSubscription]);

  return { queueData, connectionStatus, error };
}
