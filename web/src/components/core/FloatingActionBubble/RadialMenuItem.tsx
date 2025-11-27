import React from 'react';
import type { RadialMenuItemProps } from './types';

/**
 * Individual menu item in the radial menu
 * Appears at a specific angle around the floating bubble
 */
export const RadialMenuItem: React.FC<RadialMenuItemProps> = ({ 
  icon, 
  label, 
  angle, 
  distance, 
  color, 
  onClick,
  showLabel = false
}) => {
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * distance;
  const y = Math.sin(radians) * distance;

  return (
    <div
      className="absolute animate-scale-in"
      style={{
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
        pointerEvents: 'auto',
      }}
    >
      <button
        onClick={onClick}
        className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${color} shadow-xl backdrop-blur-lg border-2 border-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center group relative`}
        style={{
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {icon}
        <span className={`absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 text-xs sm:text-sm text-white font-semibold whitespace-nowrap transition-opacity ${showLabel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {label}
        </span>
      </button>
    </div>
  );
};
