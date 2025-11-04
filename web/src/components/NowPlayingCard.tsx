/**
 * Now Playing Card - DJ Side (Feature 12)
 * Shows currently playing song with timer and controls
 */

import React, { useState, useEffect } from 'react';
import { Music, Clock, User, CheckCircle, DollarSign } from 'lucide-react';

export interface NowPlayingData {
  requestId: string;
  songTitle: string;
  artistName: string;
  albumArt?: string;
  duration: string; // e.g., "3:45"
  userName: string;
  userTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  price: number;
  startedAt: number;
}

interface NowPlayingCardProps {
  playing: NowPlayingData;
  onMarkComplete?: () => void;
  onStop?: () => void;
}

const TIER_COLORS = {
  BRONZE: 'text-amber-600',
  SILVER: 'text-gray-400',
  GOLD: 'text-yellow-400',
  PLATINUM: 'text-slate-300',
};

export const NowPlayingCard: React.FC<NowPlayingCardProps> = ({
  playing,
  onMarkComplete,
  onStop,
}) => {
  const [elapsed, setElapsed] = useState(0);

  // Parse duration string (e.g., "3:45" to seconds)
  const durationInSeconds = React.useMemo(() => {
    const parts = playing.duration.split(':');
    const minutes = parseInt(parts[0] || '0', 10);
    const seconds = parseInt(parts[1] || '0', 10);
    return minutes * 60 + seconds;
  }, [playing.duration]);

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedMs = Date.now() - playing.startedAt;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      setElapsed(elapsedSec);
    }, 1000);

    return () => clearInterval(interval);
  }, [playing.startedAt]);

  // Format elapsed time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = durationInSeconds > 0 ? Math.min((elapsed / durationInSeconds) * 100, 100) : 0;
  const isComplete = progress >= 100;

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border-2 border-purple-500/50 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-white font-bold text-sm uppercase tracking-wider">Now Playing</span>
        </div>
        
        {isComplete && (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full animate-pulse">
            Song Finished
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="flex items-start gap-4 mb-4">
        {/* Album Art */}
        {playing.albumArt ? (
          <img
            src={playing.albumArt}
            alt={playing.songTitle}
            className="w-24 h-24 rounded-xl object-cover shadow-lg flex-shrink-0"
          />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Music className="w-12 h-12 text-white" />
          </div>
        )}

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-white mb-1 truncate">
            {playing.songTitle}
          </h3>
          <p className="text-lg text-gray-300 mb-2 truncate">{playing.artistName}</p>
          
          {/* User Info */}
          <div className="flex items-center gap-2 flex-wrap">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">{playing.userName}</span>
            <span className={`text-xs font-bold ${TIER_COLORS[playing.userTier]}`}>
              {playing.userTier}
            </span>
            <div className="flex items-center gap-1 text-yellow-400 ml-auto">
              <DollarSign className="w-4 h-4" />
              <span className="font-bold">R{playing.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2 text-sm">
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">
              {formatTime(elapsed)} / {playing.duration}
            </span>
          </div>
          <span className="text-gray-400">{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      {onMarkComplete && (
        <div className="flex gap-2">
          <button
            onClick={onMarkComplete}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              isComplete
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg animate-pulse'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Mark Complete</span>
          </button>

          {onStop && (
            <button
              onClick={onStop}
              className="px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-medium transition-all"
            >
              Stop
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Compact Now Playing Indicator (for use in headers/navbars)
 */
interface CompactNowPlayingProps {
  songTitle: string;
  artistName: string;
  onClick?: () => void;
}

export const CompactNowPlaying: React.FC<CompactNowPlayingProps> = ({
  songTitle,
  artistName,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full px-4 py-2 hover:from-purple-600/30 hover:to-pink-600/30 transition-all max-w-xs"
    >
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
      <div className="flex-1 min-w-0 text-left">
        <p className="text-white text-sm font-bold truncate">{songTitle}</p>
        <p className="text-gray-400 text-xs truncate">{artistName}</p>
      </div>
      <Music className="w-5 h-5 text-purple-400 flex-shrink-0" />
    </button>
  );
};
