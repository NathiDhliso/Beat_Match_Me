/**
 * Loading Spinner Component
 * Displays an animated loading state with music icon
 */

import React from 'react';
import { Music } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  message 
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer ring - static */}
        <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
        
        {/* Middle ring - spinning */}
        <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
        
        {/* Inner ring - spinning opposite direction */}
        <div 
          className="absolute inset-2 border-2 border-pink-500 rounded-full border-b-transparent" 
          style={{
            animation: 'spin 1.5s linear infinite reverse',
          }}
        />
        
        {/* Center icon - pulsing */}
        <Music 
          className={`absolute inset-0 m-auto ${iconSizes[size]} text-purple-500 animate-pulse`}
        />
      </div>
      
      {message && (
        <p className="mt-4 text-white text-sm font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};
