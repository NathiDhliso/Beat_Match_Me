/**
 * Spotify Track Search Component
 * Allows DJs to search Spotify and add tracks to their library
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Music, Loader, Play, Pause, ExternalLink } from 'lucide-react';
import { searchSpotify } from '../services/spotify';

interface SpotifyTrackResult {
  title: string;
  artist: string;
  album: string;
  albumArt?: string;
  genre: string;
  duration?: number;
  spotifyId?: string;
  previewUrl?: string;
}

interface SpotifySearchProps {
  onAddTrack: (track: SpotifyTrackResult) => void;
  existingTrackIds?: Set<string>;
}

export const SpotifySearch: React.FC<SpotifySearchProps> = ({ 
  onAddTrack,
  existingTrackIds = new Set(),
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotifyTrackResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Perform search
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const tracks = await searchSpotify(searchQuery, 20);
      setResults(tracks);
      console.log(`✅ Found ${tracks.length} tracks`);
    } catch (err: any) {
      console.error('Search failed:', err);
      setError('Failed to search Spotify. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handlePlayPreview = (previewUrl: string | undefined, trackId: string) => {
    if (!previewUrl) {
      alert('No preview available for this track');
      return;
    }

    // Stop current preview
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    // Toggle if same track
    if (playingPreview === trackId) {
      setPlayingPreview(null);
      setAudioElement(null);
      return;
    }

    // Play new preview
    const audio = new Audio(previewUrl);
    audio.volume = 0.5;
    audio.play();
    
    audio.onended = () => {
      setPlayingPreview(null);
      setAudioElement(null);
    };

    setAudioElement(audio);
    setPlayingPreview(trackId);
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search Spotify for songs, artists, or albums..."
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        />
        {isSearching && (
          <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 animate-spin" />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Search Hint */}
      {!query && !results.length && (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Search Spotify to add tracks to your library</p>
          <p className="text-gray-600 text-sm mt-2">Try searching for a song, artist, or album name</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((track) => {
            const isAlreadyAdded = track.spotifyId && existingTrackIds.has(track.spotifyId);
            const isPlaying = playingPreview === track.spotifyId;

            return (
              <div
                key={track.spotifyId || `${track.title}-${track.artist}`}
                className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl p-3 transition-all group"
              >
                <div className="flex items-center gap-3">
                  {/* Album Art */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                    {track.albumArt ? (
                      <img 
                        src={track.albumArt} 
                        alt={track.album}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold truncate">{track.title}</h4>
                    <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                    {track.duration && (
                      <p className="text-gray-500 text-xs">{formatDuration(track.duration)}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Preview Button */}
                    {track.previewUrl && (
                      <button
                        onClick={() => handlePlayPreview(track.previewUrl, track.spotifyId!)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title={isPlaying ? 'Stop preview' : 'Play preview'}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 text-green-400" />
                        ) : (
                          <Play className="w-5 h-5 text-gray-400 group-hover:text-green-400" />
                        )}
                      </button>
                    )}

                    {/* Spotify Link */}
                    <a
                      href={`https://open.spotify.com/track/${track.spotifyId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Open in Spotify"
                    >
                      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-green-400" />
                    </a>

                    {/* Add Button */}
                    <button
                      onClick={() => {
                        onAddTrack(track);
                        // Stop preview if playing
                        if (isPlaying && audioElement) {
                          audioElement.pause();
                          setPlayingPreview(null);
                          setAudioElement(null);
                        }
                      }}
                      disabled={isAlreadyAdded || false}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        isAlreadyAdded
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      }`}
                      title={isAlreadyAdded ? 'Already in library' : 'Add to library'}
                    >
                      {isAlreadyAdded ? (
                        <span className="flex items-center gap-2">
                          Added
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {query && !isSearching && results.length === 0 && !error && (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No tracks found for "{query}"</p>
          <p className="text-gray-600 text-sm mt-2">Try a different search term</p>
        </div>
      )}
    </div>
  );
};
