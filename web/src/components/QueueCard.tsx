import React from 'react';
import { TierBadge, type TierType } from './TierBadge';
import { StatusIndicator, type RequestStatus } from './StatusIndicators';

export type RequestType = 'standard' | 'spotlight' | 'group';

interface QueueCardProps {
  songTitle: string;
  artistName: string;
  userName: string;
  userTier: TierType;
  requestType: RequestType;
  status: RequestStatus;
  price: number;
  queuePosition?: number;
  dedication?: string;
  upvotes?: number;
  onAccept?: () => void;
  onVeto?: () => void;
  onReorder?: () => void;
  isPerformerView?: boolean;
  className?: string;
}

const requestTypeConfig = {
  standard: {
    label: 'Standard',
    borderColor: 'border-primary-500',
    bgColor: 'bg-primary-500/10',
    icon: '🎵',
  },
  spotlight: {
    label: 'Spotlight',
    borderColor: 'border-spotlight-500',
    bgColor: 'bg-spotlight-500/10',
    icon: '⭐',
  },
  group: {
    label: 'Group Request',
    borderColor: 'border-secondary-500',
    bgColor: 'bg-secondary-500/10',
    icon: '👥',
  },
};

export const QueueCard: React.FC<QueueCardProps> = ({
  songTitle,
  artistName,
  userName,
  userTier,
  requestType,
  status,
  price,
  queuePosition,
  dedication,
  upvotes = 0,
  onAccept,
  onVeto,
  onReorder,
  isPerformerView = false,
  className = '',
}) => {
  const typeConfig = requestTypeConfig[requestType];

  return (
    <div
      className={`
        relative rounded-2xl border-2
        ${typeConfig.borderColor}
        ${typeConfig.bgColor}
        backdrop-blur-sm
        p-4
        transition-all duration-300
        hover:shadow-lg
        ${className}
      `}
    >
      {/* Request type badge */}
      <div className="absolute -top-3 -right-3">
        <div className={`
          px-3 py-1 rounded-full text-xs font-bold
          ${typeConfig.bgColor}
          ${typeConfig.borderColor}
          border-2
          flex items-center gap-1
        `}>
          <span>{typeConfig.icon}</span>
          <span>{typeConfig.label}</span>
        </div>
      </div>

      {/* Queue position indicator */}
      {queuePosition && (
        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
          {queuePosition}
        </div>
      )}

      <div className="space-y-3">
        {/* Song info */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate">
              {songTitle}
            </h3>
            <p className="text-sm text-gray-400 truncate">
              {artistName}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-bold text-gold-500">
              R{price}
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="flex items-center gap-2">
          <TierBadge tier={userTier} size="sm" />
          <span className="text-sm text-gray-300">{userName}</span>
        </div>

        {/* Dedication */}
        {dedication && (
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-sm text-gray-300 italic">
              "{dedication}"
            </p>
          </div>
        )}

        {/* Status and actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <StatusIndicator status={status} size="sm" />
          
          <div className="flex items-center gap-2">
            {/* Upvotes */}
            {upvotes > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <span>❤️</span>
                <span>{upvotes}</span>
              </div>
            )}

            {/* Performer actions */}
            {isPerformerView && status === 'pending' && (
              <div className="flex gap-2">
                {onAccept && (
                  <button
                    onClick={onAccept}
                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Accept
                  </button>
                )}
                {onReorder && (
                  <button
                    onClick={onReorder}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Reorder
                  </button>
                )}
                {onVeto && (
                  <button
                    onClick={onVeto}
                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Veto
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Currently playing card (larger, more prominent)
 */
export const CurrentlyPlayingCard: React.FC<Omit<QueueCardProps, 'queuePosition'>> = (props) => {
  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl blur-xl opacity-50 animate-pulse" />
      
      {/* Card */}
      <div className="relative">
        <QueueCard
          {...props}
          status="playing"
          className="scale-105 shadow-glow-cyan"
        />
        
        {/* Now playing indicator */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full text-white font-bold text-sm shadow-lg animate-pulse">
          🎶 NOW PLAYING
        </div>
      </div>
    </div>
  );
};

/**
 * Compact queue card for list views
 */
interface CompactQueueCardProps {
  songTitle: string;
  artistName: string;
  requestType: RequestType;
  position: number;
  className?: string;
}

export const CompactQueueCard: React.FC<CompactQueueCardProps> = ({
  songTitle,
  artistName,
  requestType,
  position,
  className = '',
}) => {
  const typeConfig = requestTypeConfig[requestType];

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-xl
        ${typeConfig.bgColor}
        border ${typeConfig.borderColor}
        transition-all duration-200
        hover:scale-102
        ${className}
      `}
    >
      {/* Position */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-sm">
        {position}
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">
          {songTitle}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {artistName}
        </p>
      </div>

      {/* Type icon */}
      <div className="flex-shrink-0 text-lg">
        {typeConfig.icon}
      </div>
    </div>
  );
};
