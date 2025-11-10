import { useState, useRef, useEffect, useCallback } from 'react';
import type { Position, DragRef } from './types';

export interface UseDraggableOptions {
  /** Enable snap-to-edge behavior */
  snapToEdge?: boolean;
  /** Margin from screen edge when snapping */
  edgeMargin?: number;
  /** Animation duration for snap */
  snapDuration?: number;
}

/**
 * Reusable drag logic hook with touch support and optional snap-to-edge
 * Uses PointerEvent for unified mouse/touch handling
 */
export const useDraggable = (
  initialPosition: Position, 
  options: UseDraggableOptions = {}
) => {
  const {
    snapToEdge = true,
    edgeMargin = 16,
    snapDuration = 300,
  } = options;

  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<DragRef | null>(null);
  const animationRef = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX - position.x,
      startY: e.clientY - position.y,
    };
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (isDragging && dragRef.current) {
      setPosition({
        x: e.clientX - dragRef.current.startX,
        y: e.clientY - dragRef.current.startY,
      });
    }
  };

  const snapToNearestEdge = useCallback(() => {
    if (!snapToEdge) return;

    const screenWidth = window.innerWidth;
    const centerX = screenWidth / 2;
    const targetX = position.x < centerX ? edgeMargin : screenWidth - edgeMargin;

    // Smooth animation to edge
    const startX = position.x;
    const deltaX = targetX - startX;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / snapDuration, 1);
      
      // Cubic ease-out
      const easing = 1 - Math.pow(1 - progress, 3);
      
      setPosition(prev => ({
        x: startX + deltaX * easing,
        y: prev.y,
      }));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [position.x, snapToEdge, edgeMargin, snapDuration]);

  const handlePointerUp = () => {
    setIsDragging(false);
    dragRef.current = null;
    snapToNearestEdge();
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    position,
    isDragging,
    handlers: {
      onPointerDown: handlePointerDown,
    },
  };
};
