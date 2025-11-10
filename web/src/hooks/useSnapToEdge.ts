import { useEffect, useCallback } from 'react';

export interface SnapToEdgeOptions {
  /** Margin from screen edge in pixels (default: 16) */
  edgeMargin?: number;
  /** Animation duration in ms (default: 300) */
  animationDuration?: number;
  /** Whether to enable snap behavior (default: true) */
  enabled?: boolean;
  /** Callback when snap completes */
  onSnapComplete?: (edge: 'left' | 'right') => void;
}

export interface UseSnapToEdgeReturn {
  /** Trigger snap animation to nearest edge */
  snapToEdge: () => void;
  /** Calculate which edge is nearest */
  getNearestEdge: (x: number) => 'left' | 'right';
}

/**
 * Hook to snap floating elements to screen edges
 * Automatically calculates nearest edge and animates smooth snap
 * 
 * @example
 * ```tsx
 * const { snapToEdge, getNearestEdge } = useSnapToEdge({
 *   edgeMargin: 20,
 *   animationDuration: 300,
 *   onSnapComplete: (edge) => console.log(`Snapped to ${edge}`)
 * });
 * 
 * // On drag end
 * const handleDragEnd = () => {
 *   snapToEdge();
 * };
 * ```
 */
export const useSnapToEdge = (
  elementRef: React.RefObject<HTMLElement>,
  options: SnapToEdgeOptions = {}
): UseSnapToEdgeReturn => {
  const {
    edgeMargin = 16,
    animationDuration = 300,
    enabled = true,
    onSnapComplete,
  } = options;

  const getNearestEdge = useCallback((x: number): 'left' | 'right' => {
    const screenWidth = window.innerWidth;
    const centerX = screenWidth / 2;
    return x < centerX ? 'left' : 'right';
  }, []);

  const snapToEdge = useCallback(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const currentX = rect.left + rect.width / 2;
    const edge = getNearestEdge(currentX);

    // Calculate target position
    const targetX = edge === 'left' 
      ? edgeMargin 
      : window.innerWidth - rect.width - edgeMargin;

    // Apply smooth animation
    element.style.transition = `left ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    element.style.left = `${targetX}px`;

    // Call completion callback after animation
    const timeoutId = setTimeout(() => {
      element.style.transition = '';
      onSnapComplete?.(edge);
    }, animationDuration);

    return () => clearTimeout(timeoutId);
  }, [enabled, elementRef, edgeMargin, animationDuration, getNearestEdge, onSnapComplete]);

  // Snap on window resize
  useEffect(() => {
    if (!enabled) return;

    const handleResize = () => {
      snapToEdge();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [enabled, snapToEdge]);

  return {
    snapToEdge,
    getNearestEdge,
  };
};
