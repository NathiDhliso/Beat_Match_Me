/**
 * Tracklist Manager Component
 * Allows DJs to upload and manage their pre-approved song list
 * CORE VALUE PROP: "Curated Request Lists - pre-approve entire catalog"
 */

import React, { useState } from 'react';
import { Music, Upload, Trash2, Plus, Check, X } from 'lucide-react';

interface Song {
  id?: string;
  title: string;
  artist: string;
  genre: string;
  duration?: string;
}

interface TracklistManagerProps {
  existingSongs?: Song[];
  onSave: (songs: Song[]) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export const TracklistManager: React.FC<TracklistManagerProps> = ({
  existingSongs = [],
  onSave,
  onCancel,
  className = '',
}) => {
  const [songs, setSongs] = useState<Song[]>(existingSongs);
  const [newSong, setNewSong] = useState<Song>({ title: '', artist: '', genre: '', duration: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddSong = () => {
    if (newSong.title && newSong.artist && newSong.genre) {
      setSongs([...songs, { ...newSong, id: `temp-${Date.now()}` }]);
      setNewSong({ title: '', artist: '', genre: '', duration: '' });
      setIsAdding(false);
    }
  };

  const handleRemoveSong = (index: number) => {
    setSongs(songs.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(songs);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const parsedSongs: Song[] = [];

        // Expected CSV format: Title,Artist,Genre,Duration
        lines.slice(1).forEach((line) => {
          const [title, artist, genre, duration] = line.split(',').map(s => s.trim());
          if (title && artist && genre) {
            parsedSongs.push({
              id: `temp-${Date.now()}-${parsedSongs.length}`,
              title,
              artist,
              genre,
              duration: duration || '',
            });
          }
        });

        setSongs([...songs, ...parsedSongs]);
      } catch (error) {
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tracklist Manager</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Pre-approve songs that audience can request
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {songs.length} songs
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Song
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Add Song Form */}
      {isAdding && (
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Song</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Song Title *"
              value={newSong.title}
              onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Artist *"
              value={newSong.artist}
              onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Genre *"
              value={newSong.genre}
              onChange={(e) => setNewSong({ ...newSong, genre: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Duration (e.g., 3:45)"
              value={newSong.duration}
              onChange={(e) => setNewSong({ ...newSong, duration: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddSong}
              disabled={!newSong.title || !newSong.artist || !newSong.genre}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewSong({ title: '', artist: '', genre: '', duration: '' });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Song List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredSongs.length === 0 ? (
          <div className="p-12 text-center">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {songs.length === 0 ? 'No songs added yet' : 'No songs match your search'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSongs.map((song, index) => (
              <div
                key={song.id || index}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{song.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {song.artist} • {song.genre}
                      {song.duration && ` • ${song.duration}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveSong(index)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          CSV Format: Title,Artist,Genre,Duration
        </p>
        <div className="flex gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || songs.length === 0}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : `Save Tracklist (${songs.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};
