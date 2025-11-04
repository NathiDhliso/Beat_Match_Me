/**
 * useQueue Hook
 * Manages queue state with real-time updates for a DJ set
 */

import { useState, useEffect } from 'react';
import { fetchQueue } from '../services/graphql';
import { subscribeToQueueUpdates } from '../services/subscriptions';

export function useQueue(setId: string | null) {
  const [queue, setQueue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!setId) {
      setQueue(null);
      setLoading(false);
      return;
    }

    // Fetch initial queue
    const loadQueue = async () => {
      try {
        setLoading(true);
        const data = await fetchQueue(setId);
        setQueue(data);
        setError(null);
      } catch (err) {
        console.warn('⚠️ Queue query error:', err);
        // Log detailed errors if available
        if (err && typeof err === 'object' && 'errors' in err) {
          console.error('GraphQL Errors:', (err as any).errors);
        }
        // Fallback to empty queue until getQueue resolver is configured
        setQueue({
          setId,
          orderedRequests: [],
          lastUpdated: Date.now(),
          currentlyPlaying: null
        });
        setError(null); // Don't treat as error, just use empty queue
      } finally {
        setLoading(false);
      }
    };

    loadQueue();

    // Subscribe to real-time updates
    const subscription = subscribeToQueueUpdates(setId, (updatedQueue) => {
      setQueue(updatedQueue);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setId]);

  return { queue, loading, error, refetch: () => setId ? fetchQueue(setId).then(setQueue) : Promise.resolve() };
}
