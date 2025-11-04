import React, { useState } from 'react';
import { X, Search, Music, Loader } from 'lucide-react';
import { searchSpotify } from '../services/spotify';
import { searchItunes } from '../services/itunes';

interface SongData {
  title: string;
  artist: string;
  album: string;
  albumArt?: string;
  genre: string;
  duration?: number;
  spotifyId?: string;
  itunesId?: number;
  previewUrl?: string;
}

interface SongSearchModalProps {
  onSelectSong: (song: SongData) => void;
  onClose: () => void;
}

export const SongSearchModal: React.FC<SongSearchModalProps> = ({ onSelectSong, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SongData[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'spotify' | 'itunes' | null>(null);

  const handleSearch = async () => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Try Spotify first
      console.log('🎵 Searching Spotify for:', query);
      const spotifyResults = await searchSpotify(query);
      setResults(spotifyResults);
      setSource('spotify');
      console.log('✅ Found', spotifyResults.length, 'results from Spotify');
    } catch (spotifyError) {
      console.warn('⚠️ Spotify failed, trying iTunes:', spotifyError);
      try {
        // Fallback to iTunes
        const itunesResults = await searchItunes(query);
        setResults(itunesResults);
        setSource('itunes');
        console.log('✅ Found', itunesResults.length, 'results from iTunes');
      } catch (itunesError) {
        console.error('❌ Both Spotify and iTunes failed:', itunesError);
        alert('Search failed. Please check your internet connection.');
        setResults([]);
        setSource(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-900 rounded-3xl border border-white/10 p-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Search Songs</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search Input */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search by song title or artist..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              autoFocus
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || query.length < 2}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Source Indicator */}
        {source && (
          <div className="mb-3 text-sm text-gray-400">
            Results from {source === 'spotify' ? '🎵 Spotify' : '🍎 iTunes'}
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {results.length === 0 && !loading && query.length >= 2 && (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No results found</p>
              <p className="text-gray-500 text-sm mt-2">Try a different search term</p>
            </div>
          )}

          {results.map((song, index) => (
            <button
              key={index}
              onClick={() => {
                onSelectSong(song);
                onClose();
              }}
              className="w-full flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-left group"
            >
              {/* Album Art */}
              {song.albumArt ? (
                <img
                  src={song.albumArt}
                  alt={song.title}
                  className="w-16 h-16 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Music className="w-8 h-8 text-white" />
                </div>
              )}

              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate group-hover:text-purple-300 transition-colors">
                  {song.title}
                </p>
                <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-gray-500 text-xs">{song.genre}</span>
                  {song.duration && (
                    <span className="text-gray-500 text-xs">
                      {Math.floor(song.duration / 60000)}:{String(Math.floor((song.duration % 60000) / 1000)).padStart(2, '0')}
                    </span>
                  )}
                </div>
              </div>

              {/* Add Icon */}
              <div className="text-purple-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Add →
              </div>
            </button>
          ))}
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center text-xs text-gray-500">
          Search uses Spotify (primary) with iTunes fallback
        </div>
      </div>
    </div>
  );
};
