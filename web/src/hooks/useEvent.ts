/**
 * useEvent Hook
 * Manages event state and data fetching
 */

import { useState, useEffect } from 'react';
import { fetchEvent } from '../services/graphql';

export interface Event {
  eventId: string;
  createdBy: string; // User ID who created the event
  venueName: string;
  venueLocation?: {
    address: string;
    city: string;
    province: string;
  };
  startTime: number;
  endTime: number;
  status: string;
  totalRevenue?: number;
  totalRequests?: number;
}

export function useEvent(eventId: string | null) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      setLoading(false);
      setError(null);
      return;
    }

    const loadEvent = async () => {
      try {
        setLoading(true);
        console.log('🌐 Fetching event from backend:', eventId);
        
        const data = await fetchEvent(eventId);
        
        // Check if event exists
        if (!data || !data.eventId) {
          console.warn('⚠️ Event not found:', eventId);
          setEvent(null);
          setError('Event not found');
          return;
        }
        
        console.log('✅ Event fetched successfully:', data);
        setEvent(data);
        setError(null);
      } catch (err: any) {
        console.error('❌ Failed to fetch event:', err);
        
        // Log GraphQL errors
        if (err.errors && err.errors.length > 0) {
          console.error('GraphQL Errors:');
          err.errors.forEach((error: any, index: number) => {
            console.error(`  Error ${index + 1}:`, error.message);
          });
        }
        
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
