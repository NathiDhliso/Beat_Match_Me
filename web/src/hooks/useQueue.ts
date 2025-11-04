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
        console.error('Failed to fetch queue:', err);
        setQueue(null);
        setError(err instanceof Error ? err.message : 'Failed to load queue');
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
