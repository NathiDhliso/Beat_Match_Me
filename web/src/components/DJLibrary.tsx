/**
 * DJ Library Management
 * Curate master tracklist, enable/disable songs for events
 * Phase 8: Performance - Added virtual scrolling for large track lists
 */

import React, { useEffect, useRef, useState } from 'react';
import { Music, Search, Filter, X, Upload, Globe, Edit, Trash2, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';
import { List } from 'react-window';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import styles from './DJLibrary.module.css';
import { SpotifySearch } from './SpotifySearch';
import { SpotifyPlaylistImport } from './SpotifyPlaylistImport';
import { useTheme } from '../context/ThemeContext';

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  basePrice: number;
  isEnabled: boolean;
  duration?: number;
  albumArt?: string;
}

interface DJLibraryProps {
  tracks: Track[];
  onAddTrack: (track: Omit<Track, 'id'>) => void;
  onUpdateTrack: (id: string, updates: Partial<Track>) => void;
  onDeleteTrack: (id: string) => void;
  onToggleTrack: (id: string) => void;
}

export const DJLibrary: React.FC<DJLibraryProps> = ({
  tracks,
  onAddTrack,
  onUpdateTrack,
  onDeleteTrack,
  onToggleTrack,
}) => {
  const { currentTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSongSearch, setShowSongSearch] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const [listHeight, setListHeight] = useState(0);

  const genres = ['all', ...new Set(tracks.map(t => t.genre))];
  
  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || track.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  useEffect(() => {
    const element = listContainerRef.current;
    if (!element) {
      return;
    }

    const setHeight = () => {
      setListHeight(element.getBoundingClientRect().height);
    };

    setHeight();

    let observer: ResizeObserver | null = null;

    if (typeof window !== 'undefined') {
      if ('ResizeObserver' in window) {
        observer = new ResizeObserver(entries => {
          if (entries[0]) {
            setListHeight(entries[0].contentRect.height);
          }
        });
        observer.observe(element);
      }

      window.addEventListener('resize', setHeight);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }

      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', setHeight);
      }
    };
  }, []);

  const computedListHeight = Math.max(240, listHeight - 48);

  return (
    <div className={`h-full flex flex-col ${styles.libraryRoot}`}>
      {/* Header */}
      <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">My Library</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowSongSearch(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-white text-xs sm:text-sm font-semibold hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-1.5 sm:gap-2 hover:opacity-90"
              style={{
                background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.secondary})`
              }}
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">Search Online</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-white text-xs sm:text-sm font-semibold hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-1.5 sm:gap-2 hover:opacity-90"
              style={{
                background: `linear-gradient(to right, ${currentTheme.secondary}, ${currentTheme.accent})`
              }}
            >
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">Add Manual</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search songs or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors text-sm"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="pl-10 pr-7 py-2.5 bg-white/5 border border-white/10 rounded-full text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer text-sm"
            >
              {genres.map(genre => (
                <option key={genre} value={genre} className="bg-gray-900">
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-sm">
            <p className="text-gray-400 text-xs">Total</p>
            <p className="text-xl font-bold text-white">{tracks.length}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-sm">
            <p className="text-gray-400 text-xs">Enabled</p>
            <p className="text-xl font-bold text-green-400">{tracks.filter(t => t.isEnabled).length}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-sm">
            <p className="text-gray-400 text-xs">Avg Price</p>
            <p className="text-xl font-bold text-yellow-400">
              R{(tracks.reduce((sum, t) => sum + t.basePrice, 0) / tracks.length || 0).toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Track List - Phase 8: Virtual scrolling for performance */}
      <div ref={listContainerRef} className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          {filteredTracks.length > 0 ? (
            <div className="h-full">
              <List
                height={computedListHeight}
                itemCount={filteredTracks.length}
                itemSize={100}
                width="100%"
                itemData={filteredTracks}
              >
              {/* @ts-expect-error - react-window v2 children render function type mismatch */}
              {({ data, index, style }: { data: Track[]; index: number; style: React.CSSProperties }) => {
                const track = data[index];
                return (
                  <div style={style} className="pr-3 pb-3">
                    <TrackCard
                      track={track}
                      onEdit={() => setEditingTrack(track)}
                      onDelete={() => onDeleteTrack(track.id)}
                      onToggle={() => onToggleTrack(track.id)}
                      onUpdatePrice={(price) => onUpdateTrack(track.id, { basePrice: price })}
                    />
                  </div>
                );
              }}
              </List>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Music className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">No tracks found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Track Modal */}
      {showAddModal && (
        <AddTrackModal
          onClose={() => setShowAddModal(false)}
          onAdd={(track) => {
            onAddTrack(track);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Edit Track Modal */}
      {editingTrack && (
        <EditTrackModal
          track={editingTrack}
          onClose={() => setEditingTrack(null)}
          onSave={(updates) => {
            onUpdateTrack(editingTrack.id, updates);
            setEditingTrack(null);
          }}
        />
      )}

      {/* Spotify Search Modal */}
      {showSongSearch && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-8 h-8 text-white" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Search Spotify</h2>
                  <p className="text-green-100 text-sm">Find and add tracks from Spotify's catalog</p>
                </div>
              </div>
              <button
                onClick={() => setShowSongSearch(false)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Spotify Search Component */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
              {/* Playlist Import Section */}
              <SpotifyPlaylistImport
                onImportTracks={(tracks) => {
                  // Add all tracks from playlist
                  tracks.forEach(track => {
                    onAddTrack({
                      title: track.title,
                      artist: track.artist,
                      genre: track.genre || 'Pop',
                      basePrice: 20,
                      isEnabled: true,
                      albumArt: track.albumArt,
                      duration: track.duration,
                    });
                  });
                  console.log(`✅ Imported ${tracks.length} tracks from playlist`);
                }}
              />

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-800 text-gray-400">OR SEARCH INDIVIDUALLY</span>
                </div>
              </div>

              {/* Track Search */}
              <SpotifySearch
                onAddTrack={(track) => {
                  onAddTrack({
                    title: track.title,
                    artist: track.artist,
                    genre: track.genre || 'Pop',
                    basePrice: 20,
                    isEnabled: true,
                    albumArt: track.albumArt,
                    duration: track.duration,
                  });
                  // Show success notification
                  console.log(`✅ Added: ${track.title} by ${track.artist}`);
                }}
                existingTrackIds={new Set(tracks.map(t => t.title + t.artist))}
              />
            </div>

            {/* Footer */}
            <div className="bg-gray-800/50 p-4 border-t border-gray-700 flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                💡 Tip: Click ▶️ to preview tracks before adding
              </p>
              <button
                onClick={() => setShowSongSearch(false)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Track Card Component
 */
interface TrackCardProps {
  track: Track;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onUpdatePrice: (price: number) => void;
}

// Phase 8: Memoized TrackCard for virtual scrolling performance
const TrackCard: React.FC<TrackCardProps> = React.memo(({ track, onEdit, onDelete, onToggle, onUpdatePrice }) => {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState(track.basePrice.toString());

  const handlePriceSave = () => {
    const price = parseFloat(tempPrice);
    if (!isNaN(price) && price >= 0) {
      onUpdatePrice(price);
    }
    setIsEditingPrice(false);
  };

  return (
    <div className={`bg-white/5 backdrop-blur-lg rounded-xl p-4 border ${track.isEnabled ? 'border-green-500/30' : 'border-white/10'} hover:border-purple-500/50 transition-all group`}>
      <div className="flex items-center gap-4">
        {/* Album Art - Phase 8: Lazy loaded for performance */}
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {track.albumArt ? (
            <LazyLoadImage
              src={track.albumArt}
              alt={track.title}
              className="w-full h-full object-cover rounded-lg"
              effect="blur"
              width={64}
              height={64}
            />
          ) : (
            <Music className="w-8 h-8 text-white" />
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{track.title}</h3>
          <p className="text-gray-400 text-sm truncate">{track.artist}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
              {track.genre}
            </span>
            {track.duration && (
              <span className="text-xs text-gray-500">
                {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-yellow-400" />
          {isEditingPrice ? (
            <input
              type="number"
              value={tempPrice}
              onChange={(e) => setTempPrice(e.target.value)}
              onBlur={handlePriceSave}
              onKeyDown={(e) => e.key === 'Enter' && handlePriceSave()}
              className="w-16 px-2 py-1 bg-white/10 border border-purple-500 rounded text-white text-sm focus:outline-none"
              autoFocus
            />
          ) : (
            <span
              onClick={() => setIsEditingPrice(true)}
              className="text-yellow-400 font-semibold cursor-pointer hover:text-yellow-300"
            >
              R{track.basePrice}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onToggle}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title={track.isEnabled ? 'Disable' : 'Enable'}
          >
            {track.isEnabled ? (
              <ToggleRight className="w-5 h-5 text-green-400" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          <button
            onClick={onEdit}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-5 h-5 text-blue-400" />
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
});

/**
 * Add Track Modal
 */
interface AddTrackModalProps {
  onClose: () => void;
  onAdd: (track: Omit<Track, 'id'>) => void;
}

const AddTrackModal: React.FC<AddTrackModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: 'Pop',
    basePrice: 20,
    isEnabled: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.artist) {
      onAdd(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-white mb-6">Add New Track</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Song Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Artist *</label>
            <input
              type="text"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Genre</label>
            <select
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Pop">Pop</option>
              <option value="Rock">Rock</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="R&B">R&B</option>
              <option value="Electronic">Electronic</option>
              <option value="Country">Country</option>
              <option value="Jazz">Jazz</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Base Price (R)</label>
            <input
              type="number"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              min="0"
              step="1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors font-semibold"
            >
              Add Track
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Edit Track Modal
 */
interface EditTrackModalProps {
  track: Track;
  onClose: () => void;
  onSave: (updates: Partial<Track>) => void;
}

const EditTrackModal: React.FC<EditTrackModalProps> = ({ track, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: track.title,
    artist: track.artist,
    genre: track.genre,
    basePrice: track.basePrice,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-white mb-6">Edit Track</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Song Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Artist</label>
            <input
              type="text"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Genre</label>
            <select
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Pop">Pop</option>
              <option value="Rock">Rock</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="R&B">R&B</option>
              <option value="Electronic">Electronic</option>
              <option value="Country">Country</option>
              <option value="Jazz">Jazz</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Base Price (R)</label>
            <input
              type="number"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              min="0"
              step="1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors font-semibold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export type { Track };
