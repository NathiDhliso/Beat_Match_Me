import { useState, useEffect } from 'react';
import type { DragState, Request } from './types';

interface UseRequestSwipeProps {
  requests: Request[];
  onAccept?: (id: string) => void;
  onVeto?: (id: string) => void;
  onTap?: (request: Request) => void;
}

/**
 * Hook to handle swipe-to-accept/veto gesture on request cards
 */
export const useRequestSwipe = ({
  requests,
  onAccept,
  onVeto,
  onTap,
}: UseRequestSwipeProps) => {
  const [dragState, setDragState] = useState<DragState | null>(null);

  const handlePointerDown = (e: React.PointerEvent, request: Request) => {
    e.preventDefault();
    setDragState({ 
      id: request.id, 
      startY: e.clientY, 
      currentY: e.clientY 
    });
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (dragState) {
      setDragState({ 
        ...dragState, 
        currentY: e.clientY 
      });
    }
  };

  const handlePointerUp = () => {
    if (dragState) {
      const delta = dragState.currentY - dragState.startY;
      
      // Swipe up threshold (100px) - Accept
      if (delta < -100 && onAccept) {
        onAccept(dragState.id);
      }
      // Swipe down threshold (100px) - Veto
      else if (delta > 100 && onVeto) {
        onVeto(dragState.id);
      }
      // No significant swipe - Tap to view details
      else if (Math.abs(delta) < 10 && onTap) {
        const request = requests.find(r => r.id === dragState.id);
        if (request) {
          onTap(request);
        }
      }
      
      setDragState(null);
    }
  };

  useEffect(() => {
    if (dragState) {
      window.addEventListener('pointermove', handlePointerMove as any);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove as any);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [dragState]);

  return {
    dragState,
    handlePointerDown,
  };
};
