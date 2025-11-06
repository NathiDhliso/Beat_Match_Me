/**
 * Event Playlist Manager
 * Easily curate event-specific playlists from your master library
 * Perfect for DJs who play different demographics/events
 */

import React, { useState, useMemo } from 'react';
import { Music, Copy, Save, Search, Check, X, Sparkles, Calendar } from 'lucide-react';
import { List } from 'react-window';

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  basePrice: number;
  isEnabled: boolean;
  albumArt?: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  trackIds: string[];
  genre?: string;
  emoji?: string;
  createdAt: number;
}

interface EventPlaylistManagerProps {
  masterLibrary: Track[]; // All DJ's songs
  currentEventName?: string;
  currentSetId?: string; // Current set ID for saving playlist
  isLive?: boolean; // Whether DJ is currently live
  onApplyPlaylist: (trackIds: string[], playlistInfo: { type: 'PRESET' | 'CUSTOM', id: string, name: string }) => void;
  onClose: () => void;
}

const PRESET_PLAYLISTS = [
  { name: 'Corporate Holiday', emoji: '🎄', genres: ['Pop', 'Jazz', 'R&B'], description: 'Family-friendly festive vibes' },
  { name: 'Club Night', emoji: '🔥', genres: ['Hip Hop', 'Electronic', 'R&B'], description: 'High energy dance music' },
  { name: 'Wedding Reception', emoji: '💒', genres: ['Pop', 'R&B', 'Country', 'Rock'], description: 'Crowd pleasers for all ages' },
  { name: 'Lounge Bar', emoji: '🍸', genres: ['Jazz', 'R&B', 'Pop'], description: 'Smooth background music' },
  { name: 'College Party', emoji: '🎓', genres: ['Hip Hop', 'Electronic', 'Pop'], description: 'Current hits and throwbacks' },
  { name: 'Latin Night', emoji: '💃', genres: ['Latin', 'Reggaeton', 'Salsa'], description: 'Reggaeton, salsa, bachata' },
];

