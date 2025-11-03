import React, { useState, useMemo } from 'react';
import { Search, Music } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration?: string;
  upvotes?: number;
  isInQueue?: boolean;
}

interface SongSelectionScreenProps {
  tracklist: Song[];
  onSelectSong: (song: Song) => void;
  onFeelingLucky?: () => void;
}

export const SongSelectionScreen: React.FC<SongSelectionScreenProps> = ({
  tracklist,
  onSelectSong,
  onFeelingLucky,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // Get unique genres
  const genres = useMemo(() => {
    const uniqueGenres = new Set(tracklist.map(song => song.genre));
    return Array.from(uniqueGenres);
  }, [tracklist]);

  // Filter songs
  const filteredSongs = useMemo(() => {
    return tracklist.filter(song => {
      const matchesSearch = searchQuery === '' || 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGenre = !selectedGenre || song.genre === selectedGenre;
      
      return matchesSearch && matchesGenre;
    });
  }, [tracklist, searchQuery, selectedGenre]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Select a Song</h1>
          <p className="text-gray-400">Choose from the DJ's tracklist</p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search songs or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Genre Filter Chips */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
              selectedGenre === null
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Genres
          </button>
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                selectedGenre === genre
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Feeling Lucky Button */}
        {onFeelingLucky && (
          <div className="mb-6">
            <button
              onClick={onFeelingLucky}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Music className="w-5 h-5" />
              Feeling Lucky - Surprise Me!
            </button>
          </div>
        )}

        {/* Song List */}
        <div className="space-y-3">
          {filteredSongs.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No songs found</p>
            </div>
          ) : (
            filteredSongs.map(song => (
              <SongCard
                key={song.id}
                song={song}
                onClick={() => onSelectSong(song)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface SongCardProps {
  song: Song;
  onClick: () => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={song.isInQueue}
      className={`w-full text-left p-4 rounded-xl transition-all ${
        song.isInQueue
          ? 'bg-gray-800/50 opacity-50 cursor-not-allowed'
          : 'bg-gray-800 hover:bg-gray-750 hover:scale-[1.02] active:scale-[0.98]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className={`font-bold text-lg ${song.isInQueue ? 'text-gray-500' : 'text-white'}`}>
            {song.title}
          </h3>
          <p className={`text-sm ${song.isInQueue ? 'text-gray-600' : 'text-gray-400'}`}>
            {song.artist}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${
              song.isInQueue 
                ? 'bg-gray-700 text-gray-500'
                : 'bg-purple-500/20 text-purple-300'
            }`}>
              {song.genre}
            </span>
            {song.duration && (
              <span className="text-xs text-gray-500">
                {song.duration}
              </span>
            )}
            {song.isInQueue && (
              <span className="text-xs text-yellow-500 font-semibold">
                Already in queue
              </span>
            )}
          </div>
        </div>
        
        {song.upvotes !== undefined && song.upvotes > 0 && (
          <div className="ml-4 text-right">
            <div className="text-pink-500 font-semibold">
              ❤️ {song.upvotes}
            </div>
          </div>
        )}
      </div>
    </button>
  );
};
