/**
 * Event Cache Utility
 * Phase 10: Offline Handling - Event Data Caching
 * 
 * Caches event data locally for offline access
 */

interface CachedEvent {
  id: string;
  venueName: string;
  djName: string;
  startTime: number;
  endTime?: number;
  qrCodeUrl?: string;
  settings?: any;
  cachedAt: number;
}

interface CachedQueue {
  eventId: string;
  requests: any[];
  cachedAt: number;
}

const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours
const EVENT_CACHE_KEY = 'beatmatchme_event_cache';
const QUEUE_CACHE_KEY = 'beatmatchme_queue_cache';

/**
 * Cache event data for offline access
 */
export const cacheEventData = (event: Omit<CachedEvent, 'cachedAt'>): void => {
  try {
    const cached: CachedEvent = {
      ...event,
      cachedAt: Date.now(),
    };

    const existing = getCachedEvents();
    const updated = existing.filter((e) => e.id !== event.id);
    updated.push(cached);

    localStorage.setItem(EVENT_CACHE_KEY, JSON.stringify(updated));
    console.log(`Cached event ${event.id} for offline access`);
  } catch (error) {
    console.error('Failed to cache event data:', error);
  }
};

/**
 * Get all cached events
 */
export const getCachedEvents = (): CachedEvent[] => {
  try {
    const stored = localStorage.getItem(EVENT_CACHE_KEY);
    if (!stored) return [];

    const events: CachedEvent[] = JSON.parse(stored);
    const now = Date.now();

    // Filter out expired caches
    const valid = events.filter((event) => now - event.cachedAt < CACHE_DURATION);

    // Update storage if any were removed
    if (valid.length !== events.length) {
      localStorage.setItem(EVENT_CACHE_KEY, JSON.stringify(valid));
    }

    return valid;
  } catch (error) {
    console.error('Failed to get cached events:', error);
    return [];
  }
};

/**
 * Get a specific cached event by ID
 */
export const getCachedEvent = (eventId: string): CachedEvent | null => {
  const events = getCachedEvents();
  return events.find((e) => e.id === eventId) || null;
};

/**
 * Remove a specific cached event
 */
export const removeCachedEvent = (eventId: string): void => {
  try {
    const events = getCachedEvents();
    const filtered = events.filter((e) => e.id !== eventId);
    localStorage.setItem(EVENT_CACHE_KEY, JSON.stringify(filtered));
    console.log(`Removed cached event ${eventId}`);
  } catch (error) {
    console.error('Failed to remove cached event:', error);
  }
};

/**
 * Clear all cached events
 */
export const clearEventCache = (): void => {
  try {
    localStorage.removeItem(EVENT_CACHE_KEY);
    console.log('Cleared all cached events');
  } catch (error) {
    console.error('Failed to clear event cache:', error);
  }
};

/**
 * Cache queue data for an event
 */
export const cacheQueueData = (eventId: string, requests: any[]): void => {
  try {
    const cached: CachedQueue = {
      eventId,
      requests,
      cachedAt: Date.now(),
    };

    const existing = getCachedQueues();
    const updated = existing.filter((q) => q.eventId !== eventId);
    updated.push(cached);

    localStorage.setItem(QUEUE_CACHE_KEY, JSON.stringify(updated));
    console.log(`Cached queue for event ${eventId}`);
  } catch (error) {
    console.error('Failed to cache queue data:', error);
  }
};

/**
 * Get all cached queues
 */
export const getCachedQueues = (): CachedQueue[] => {
  try {
    const stored = localStorage.getItem(QUEUE_CACHE_KEY);
    if (!stored) return [];

    const queues: CachedQueue[] = JSON.parse(stored);
    const now = Date.now();

    // Filter out expired caches
    const valid = queues.filter((queue) => now - queue.cachedAt < CACHE_DURATION);

    // Update storage if any were removed
    if (valid.length !== queues.length) {
      localStorage.setItem(QUEUE_CACHE_KEY, JSON.stringify(valid));
    }

    return valid;
  } catch (error) {
    console.error('Failed to get cached queues:', error);
    return [];
  }
};

/**
 * Get cached queue for a specific event
 */
export const getCachedQueue = (eventId: string): CachedQueue | null => {
  const queues = getCachedQueues();
  return queues.find((q) => q.eventId === eventId) || null;
};

/**
 * Clear all cached queues
 */
export const clearQueueCache = (): void => {
  try {
    localStorage.removeItem(QUEUE_CACHE_KEY);
    console.log('Cleared all cached queues');
  } catch (error) {
    console.error('Failed to clear queue cache:', error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  const events = getCachedEvents();
  const queues = getCachedQueues();

  return {
    eventCount: events.length,
    queueCount: queues.length,
    totalSize: new Blob([
      localStorage.getItem(EVENT_CACHE_KEY) || '',
      localStorage.getItem(QUEUE_CACHE_KEY) || '',
    ]).size,
  };
};
