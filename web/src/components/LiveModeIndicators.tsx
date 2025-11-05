/**
 * Live Mode Visual Indicators
 * Pulsing colors and animations for DJ live mode
 * Provides instant visual feedback for queue events
 */

import React, { useEffect, useState } from 'react';
import { Music, Radio, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface LiveModeIndicatorsProps {
  mode: 'idle' | 'new_request' | 'playing' | 'accepting' | 'vetoed';
  requestCount?: number;
  currentSong?: {
    title: string;
    artist: string;
  };
}

export const LiveModeIndicators: React.FC<LiveModeIndicatorsProps> = ({
  mode,
  requestCount = 0,
  currentSong,
}) => {
  const [pulseKey, setPulseKey] = useState(0);

  // Trigger pulse animation when mode changes
  useEffect(() => {
    setPulseKey(prev => prev + 1);
  }, [mode]);

  const getModeConfig = () => {
    switch (mode) {
      case 'new_request':
        return {
          color: 'from-purple-500 via-pink-500 to-purple-500',
          borderColor: 'border-purple-500',
          icon: <Zap className="w-8 h-8 text-white" />,
          label: 'New Request!',
          pulseColor: 'purple',
          intensity: 'fast',
        };
      case 'playing':
        return {
          color: 'from-green-500 via-emerald-500 to-green-500',
          borderColor: 'border-green-500',
          icon: <Music className="w-8 h-8 text-white" />,
          label: 'Now Playing',
          pulseColor: 'green',
          intensity: 'medium',
        };
      case 'accepting':
        return {
          color: 'from-blue-500 via-cyan-500 to-blue-500',
          borderColor: 'border-blue-500',
          icon: <CheckCircle className="w-8 h-8 text-white" />,
          label: 'Accepting',
          pulseColor: 'blue',
          intensity: 'medium',
        };
      case 'vetoed':
        return {
          color: 'from-red-500 via-orange-500 to-red-500',
          borderColor: 'border-red-500',
          icon: <AlertCircle className="w-8 h-8 text-white" />,
          label: 'Request Vetoed',
          pulseColor: 'red',
          intensity: 'slow',
        };
      default:
        return {
          color: 'from-gray-500 via-gray-600 to-gray-500',
          borderColor: 'border-gray-500',
          icon: <Radio className="w-8 h-8 text-white" />,
          label: 'Live Mode',
          pulseColor: 'gray',
          intensity: 'slow',
        };
    }
  };

  const config = getModeConfig();

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Full Screen Color Wash */}
      <div
        key={`wash-${pulseKey}`}
        className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 animate-color-wash`}
      />

      {/* Pulsing Border */}
      <div
        key={`border-${pulseKey}`}
        className={`absolute inset-0 border-8 ${config.borderColor} animate-pulse-border`}
      />

      {/* Corner Indicators */}
      <div className="absolute top-0 left-0 right-0 flex justify-between p-4 pointer-events-auto">
        {/* Top Left - Status Badge */}
        <div
          className={`px-6 py-3 rounded-full bg-gradient-to-r ${config.color} border-2 ${config.borderColor} shadow-2xl flex items-center gap-3 animate-bounce-in`}
        >
          {config.icon}
          <div>
            <p className="text-white font-bold text-lg">{config.label}</p>
            {requestCount > 0 && (
              <p className="text-white/80 text-sm">{requestCount} in queue</p>
            )}
          </div>
        </div>

        {/* Top Right - Currently Playing */}
        {currentSong && mode === 'playing' && (
          <div className="px-6 py-3 rounded-full bg-black/80 backdrop-blur-lg border-2 border-green-500 shadow-2xl animate-slide-in-right">
            <p className="text-green-400 text-sm font-semibold">NOW PLAYING</p>
            <p className="text-white font-bold">{currentSong.title}</p>
            <p className="text-gray-400 text-sm">{currentSong.artist}</p>
          </div>
        )}
      </div>

      {/* Bottom Center - Request Counter */}
      {requestCount > 0 && mode === 'new_request' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div
            className={`px-8 py-4 rounded-full bg-gradient-to-r ${config.color} border-4 ${config.borderColor} shadow-2xl animate-bounce-scale`}
          >
            <p className="text-white text-center">
              <span className="text-4xl font-bold">{requestCount}</span>
              <span className="text-lg ml-2">New Request{requestCount !== 1 ? 's' : ''}</span>
            </p>
          </div>
        </div>
      )}

      {/* Pulsing Corners */}
      <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${config.color} opacity-30 blur-3xl animate-pulse-corner`} />
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${config.color} opacity-30 blur-3xl animate-pulse-corner animation-delay-500`} />
      <div className={`absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr ${config.color} opacity-30 blur-3xl animate-pulse-corner animation-delay-1000`} />
      <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl ${config.color} opacity-30 blur-3xl animate-pulse-corner animation-delay-1500`} />
    </div>
  );
};

/**
 * Compact Live Status Bar
 * Shows at top of screen for continuous status
 */
interface LiveStatusBarProps {
  isLive: boolean;
  requestCount: number;
  acceptedCount: number;
  playedCount: number;
  currentlyPlaying?: string;
}

