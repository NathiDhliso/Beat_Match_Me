/**
 * useEvent Hook
 * Manages event state and data fetching
 */

import { useState, useEffect } from 'react';
import { fetchEvent } from '../services/graphql';

export interface Event {
  eventId: string;
  performerId: string;
  venueName: string;
  venueLocation?: {
    address: string;
    city: string;
    province: string;
  };
  startTime: number;
  endTime: number;
  status: string;
  settings?: {
    basePrice: number;
    requestCapPerHour: number;
    spotlightSlotsPerBlock: number;
    allowDedications: boolean;
    allowGroupRequests: boolean;
  };
  qrCode?: string;
  totalRevenue?: number;
  totalRequests?: number;
}

export function useEvent(eventId: string | null) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const loadEvent = async () => {
      try {
        setLoading(true);
        console.log('🌐 Fetching event from backend:', eventId);
        
        const data = await fetchEvent(eventId);
        setEvent(data);
        setError(null);
      } catch (err) {
        console.error('❌ Failed to fetch event:', err);
        setEvent(null);
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  return { 
    event, 
    loading, 
    error, 
    refetch: () => eventId ? fetchEvent(eventId).then(setEvent) : Promise.resolve() 
  };
}