export const EventPlaylistManager: React.FC<EventPlaylistManagerProps> = ({
  masterLibrary,
  currentEventName,
  isLive = false,
  onApplyPlaylist,
  onClose,
}) => {
  const [view, setView] = useState<'quick' | 'custom'>('quick');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [customPlaylistName, setCustomPlaylistName] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [savedPlaylists, setSavedPlaylists] = useState<Playlist[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Extract unique genres from master library
  const availableGenres = useMemo(() => {
    return Array.from(new Set(masterLibrary.map(t => t.genre))).sort();
  }, [masterLibrary]);

  // Filter tracks based on search and genre
  const filteredTracks = useMemo(() => {
    return masterLibrary.filter(track => {
      const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           track.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(track.genre);
      return matchesSearch && matchesGenre;
    });
  }, [masterLibrary, searchQuery, selectedGenres]);

  // Quick select by preset
  const handleQuickSelect = (preset: typeof PRESET_PLAYLISTS[0]) => {
    const tracksInGenres = masterLibrary.filter(t => preset.genres.includes(t.genre));
    const trackIds = tracksInGenres.map(t => t.id);
    
    if (confirm(`Apply "${preset.name}" playlist?\n\n${tracksInGenres.length} songs will be available for this event.`)) {
      onApplyPlaylist(trackIds, {
        type: 'PRESET',
        id: `preset:${preset.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: preset.name
      });
      onClose();
    }
  };

  // Toggle genre filter
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  // Toggle track selection
  const toggleTrack = (trackId: string) => {
    setSelectedTracks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  // Select all filtered tracks
  const selectAll = () => {
    setSelectedTracks(new Set(filteredTracks.map(t => t.id)));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedTracks(new Set());
  };

  // Apply custom selection to event
  const handleApplyCustom = () => {
    if (selectedTracks.size === 0) {
      alert('Please select at least one song');
      return;
    }
    
    if (confirm(`Apply ${selectedTracks.size} songs to this event?`)) {
      const playlistId = `custom:${Date.now()}`;
      onApplyPlaylist(Array.from(selectedTracks), {
        type: 'CUSTOM',
        id: playlistId,
        name: customPlaylistName || 'Custom Selection'
      });
      onClose();
    }
  };

  // Save current selection as playlist
  const handleSavePlaylist = () => {
    if (!customPlaylistName.trim()) {
      alert('Please enter a playlist name');
      return;
    }
    
    if (selectedTracks.size === 0) {
      alert('Please select at least one song');
      return;
    }

    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name: customPlaylistName,
      description: `${selectedTracks.size} songs`,
      trackIds: Array.from(selectedTracks),
      createdAt: Date.now(),
    };

    setSavedPlaylists([...savedPlaylists, newPlaylist]);
    setShowSaveDialog(false);
    setCustomPlaylistName('');
    alert(`✅ Playlist "${newPlaylist.name}" saved!`);
  };

  // Load saved playlist
  const handleLoadPlaylist = (playlist: Playlist) => {
    setSelectedTracks(new Set(playlist.trackIds));
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-purple-500/30 shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-purple-500/30 bg-black/30">
          {/* Live Mode Warning */}
          {isLive && (
            <div className="mb-4 p-4 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="text-yellow-400 font-bold text-lg mb-1">You Are Currently LIVE</h3>
                  <p className="text-yellow-200/80 text-sm">
                    Changing your playlist will:
                  </p>
                  <ul className="text-yellow-200/80 text-sm mt-2 space-y-1 ml-4">
                    <li>• Not affect already accepted requests</li>
                    <li>• Apply to new songs you add to your library</li>
                    <li>• Take effect immediately</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                Event Playlist Manager
              </h2>
              {currentEventName && (
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {currentEventName}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setView('quick')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                view === 'quick'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              ⚡ Quick Presets
            </button>
            <button
              onClick={() => setView('custom')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                view === 'custom'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              🎨 Custom Selection
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 200px)' }}>
          {view === 'quick' ? (
            // Quick Presets View
            <div className="p-4 sm:p-6">
              <p className="text-gray-400 text-sm mb-4">
                Select a preset playlist based on your event type. Instantly curate your tracklist!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRESET_PLAYLISTS.map((preset) => {
                  const matchingTracks = masterLibrary.filter(t => preset.genres.includes(t.genre));
                  
                  return (
                    <button
                      key={preset.name}
                      onClick={() => handleQuickSelect(preset)}
                      className="text-left p-4 sm:p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-all group"
                    >
                      <div className="text-4xl sm:text-5xl mb-3">{preset.emoji}</div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                        {preset.name}
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm mb-3">{preset.description}</p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                        {preset.genres.map(genre => (
                          <span
                            key={genre}
                            className="text-xs px-2 py-1 bg-purple-500/30 text-purple-200 rounded-full"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Music className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-semibold">
                          {matchingTracks.length} songs available
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Saved Playlists */}
              {savedPlaylists.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-4">📚 Your Saved Playlists</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedPlaylists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-semibold">{playlist.name}</h4>
                          <button
                            onClick={() => handleLoadPlaylist(playlist)}
                            className="p-1 hover:bg-purple-500/20 rounded transition-colors"
                            title="Load playlist"
                          >
                            <Copy className="w-4 h-4 text-purple-400" />
                          </button>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{playlist.description}</p>
                        <button
                          onClick={() => {
                            setSelectedTracks(new Set(playlist.trackIds));
                            handleApplyCustom();
                          }}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-semibold transition-colors"
                        >
                          Apply to Event
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Custom Selection View
            <div className="p-4 sm:p-6">
              {/* Search & Filters */}
              <div className="mb-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search songs or artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Genre Filters */}
                <div className="flex flex-wrap gap-2">
                  {availableGenres.map(genre => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedGenres.includes(genre)
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>

                {/* Selection Actions */}
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div className="text-sm text-gray-400">
                    {selectedTracks.size} of {masterLibrary.length} songs selected
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Select All ({filteredTracks.length})
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Track List - Phase 8: Virtual scrolling for performance */}
              <div className="h-96 overflow-hidden">
                {filteredTracks.length > 0 ? (
                  <List
                    height={384} // 96 * 4 = 384px (max-h-96)
                    itemCount={filteredTracks.length}
                    itemSize={76} // Approximate height of each track item
                    width="100%"
                    itemData={{ tracks: filteredTracks, selectedTracks, toggleTrack }}
                  >
                    {/* @ts-expect-error - react-window v2 children render function type mismatch */}
                    {({ data, index, style }: { data: any; index: number; style: React.CSSProperties }) => {
                      const track = data.tracks[index];
                      const isSelected = data.selectedTracks.has(track.id);
                      
                      return (
                        <div style={style} className="pb-2">
                          <button
                            onClick={() => data.toggleTrack(track.id)}
                            className={`w-full p-3 rounded-lg border transition-all text-left ${
                              isSelected
                                ? 'bg-purple-600/30 border-purple-500'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? 'bg-purple-600 border-purple-600'
                                  : 'border-gray-400'
                              }`}>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-white" />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium truncate">{track.title}</h4>
                                <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                              </div>
                              
                              <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full flex-shrink-0">
                                {track.genre}
                              </span>
                            </div>
                          </button>
                        </div>
                      );
                    }}
                  </List>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No songs match your filters</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {view === 'custom' && (
          <div className="p-4 sm:p-6 border-t border-purple-500/30 bg-black/30 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={selectedTracks.size === 0}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save as Playlist
            </button>
            <button
              onClick={handleApplyCustom}
              disabled={selectedTracks.size === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Apply to Event ({selectedTracks.size})
            </button>
          </div>
        )}

        {/* Save Playlist Dialog */}
        {showSaveDialog && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-4">Save Playlist</h3>
              <input
                type="text"
                placeholder="Playlist name (e.g., 'Summer Vibes 2025')"
                value={customPlaylistName}
                onChange={(e) => setCustomPlaylistName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setCustomPlaylistName('');
                  }}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePlaylist}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
