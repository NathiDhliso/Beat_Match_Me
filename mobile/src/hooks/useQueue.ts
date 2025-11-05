/**
 * useQueue Hook - Mobile
 * Manages queue state with real-time updates for a DJ set
 */

import { useState, useEffect } from 'react';
import { apolloClient } from '../services/api';
import { GET_QUEUE } from '../services/graphql';
import { subscribeToQueueUpdates } from '../services/subscriptions';

export function useQueue(setId: string | null) {
  const [queue, setQueue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = async (id: string) => {
    try {
      setLoading(true);
      console.log('[useQueue] Fetching queue:', id);
      
      const response = await apolloClient.query({
        query: GET_QUEUE,
        variables: { eventId: id },
        fetchPolicy: 'network-only'
      });

      const data = response.data?.getQueue;
      
      if (data) {
        console.log('[useQueue] Queue fetched:', data);
        setQueue(data);
        setError(null);
      } else {
        // Fallback to empty queue
        console.log('[useQueue] No queue data, using empty queue');
        setQueue({
          setId: id,
          orderedRequests: [],
          lastUpdated: Date.now(),
          currentlyPlaying: null
        });
        setError(null);
      }
    } catch (err: any) {
      console.warn('[useQueue] Queue query error:', err);
      
      // Log detailed errors if available
      if (err.graphQLErrors) {
        console.error('[useQueue] GraphQL Errors:', err.graphQLErrors);
      }
      
      // Fallback to empty queue until getQueue resolver is configured
      setQueue({
        setId: id,
        orderedRequests: [],
        lastUpdated: Date.now(),
        currentlyPlaying: null
      });
      setError(null); // Don't treat as error, just use empty queue
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!setId) {
      setQueue(null);
      setLoading(false);
      return;
    }

    // Fetch initial queue
    loadQueue(setId);

    // Subscribe to real-time updates
    const subscription = subscribeToQueueUpdates(setId, (updatedQueue) => {
      console.log('[useQueue] Received subscription update:', updatedQueue);
      setQueue(updatedQueue);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setId]);

  const refetch = () => {
    if (setId) {
      return loadQueue(setId);
    }
    return Promise.resolve();
  };

  return { queue, loading, error, refetch };
}
