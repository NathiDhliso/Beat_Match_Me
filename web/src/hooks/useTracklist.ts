/**
 * useTracklist Hook
 * Manages tracklist/available songs for an event
 * Fetches DJ's pre-approved tracklist from backend
 */

import { useState, useEffect, useMemo } from 'react';
import { fetchEventTracklist } from '../services/graphql';
import { useQueue } from './useQueue';
import { useEvent } from './useEvent';

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
  const { event } = useEvent(eventId);
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
        
        if (data && data.songs) {
          // Add basePrice from event settings and mark songs in queue
          const queuedSongKeys = new Set(
            queue?.orderedRequests?.map((r: any) => `${r.songTitle}-${r.artistName}`) || []
          );
          
          const enrichedSongs = data.songs.map((song: any) => ({
            ...song,
            basePrice: event?.settings?.basePrice || 20,
            isInQueue: queuedSongKeys.has(`${song.title}-${song.artist}`),
          }));
          
          setTracklist(enrichedSongs);
          setError(null);
        } else {
          setTracklist([]);
          setError(null); // No error, just empty tracklist
        }
      } catch (err) {
        console.error('Failed to fetch tracklist:', err);
        setTracklist([]);
        setError(err instanceof Error ? err.message : 'Failed to load tracklist');
      } finally {
        setLoading(false);
      }
    };

    loadTracklist();
  }, [eventId, queue, event]);

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
