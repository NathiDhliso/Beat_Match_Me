import React from 'react';
import type { PeekPreview as PeekPreviewType } from './types';

interface PeekPreviewProps {
  peekPreview: PeekPreviewType;
}

/**
 * Preview layer that shows the next page sliding in during swipe
 * Premium animation with Parallax, Scale, and Blur effects
 */
export const PeekPreview: React.FC<PeekPreviewProps> = ({ peekPreview }) => {
  const { direction, offset } = peekPreview;
  const absOffset = Math.abs(offset);

  // Premium Animation Physics
  // 1. Opacity: Smooth fade in
  const opacity = Math.min(absOffset / 150, 1);

  // 2. Scale: Content starts slightly smaller and scales up
  // Maps 0-100 offset to 0.95-1.0 scale
  const scale = 0.95 + (Math.min(absOffset, 100) / 100) * 0.05;

  // 3. Parallax: Background moves slower than content
  // We use this in the background transform below

  const getTransform = () => {
    switch (direction) {
      case 'left': return `translateX(${Math.max(0, 100 - absOffset)}%)`;
      case 'right': return `translateX(${Math.min(0, -100 + absOffset)}%)`;
      case 'up': return `translateY(${Math.max(0, 100 - absOffset)}%)`;
      case 'down': return `translateY(${Math.min(0, -100 + absOffset)}%)`;
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
      {/* Premium Glassmorphism Background */}
      <div
        className="h-full w-full relative overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.05)', // Very subtle white tint
          backdropFilter: 'blur(12px)', // Glass blur
          WebkitBackdropFilter: 'blur(12px)', // Safari support
          transform: direction === 'left' || direction === 'right'
            ? `translateX(${direction === 'left' ? -10 : 10}%)` // Subtle parallax shift
            : `translateY(${direction === 'up' ? -10 : 10}%)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Content Container with Scale Effect */}
        <div
          className="relative z-10 h-full w-full flex items-center justify-center"
          style={{
            transform: `scale(${scale})`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          {peekPreview.content}
        </div>
      </div>
    </div>
  );
};
