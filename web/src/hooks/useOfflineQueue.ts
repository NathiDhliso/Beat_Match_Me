/**
 * Offline Queue Hook
 * Phase 10: Offline Handling - Request Retry Logic
 * 
 * Manages pending requests when offline and automatically retries them when back online
 */

import { useState, useEffect, useCallback } from 'react';

interface PendingRequest {
  id: string;
  type: 'request' | 'veto' | 'accept' | 'payment';
  data: any;
  timestamp: number;
  retryCount: number;
}

const STORAGE_KEY = 'beatmatchme_offline_queue';
const MAX_RETRIES = 3;

export const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load pending requests from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPendingRequests(parsed);
      } catch (error) {
        console.error('Failed to load offline queue:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save pending requests to localStorage whenever they change
  useEffect(() => {
    if (pendingRequests.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingRequests));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [pendingRequests]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingRequests.length > 0 && !isSyncing) {
      syncPendingRequests();
    }
  }, [isOnline, pendingRequests.length]);

  /**
   * Add a request to the offline queue
   */
  const queueRequest = useCallback((type: PendingRequest['type'], data: any) => {
    const request: PendingRequest = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    setPendingRequests((prev) => [...prev, request]);
    return request.id;
  }, []);

  /**
   * Process a single pending request
   */
  const processPendingRequest = async (request: PendingRequest): Promise<boolean> => {
    try {
      // This would be replaced with actual API calls based on request type
      console.log(`Processing ${request.type} request:`, request.data);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Return true if successful
      return true;
    } catch (error) {
      console.error(`Failed to process ${request.type} request:`, error);
      return false;
    }
  };

  /**
   * Sync all pending requests
   */
  const syncPendingRequests = useCallback(async () => {
    if (!isOnline || isSyncing || pendingRequests.length === 0) {
      return;
    }

    setIsSyncing(true);

    const results: { success: string[]; failed: string[] } = {
      success: [],
      failed: [],
    };

    for (const request of pendingRequests) {
      if (request.retryCount >= MAX_RETRIES) {
        console.warn(`Max retries reached for request ${request.id}`);
        results.failed.push(request.id);
        continue;
      }

      const success = await processPendingRequest(request);

      if (success) {
        results.success.push(request.id);
      } else {
        // Increment retry count
        request.retryCount += 1;
        if (request.retryCount >= MAX_RETRIES) {
          results.failed.push(request.id);
        }
      }
    }

    // Remove successfully processed and permanently failed requests
    setPendingRequests((prev) =>
      prev.filter(
        (req) => !results.success.includes(req.id) && !results.failed.includes(req.id)
      )
    );

    setIsSyncing(false);

    return results;
  }, [isOnline, isSyncing, pendingRequests]);

  /**
   * Clear all pending requests (use with caution)
   */
  const clearQueue = useCallback(() => {
    setPendingRequests([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * Remove a specific request from the queue
   */
  const removeRequest = useCallback((requestId: string) => {
    setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
  }, []);

  return {
    isOnline,
    pendingRequests,
    pendingCount: pendingRequests.length,
    isSyncing,
    queueRequest,
    syncPendingRequests,
    clearQueue,
    removeRequest,
  };
};
