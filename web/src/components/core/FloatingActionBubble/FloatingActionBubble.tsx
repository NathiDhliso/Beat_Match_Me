import React from 'react';
import { Music } from 'lucide-react';
import { useDraggable } from './useDraggable';
import { RadialMenuItem } from './RadialMenuItem';
import type { FloatingBubbleProps } from './types';

/**
 * Floating Action Bubble - Draggable main menu control
 * Phase 8: Memoized for performance - prevents unnecessary re-renders
 */
export const FloatingActionBubble: React.FC<FloatingBubbleProps> = React.memo(({ 
  onMenuToggle, 
  isExpanded, 
  menuOptions 
}) => {
  const { position, handlers } = useDraggable({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 100 : 100, 
    y: typeof window !== 'undefined' ? window.innerHeight - 100 : 100 
  });

  return (
    <div
      className="fixed z-50 cursor-move hidden md:block"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      {...handlers}
    >
      <button
        onClick={onMenuToggle}
        className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 shadow-2xl backdrop-blur-lg border-2 border-white/20 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        style={{
          boxShadow: '0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(168, 85, 247, 0.3)',
        }}
      >
        <Music className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white animate-pulse" />
        
        {/* Pulse rings */}
        <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse" />
      </button>

      {/* Radial Menu - Expands in circular pattern */}
      {isExpanded && menuOptions && (
        <div className="absolute inset-0">
          {menuOptions.map((option, index) => (
            <RadialMenuItem
              key={index}
              icon={option.icon}
              label={option.label}
              angle={option.angle}
              distance={100}
              color={option.color}
              onClick={option.onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
});

FloatingActionBubble.displayName = 'FloatingActionBubble';
