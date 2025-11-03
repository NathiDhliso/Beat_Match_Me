import React from 'react';

export type TierType = 'bronze' | 'silver' | 'gold' | 'platinum';

interface TierBadgeProps {
  tier: TierType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

const tierConfig = {
  bronze: {
    color: '#cd7f32',
    gradient: 'bg-gradient-bronze',
    label: 'Bronze',
    description: '1-5 successful requests',
    glow: 'shadow-[0_0_10px_rgba(205,127,50,0.5)]',
  },
  silver: {
    color: '#c0c0c0',
    gradient: 'bg-gradient-silver',
    label: 'Silver',
    description: '6-15 successful requests',
    glow: 'shadow-[0_0_10px_rgba(192,192,192,0.5)]',
  },
  gold: {
    color: '#ffd700',
    gradient: 'bg-gradient-gold',
    label: 'Gold',
    description: '16-50 successful requests',
    glow: 'shadow-[0_0_15px_rgba(255,215,0,0.6)]',
  },
  platinum: {
    color: '#e5e4e2',
    gradient: 'bg-gradient-platinum',
    label: 'Platinum',
    description: 'Top 1% of users',
    glow: 'shadow-[0_0_20px_rgba(229,228,226,0.7)]',
    shimmer: true,
  },
};

const sizeConfig = {
  sm: {
    badge: 'w-6 h-6',
    text: 'text-2xs',
    icon: 'text-xs',
  },
  md: {
    badge: 'w-10 h-10',
    text: 'text-xs',
    icon: 'text-sm',
  },
  lg: {
    badge: 'w-16 h-16',
    text: 'text-sm',
    icon: 'text-lg',
  },
  xl: {
    badge: 'w-24 h-24',
    text: 'text-base',
    icon: 'text-2xl',
  },
};

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const config = tierConfig[tier];
  const sizes = sizeConfig[size];

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`
          ${sizes.badge}
          ${config.gradient}
          ${config.glow}
          rounded-full
          flex items-center justify-center
          border-2 border-white/20
          relative
          overflow-hidden
          ${config.shimmer ? 'animate-shimmer' : ''}
        `}
        style={{
          backgroundSize: config.shimmer ? '200% 100%' : undefined,
        }}
      >
        {/* Tier Icon/Symbol */}
        <div className={`${sizes.icon} font-bold text-white drop-shadow-lg`}>
          {tier === 'bronze' && '🥉'}
          {tier === 'silver' && '🥈'}
          {tier === 'gold' && '🥇'}
          {tier === 'platinum' && '💎'}
        </div>

        {/* Shimmer effect for platinum */}
        {config.shimmer && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
            style={{ backgroundSize: '200% 100%' }}
          />
        )}
      </div>

      {showLabel && (
        <div className="text-center">
          <div className={`${sizes.text} font-semibold text-white`}>
            {config.label}
          </div>
          {size === 'lg' || size === 'xl' ? (
            <div className="text-2xs text-gray-400 mt-1">
              {config.description}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

/**
 * Tier Badge with glow animation
 */
export const AnimatedTierBadge: React.FC<TierBadgeProps> = (props) => {
  return (
    <div className="animate-glow">
      <TierBadge {...props} />
    </div>
  );
};

/**
 * Get tier based on successful request count
 */
export function calculateTier(successfulRequests: number): TierType {
  if (successfulRequests >= 51) return 'platinum'; // Top 1% logic would be more complex
  if (successfulRequests >= 16) return 'gold';
  if (successfulRequests >= 6) return 'silver';
  return 'bronze';
}

/**
 * Tier progress component showing progress to next tier
 */
interface TierProgressProps {
  currentRequests: number;
  className?: string;
}

export const TierProgress: React.FC<TierProgressProps> = ({
  currentRequests,
  className = '',
}) => {
  const currentTier = calculateTier(currentRequests);
  
  const thresholds = {
    bronze: { min: 1, max: 5, next: 'silver' },
    silver: { min: 6, max: 15, next: 'gold' },
    gold: { min: 16, max: 50, next: 'platinum' },
    platinum: { min: 51, max: 51, next: null },
  };

  const threshold = thresholds[currentTier];
  const progress = threshold.next
    ? ((currentRequests - threshold.min) / (threshold.max - threshold.min + 1)) * 100
    : 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <TierBadge tier={currentTier} size="sm" />
        <div className="text-sm text-gray-400">
          {currentRequests} / {threshold.max} requests
        </div>
        {threshold.next && (
          <TierBadge tier={threshold.next as TierType} size="sm" />
        )}
      </div>
      
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${tierConfig[currentTier].gradient} transition-all duration-500`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {threshold.next && (
        <div className="text-xs text-center text-gray-500">
          {threshold.max - currentRequests + 1} more to {tierConfig[threshold.next as TierType].label}
        </div>
      )}
    </div>
  );
};
