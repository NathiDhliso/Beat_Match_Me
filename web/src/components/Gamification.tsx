import React, { useState } from 'react';
import { HapticFeedback } from '../utils/haptics';

/**
 * Phase 11: Gamification & Achievements
 * Achievement system, leaderboards, streaks
 */

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  tier: AchievementTier;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: {
    current: number;
    target: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userImage?: string;
  tier: AchievementTier;
  score: number;
  badge?: string;
}

/**
 * Achievement Unlock Modal
 */
interface AchievementUnlockModalProps {
  achievement: Achievement;
  onClose: () => void;
  onShare?: () => void;
}

export const AchievementUnlockModal: React.FC<AchievementUnlockModalProps> = ({
  achievement,
  onClose,
  onShare,
}) => {
  const getTierColor = (tier: AchievementTier) => {
    switch (tier) {
      case 'platinum': return 'from-gray-300 to-gray-100';
      case 'gold': return 'from-gold-500 to-gold-300';
      case 'silver': return 'from-gray-400 to-gray-200';
      case 'bronze': return 'from-orange-700 to-orange-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 rounded-3xl p-8 max-w-md w-full text-center animate-scale-in">
        {/* Confetti Effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary-500 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Achievement Icon */}
        <div className={`inline-block p-6 rounded-full bg-gradient-to-br ${getTierColor(achievement.tier)} mb-6 animate-shimmer`}>
          <span className="text-6xl">{achievement.icon}</span>
        </div>

        {/* Achievement Name */}
        <h2 className="text-3xl font-bold text-white mb-2">
          Achievement Unlocked!
        </h2>
        <h3 className="text-2xl font-bold text-primary-400 mb-4">
          {achievement.name}
        </h3>

        {/* Tier Badge */}
        <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getTierColor(achievement.tier)} mb-4`}>
          <span className="text-sm font-bold text-gray-900 uppercase">
            {achievement.tier}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-400 mb-8">
          {achievement.description}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          {onShare && (
            <button
              onClick={() => {
                HapticFeedback.buttonPress();
                onShare();
              }}
              className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
            >
              Share
            </button>
          )}
          <button
            onClick={() => {
              HapticFeedback.buttonPress();
              onClose();
            }}
            className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Achievements Gallery
 */
interface AchievementsGalleryProps {
  achievements: Achievement[];
  onAchievementClick?: (achievement: Achievement) => void;
  className?: string;
}

export const AchievementsGallery: React.FC<AchievementsGalleryProps> = ({
  achievements,
  onAchievementClick,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'in_progress' | 'locked'>('all');
  const [sortBy, setSortBy] = useState<'rarity' | 'recent' | 'alphabetical'>('rarity');

  const tierOrder = { platinum: 4, gold: 3, silver: 2, bronze: 1 };

  const filteredAchievements = achievements
    .filter(a => {
      if (filter === 'unlocked') return a.unlocked;
      if (filter === 'locked') return !a.unlocked;
      if (filter === 'in_progress') return !a.unlocked && a.progress;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rarity') return tierOrder[b.tier] - tierOrder[a.tier];
      if (sortBy === 'recent') return (b.unlockedAt || 0) - (a.unlockedAt || 0);
      if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
      return 0;
    });

  const stats = {
    total: achievements.length,
    unlocked: achievements.filter(a => a.unlocked).length,
    inProgress: achievements.filter(a => !a.unlocked && a.progress).length,
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-white">{stats.unlocked}</p>
          <p className="text-sm text-gray-400">Unlocked</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-500">{stats.inProgress}</p>
          <p className="text-sm text-gray-400">In Progress</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-500">{stats.total - stats.unlocked}</p>
          <p className="text-sm text-gray-400">Locked</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unlocked' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Unlocked
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'in_progress' ? 'bg-yellow-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'locked' ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Locked
          </button>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="ml-auto px-4 py-2 bg-gray-800 text-white rounded-lg text-sm border border-gray-700 focus:border-primary-500 focus:outline-none"
        >
          <option value="rarity">Sort by Rarity</option>
          <option value="recent">Sort by Recent</option>
          <option value="alphabetical">Sort Alphabetically</option>
        </select>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAchievements.map(achievement => (
          <div
            key={achievement.id}
            onClick={() => {
              if (onAchievementClick) {
                HapticFeedback.buttonPress();
                onAchievementClick(achievement);
              }
            }}
            className={`
              bg-gray-800 rounded-xl p-4 text-center cursor-pointer
              transition-all duration-200 hover:scale-105
              ${achievement.unlocked ? '' : 'opacity-50 grayscale'}
              ${onAchievementClick ? 'hover:bg-gray-750' : ''}
            `}
          >
            <div className="text-5xl mb-3">
              {achievement.unlocked ? achievement.icon : '🔒'}
            </div>
            <h4 className="text-white font-semibold text-sm mb-1">
              {achievement.unlocked ? achievement.name : '???'}
            </h4>
            <p className="text-gray-400 text-xs mb-2">
              {achievement.unlocked ? achievement.description : 'Locked'}
            </p>

            {/* Progress Bar */}
            {!achievement.unlocked && achievement.progress && (
              <div className="mt-3">
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 transition-all duration-500"
                    style={{ width: `${(achievement.progress.current / achievement.progress.target) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {achievement.progress.current}/{achievement.progress.target}
                </p>
              </div>
            )}

            {/* Tier Badge */}
            <div className={`
              inline-block px-2 py-1 rounded-full text-xs font-bold mt-2
              ${achievement.tier === 'platinum' ? 'bg-gray-300 text-gray-900' :
                achievement.tier === 'gold' ? 'bg-gold-500 text-white' :
                achievement.tier === 'silver' ? 'bg-gray-400 text-gray-900' :
                'bg-orange-700 text-white'}
            `}>
              {achievement.tier.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Leaderboard Component
 */
interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  title: string;
  scoreLabel?: string;
  onUserClick?: (userId: string) => void;
  className?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  currentUserId,
  title,
  scoreLabel = 'Score',
  onUserClick,
  className = '',
}) => {
  const currentUserRank = entries.findIndex(e => e.userId === currentUserId) + 1;

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className={`bg-gray-800 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {currentUserRank > 0 && (
          <span className="text-sm text-gray-400">
            Your rank: #{currentUserRank}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {entries.map((entry, index) => {
          const isCurrentUser = entry.userId === currentUserId;
          return (
            <div
              key={entry.userId}
              onClick={() => {
                if (onUserClick) {
                  HapticFeedback.buttonPress();
                  onUserClick(entry.userId);
                }
              }}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-colors
                ${isCurrentUser ? 'bg-primary-500/20 border-2 border-primary-500' : 'bg-gray-750 hover:bg-gray-700'}
                ${onUserClick ? 'cursor-pointer' : ''}
              `}
            >
              {/* Rank */}
              <div className="w-12 text-center">
                <span className="text-2xl font-bold">
                  {getMedalEmoji(entry.rank)}
                </span>
              </div>

              {/* User Info */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                {entry.userImage ? (
                  <img src={entry.userImage} alt={entry.userName} className="w-full h-full object-cover" />
                ) : (
                  entry.userName.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-semibold truncate">{entry.userName}</h4>
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${entry.tier === 'platinum' ? 'bg-gray-300 text-gray-900' :
                      entry.tier === 'gold' ? 'bg-gold-500 text-white' :
                      entry.tier === 'silver' ? 'bg-gray-400 text-gray-900' :
                      'bg-orange-700 text-white'}
                  `}>
                    {entry.tier}
                  </span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="text-white font-bold">{entry.score}</p>
                <p className="text-xs text-gray-400">{scoreLabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Streak Tracker Component
 */
interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  lastEventDate?: number;
  nextEventDate?: number;
  className?: string;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({
  currentStreak,
  longestStreak,
  lastEventDate,
  nextEventDate,
  className = '',
}) => {
  const daysUntilNext = nextEventDate
    ? Math.ceil((nextEventDate - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 10) return '🔥🔥';
    if (streak >= 5) return '🔥';
    return '⭐';
  };

  return (
    <div className={`bg-gray-800 rounded-2xl p-6 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-6">Event Streak</h3>

      {/* Current Streak */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-2">{getStreakEmoji(currentStreak)}</div>
        <div className="text-5xl font-bold text-white mb-2">{currentStreak}</div>
        <p className="text-gray-400">Events in a row</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-750 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gold-500">{longestStreak}</p>
          <p className="text-sm text-gray-400">Longest Streak</p>
        </div>
        <div className="bg-gray-750 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">
            {daysUntilNext !== null ? daysUntilNext : '-'}
          </p>
          <p className="text-sm text-gray-400">Days Until Next</p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Next Milestone</span>
          <span className="text-white font-semibold">
            {currentStreak < 5 ? '5 events' :
             currentStreak < 10 ? '10 events' :
             currentStreak < 30 ? '30 events' :
             '50 events'}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
            style={{
              width: `${
                currentStreak < 5 ? (currentStreak / 5) * 100 :
                currentStreak < 10 ? ((currentStreak - 5) / 5) * 100 :
                currentStreak < 30 ? ((currentStreak - 10) / 20) * 100 :
                ((currentStreak - 30) / 20) * 100
              }%`
            }}
          />
        </div>
      </div>

      {/* Warning */}
      {daysUntilNext !== null && daysUntilNext > 7 && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-xl">
          <p className="text-red-400 text-sm text-center">
            ⚠️ Streak at risk! Attend an event within {daysUntilNext} days to keep it alive.
          </p>
        </div>
      )}
    </div>
  );
};
