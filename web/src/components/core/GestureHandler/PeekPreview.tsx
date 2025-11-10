import React from 'react';
import type { PeekPreview as PeekPreviewType } from './types';

interface PeekPreviewProps {
  peekPreview: PeekPreviewType;
}

/**
 * Preview layer that shows the next page sliding in during swipe
 * Simple, highly visible animation with smooth reload
 */
export const PeekPreview: React.FC<PeekPreviewProps> = ({ peekPreview }) => {
  const { direction, offset } = peekPreview;
  const absOffset = Math.abs(offset);
  
  // Calculate opacity - fade in as user swipes
  const opacity = Math.min(absOffset / 100, 0.95);
  
  // Calculate transform based on swipe direction
  // Preview now covers FULL screen and slides in from the appropriate edge
  const getTransform = () => {
    switch (direction) {
      case 'left':
        // Slide in from right edge
        return `translateX(${Math.max(0, 100 - absOffset)}%)`;
      case 'right':
        // Slide in from left edge
        return `translateX(${Math.min(0, -100 + absOffset)}%)`;
      case 'up':
        // Slide in from bottom edge
        return `translateY(${Math.max(0, 100 - absOffset)}%)`;
      case 'down':
        // Slide in from top edge
        return `translateY(${Math.min(0, -100 + absOffset)}%)`;
    }
  };

  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        opacity,
        transform: getTransform(),
        transition: 'none',
        willChange: 'transform, opacity',
      }}
    >
      {/* Vibrant animated background with pulsing effect */}
      <div 
        className="h-full w-full relative overflow-hidden"
        style={{
          background: direction === 'left' 
            ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.5) 100%)'
            : direction === 'right'
            ? 'linear-gradient(-90deg, rgba(236, 72, 153, 0.3) 0%, rgba(239, 68, 68, 0.5) 100%)'
            : direction === 'up'
            ? 'linear-gradient(180deg, rgba(34, 197, 94, 0.3) 0%, rgba(16, 185, 129, 0.5) 100%)'
            : 'linear-gradient(-180deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.5) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'inset 0 0 100px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Animated ripple effect */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, rgba(255,255,255,${opacity * 0.2}) 0%, transparent 70%)`,
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
        
        {/* Content container */}
        <div className="relative z-10 h-full w-full flex items-center justify-center">
          {peekPreview.content}
        </div>

        {/* Progress indicator */}
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 
                     bg-white/20 backdrop-blur-md rounded-full px-6 py-3
                     border-2 border-white/40 shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full bg-white animate-pulse"
              style={{
                animationDuration: '1s',
              }}
            />
            <span className="text-white font-bold text-lg">
              {Math.round(opacity * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
