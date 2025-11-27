import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
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
  const { isDark } = useTheme();
  
  return (
    <div 
      className={`backdrop-blur-lg rounded-full px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 border ${isDark ? 'bg-gray-900/50' : 'bg-white/80 shadow-md'}`}
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
        <p className={`text-xs text-center mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
      )}
    </div>
  );
};
