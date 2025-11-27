import { useState } from 'react';
import type { TouchPoint, Delta, SwipeCallbacks } from './types';

/**
 * Hook to detect and handle swipe gestures
 * Pure logic - no UI concerns
 */
export const useSwipeDetection = (callbacks: SwipeCallbacks, options: { disabled?: boolean } = {}) => {
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null);
  const [currentDelta, setCurrentDelta] = useState<Delta>({ x: 0, y: 0 });
  const [isPeeking, setIsPeeking] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (options.disabled) return;
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    });
    setIsPeeking(true);
    setHasTriggered(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || hasTriggered) return;

    const currentTouch = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    const deltaX = currentTouch.x - touchStart.x;
    const deltaY = currentTouch.y - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;

    setCurrentDelta({ x: deltaX, y: deltaY });

    // Auto-snap: If scrolling for > 0.5s and threshold met, trigger immediately
    const distanceThreshold = 60;
    const autoSnapTime = 500;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (deltaTime > autoSnapTime && distance > distanceThreshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) callbacks.onSwipeRight();
        else callbacks.onSwipeLeft();
      } else {
        if (deltaY > 0) callbacks.onSwipeDown();
        else callbacks.onSwipeUp();
      }

      // Reset and mark as triggered
      setHasTriggered(true);
      setCurrentDelta({ x: 0, y: 0 });
      setIsPeeking(false);
      setTouchStart(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || hasTriggered) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now(),
    };

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const deltaTime = touchEnd.time - touchStart.time;

    // Reset peek animation
    setCurrentDelta({ x: 0, y: 0 });
    setIsPeeking(false);

    // Threshold for swipe detection - Quicker activation
    const distanceThreshold = 60;
    const minSwipeTime = 50;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;
    const minVelocity = 0.3;

    // Trigger navigation if swipe meets criteria
    if (distance > distanceThreshold && deltaTime > minSwipeTime && velocity > minVelocity) {
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
