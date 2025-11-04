import React from 'react';

export type TierType = 'bronze' | 'silver' | 'gold' | 'platinum';

interface TierBadgeProps {
  tier: TierType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const tierConfig = {
  bronze: {
    label: 'Bronze',
    colors: 'bg-gradient-to-r from-amber-700 to-amber-900',
    textColor: 'text-amber-100',
    icon: '🥉',
  },
  silver: {
    label: 'Silver',
    colors: 'bg-gradient-to-r from-gray-300 to-gray-500',
    textColor: 'text-gray-900',
    icon: '🥈',
  },
  gold: {
    label: 'Gold',
    colors: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    textColor: 'text-yellow-900',
    icon: '🥇',
  },
  platinum: {
    label: 'Platinum',
    colors: 'bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400',
    textColor: 'text-white',
    icon: '💎',
  },
};

const sizeConfig = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, size = 'md', className = '' }) => {
  const config = tierConfig[tier];
  const sizeClass = sizeConfig[size];

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${config.colors} ${config.textColor} ${sizeClass} ${className}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
};
