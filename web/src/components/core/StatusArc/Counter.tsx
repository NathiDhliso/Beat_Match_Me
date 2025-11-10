import React from 'react';
import type { CounterProps } from './types';

/**
 * Reusable animated counter component
 * Can be used anywhere in the app for displaying metrics
 */
export const Counter: React.FC<CounterProps> = ({ 
  value, 
  icon, 
  color, 
  prefix = '',
  label 
}) => {
  return (
    <div 
      className="bg-black/50 backdrop-blur-lg rounded-full px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 border"
      style={{ borderColor: `${color}80` }}
    >
      <div className="flex items-center gap-1 sm:gap-2">
        <div style={{ color }}>{icon}</div>
        <span 
          className="text-base sm:text-xl md:text-2xl font-bold tabular-nums" 
          style={{ color }}
        >
          {prefix}{typeof value === 'number' ? value.toFixed(2) : value}
        </span>
      </div>
      {label && (
        <p className="text-xs text-gray-400 text-center mt-0.5">{label}</p>
      )}
    </div>
  );
};
