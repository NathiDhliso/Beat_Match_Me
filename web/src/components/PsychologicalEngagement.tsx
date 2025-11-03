import React, { useState, useEffect } from 'react';
import { Shield, Clock, TrendingUp, Heart, Zap, Award, Users, Music } from 'lucide-react';

/**
 * CERTAINTY ENHANCERS
 */

// Request Insurance Visual - Shield icon showing refund guarantee
interface RequestInsuranceProps {
  requestId: string;
  price: number;
  className?: string;
}

export const RequestInsurance: React.FC<RequestInsuranceProps> = ({
  requestId,
  price,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/50 rounded-full ${className}`}>
      <Shield className="w-4 h-4 text-green-400 animate-pulse" />
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-green-300">Protected</span>
        <span className="text-2xs text-green-400/70">R{price} refund if vetoed</span>
      </div>
    </div>
  );
};

// Auto-Queue Fallback - Instant backup list on veto
interface AutoQueueFallbackProps {
  vetoedSong: {
    title: string;
    artist: string;
  };
  onAddToBackup: () => void;
  onDismiss: () => void;
  className?: string;
}

export const AutoQueueFallback: React.FC<AutoQueueFallbackProps> = ({
  vetoedSong,
  onAddToBackup,
  onDismiss,
  className = '',
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToBackup = async () => {
    setIsAdding(true);
    await onAddToBackup();
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <div className={`bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-2xl p-6 ${className} animate-slide-up`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-orange-500/30 rounded-full flex items-center justify-center flex-shrink-0">
          <Music className="w-6 h-6 text-orange-300" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">Song Vetoed - But We've Got You!</h3>
          <p className="text-sm text-orange-200 mb-3">
            "{vetoedSong.title}" by {vetoedSong.artist} was declined, but your refund is processing.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleAddToBackup}
              disabled={isAdding}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Add to My Backup List
                </>
              )}
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Predictive Wait Time - Estimate based on DJ's average play rate
interface PredictiveWaitTimeProps {
  queuePosition: number;
  totalInQueue: number;
  averageSongDuration: number; // in seconds
  className?: string;
}

export const PredictiveWaitTime: React.FC<PredictiveWaitTimeProps> = ({
  queuePosition,
  totalInQueue,
  averageSongDuration = 210, // 3.5 minutes default
  className = '',
}) => {
  const estimatedWaitMinutes = Math.ceil((queuePosition * averageSongDuration) / 60);
  const progress = ((totalInQueue - queuePosition) / totalInQueue) * 100;

  return (
    <div className={`bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-white/20 dark:border-gray-700 ${className} transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-400 dark:text-cyan-400" />
          <span className="text-white font-semibold">Your Song</span>
        </div>
        <span className="text-primary-400 dark:text-cyan-400 font-bold text-lg">~{estimatedWaitMinutes} min</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Position:</span>
          <span className="text-white font-semibold">{queuePosition} of {totalInQueue}</span>
        </div>
        
        {/* Progress bar */}
        <div className="relative">
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          {/* Progress indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-500 border-2 border-primary-500"
            style={{ left: `calc(${Math.min(progress, 100)}% - 8px)` }}
          />
        </div>
        
        <p className="text-xs text-gray-400 text-center mt-2">
          Based on average {Math.floor(averageSongDuration / 60)}:{(averageSongDuration % 60).toString().padStart(2, '0')} per song
        </p>
      </div>
    </div>
  );
};

/**
 * SIGNIFICANCE AMPLIFIERS
 */

// Request Impact Meter - Show upvotes with radiating pulse
interface RequestImpactMeterProps {
  upvotes: number;
  isAnimating?: boolean;
  onUpvote?: () => void;
  className?: string;
}

export const RequestImpactMeter: React.FC<RequestImpactMeterProps> = ({
  upvotes,
  isAnimating = false,
  onUpvote,
  className = '',
}) => {
  const [pulseRings, setPulseRings] = useState<number[]>([]);

  useEffect(() => {
    if (isAnimating) {
      // Create radiating pulse rings
      const rings = [0, 1, 2];
      setPulseRings(rings);
      setTimeout(() => setPulseRings([]), 1500);
    }
  }, [isAnimating]);

  return (
    <button
      onClick={onUpvote}
      disabled={!onUpvote}
      className={`relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/50 rounded-full hover:from-red-500/30 hover:to-pink-500/30 transition-all ${className}`}
    >
      {/* Radiating pulse rings */}
      {pulseRings.map((ring) => (
        <div
          key={ring}
          className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping"
          style={{
            animationDelay: `${ring * 200}ms`,
            animationDuration: '1.5s',
          }}
        />
      ))}
      
      <Heart className={`w-5 h-5 text-red-400 ${isAnimating ? 'animate-bounce' : ''}`} fill={upvotes > 0 ? 'currentColor' : 'none'} />
      <div className="flex flex-col items-start">
        <span className="text-lg font-bold text-white">{upvotes}</span>
        <span className="text-2xs text-red-300">people vibing</span>
      </div>
    </button>
  );
};

// Trendsetter Score - Real-time leaderboard position
interface TrendsetterScoreProps {
  rank: number;
  totalUsers: number;
  successfulRequests: number;
  className?: string;
}

export const TrendsetterScore: React.FC<TrendsetterScoreProps> = ({
  rank,
  totalUsers,
  successfulRequests,
  className = '',
}) => {
  const isTopTen = rank <= 10;
  const percentile = ((totalUsers - rank) / totalUsers) * 100;

  return (
    <div className={`bg-gradient-to-br from-gold-500/20 to-gold-600/20 border border-gold-500/50 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gold-400" />
          <span className="text-white font-semibold">Trendsetter Score</span>
        </div>
        {isTopTen && (
          <div className="px-2 py-1 bg-gold-500 rounded-full">
            <span className="text-xs font-bold text-white">TOP 10</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-gold-400">#{rank}</div>
          <div className="text-2xs text-gray-400">Rank</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{successfulRequests}</div>
          <div className="text-2xs text-gray-400">Played</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-400">{percentile.toFixed(0)}%</div>
          <div className="text-2xs text-gray-400">Percentile</div>
        </div>
      </div>
    </div>
  );
};

/**
 * CONTRIBUTION PATHWAYS
 */

// Karma Points Display
interface KarmaPointsProps {
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  nextTierPoints: number;
  className?: string;
}

export const KarmaPoints: React.FC<KarmaPointsProps> = ({
  points,
  tier,
  nextTierPoints,
  className = '',
}) => {
  const progress = (points / nextTierPoints) * 100;
  const tierColors = {
    bronze: { from: '#cd7f32', to: '#e8a05c', text: 'text-orange-400' },
    silver: { from: '#c0c0c0', to: '#e8e8e8', text: 'text-gray-300' },
    gold: { from: '#ffd700', to: '#ffed4e', text: 'text-gold-400' },
    platinum: { from: '#e5e4e2', to: '#ffffff', text: 'text-gray-100' },
  };

  const colors = tierColors[tier];

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className={`w-5 h-5 ${colors.text}`} />
          <span className="text-white font-semibold">Karma Points</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${colors.text}`} style={{
          background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`
        }}>
          {tier.toUpperCase()}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">{points}</span>
          <span className="text-sm text-gray-400">{nextTierPoints - points} to next tier</span>
        </div>
        
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: `linear-gradient(90deg, ${colors.from} 0%, ${colors.to} 100%)`
            }}
          />
        </div>
        
        <p className="text-xs text-gray-400">
          Earn karma by upvoting underdog songs and contributing to the community
        </p>
      </div>
    </div>
  );
};

// Collective Energy Metrics - Show community impact
interface CollectiveEnergyProps {
  totalRequests: number;
  activeUsers: number;
  topGenre: string;
  energyLevel: 'building' | 'peak' | 'intimate' | 'cooldown';
  className?: string;
}

export const CollectiveEnergy: React.FC<CollectiveEnergyProps> = ({
  totalRequests,
  activeUsers,
  topGenre,
  energyLevel,
  className = '',
}) => {
  const energyConfig = {
    building: { color: 'from-violet-500 to-cyan-500', label: 'Building Energy', emoji: '📈' },
    peak: { color: 'from-magenta-500 to-gold-500', label: 'Peak Hype', emoji: '🔥' },
    intimate: { color: 'from-rose-500 to-amber-500', label: 'Intimate Vibes', emoji: '💫' },
    cooldown: { color: 'from-teal-500 to-blue-400', label: 'Cool Down', emoji: '🌊' },
  };

  const config = energyConfig[energyLevel];

  return (
    <div className={`bg-gradient-to-br ${config.color} bg-opacity-20 backdrop-blur-lg rounded-xl p-6 border border-white/20 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-4xl">{config.emoji}</div>
        <div>
          <h3 className="text-xl font-bold text-white">{config.label}</h3>
          <p className="text-sm text-white/70">Tonight's Collective Vibe</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <Users className="w-5 h-5 text-white mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{activeUsers}</div>
          <div className="text-xs text-white/70">Active</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <Music className="w-5 h-5 text-white mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{totalRequests}</div>
          <div className="text-xs text-white/70">Requests</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <Award className="w-5 h-5 text-white mx-auto mb-1" />
          <div className="text-sm font-bold text-white truncate">{topGenre}</div>
          <div className="text-xs text-white/70">Top Genre</div>
        </div>
      </div>
      
      <p className="text-xs text-white/80 mt-4 text-center">
        You and {activeUsers - 1} others are building tonight's soundtrack
      </p>
    </div>
  );
};
