/**
 * Mark Playing Panel - DJ Side (Feature 12)
 * Confirmation panel and celebration when DJ marks song as playing
 */

import React from 'react';
import { Play, X, Sparkles, Music } from 'lucide-react';

export interface PlayingRequest {
  requestId: string;
  songTitle: string;
  artistName: string;
  albumArt?: string;
  duration?: string;
  userName: string;
  userTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  price: number;
  waitTime: number; // in minutes
}

interface MarkPlayingPanelProps {
  request: PlayingRequest;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const MarkPlayingPanel: React.FC<MarkPlayingPanelProps> = ({
  request,
  onConfirm,
  onCancel,
  isProcessing = false,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-scale-in">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl max-w-md w-full border border-green-500/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-center relative">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center">
            <Play className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Ready to Play?</h2>
          <p className="text-green-100">This will notify the user</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Song Info */}
          <div className="flex items-start gap-4">
            {request.albumArt ? (
              <img
                src={request.albumArt}
                alt={request.songTitle}
                className="w-24 h-24 rounded-xl object-cover shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Music className="w-12 h-12 text-white" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white mb-1">{request.songTitle}</h3>
              <p className="text-gray-400">{request.artistName}</p>
              {request.duration && (
                <p className="text-sm text-gray-500 mt-1">Duration: {request.duration}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Requested by:</span>
              <span className="text-white font-medium">{request.userName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Waited:</span>
              <span className="text-white font-medium">
                {request.waitTime < 1 ? 'Just now' : `${request.waitTime} min${request.waitTime > 1 ? 's' : ''}`}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Revenue:</span>
              <span className="text-yellow-400 font-bold text-lg">+R{request.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Yes, Play Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Now Playing Celebration Animation
 */
interface PlayingCelebrationProps {
  request: PlayingRequest;
  onComplete: () => void;
}

export const PlayingCelebration: React.FC<PlayingCelebrationProps> = ({ request, onComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 flex items-center justify-center z-50">
      <div className="text-center relative">
        {/* Sparkle Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Album Art/Icon */}
          {request.albumArt ? (
            <img
              src={request.albumArt}
              alt={request.songTitle}
              className="w-48 h-48 mx-auto mb-6 rounded-3xl object-cover shadow-2xl animate-scale-in transform scale-150 rotate-12"
            />
          ) : (
            <div className="w-48 h-48 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl animate-scale-in transform scale-150 rotate-12">
              <Music className="w-24 h-24 text-white" />
            </div>
          )}

          {/* NOW PLAYING Banner */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-12 py-4 rounded-full inline-block mb-4 shadow-2xl animate-pulse-glow">
            <p className="text-white font-bold text-3xl">NOW PLAYING</p>
          </div>

          {/* Song Info */}
          <h2 className="text-5xl font-bold text-white mb-2 animate-scale-in">
            {request.songTitle}
          </h2>
          <p className="text-2xl text-gray-300">{request.artistName}</p>
        </div>

        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 blur-3xl animate-pulse-glow -z-10" />
      </div>
    </div>
  );
};
