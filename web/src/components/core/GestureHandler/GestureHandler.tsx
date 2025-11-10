import React from 'react';
import { useSwipeDetection } from './useSwipeDetection';
import { usePeekPreview } from './usePeekPreview';
import { PeekPreview } from './PeekPreview';
import type { GestureHandlerProps } from './types';

/**
 * Gesture Handler Component with Peek Preview
 * Wraps content and provides swipe navigation with visual feedback
 */
export const GestureHandler: React.FC<GestureHandlerProps> = ({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  children,
  peekContent,
}) => {

  const { currentDelta, isPeeking, handlers } = useSwipeDetection({
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
  });

  const peekPreview = usePeekPreview(currentDelta, isPeeking, peekContent);

  // Limit drag distance and determine dominant direction
  const getDominantTransform = () => {
    if (!isPeeking) return 'translate(0, 0)';
    
    const absX = Math.abs(currentDelta.x);
    const absY = Math.abs(currentDelta.y);
    const maxDrag = 150; // Maximum pixels user can drag
    
    // Apply resistance - the further you drag, the harder it gets
    const applyResistance = (value: number) => {
      const abs = Math.abs(value);
      if (abs > maxDrag) {
        // Strong resistance beyond max
        return (value > 0 ? 1 : -1) * (maxDrag + (abs - maxDrag) * 0.2);
      }
      return value;
    };
    
    // Only move in the dominant direction with resistance
    if (absX > absY) {
      return `translate(${applyResistance(currentDelta.x)}px, 0)`;
    } else {
      return `translate(0, ${applyResistance(currentDelta.y)}px)`;
    }
  };

  return (
    <div
      {...handlers}
      className="h-full w-full"
      style={{ 
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
      }}
    >
      {/* Peek Preview Layer - Shows behind the main content */}
      {isPeeking && peekPreview && peekPreview.direction && (
        <PeekPreview peekPreview={peekPreview} />
      )}

      {/* Current Page Layer - Limited drag with elastic snap back */}
      <div
        className="h-full w-full relative z-10"
        style={{
          transform: getDominantTransform(),
          transition: isPeeking ? 'none' : 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          willChange: 'transform',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)',
          opacity: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
};
