/**
 * useEvent Hook - Mobile
 * Manages event state and data fetching with Apollo Client
 */

import { useState, useEffect } from 'react';
import { apolloClient } from '../services/api';
import { GET_EVENT } from '../services/graphql';

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

  const loadEvent = async (id: string) => {
    try {
      setLoading(true);
      console.log('[useEvent] Fetching event from backend:', id);
      
      const response = await apolloClient.query({
        query: GET_EVENT,
        variables: { eventId: id },
        fetchPolicy: 'network-only'
      });
      
      const data = response.data?.getEvent;
      
      // Check if event exists
      if (!data || !data.eventId) {
        console.warn('[useEvent] Event not found:', id);
        setEvent(null);
        setError('Event not found');
        return;
      }
      
      console.log('[useEvent] Event fetched successfully:', data);
      setEvent(data);
      setError(null);
    } catch (err: any) {
      console.error('[useEvent] Failed to fetch event:', err);
      
      // Log GraphQL errors
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        console.error('[useEvent] GraphQL Errors:');
        err.graphQLErrors.forEach((error: any, index: number) => {
          console.error(`  Error ${index + 1}:`, error.message);
        });
      }
      
      setEvent(null);
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      setLoading(false);
      setError(null);
      return;
    }

    loadEvent(eventId);
  }, [eventId]);

  const refetch = () => {
    if (eventId) {
      return loadEvent(eventId);
    }
    return Promise.resolve();
  };

  return { 
    event, 
    loading, 
    error, 
    refetch 
  };
}
