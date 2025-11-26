/**
 * useTracklist Hook - Mobile
 * Manages tracklist/available songs for an event
 * Fetches DJ's pre-approved tracklist from backend
 */

import { useState, useEffect, useMemo } from 'react';
import { apolloClient } from '../services/api';
import { GET_EVENT_TRACKLIST } from '../services/graphql';
import { useQueue } from './useQueue';

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  basePrice: number;
  duration?: string;
  upvotes?: number;
  isInQueue?: boolean;
  albumArt?: string;
  isEnabled?: boolean;
}

export function useTracklist(eventId: string | null) {
  const { queue } = useQueue(eventId || '');
  const [tracklist, setTracklist] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      setTracklist([]);
      return;
    }

    const loadTracklist = async () => {
      try {
        setLoading(true);
        console.log('[useTracklist] Fetching tracklist for event:', eventId);
        
        // Fetch tracklist from backend
        const response = await apolloClient.query({
          query: GET_EVENT_TRACKLIST,
          variables: { eventId },
          fetchPolicy: 'network-only'
        });
        
        const data = response.data?.getEventTracklist;
        
        if (data && Array.isArray(data)) {
          // Add basePrice from event settings and mark songs in queue
          const queuedSongKeys = new Set(
            queue?.orderedRequests?.map((r: any) => `${r.songTitle}-${r.artistName}`) || []
          );
          
          const enrichedSongs: Song[] = data.map((track: any) => ({
            id: track.trackId,
            title: track.title,
            artist: track.artist,
            genre: track.genre,
            duration: track.duration,
            albumArt: track.albumArt,
            basePrice: track.basePrice || 20,
            isInQueue: queuedSongKeys.has(`${track.title}-${track.artist}`),
          }));
          
          console.log('[useTracklist] Tracklist fetched:', enrichedSongs.length, 'tracks');
          setTracklist(enrichedSongs);
          setError(null);
        } else {
          console.log('[useTracklist] No tracklist data, using empty tracklist');
          setTracklist([]);
          setError(null); // No error, just empty tracklist
        }
      } catch (err: any) {
        console.warn('[useTracklist] Tracklist query error:', err);
        
        // Log GraphQL errors
        if (err.graphQLErrors) {
          console.error('[useTracklist] GraphQL Errors:', err.graphQLErrors);
        }
        
        // Fallback to empty tracklist until getEventTracklist resolver is configured
        setTracklist([]);
        setError(null); // Don't treat as error, just use empty tracklist
      } finally {
        setLoading(false);
      }
    };

    loadTracklist();
  }, [eventId, queue?.orderedRequests]);

  // Extract unique genres from tracklist
  const genres = useMemo(() => {
    const uniqueGenres = new Set(tracklist.map(song => song.genre));
    return Array.from(uniqueGenres).filter(Boolean);
  }, [tracklist]);

  return { 
    tracklist, 
    genres,
    loading, 
    error,
  };
}
