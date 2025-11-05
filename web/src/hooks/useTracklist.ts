/**
 * useTracklist Hook
 * Manages tracklist/available songs for an event
 * Fetches DJ's pre-approved tracklist from backend
 */

import { useState, useEffect, useMemo } from 'react';
import { fetchEventTracklist } from '../services/graphql';
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
        
        // Fetch tracklist from backend
        const data = await fetchEventTracklist(eventId);
        
        if (data && Array.isArray(data)) {
          // Add basePrice from event settings and mark songs in queue
          const queuedSongKeys = new Set(
            queue?.orderedRequests?.map((r: any) => `${r.songTitle}-${r.artistName}`) || []
          );
          
          const enrichedSongs = data.map((track: any) => ({
            id: track.trackId,
            title: track.title,
            artist: track.artist,
            genre: track.genre,
            duration: track.duration,
            albumArt: track.albumArt,
            basePrice: track.basePrice || 20,
            isInQueue: queuedSongKeys.has(`${track.title}-${track.artist}`),
          }));
          
          setTracklist(enrichedSongs);
          setError(null);
        } else {
          setTracklist([]);
          setError(null); // No error, just empty tracklist
        }
      } catch (err) {
        // Silently fallback to empty tracklist - this is expected until getEventTracklist resolver is configured
        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('ℹ️ Tracklist query not configured, using empty tracklist');
        }
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
