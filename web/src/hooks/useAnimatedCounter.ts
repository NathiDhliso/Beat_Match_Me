/**
 * Animated Counter Hook
 * Smoothly animates number changes with easing
 */

import { useState, useEffect } from 'react';

interface UseAnimatedCounterOptions {
  duration?: number;
  easing?: (t: number) => number;
  decimals?: number;
}

/**
 * Animates a number from its current value to a target value
 * @param targetValue - The value to animate to
 * @param options - Animation configuration
 * @returns The current animated value
 */
export const useAnimatedCounter = (
  targetValue: number,
  options: UseAnimatedCounterOptions = {}
) => {
  const {
    duration = 800,
    easing = (t: number) => 1 - Math.pow(1 - t, 3), // Ease-out cubic
    decimals = 0,
  } = options;

  const [displayValue, setDisplayValue] = useState(targetValue);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const startValue = displayValue;
    const difference = targetValue - startValue;

    // Don't animate if difference is too small
    if (Math.abs(difference) < 0.01) {
      setDisplayValue(targetValue);
      return;
    }

    setIsAnimating(true);
    const startTime = Date.now();
    let animationFrameId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Apply easing function
      const easedProgress = easing(progress);
      const current = startValue + difference * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        setIsAnimating(false);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [targetValue, duration, easing]);

  // Format the display value
  const formattedValue = decimals > 0 
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toString();

  return {
    value: displayValue,
    formattedValue,
    isAnimating,
  };
};
