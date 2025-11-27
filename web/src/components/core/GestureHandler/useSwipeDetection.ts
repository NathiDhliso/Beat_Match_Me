import { useState, useRef } from 'react';
import type { TouchPoint, Delta, SwipeCallbacks } from './types';

/**
 * Hook to detect and handle swipe gestures
 * Requires hard press + deliberate pull for navigation
 */
export const useSwipeDetection = (callbacks: SwipeCallbacks, options: { disabled?: boolean } = {}) => {
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null);
  const [currentDelta, setCurrentDelta] = useState<Delta>({ x: 0, y: 0 });
  const [isPeeking, setIsPeeking] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isHardPressActive, setIsHardPressActive] = useState(false);
  const hardPressTimer = useRef<NodeJS.Timeout | null>(null);

  const HARD_PRESS_DURATION = 300;
  const DISTANCE_THRESHOLD = 200;
  const MIN_VELOCITY = 0.6;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (options.disabled) return;
    
    const startPoint = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
    
    setTouchStart(startPoint);
    setHasTriggered(false);
    setIsHardPressActive(false);
    setIsPeeking(false);

    if (hardPressTimer.current) {
      clearTimeout(hardPressTimer.current);
    }

    hardPressTimer.current = setTimeout(() => {
      setIsHardPressActive(true);
      setIsPeeking(true);
    }, HARD_PRESS_DURATION);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || hasTriggered) return;

    const currentTouch = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    const deltaX = currentTouch.x - touchStart.x;
    const deltaY = currentTouch.y - touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > 20 && hardPressTimer.current) {
      clearTimeout(hardPressTimer.current);
      hardPressTimer.current = null;
    }

    if (!isHardPressActive) {
      return;
    }

    setCurrentDelta({ x: deltaX, y: deltaY });

    if (distance > DISTANCE_THRESHOLD) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) callbacks.onSwipeRight();
        else callbacks.onSwipeLeft();
      } else {
        if (deltaY > 0) callbacks.onSwipeDown();
        else callbacks.onSwipeUp();
      }

      setHasTriggered(true);
      setCurrentDelta({ x: 0, y: 0 });
      setIsPeeking(false);
      setIsHardPressActive(false);
      setTouchStart(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (hardPressTimer.current) {
      clearTimeout(hardPressTimer.current);
      hardPressTimer.current = null;
    }

    if (!touchStart || hasTriggered || !isHardPressActive) {
      setCurrentDelta({ x: 0, y: 0 });
      setIsPeeking(false);
      setIsHardPressActive(false);
      setTouchStart(null);
      return;
    }

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now(),
    };

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const deltaTime = touchEnd.time - touchStart.time;

    setCurrentDelta({ x: 0, y: 0 });
    setIsPeeking(false);
    setIsHardPressActive(false);

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    if (distance > DISTANCE_THRESHOLD && velocity > MIN_VELOCITY) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          callbacks.onSwipeRight();
        } else {
          callbacks.onSwipeLeft();
        }
      } else {
        if (deltaY > 0) {
          callbacks.onSwipeDown();
        } else {
          callbacks.onSwipeUp();
        }
      }
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
