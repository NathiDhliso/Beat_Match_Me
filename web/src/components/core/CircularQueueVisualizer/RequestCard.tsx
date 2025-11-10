import React, { useState } from 'react';
import { Music } from 'lucide-react';
import { RequestBadge } from '../../ui/RequestBadge';
import type { RequestCardProps } from './types';

/**
 * Individual request card in the orbital queue
 * Handles display and drag interactions for a single request
 */
export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  angle,
  distance,
  index,
  isMobile,
  isDragging,
  dragOffset,
  onPointerDown,
}) => {
  const [imageError, setImageError] = useState(false);
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * distance;
  const y = Math.sin(radians) * distance;

  const glowColors = {
    standard: 'shadow-blue-500/50',
    spotlight: 'shadow-yellow-500/50',
    dedication: 'shadow-pink-500/50',
    premium: 'shadow-purple-500/50',
  };

  const borderColors = {
    standard: 'border-blue-500',
    spotlight: 'border-yellow-500',
    dedication: 'border-pink-500',
    premium: 'border-purple-500',
  };

  return (
    <div
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
        className={`rounded-full bg-black/80 backdrop-blur-lg border-2 ${borderColors[request.type]} ${glowColors[request.type]} shadow-2xl flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-all group relative overflow-hidden ${
          isMobile ? 'w-14 h-14' : 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24'
        } ${
          isDragging && dragOffset < -50 ? 'ring-4 ring-green-500' : ''
        } ${
          isDragging && dragOffset > 50 ? 'ring-4 ring-red-500' : ''
        }`}
        onPointerDown={(e) => onPointerDown(e, request)}
        style={{
          touchAction: 'none',
        }}
      >
        {/* Album Art or Music Icon */}
        {request.albumArt && !imageError ? (
          <img 
            src={request.albumArt} 
            alt={request.songTitle}
            className="absolute inset-0 w-full h-full object-cover rounded-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <Music className={`text-white ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
        )}
        
        {/* Position Badge */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-full z-10">
          <span className={`text-white font-bold ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
            #{request.position}
          </span>
        </div>
        
        {/* Request Type Badge */}
        <RequestBadge type={request.type} price={request.price} />
        
        {/* Drag Indicators */}
        {isDragging && dragOffset < -50 && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-green-400 font-bold text-sm whitespace-nowrap z-20">
            ↑ ACCEPT
          </div>
        )}
        {isDragging && dragOffset > 50 && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-red-400 font-bold text-sm whitespace-nowrap z-20">
            ↓ VETO
          </div>
        )}
        
        {/* Tooltip */}
        <div className="absolute -bottom-12 sm:-bottom-16 md:-bottom-20 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-lg rounded-lg px-2 py-1 sm:px-3 sm:py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          <p className="text-white text-xs sm:text-sm font-semibold">{request.songTitle}</p>
          <p className="text-gray-400 text-xs">{request.artistName}</p>
          {request.userName && (
            <p className="text-purple-400 text-xs mt-1">Requested by {request.userName}</p>
          )}
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
};
