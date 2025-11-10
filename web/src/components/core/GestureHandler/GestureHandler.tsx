import React from 'react';
import { useSwipeDetection } from './useSwipeDetection';
import { usePeekPreview } from './usePeekPreview';
import { PeekPreview } from './PeekPreview';
import { DirectionArrow } from './DirectionArrow';
import type { GestureHandlerProps } from './types';
import { useInstanceTracker, useInstanceRegistry } from '../../../utils/instanceTracker';
import { logger } from '../../../utils/debugLogger';

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
  // Track component instance and check for duplicates
  const { instanceId, renderCount } = useInstanceTracker({
    componentName: 'GestureHandler',
    logMounts: true,
    logRenders: false, // Set to true only when debugging excessive renders
    logUnmounts: true,
  });

  const { totalInstances } = useInstanceRegistry('GestureHandler');

  const { currentDelta, isPeeking, handlers } = useSwipeDetection({
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
  });

  const peekPreview = usePeekPreview(currentDelta, isPeeking, peekContent);

  // Debug: Log state changes (only at verbose level)
  React.useEffect(() => {
    logger.debug('🎨 GestureHandler state:', { 
      instanceId,
      renderCount,
      totalInstances,
      isPeeking, 
      currentDelta,
      hasChildren: !!children,
      hasPeekContent: !!peekContent 
    });
  }, [instanceId, renderCount, totalInstances, isPeeking, currentDelta, children, peekContent]);

  return (
    <div
      {...handlers}
      className="h-full w-full"
      style={{ 
        position: 'relative',
        overflow: 'hidden', // Prevent scrollbars and clip overflow properly
        background: 'transparent', // Let children define their own background
      }}
    >
      {/* Peek Preview Layer - Shows next page sliding in (BEHIND current page, z-0) */}
      {peekPreview && (
        <PeekPreview peekPreview={peekPreview} />
      )}
      
      {/* Current Page Layer - Slides with finger (ON TOP of peek, z-10) */}
      <div
        className="h-full w-full relative"
        style={{
          transform: isPeeking ? `translate(${currentDelta.x}px, ${currentDelta.y}px)` : 'translate(0, 0)',
          transition: isPeeking ? 'none' : 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
          willChange: 'transform',
          zIndex: 10, // Explicitly high z-index to ensure it's above peek preview
          // No background here - children provide their own
        }}
      >
        {children}
      </div>
      
      {/* Direction Hint Arrow with smooth fade (z-20, above everything) */}
      {peekPreview && (
        <DirectionArrow direction={peekPreview.direction} />
      )}
    </div>
  );
};
