import React, { useState, useEffect } from 'react';
import { DollarSign, Trophy, Zap, Star, TrendingUp } from 'lucide-react';
import { ConfettiAnimation } from './ConfettiAnimation';

/**
 * MILESTONE CELEBRATIONS
 * Celebratory animations when users/performers hit revenue/achievement targets
 */

export type MilestoneType = 'revenue' | 'requests' | 'upvotes' | 'streak' | 'tier';

interface Milestone {
  type: MilestoneType;
  value: number;
  title: string;
  message: string;
  icon: React.ReactNode;
  color: string;
  confettiColors: string[];
}

interface MilestoneCelebrationProps {
  milestone: Milestone;
  onComplete: () => void;
  onShare?: () => void;
  className?: string;
}

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  milestone,
  onComplete,
  onShare,
  className = '',
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 500);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <>
      {showConfetti && <ConfettiAnimation trigger={true} />}
      
      <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in ${className}`}>
        <div className="bg-gradient-to-br from-gold-500/30 to-orange-500/30 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 border border-gold-500/50 animate-bounce-in">
          {/* Icon */}
          <div className={`w-24 h-24 bg-gradient-to-br ${milestone.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-gold animate-pulse-slow`}>
            <div className="text-white text-5xl">
              {milestone.icon}
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">{milestone.title}</h2>
            <p className="text-lg text-gold-200">{milestone.message}</p>
          </div>

          {/* Value Display */}
          <div className="bg-black/30 rounded-2xl p-6 mb-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">
                {milestone.type === 'revenue' && 'R'}
                {milestone.value.toLocaleString()}
                {milestone.type === 'streak' && ' days'}
              </div>
              <div className="text-sm text-gray-400">
                {milestone.type === 'revenue' && 'Total Earnings'}
                {milestone.type === 'requests' && 'Successful Requests'}
                {milestone.type === 'upvotes' && 'Total Upvotes'}
                {milestone.type === 'streak' && 'Day Streak'}
                {milestone.type === 'tier' && 'New Tier Unlocked'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {onShare && (
              <button
                onClick={onShare}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-white font-bold rounded-xl hover:from-gold-500 hover:to-gold-700 transition-all"
              >
                <Star className="w-5 h-5" />
                Share Achievement
              </button>
            )}
            <button
              onClick={() => {
                setShowConfetti(false);
                setIsVisible(false);
                onComplete();
              }}
              className="w-full px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * REVENUE MILESTONES
 * Specific celebrations for performer earnings
 */

export const RevenueMilestones = {
  R100: {
    type: 'revenue' as MilestoneType,
    value: 100,
    title: '🎉 First R100!',
    message: 'You\'ve earned your first hundred!',
    icon: <DollarSign className="w-12 h-12" />,
    color: 'from-green-400 to-green-600',
    confettiColors: ['#10b981', '#34d399', '#6ee7b7'],
  },
  R500: {
    type: 'revenue' as MilestoneType,
    value: 500,
    title: '💰 R500 Milestone!',
    message: 'You\'re on fire! Keep the music playing!',
    icon: <DollarSign className="w-12 h-12" />,
    color: 'from-gold-400 to-gold-600',
    confettiColors: ['#ffd700', '#ffed4e', '#fbbf24'],
  },
  R1000: {
    type: 'revenue' as MilestoneType,
    value: 1000,
    title: '👑 R1,000 Reached!',
    message: 'You\'re a superstar performer!',
    icon: <Trophy className="w-12 h-12" />,
    color: 'from-purple-400 to-pink-600',
    confettiColors: ['#a855f7', '#ec4899', '#f472b6'],
  },
  R5000: {
    type: 'revenue' as MilestoneType,
    value: 5000,
    title: '🚀 R5,000 Legend!',
    message: 'You\'ve made 5K! Incredible!',
    icon: <Zap className="w-12 h-12" />,
    color: 'from-cyan-400 to-blue-600',
    confettiColors: ['#06b6d4', '#3b82f6', '#60a5fa'],
  },
};

/**
 * REQUEST MILESTONES
 * Celebrations for audience members
 */

export const RequestMilestones = {
  FIRST: {
    type: 'requests' as MilestoneType,
    value: 1,
    title: '🎵 First Request!',
    message: 'Welcome to the party!',
    icon: <Star className="w-12 h-12" />,
    color: 'from-blue-400 to-cyan-600',
    confettiColors: ['#3b82f6', '#06b6d4', '#60a5fa'],
  },
  TEN: {
    type: 'requests' as MilestoneType,
    value: 10,
    title: '🔥 10 Songs Played!',
    message: 'You\'re a regular!',
    icon: <TrendingUp className="w-12 h-12" />,
    color: 'from-orange-400 to-red-600',
    confettiColors: ['#fb923c', '#ef4444', '#f87171'],
  },
  FIFTY: {
    type: 'requests' as MilestoneType,
    value: 50,
    title: '⭐ 50 Requests!',
    message: 'You\'re a music curator!',
    icon: <Trophy className="w-12 h-12" />,
    color: 'from-gold-400 to-gold-600',
    confettiColors: ['#ffd700', '#ffed4e', '#fbbf24'],
  },
  HUNDRED: {
    type: 'requests' as MilestoneType,
    value: 100,
    title: '💎 Century Club!',
    message: '100 songs played - You\'re legendary!',
    icon: <Trophy className="w-12 h-12" />,
    color: 'from-purple-400 to-pink-600',
    confettiColors: ['#a855f7', '#ec4899', '#f472b6'],
  },
};

/**
 * REAL-TIME EARNINGS ANIMATION
 * Floating dollar signs for each transaction
 */

interface FloatingEarning {
  id: string;
  amount: number;
  x: number;
  y: number;
}

interface RealTimeEarningsProps {
  earnings: FloatingEarning[];
  onAnimationComplete: (id: string) => void;
  className?: string;
}

export const RealTimeEarnings: React.FC<RealTimeEarningsProps> = ({
  earnings,
  onAnimationComplete,
  className = '',
}) => {
  useEffect(() => {
    earnings.forEach((earning) => {
      setTimeout(() => {
        onAnimationComplete(earning.id);
      }, 2000); // Animation duration
    });
  }, [earnings, onAnimationComplete]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-40 ${className}`}>
      {earnings.map((earning) => (
        <div
          key={earning.id}
          className="absolute animate-float-up"
          style={{
            left: `${earning.x}%`,
            top: `${earning.y}%`,
          }}
        >
          <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full shadow-lg font-bold">
            <DollarSign className="w-4 h-4" />
            <span>R{earning.amount}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * FAN COUNTER
 * Live metric showing how many people you've made dance
 */

interface FanCounterProps {
  count: number;
  increment?: number;
  label?: string;
  className?: string;
}

export const FanCounter: React.FC<FanCounterProps> = ({
  count,
  increment = 0,
  label = 'people dancing tonight',
  className = '',
}) => {
  const [displayCount, setDisplayCount] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (increment > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayCount(count);
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [count, increment]);

  return (
    <div className={`bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl p-6 border border-pink-500/50 ${className}`}>
      <div className="text-center">
        <div className="mb-2">
          <span className="text-6xl">💃</span>
        </div>
        <div className={`text-5xl font-bold text-white mb-2 transition-all ${isAnimating ? 'scale-125 text-pink-400' : ''}`}>
          {displayCount.toLocaleString()}
        </div>
        <div className="text-sm text-gray-300">{label}</div>
        
        {increment > 0 && (
          <div className="mt-2 text-green-400 font-semibold animate-bounce-in">
            +{increment} just now!
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * STREAK COUNTER
 * Shows consecutive days of activity
 */

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  longestStreak,
  className = '',
}) => {
  return (
    <div className={`bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-xl p-6 border border-orange-500/50 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-3xl font-bold text-white mb-1">
            {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
          </div>
          <div className="text-sm text-gray-300">Current Streak 🔥</div>
          <div className="text-xs text-gray-400 mt-1">
            Best: {longestStreak} days
          </div>
        </div>
      </div>
      
      {currentStreak >= 7 && (
        <div className="mt-4 p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
          <p className="text-xs text-orange-300 text-center">
            🔥 You're on fire! Keep the streak alive!
          </p>
        </div>
      )}
    </div>
  );
};

// Add float-up animation to tailwind config if not already there
// @keyframes float-up {
//   0% { transform: translateY(0) scale(1); opacity: 1; }
//   100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
// }
