/**
 * Request Badge Component
 * Visual indicator for different request types
 */

import React from 'react';

type RequestType = 'standard' | 'spotlight' | 'dedication' | 'premium';

interface RequestBadgeProps {
  type: RequestType;
  price?: number;
  className?: string;
}

const badgeConfig = {
  spotlight: {
    style: 'bg-yellow-500 text-black shadow-yellow-500/50',
    icon: '⭐',
    label: 'Spotlight',
  },
  dedication: {
    style: 'bg-pink-500 text-white shadow-pink-500/50',
    icon: '💝',
    label: 'Dedication',
  },
  premium: {
    style: 'bg-purple-600 text-white shadow-purple-600/50',
    icon: '💎',
    label: 'Premium',
  },
  standard: {
    style: 'bg-blue-500 text-white shadow-blue-500/50',
    icon: '🎵',
    label: 'Standard',
  },
};

export const RequestBadge: React.FC<RequestBadgeProps> = ({ 
  type, 
  price,
  className = '' 
}) => {
  const config = badgeConfig[type];

  return (
    <div 
      className={`
        absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold 
        ${config.style} shadow-lg backdrop-blur-sm border border-white/20
        flex items-center gap-1 z-10
        ${className}
      `}
      title={`${config.label}${price ? ` - R${price}` : ''}`}
    >
      <span className="text-sm">{config.icon}</span>
      {price && (
        <span className="font-bold">R{price}</span>
      )}
    </div>
  );
};
