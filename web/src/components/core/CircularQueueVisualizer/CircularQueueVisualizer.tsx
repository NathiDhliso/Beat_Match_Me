import React, { useState } from 'react';
import { Music } from 'lucide-react';
import { useResponsiveOrbit } from './useResponsiveOrbit';
import { useRequestSwipe } from './useRequestSwipe';
import { RequestCard } from './RequestCard';
import { RequestDetailsModal } from '../../modals/RequestDetailsModal';
import type { QueueVisualizerProps, Request } from './types';

/**
 * Circular Queue Visualizer - Center of screen orbital display
 * Phase 8: Memoized - only updates when requests array changes
 */
export const CircularQueueVisualizer: React.FC<QueueVisualizerProps> = React.memo(({ 
  requests, 
  onRequestTap,
  onAccept,
  onVeto 
}) => {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const { isMobile, orbitDistance, containerSize, centerSize, iconSize } = useResponsiveOrbit();
  const { dragState, handlePointerDown } = useRequestSwipe({
    requests,
    onAccept,
    onVeto,
    onTap: (request) => {
      setSelectedRequest(request);
      onRequestTap?.(request);
    },
  });

  const nextRequests = requests.slice(0, 5);

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-30">
        <div className={`relative pointer-events-auto ${containerSize}`}>
          {/* Center Circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl ${centerSize}`}>
              <Music className={`${iconSize} text-white`} />
            </div>
          </div>

          {/* Orbiting Requests */}
          {nextRequests.map((request, index) => {
            const angle = (index * 360) / 5;
            const isDragging = dragState?.id === request.id;
            const dragOffset = isDragging ? (dragState.currentY - dragState.startY) : 0;

            return (
              <RequestCard
                key={request.id}
                request={request}
                angle={angle}
                distance={orbitDistance}
                index={index}
                isMobile={isMobile}
                isDragging={isDragging}
                dragOffset={dragOffset}
                onPointerDown={handlePointerDown}
              />
            );
          })}
        </div>
      </div>

      {/* Request Details Modal */}
      <RequestDetailsModal
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onAccept={(id) => onAccept?.(id)}
        onVeto={onVeto}
      />
    </>
  );
});

CircularQueueVisualizer.displayName = 'CircularQueueVisualizer';
