/**
 * Orbital Interface - Revolutionary DJ Portal UI
 * No traditional nav/sidebar - gesture-first, floating controls
 */

import React, { useState, useRef, useEffect } from 'react';
import { Music, DollarSign, Settings, LogOut, Plus, Search, Filter } from 'lucide-react';

interface MenuOption {
  icon: React.ReactNode;
  label: string;
  angle: number;
  color: string;
  onClick: () => void;
}

interface FloatingBubbleProps {
  onMenuToggle: () => void;
  isExpanded: boolean;
  menuOptions?: MenuOption[];
}

export const FloatingActionBubble: React.FC<FloatingBubbleProps> = ({ onMenuToggle, isExpanded, menuOptions }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX - position.x,
      startY: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && dragRef.current) {
      setPosition({
        x: e.clientX - dragRef.current.startX,
        y: e.clientY - dragRef.current.startY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragRef.current = null;
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <>
      {/* Main Floating Bubble */}
      <div
        className="fixed z-50 cursor-move"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
        onMouseDown={handleMouseDown}
      >
        <button
          onClick={onMenuToggle}
          className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 shadow-2xl backdrop-blur-lg border-2 border-white/20 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          style={{
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(168, 85, 247, 0.3)',
          }}
        >
          <Music className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white animate-pulse" />
          
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse" />
        </button>

        {/* Radial Menu - Expands in circular pattern */}
        {isExpanded && menuOptions && (
          <div className="absolute inset-0">
            {menuOptions.map((option, index) => (
              <RadialMenuItem
                key={index}
                icon={option.icon}
                label={option.label}
                angle={option.angle}
                distance={100}
                color={option.color}
                onClick={option.onClick}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

interface RadialMenuItemProps {
  icon: React.ReactNode;
  label: string;
  angle: number;
  distance: number;
  color: string;
  onClick: () => void;
}

const RadialMenuItem: React.FC<RadialMenuItemProps> = ({ icon, label, angle, distance, color, onClick }) => {
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * distance;
  const y = Math.sin(radians) * distance;

  return (
    <div
      className="absolute animate-scale-in"
      style={{
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
      }}
    >
      <button
        onClick={onClick}
        className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${color} shadow-xl backdrop-blur-lg border-2 border-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center group relative`}
        style={{
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {icon}
        <span className="absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 text-xs sm:text-sm text-white font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {label}
        </span>
      </button>
    </div>
  );
};

/**
 * Status Arc - Wraps around screen edges
 */
interface StatusArcProps {
  mode: 'browsing' | 'active' | 'earning';
  revenue: number;
  requestCount: number;
}

export const StatusArc: React.FC<StatusArcProps> = ({ mode, revenue, requestCount }) => {
  const colors = {
    browsing: 'from-blue-500 via-blue-600 to-blue-500',
    active: 'from-green-500 via-green-600 to-green-500',
    earning: 'from-yellow-500 via-orange-500 to-yellow-500',
  };

  return (
    <>
      {/* Top Arc */}
      <div className="fixed top-0 left-0 right-0 h-1 z-40">
        <div className={`h-full bg-gradient-to-r ${colors[mode]} animate-pulse-glow`} />
      </div>

      {/* Counters - Top Left Side by Side */}
      <div className="fixed top-2 sm:top-4 md:top-6 left-2 sm:left-4 md:left-6 z-40 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-4">
        {/* Request Counter */}
        <div className="bg-black/50 backdrop-blur-lg rounded-full px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 border border-blue-500/50">
          <div className="flex items-center gap-1 sm:gap-2">
            <Music className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400 animate-pulse" />
            <span className="text-base sm:text-xl md:text-2xl font-bold text-blue-400 tabular-nums">
              {requestCount}
            </span>
          </div>
        </div>

        {/* Revenue Counter */}
        <div className="bg-black/50 backdrop-blur-lg rounded-full px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 border border-yellow-500/50">
          <div className="flex items-center gap-1 sm:gap-2">
            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400 animate-pulse" />
            <span className="text-base sm:text-xl md:text-2xl font-bold text-yellow-400 tabular-nums">
              R{revenue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Arc */}
      <div className="fixed bottom-0 left-0 right-0 h-1 z-40">
        <div className={`h-full bg-gradient-to-r ${colors[mode]} animate-pulse-glow`} />
      </div>
    </>
  );
};

/**
 * Circular Queue Visualizer - Center of screen
 */
interface QueueVisualizerProps {
  requests: Array<{
    id: string;
    songTitle: string;
    artistName: string;
    albumArt?: string;
    type: 'standard' | 'spotlight' | 'dedication';
    position: number;
    userName?: string;
    userTier?: string;
    price?: number;
    dedication?: string;
  }>;
  onRequestTap?: (request: any) => void;
  onAccept?: (id: string) => void;
  onVeto: (id: string) => void;
}

export const CircularQueueVisualizer: React.FC<QueueVisualizerProps> = ({ 
  requests, 
  onRequestTap,
  onAccept,
  onVeto 
}) => {
  const [dragState, setDragState] = useState<{ id: string; startY: number; currentY: number } | null>(null);
  const nextRequests = requests.slice(0, 5);

  const handlePointerDown = (e: React.PointerEvent, request: any) => {
    e.preventDefault();
    setDragState({ id: request.id, startY: e.clientY, currentY: e.clientY });
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (dragState) {
      setDragState({ ...dragState, currentY: e.clientY });
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
      else if (delta > 100) {
        onVeto(dragState.id);
      }
      // No significant swipe - Tap to view details
      else if (Math.abs(delta) < 10 && onRequestTap) {
        const request = requests.find(r => r.id === dragState.id);
        if (request) {
          onRequestTap(request);
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

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-30">
      <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] pointer-events-auto">
        {/* Center Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl">
            <Music className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white" />
          </div>
        </div>

        {/* Orbiting Requests */}
        {nextRequests.map((request, index) => {
          const angle = (index * 360) / 5;
          const radians = (angle * Math.PI) / 180;
          const distance = 140;
          const x = Math.cos(radians) * distance;
          const y = Math.sin(radians) * distance;

          const glowColors = {
            standard: 'shadow-blue-500/50',
            spotlight: 'shadow-yellow-500/50',
            dedication: 'shadow-pink-500/50',
          };

          const borderColors = {
            standard: 'border-blue-500',
            spotlight: 'border-yellow-500',
            dedication: 'border-pink-500',
          };

          // Apply drag offset if this card is being dragged
          const isDragging = dragState?.id === request.id;
          const dragOffset = isDragging ? (dragState.currentY - dragState.startY) : 0;

          return (
            <div
              key={request.id}
              className="absolute animate-orbit"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y + dragOffset}px))`,
                animationDelay: `${index * 0.2}s`,
                transition: isDragging ? 'none' : 'transform 0.3s ease',
              }}
            >
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-black/80 backdrop-blur-lg border-2 ${borderColors[request.type]} ${glowColors[request.type]} shadow-2xl flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-all group relative ${
                  isDragging && dragOffset < -50 ? 'ring-4 ring-green-500' : ''
                } ${
                  isDragging && dragOffset > 50 ? 'ring-4 ring-red-500' : ''
                }`}
                onPointerDown={(e) => handlePointerDown(e, request)}
                style={{
                  touchAction: 'none',
                }}
              >
                {/* Position Badge */}
                <span className="text-white text-xs sm:text-sm font-bold">#{request.position}</span>
                <Music className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white mt-1" />
                
                {/* Drag Indicators */}
                {isDragging && dragOffset < -50 && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-green-400 font-bold text-sm whitespace-nowrap">
                    ↑ ACCEPT
                  </div>
                )}
                {isDragging && dragOffset > 50 && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-red-400 font-bold text-sm whitespace-nowrap">
                    ↓ VETO
                  </div>
                )}
                
                {/* Tooltip */}
                <div className="absolute -bottom-12 sm:-bottom-16 md:-bottom-20 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-lg rounded-lg px-2 py-1 sm:px-3 sm:py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  <p className="text-white text-xs sm:text-sm font-semibold">{request.songTitle}</p>
                  <p className="text-gray-400 text-xs">{request.artistName}</p>
                  <p className="text-xs text-green-400 mt-1">↑ Swipe up to accept</p>
                  <p className="text-xs text-red-400">↓ Swipe down to veto</p>
                </div>
              </div>

              {/* Heartbeat pulse for next 2 songs */}
              {index < 2 && (
                <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-heartbeat" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Gesture Handler Component
 */
interface GestureHandlerProps {
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  children: React.ReactNode;
}

export const GestureHandler: React.FC<GestureHandlerProps> = ({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  children,
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const threshold = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          onSwipeDown();
        } else {
          onSwipeUp();
        }
      }
    }

    setTouchStart(null);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="h-full w-full"
    >
      {children}
    </div>
  );
};
