import React from 'react';
import { Clock, CheckCircle, XCircle, Music, AlertCircle } from 'lucide-react';

export type RequestStatus = 
  | 'pending' 
  | 'accepted' 
  | 'vetoed' 
  | 'playing' 
  | 'completed'
  | 'expired';

interface StatusIndicatorProps {
  status: RequestStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    colors: 'bg-yellow-500/10 text-yellow-500 border-yellow-500',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle,
    colors: 'bg-green-500/10 text-green-500 border-green-500',
  },
  vetoed: {
    label: 'Vetoed',
    icon: XCircle,
    colors: 'bg-red-500/10 text-red-500 border-red-500',
  },
  playing: {
    label: 'Now Playing',
    icon: Music,
    colors: 'bg-primary-500/10 text-primary-500 border-primary-500 animate-pulse',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    colors: 'bg-blue-500/10 text-blue-500 border-blue-500',
  },
  expired: {
    label: 'Expired',
    icon: AlertCircle,
    colors: 'bg-gray-500/10 text-gray-500 border-gray-500',
  },
};

const sizeConfig = {
  sm: { container: 'px-2 py-0.5 text-xs', icon: 12 },
  md: { container: 'px-3 py-1 text-sm', icon: 16 },
  lg: { container: 'px-4 py-1.5 text-base', icon: 20 },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  size = 'md', 
  showLabel = true,
  className = '' 
}) => {
  const config = statusConfig[status];
  const sizeConf = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.colors} ${sizeConf.container} font-medium ${className}`}
    >
      <Icon size={sizeConf.icon} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
};
