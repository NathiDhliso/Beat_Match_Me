/**
 * Queue Tracker Component
 * Real-time queue position tracking with visual progress
 * Features:
 * - Live position updates
 * - Estimated play time
 * - Songs ahead counter
 * - Visual progress ring
 * - Position milestone celebrations
 */

import React, { useEffect, useState } from 'react';
import { Music, Clock, Users, TrendingUp, Sparkles } from 'lucide-react';
import { useThemeClasses } from '../context/ThemeContext';

interface QueueTrackerProps {
  position: number;
  totalInQueue: number;
  songTitle: string;
  artistName: string;
  avgSongDuration?: number; // in seconds, default 180 (3 min)
  onBrowseMore?: () => void;
}

export const QueueTracker: React.FC<QueueTrackerProps> = ({
  position,
  totalInQueue,
  songTitle,
  artistName,
  avgSongDuration = 180,
  onBrowseMore,
}) => {
  const themeClasses = useThemeClasses();
  const [animatedPosition, setAnimatedPosition] = useState(position);
  const [showMilestone, setShowMilestone] = useState(false);
  const [positionImprovement, setPositionImprovement] = useState(0); // PHASE 5: Track position changes

  // PHASE 5 ENHANCEMENT: Animate position changes with time saved calculation
  useEffect(() => {
    if (position < animatedPosition) {
      const improvement = animatedPosition - position;
      setPositionImprovement(improvement);
      // Position improved - show celebration
      setShowMilestone(true);
      setTimeout(() => setShowMilestone(false), 3000);
    }
    setAnimatedPosition(position);
  }, [position, animatedPosition]);

  // Calculate estimated wait time
  const songsAhead = position - 1;
  const estimatedSeconds = songsAhead * avgSongDuration;
  const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
  const estimatedTimeDisplay = estimatedMinutes < 60
    ? `~${estimatedMinutes} min`
    : `~${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m`;

  // Calculate progress percentage (inverse - higher position = less progress)
  const progressPercentage = ((totalInQueue - position) / totalInQueue) * 100;

  // PHASE 5 ENHANCEMENT: Queue Activity Level
  const getQueueActivity = () => {
    if (totalInQueue < 5) {
      return { label: 'Quiet Night', color: 'text-blue-400', emoji: '🌙' };
    } else if (totalInQueue < 15) {
      return { label: 'Busy Queue', color: 'text-yellow-400', emoji: '🔥' };
    } else {
      return { label: 'Super Active!', color: 'text-red-400', emoji: '⚡' };
    }
  };

  const queueActivity = getQueueActivity();

  // Determine status message and color
  const getStatusInfo = () => {
    if (position === 1) {
      return {
        message: "YOU'RE UP NEXT!",
        emoji: '🎵',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
      };
    } else if (position === 2) {
      return {
        message: 'Almost There!',
        emoji: '🔥',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
      };
    } else if (position <= 3) {
      return {
        message: 'Coming Soon!',
        emoji: '⚡',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
      };
    } else {
      return {
        message: 'In Queue',
        emoji: '⏳',
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
      };
    }
  };

  const status = getStatusInfo();

  // SVG Progress Ring
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="relative h-full flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Gradient Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)] animate-pulse" />
      </div>

      {/* PHASE 5 ENHANCEMENT: Milestone Celebration with Time Saved */}
      {showMilestone && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className={`${themeClasses.gradientPrimary} px-6 py-3 rounded-full shadow-2xl`}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-white" />
              <span className="text-white font-bold">
                Moved Up {positionImprovement} {positionImprovement === 1 ? 'Spot' : 'Spots'}!
              </span>
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </div>
            <div className="text-xs text-white/80 text-center mt-1">
              ~{positionImprovement * Math.ceil(avgSongDuration / 60)} min saved ⚡
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-8 max-w-lg">
        {/* Song Info */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{songTitle}</h2>
          <p className="text-lg text-gray-400">{artistName}</p>
        </div>

        {/* Position Display with Progress Ring */}
        <div className="relative inline-flex items-center justify-center">
          {/* SVG Progress Ring */}
          <svg className="transform -rotate-90 w-48 h-48" viewBox="0 0 160 160">
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-700"
            />
            {/* Progress Circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>

          {/* Position Number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-6xl font-bold ${status.color} transition-colors duration-500`}>
              #{position}
            </div>
            <div className="text-sm text-gray-500 mt-1">of {totalInQueue}</div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-6 py-3 ${status.bgColor} rounded-full`}>
          <span className="text-2xl">{status.emoji}</span>
          <span className={`${status.color} font-bold text-lg`}>{status.message}</span>
        </div>

        {/* PHASE 5 ENHANCEMENT: Enhanced Stats Grid with Total Queue */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {/* Songs Ahead */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex flex-col items-center">
              <Music className="w-8 h-8 text-purple-400 mb-2" />
              <div className="text-3xl font-bold text-white">{songsAhead}</div>
              <div className="text-xs text-gray-400 mt-1">Songs Ahead</div>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 text-pink-400 mb-2" />
              <div className="text-3xl font-bold text-white">{estimatedTimeDisplay}</div>
              <div className="text-xs text-gray-400 mt-1">Est. Wait</div>
            </div>
          </div>

          {/* Total in Queue */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 text-blue-400 mb-2" />
              <div className="text-3xl font-bold text-white">{totalInQueue}</div>
              <div className="text-xs text-gray-400 mt-1">Total Requests</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${themeClasses.gradientPrimary} transition-all duration-1000 ease-out rounded-full`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">
            {Math.round(progressPercentage)}% through the queue
          </p>
          {/* PHASE 5: Queue Activity Indicator */}
          <div className={`flex items-center gap-1 ${queueActivity.color}`}>
            <span>{queueActivity.emoji}</span>
            <span className="font-semibold">{queueActivity.label}</span>
          </div>
        </div>

        {/* Real-time Indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Live Updates Active</span>
        </div>

        {/* Browse More Button */}
        {onBrowseMore && position > 2 && (
          <button
            onClick={onBrowseMore}
            className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all font-semibold flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            Browse More Songs
          </button>
        )}

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {position === 1
              ? "🎧 DJ is about to play your song!"
              : position === 2
              ? "Get ready! You'll be up very soon."
              : "We'll notify you when you're next in line."}
          </p>
        </div>
      </div>
    </div>
  );
};