export const LiveStatusBar: React.FC<LiveStatusBarProps> = ({
  isLive,
  requestCount,
  acceptedCount,
  playedCount,
  currentlyPlaying,
}) => {
  if (!isLive) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 px-4 py-2 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Live Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white font-bold text-sm">🔴 LIVE</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 sm:gap-6 text-white text-xs sm:text-sm">
            <div>
              <span className="font-semibold">{requestCount}</span>
              <span className="ml-1 opacity-80">Pending</span>
            </div>
            <div>
              <span className="font-semibold">{acceptedCount}</span>
              <span className="ml-1 opacity-80">Accepted</span>
            </div>
            <div>
              <span className="font-semibold">{playedCount}</span>
              <span className="ml-1 opacity-80">Played</span>
            </div>
          </div>

          {/* Currently Playing */}
          {currentlyPlaying && (
            <div className="hidden md:block text-white text-sm">
              <span className="opacity-80">Now: </span>
              <span className="font-semibold">{currentlyPlaying}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * User Now Playing Notification
 * Shows to user when their song is playing
 * Includes recording prompt for proof
 */
interface UserNowPlayingNotificationProps {
  userName: string;
  songTitle: string;
  artistName: string;
  djName: string;
  venueName: string;
  timestamp: number;
  onDismiss: () => void;
}

export const UserNowPlayingNotification: React.FC<UserNowPlayingNotificationProps> = ({
  userName,
  songTitle,
  artistName,
  djName,
  venueName,
  timestamp,
  onDismiss,
}) => {
  const [countdown, setCountdown] = useState(30);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDismiss]);

  const handleStartRecording = async () => {
    setIsRecording(true);
    
    try {
      // Request camera access for recording
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // Show browser's native recording UI
      // User can record their own proof video
      console.log('Recording started', stream);
      
      // Note: Full implementation would use MediaRecorder API
      // For now, just prompt user to use phone camera
      alert('Use your phone camera to record the DJ playing your song! 📹');
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access denied. Use your phone to record manually! 📱');
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl border-4 border-green-400 shadow-2xl overflow-hidden animate-bounce-in">
        {/* Header */}
        <div className="bg-black/30 px-6 py-4 border-b border-green-400">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center animate-pulse">
              <Music className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">🎉 YOUR SONG IS PLAYING!</p>
              <p className="text-green-200 text-sm">Right now at {venueName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Song Info */}
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <p className="text-green-200 text-sm mb-1">Now Playing:</p>
            <p className="text-white font-bold text-xl">{songTitle}</p>
            <p className="text-green-200">{artistName}</p>
            <p className="text-white/60 text-sm mt-2">Requested by {userName}</p>
          </div>

          {/* DJ Info */}
          <div className="flex items-center justify-between text-white text-sm">
            <span>DJ: <span className="font-semibold">{djName}</span></span>
            <span className="opacity-60">{new Date(timestamp).toLocaleTimeString()}</span>
          </div>

          {/* Recording Prompt */}
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📹</span>
              <div className="flex-1">
                <p className="text-white font-semibold mb-1">Record This Moment!</p>
                <p className="text-yellow-200 text-sm mb-3">
                  Capture proof that your song is playing. Share on social media!
                </p>
                <button
                  onClick={handleStartRecording}
                  disabled={isRecording}
                  className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 text-black font-bold rounded-lg transition-colors"
                >
                  {isRecording ? '📹 Recording...' : '📹 Start Recording'}
                </button>
              </div>
            </div>
          </div>

          {/* Social Sharing Prompt */}
          <div className="text-center space-y-2">
            <p className="text-white/80 text-sm">Share your experience:</p>
            <div className="flex gap-2 justify-center">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors">
                📸 Instagram
              </button>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors">
                🎵 TikTok
              </button>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors">
                🐦 Twitter
              </button>
            </div>
          </div>

          {/* Auto-dismiss countdown */}
          <div className="text-center">
            <p className="text-white/60 text-sm">
              Auto-dismissing in {countdown}s
            </p>
            <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-1000"
                style={{ width: `${(countdown / 30) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/30 px-6 py-3 border-t border-green-400 flex justify-between">
          <button
            onClick={onDismiss}
            className="text-white/80 hover:text-white text-sm transition-colors"
          >
            Dismiss
          </button>
          <span className="text-green-300 text-sm font-semibold">
            Enjoy! 🎉
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Request Status Color Indicator
 * Small pill that shows current request status
 */
interface RequestStatusPillProps {
  status: 'pending' | 'accepted' | 'playing' | 'played' | 'vetoed';
  compact?: boolean;
}

export const RequestStatusPill: React.FC<RequestStatusPillProps> = ({
  status,
  compact = false,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-900',
          label: 'Pending',
          icon: '⏳',
        };
      case 'accepted':
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-900',
          label: 'Accepted',
          icon: '✓',
        };
      case 'playing':
        return {
          bg: 'bg-green-500 animate-pulse',
          text: 'text-green-900',
          label: 'Playing Now',
          icon: '🎵',
        };
      case 'played':
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-900',
          label: 'Played',
          icon: '✓',
        };
      case 'vetoed':
        return {
          bg: 'bg-red-500',
          text: 'text-red-900',
          label: 'Vetoed',
          icon: '✗',
        };
    }
  };

  const config = getStatusConfig();

  if (compact) {
    return (
      <div className={`${config.bg} ${config.text} px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
        <span>{config.icon}</span>
      </div>
    );
  }

  return (
    <div className={`${config.bg} ${config.text} px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
};
