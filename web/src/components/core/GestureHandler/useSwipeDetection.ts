import { useState } from 'react';
import type { TouchPoint, Delta, SwipeCallbacks } from './types';
import { logger } from '../../../utils/debugLogger';

/**
 * Hook to detect and handle swipe gestures
 * Pure logic - no UI concerns
 */
export const useSwipeDetection = (callbacks: SwipeCallbacks) => {
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null);
  const [currentDelta, setCurrentDelta] = useState<Delta>({ x: 0, y: 0 });
  const [isPeeking, setIsPeeking] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    logger.debug('👆 Touch START:', e.touches[0].clientX, e.touches[0].clientY);
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    });
    setIsPeeking(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const currentTouch = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    const deltaX = currentTouch.x - touchStart.x;
    const deltaY = currentTouch.y - touchStart.y;

    logger.debug('👉 Touch MOVE - Delta:', { deltaX, deltaY });

    setCurrentDelta({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    logger.debug('👋 Touch END');
    if (!touchStart) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now(),
    };

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const deltaTime = touchEnd.time - touchStart.time;
    
    logger.debug('✅ Swipe detected:', { deltaX, deltaY, deltaTime });
    
    // Reset peek animation
    setCurrentDelta({ x: 0, y: 0 });
    setIsPeeking(false);
    
    // Threshold for swipe detection
    const distanceThreshold = 100;
    const minSwipeTime = 200;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;
    const minVelocity = 0.3;

    logger.debug('📊 Swipe metrics:', { distance, velocity, threshold: distanceThreshold, minVelocity });

    // Trigger navigation if swipe meets criteria
    if (distance > distanceThreshold && deltaTime > minSwipeTime && velocity > minVelocity) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          logger.info('➡️ SWIPE RIGHT triggered');
          callbacks.onSwipeRight();
        } else {
          logger.info('⬅️ SWIPE LEFT triggered');
          callbacks.onSwipeLeft();
        }
      } else {
        if (deltaY > 0) {
          logger.info('⬇️ SWIPE DOWN triggered');
          callbacks.onSwipeDown();
        } else {
          logger.info('⬆️ SWIPE UP triggered');
          callbacks.onSwipeUp();
        }
      }
    } else {
      logger.debug('❌ Swipe did not meet criteria');
    }

    setTouchStart(null);
  };

  return {
    touchStart,
    currentDelta,
    isPeeking,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
