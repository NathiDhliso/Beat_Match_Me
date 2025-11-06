/**
 * useQueueSubscription Hook (Updated with Reconnection & Fallback)
 * Real-time GraphQL subscription for queue updates with:
 * - Exponential backoff reconnection
 * - Automatic polling fallback
 * - Telemetry tracking
 * - Error handling
 * - OPT-4: WebSocket connection reuse across remounts
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

// OPT-4: Global WebSocket connection cache for reuse across component remounts
interface CachedConnection {
  subscription: any;
  eventId: string;
  lastUsed: number;
  refCount: number;
}

const connectionCache = new Map<string, CachedConnection>();
const CONNECTION_CACHE_TTL = 5 * 60 * 1000; // Keep connections alive for 5 minutes

/**
 * Clean up stale cached connections
 */
function cleanupStaleConnections() {
  const now = Date.now();
  const staleKeys: string[] = [];

  connectionCache.forEach((cached, key) => {
    if (cached.refCount === 0 && now - cached.lastUsed > CONNECTION_CACHE_TTL) {
      console.log(`🗑️ Cleaning up stale WebSocket connection: ${key}`);
      try {
        cached.subscription?.unsubscribe();
      } catch (e) {
        console.error('Error unsubscribing stale connection:', e);
      }
      staleKeys.push(key);
    }
  });

  staleKeys.forEach(key => connectionCache.delete(key));
}

// Run cleanup every minute
setInterval(cleanupStaleConnections, 60000);

