/**
 * Spotify Playlist Import Component
 * Allows DJs to import entire Spotify playlists into their library
 */

import React, { useState } from 'react';
import { Link2, Download, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { getPlaylistTracks, extractPlaylistId } from '../services/spotify';

interface SpotifyPlaylistImportProps {
  onImportTracks: (tracks: Array<{
    title: string;
    artist: string;
    album: string;
    albumArt?: string;
    genre: string;
    duration?: number;
    spotifyId?: string;
    previewUrl?: string;
  }>) => void;
}

export const SpotifyPlaylistImport: React.FC<SpotifyPlaylistImportProps> = ({
  onImportTracks,
}) => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<number | null>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playlistUrl.trim()) {
      setError('Please enter a playlist URL');
      return;
    }

    const playlistId = extractPlaylistId(playlistUrl);
    
    if (!playlistId) {
      setError('Invalid Spotify playlist URL. Please check and try again.');
      return;
    }

    setIsImporting(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('📥 Importing playlist:', playlistId);
      const tracks = await getPlaylistTracks(playlistId);
      
      if (tracks.length === 0) {
        setError('No tracks found in this playlist');
        return;
      }

      onImportTracks(tracks);
      setSuccess(tracks.length);
      setPlaylistUrl('');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
      
      console.log(`✅ Imported ${tracks.length} tracks from playlist`);
    } catch (err: any) {
      console.error('Playlist import failed:', err);
      setError(err.message || 'Failed to import playlist. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Import Spotify Playlist</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Paste a Spotify playlist URL to import all tracks at once
          </p>
        </div>
      </div>

      <form onSubmit={handleImport} className="space-y-4">
        {/* URL Input */}
        <div className="relative">
          <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            placeholder="https://open.spotify.com/playlist/..."
            className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            disabled={isImporting}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/50 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success !== null && (
          <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/50 rounded-xl p-4 animate-scale-in">
            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-600 dark:text-green-400 font-semibold">✅ Successfully imported!</p>
              <p className="text-green-500 dark:text-green-300 text-sm mt-1">Added {success} tracks to your library</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isImporting || !playlistUrl.trim()}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {isImporting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Importing Playlist...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Import Playlist
            </>
          )}
        </button>
      </form>

      {/* Help Text */}
      <div className="mt-4 bg-gray-100 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-700 dark:text-gray-400 text-xs mb-2 font-semibold">How to import:</p>
        <ol className="text-gray-600 dark:text-gray-500 text-xs space-y-1 list-decimal list-inside">
          <li>Open Spotify and find a playlist</li>
          <li>Click Share → Copy link to playlist</li>
          <li>Paste the link above and click Import</li>
          <li>All tracks will be added to your library</li>
        </ol>
      </div>
    </div>
  );
};
