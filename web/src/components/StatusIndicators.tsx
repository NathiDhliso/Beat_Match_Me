import React from 'react';

export type RequestStatus = 'pending' | 'approved' | 'playing' | 'completed' | 'vetoed';

interface StatusIndicatorProps {
  status: RequestStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'In Queue',
    icon: '⏳',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
    borderColor: 'border-yellow-400/50',
    dotColor: 'bg-yellow-400',
  },
  approved: {
    label: 'Confirmed',
    icon: '✓',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
    borderColor: 'border-blue-400/50',
    dotColor: 'bg-blue-400',
  },
  playing: {
    label: 'Now Playing!',
    icon: '🎶',
    color: 'text-green-400',
    bgColor: 'bg-green-400/20',
    borderColor: 'border-green-400/50',
    dotColor: 'bg-green-400',
    pulse: true,
  },
  completed: {
    label: 'Played',
    icon: '✓',
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    dotColor: 'bg-green-500',
  },
  vetoed: {
    label: 'Refunded',
    icon: '❌',
    color: 'text-red-400',
    bgColor: 'bg-red-400/20',
    borderColor: 'border-red-400/50',
    dotColor: 'bg-red-400',
  },
};

const sizeConfig = {
  sm: {
    dot: 'w-2 h-2',
    text: 'text-xs',
    padding: 'px-2 py-1',
  },
  md: {
    dot: 'w-3 h-3',
    text: 'text-sm',
    padding: 'px-3 py-1.5',
  },
  lg: {
    dot: 'w-4 h-4',
    text: 'text-base',
    padding: 'px-4 py-2',
  },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const config = statusConfig[status] || statusConfig.pending; // Fallback to pending if status is invalid
  const sizes = sizeConfig[size];

  return (
    <div
      className={`
        inline-flex items-center gap-2
        ${sizes.padding}
        ${config.bgColor}
        ${config.borderColor}
        border rounded-full
        ${className}
      `}
    >
      <div
        className={`
          ${sizes.dot}
          ${config.dotColor}
          rounded-full
          ${config.pulse ? 'animate-pulse' : ''}
        `}
      />
      {showLabel && (
        <span className={`${sizes.text} ${config.color} font-medium`}>
          {config.label}
        </span>
      )}
    </div>
  );
};

/**
 * Queue position progress indicator
 */
interface QueuePositionProps {
  position: number;
  total: number;
  estimatedWait?: number; // in minutes
  className?: string;
}

export const QueuePosition: React.FC<QueuePositionProps> = ({
  position,
  total,
  estimatedWait,
  className = '',
}) => {
  const progress = ((total - position) / total) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Current position:</span>
        <span className="text-white font-semibold">
          {position} of {total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        {/* Progress indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-500"
          style={{ left: `calc(${Math.min(progress, 100)}% - 8px)` }}
        />
      </div>

      {estimatedWait && (
        <div className="text-center text-sm text-gray-500">
          Estimated wait: ~{estimatedWait} minutes
        </div>
      )}
    </div>
  );
};

/**
 * Circular progress indicator
 */
interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  showPercentage?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 80,
  strokeWidth = 8,
  color = '#00d9ff',
  showPercentage = true,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
};

/**
 * Achievement unlock badge
 */
interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlocked: boolean;
  className?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  name,
  description,
  icon,
  tier,
  unlocked,
  className = '',
}) => {
  const tierColors = {
    bronze: 'from-bronze to-orange-600',
    silver: 'from-silver to-gray-300',
    gold: 'from-gold-400 to-gold-600',
    platinum: 'from-platinum to-white',
  };

  return (
    <div
      className={`
        relative p-6 rounded-2xl
        ${unlocked ? `bg-gradient-to-br ${tierColors[tier]}` : 'bg-gray-800'}
        ${unlocked ? 'shadow-glow-gold' : ''}
        transition-all duration-300
        ${className}
      `}
    >
      {!unlocked && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <span className="text-4xl">🔒</span>
        </div>
      )}
      
      <div className="flex flex-col items-center gap-3 text-center">
        <div className={`text-4xl ${unlocked ? 'animate-bounce-in' : 'grayscale'}`}>
          {icon}
        </div>
        <div>
          <h3 className={`text-lg font-bold ${unlocked ? 'text-white' : 'text-gray-500'}`}>
            {unlocked ? name : '???'}
          </h3>
          <p className={`text-sm mt-1 ${unlocked ? 'text-white/80' : 'text-gray-600'}`}>
            {unlocked ? description : 'Locked'}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Loading spinner
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'border-primary-500',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${color}
        border-t-transparent
        rounded-full
        animate-spin
        ${className}
      `}
    />
  );
};
