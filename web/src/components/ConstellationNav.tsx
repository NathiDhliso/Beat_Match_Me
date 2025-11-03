import React, { useState, useEffect } from 'react';
import { HapticFeedback } from '../utils/haptics';

/**
 * Constellation Navigation System
 * Radial menu with social gravity algorithm
 */

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  angle: number; // degrees from center
  frequency: number; // usage frequency (0-1)
  onClick: () => void;
}

interface ConstellationNavProps {
  items: NavItem[];
  onItemClick: (itemId: string) => void;
  friendsOnline?: number;
  className?: string;
}

export const ConstellationNav: React.FC<ConstellationNavProps> = ({
  items,
  onItemClick,
  friendsOnline = 0,
  className = '',
}) => {
  const [expandedItems, setExpandedItems] = useState<NavItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Apply social gravity algorithm
    const sortedItems = [...items].sort((a, b) => b.frequency - a.frequency);
    
    // Redistribute angles based on frequency
    const redistributed = sortedItems.map((item, index) => {
      const baseAngle = (index * 360) / items.length;
      // More frequently used items gravitate closer to center (0°)
      const gravityOffset = (1 - item.frequency) * 30;
      return {
        ...item,
        angle: baseAngle + gravityOffset,
      };
    });

    setExpandedItems(redistributed);
  }, [items]);

  const handleCenterPress = () => {
    setIsExpanded(!isExpanded);
    HapticFeedback.buttonPress();
  };

  const handleItemClick = (item: NavItem) => {
    onItemClick(item.id);
    item.onClick();
    HapticFeedback.buttonLongPress();
    setIsExpanded(false);
  };

  const radius = 120; // pixels from center

  return (
    <div className={`relative w-80 h-80 ${className}`}>
      {/* Center button */}
      <button
        onClick={handleCenterPress}
        onContextMenu={(e) => {
          e.preventDefault();
          handleCenterPress();
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 shadow-glow-cyan flex items-center justify-center text-3xl z-10 transition-transform hover:scale-110"
      >
        🎵
      </button>

      {/* Friend indicator */}
      {friendsOnline > 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-secondary-500 animate-pulse pointer-events-none" />
      )}

      {/* Nav items */}
      {isExpanded && expandedItems.map((item) => {
        const x = Math.cos((item.angle * Math.PI) / 180) * radius;
        const y = Math.sin((item.angle * Math.PI) / 180) * radius;
        const size = 40 + item.frequency * 20; // Larger for more frequent items

        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="absolute top-1/2 left-1/2 rounded-full bg-glass-dark backdrop-blur-xl border border-white/20 flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/10 animate-scale-in"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              opacity: 0.7 + item.frequency * 0.3,
            }}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-2xs text-white mt-1">{item.label}</span>
          </button>
        );
      })}

      {/* Usage hint */}
      {!isExpanded && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-gray-500 text-center">
          Tap or long-press center
        </div>
      )}
    </div>
  );
};

/**
 * Crowd Momentum Arrows
 * Shows popular actions at the event
 */
interface CrowdMomentumProps {
  popularActions: Array<{
    action: string;
    count: number;
    icon: string;
  }>;
  className?: string;
}

export const CrowdMomentum: React.FC<CrowdMomentumProps> = ({
  popularActions,
  className = '',
}) => {
  const topActions = popularActions.slice(0, 3);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="text-sm text-gray-400">🔥 Trending:</span>
      {topActions.map((action, index) => (
        <div
          key={action.action}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 animate-pulse"
          style={{ animationDelay: `${index * 200}ms` }}
        >
          <span>{action.icon}</span>
          <span className="text-sm text-white">{action.action}</span>
          <span className="text-xs text-gray-400">{action.count}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * Friend Proximity Indicator
 * Shows friends at the same event
 */
interface FriendProximityProps {
  friends: Array<{
    id: string;
    name: string;
    avatar?: string;
    lastAction: string;
  }>;
  className?: string;
}

export const FriendProximity: React.FC<FriendProximityProps> = ({
  friends,
  className = '',
}) => {
  if (friends.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-white">👥 Friends Here</span>
        <span className="text-xs text-gray-400">({friends.length})</span>
      </div>
      <div className="flex -space-x-2">
        {friends.slice(0, 5).map((friend) => (
          <div
            key={friend.id}
            className="w-10 h-10 rounded-full border-2 border-gray-800 bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden"
            title={`${friend.name} - ${friend.lastAction}`}
          >
            {friend.avatar ? (
              <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
            ) : (
              friend.name.charAt(0).toUpperCase()
            )}
          </div>
        ))}
        {friends.length > 5 && (
          <div className="w-10 h-10 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-white font-bold text-xs">
            +{friends.length - 5}
          </div>
        )}
      </div>
    </div>
  );
};
