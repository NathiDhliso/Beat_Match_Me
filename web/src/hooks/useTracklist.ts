/**
 * useTracklist Hook
 * Manages tracklist/available songs for an event
 * Fetches DJ's pre-approved tracklist from backend or DJ Set playlist
 */

import { useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/api';
import { fetchEventTracklist, getDJSet } from '../services/graphql';
import { useQueue } from './useQueue';

const client = generateClient();

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

export function useTracklist(eventId: string | null, setId?: string | null) {
  const { queue } = useQueue(setId || eventId || '');
  const [tracklist, setTracklist] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const reload = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (!eventId && !setId) {
      setLoading(false);
      setTracklist([]);
      return;
    }

    const loadTracklist = async () => {
      try {
        setLoading(true);
        
        const queuedSongKeys = new Set(
          queue?.orderedRequests?.map((r: any) => `${r.songTitle}-${r.artistName}`) || []
        );

        // First try to get playlist from DJ Set (if setId provided)
        if (setId) {
          try {
            const response: any = await client.graphql({ 
              query: getDJSet, 
              variables: { setId } 
            });
            
            const djSet = response.data?.getDJSet;
            
            if (djSet?.playlistTracks && djSet.playlistTracks.length > 0) {
              console.log(`🎵 Found DJ Set playlist: ${djSet.playlistName} (${djSet.playlistTracks.length} tracks)`);
              
              // Parse playlist tracks (stored as JSON strings with track info)
              const songs: Song[] = djSet.playlistTracks.map((trackJson: string, index: number) => {
                try {
                  const track = JSON.parse(trackJson);
                  return {
                    id: track.id || `track-${index}`,
                    title: track.title || track.name || 'Unknown',
                    artist: track.artist || track.artists?.[0]?.name || 'Unknown Artist',
                    genre: track.genre || 'Various',
                    basePrice: djSet.settings?.basePrice || 20,
                    duration: track.duration,
                    albumArt: track.albumArt || track.album?.images?.[0]?.url,
                    isInQueue: queuedSongKeys.has(`${track.title}-${track.artist}`),
                  };
                } catch {
                  // If not JSON, treat as simple track ID
                  return {
                    id: trackJson,
                    title: trackJson,
                    artist: 'Unknown Artist',
                    genre: 'Various',
                    basePrice: djSet.settings?.basePrice || 20,
                    isInQueue: false,
                  };
                }
              });
              
              setTracklist(songs);
              setError(null);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.log('ℹ️ Could not fetch DJ Set playlist, trying event tracklist...');
          }
        }

        // Fallback: Fetch tracklist from event
        if (eventId) {
          const data = await fetchEventTracklist(eventId);
          
          if (data && Array.isArray(data)) {
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
            setError(null);
          }
        } else {
          setTracklist([]);
        }
      } catch {
        if (process.env.NODE_ENV === 'development') {
          console.log('ℹ️ Tracklist query not configured, using empty tracklist');
        }
        setTracklist([]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    loadTracklist();
  }, [eventId, setId, queue?.orderedRequests, refreshTrigger]);

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
    reload,
  };
}
