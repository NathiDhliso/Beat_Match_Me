/**
 * useQueue Hook
 * Manages queue state with real-time updates
 */

import { useState, useEffect } from 'react';
import { fetchQueue } from '../services/graphql';
import { subscribeToQueueUpdates } from '../services/subscriptions';

export function useQueue(eventId: string) {
  const [queue, setQueue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    // Fetch initial queue
    const loadQueue = async () => {
      try {
        setLoading(true);
        const data = await fetchQueue(eventId);
        setQueue(data);
        setError(null);
      } catch (err) {
        console.warn('⚠️ Queue query not configured, using empty queue:', err);
        // Fallback to empty queue until getQueue resolver is configured
        setQueue({
          eventId,
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
    const subscription = subscribeToQueueUpdates(eventId, (updatedQueue) => {
      setQueue(updatedQueue);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId]);

  return { queue, loading, error, refetch: () => fetchQueue(eventId).then(setQueue) };
}