export function useQueueSubscription(setId: string, eventId: string) {
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<Error | null>(null);
  
  const { subscriptionsAvailable } = useBackend();
  const subscriptionRef = useRef<any>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  // CRITICAL FIX: Track last message timestamp for missed message recovery
  const lastMessageTimestampRef = useRef<number>(0);
  const missedMessagesRef = useRef<Set<string>>(new Set());
  
  // NEW: Health check for detecting stale WebSocket connections
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastHealthCheckResponseRef = useRef<number>(Date.now());
  const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  const HEALTH_CHECK_TIMEOUT = 60000;  // 60 seconds - no response = stale connection

  // OPT-4: Connection cache key
  const cacheKey = `${eventId}-${setId}`;

  // NEW: Recover missed messages after reconnection
  const recoverMissedMessages = useCallback(async () => {
    if (!eventId || !lastMessageTimestampRef.current) return;

    console.log('🔍 Recovering missed messages since:', new Date(lastMessageTimestampRef.current).toISOString());

    try {
      const client = generateClient({
        authMode: 'userPool'
      });

      // Query for requests updated after last message timestamp
      const recoveryQuery = `
        query RecoverMissedUpdates($eventId: ID!, $since: AWSTimestamp!) {
          listRequestsByEvent(
            eventId: $eventId,
            filter: { updatedAt: { gt: $since } }
            limit: 100
          ) {
            items {
              requestId
              queuePosition
              status
              songTitle
              artistName
              updatedAt
            }
          }
        }
      `;

      const response: any = await client.graphql({
        query: recoveryQuery,
        variables: {
          eventId,
          since: lastMessageTimestampRef.current
        }
      });

      if (response.data?.listRequestsByEvent?.items?.length > 0) {
        const recoveredMessages = response.data.listRequestsByEvent.items;
        console.log(`✅ Recovered ${recoveredMessages.length} missed updates`);

        // Merge recovered messages with current queue data
        setQueueData(prev => {
          if (!prev) return prev;

          // Create map of current requests
          const requestMap = new Map(
            prev.orderedRequests.map(r => [r.requestId, r])
          );

          // Update with recovered data
          recoveredMessages.forEach((msg: any) => {
            requestMap.set(msg.requestId, {
              requestId: msg.requestId,
              queuePosition: msg.queuePosition,
              status: msg.status,
              songTitle: msg.songTitle,
              artist: msg.artistName,
            });
            missedMessagesRef.current.add(msg.requestId);
          });

          // Rebuild ordered array sorted by queue position
          const updatedRequests = Array.from(requestMap.values())
            .sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0));

          return {
            ...prev,
            orderedRequests: updatedRequests,
            lastUpdated: Date.now(),
          };
        });
      } else {
        console.log('✅ No missed messages to recover');
      }
    } catch (err) {
      console.error('❌ Failed to recover missed messages:', err);
      // Don't throw - continue with normal operation
    }
  }, [eventId]);

  // Polling fallback
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;
    
    // Don't start polling if we don't have valid IDs (check for empty strings too)
    if (!setId || !eventId || setId === '' || eventId === '') {
      console.log('⚠️ Cannot start polling: missing or empty setId/eventId');
      setConnectionStatus('disconnected');
      return;
    }

    console.log('Starting polling mode (10s interval)');
    setConnectionStatus('connected');

    const poll = async () => {
      // Double-check IDs are still valid (including empty strings)
      if (!eventId || !setId || eventId === '' || setId === '') {
        console.log('⚠️ Polling skipped: missing or empty IDs');
        return;
      }
      
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

        if (response.data?.getQueue) {
          const queueUpdate = response.data.getQueue;
          
          // Track timestamp for polling updates too
          if (queueUpdate.lastUpdated) {
            lastMessageTimestampRef.current = queueUpdate.lastUpdated;
          } else {
            lastMessageTimestampRef.current = Date.now();
          }
          
          setQueueData(queueUpdate);
          setError(null);
        } else {
          console.log('⚠️ Polling returned no queue data');
        }
      } catch (err: any) {
        // Only log errors in development mode to reduce console spam
        if (process.env.NODE_ENV === 'development') {
          // Check if it's a schema error (missing query)
          const isSchemaError = err.errors?.some((e: any) => 
            e.message?.includes('Cannot query field') || 
            e.message?.includes('getQueue')
          );
          
          if (isSchemaError) {
            console.warn('⚠️ Queue polling disabled - schema not deployed');
            // Don't set error for schema issues, just stop polling
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            return;
          }
          
          console.error('Polling error:', err);
          console.error('Error details:', err.errors || err.message);
        }
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
    
    setTimeout(async () => {
      // CRITICAL FIX: Recover missed messages before reconnecting
      await recoverMissedMessages();
      connectSubscription();
    }, delay);
  }, [startPolling, recoverMissedMessages]);

  // NEW: Start health check monitoring for WebSocket connection
  const startHealthCheck = useCallback(() => {
    // Clear any existing health check
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
    }

    console.log('🏥 Starting WebSocket health check monitoring');
    lastHealthCheckResponseRef.current = Date.now();

    healthCheckIntervalRef.current = setInterval(() => {
      const timeSinceLastMessage = Date.now() - lastHealthCheckResponseRef.current;

      // Check if connection is stale (no messages for HEALTH_CHECK_TIMEOUT)
      if (timeSinceLastMessage > HEALTH_CHECK_TIMEOUT) {
        console.warn('⚠️ Stale WebSocket connection detected (no messages for 60s)');
        console.log('🔄 Triggering reconnection due to health check failure');
        
        // Stop health check
        if (healthCheckIntervalRef.current) {
          clearInterval(healthCheckIntervalRef.current);
          healthCheckIntervalRef.current = null;
        }
        
        // Unsubscribe current connection
        if (subscriptionRef.current && subscriptionRef.current.unsubscribe) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }
        
        // Trigger reconnection
        setConnectionStatus('error');
        reconnect();
      } else {
        console.log(`✓ Health check passed (last message: ${Math.round(timeSinceLastMessage / 1000)}s ago)`);
      }
    }, HEALTH_CHECK_INTERVAL);
  }, [reconnect, HEALTH_CHECK_INTERVAL, HEALTH_CHECK_TIMEOUT]);

  // NEW: Stop health check monitoring
  const stopHealthCheck = useCallback(() => {
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
      console.log('🛑 Stopped health check monitoring');
    }
  }, []);

  // Real-time subscription with OPT-4 connection reuse
  const connectSubscription = useCallback(async () => {
    if (!setId || !eventId || setId === '' || eventId === '' || !subscriptionsAvailable) {
      console.log('⚠️ Cannot connect subscription: invalid IDs or subscriptions unavailable');
      if (setId && eventId && setId !== '' && eventId !== '') {
        startPolling();
        trackPollingFallback();
      }
      return;
    }

    // OPT-4: Check if connection already exists in cache
    const cached = connectionCache.get(cacheKey);
    if (cached && cached.subscription) {
      console.log(`♻️ Reusing cached WebSocket connection: ${cacheKey}`);
      subscriptionRef.current = cached.subscription;
      cached.refCount++;
      cached.lastUsed = Date.now();
      setConnectionStatus('connected');
      trackConnectionSuccess();
      startHealthCheck();
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
            const update = data.onQueueUpdate;
            
            // CRITICAL FIX: Track timestamp of received message
            if (update.lastUpdated) {
              lastMessageTimestampRef.current = update.lastUpdated;
            } else {
              lastMessageTimestampRef.current = Date.now();
            }
            
            // NEW: Update health check timestamp on every message
            lastHealthCheckResponseRef.current = Date.now();
            
            // Clear missed messages tracker on successful update
            missedMessagesRef.current.clear();
            
            setQueueData(update);
            setConnectionStatus('connected');
            reconnectAttemptsRef.current = 0;
            setError(null);
            trackConnectionSuccess();
          },
          error: (err: Error) => {
            console.error('Subscription error:', err);
            setError(err);
            setConnectionStatus('error');
            
            // Stop health check on error
            stopHealthCheck();
            reconnect();
          }
        });
        
        // NEW: Start health check after successful subscription
        startHealthCheck();
        
        // OPT-4: Cache the connection for reuse
        connectionCache.set(cacheKey, {
          subscription: subscriptionRef.current,
          eventId,
          lastUsed: Date.now(),
          refCount: 1,
        });
        console.log(`💾 Cached WebSocket connection: ${cacheKey}`);
        
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
  }, [setId, eventId, subscriptionsAvailable, reconnect, startPolling, startHealthCheck, stopHealthCheck, cacheKey]);

  useEffect(() => {
    return () => {
      // OPT-4: Decrement ref count instead of immediate unsubscribe
      const cached = connectionCache.get(cacheKey);
      if (cached) {
        cached.refCount--;
        cached.lastUsed = Date.now();
        console.log(`📉 Decremented connection ref count: ${cached.refCount} (${cacheKey})`);
        
        // Only unsubscribe if no other components using it
        if (cached.refCount <= 0) {
          console.log(`🔌 Last reference removed, will cleanup after TTL: ${cacheKey}`);
        }
      } else if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      // NEW: Clean up health check on unmount
      stopHealthCheck();
    };
  }, [stopHealthCheck, cacheKey]);

  useEffect(() => {
    // Guard: Don't attempt connection without valid IDs (check for empty strings too)
    if (!setId || !eventId || setId === '' || eventId === '') {
      console.log('⚠️ useQueueSubscription: Waiting for valid setId and eventId');
      setConnectionStatus('disconnected');
      return;
    }

    if (subscriptionsAvailable) {
      connectSubscription();
    } else {
      startPolling();
      trackPollingFallback();
    }

    return () => {
      // Cleanup handled by first useEffect
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      // Stop health check
      stopHealthCheck();
    };
  }, [setId, eventId, subscriptionsAvailable, connectSubscription, startPolling, stopHealthCheck]);

  return { queueData, connectionStatus, error };
}
