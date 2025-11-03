import React from 'react';
import { Music, Clock, TrendingUp, Share2, Plus } from 'lucide-react';

interface RequestTrackingViewProps {
  request: {
    id: string;
    songTitle: string;
    artist: string;
    status: 'pending' | 'approved' | 'coming_up' | 'playing' | 'completed' | 'vetoed';
    queuePosition?: number;
    totalInQueue?: number;
    estimatedWaitMinutes?: number;
    playedAt?: Date;
    vetoReason?: string;
  };
  onViewQueue: () => void;
  onAddAnother: () => void;
  onShare: () => void;
  onUpvote?: () => void;
}

export const RequestTrackingView: React.FC<RequestTrackingViewProps> = ({
  request,
  onViewQueue,
  onAddAnother,
  onShare,
  onUpvote,
}) => {
  const getStatusConfig = () => {
    switch (request.status) {
      case 'pending':
        return {
          label: '⏳ In Queue',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500',
        };
      case 'approved':
        return {
          label: '✓ Confirmed',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500',
        };
      case 'coming_up':
        return {
          label: '🔜 Coming Up Next!',
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500',
        };
      case 'playing':
        return {
          label: '🎶 Now Playing!',
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20',
          borderColor: 'border-purple-500',
        };
      case 'completed':
        return {
          label: `✓ Played at ${request.playedAt?.toLocaleTimeString()}`,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500',
        };
      case 'vetoed':
        return {
          label: '❌ Refunded',
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500',
        };
      default:
        return {
          label: 'Unknown',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const progress = request.queuePosition && request.totalInQueue
    ? ((request.totalInQueue - request.queuePosition) / request.totalInQueue) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Your Request</h1>

        {/* Main Status Card */}
        <div className={`bg-gray-800 rounded-2xl p-6 mb-6 border-2 ${statusConfig.borderColor}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{request.songTitle}</h2>
              <p className="text-gray-400">{request.artist}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`inline-block px-4 py-2 rounded-full ${statusConfig.bgColor} ${statusConfig.color} font-bold mb-4`}>
            {statusConfig.label}
          </div>

          {/* Queue Position (if pending/approved) */}
          {(request.status === 'pending' || request.status === 'approved') && request.queuePosition && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Position in Queue</span>
                <span className="text-3xl font-bold text-white">
                  {request.queuePosition} of {request.totalInQueue}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-500"
                  style={{ left: `${progress}%` }}
                />
              </div>

              {/* Estimated Wait */}
              {request.estimatedWaitMinutes && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-5 h-5" />
                  <span>Estimated wait: ~{request.estimatedWaitMinutes} minutes</span>
                </div>
              )}
            </div>
          )}

          {/* Veto Reason */}
          {request.status === 'vetoed' && request.vetoReason && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-red-400">Reason:</span> {request.vetoReason}
              </p>
              <p className="text-xs text-gray-400 mt-2">Your payment has been refunded</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={onViewQueue}
            className="bg-gray-800 hover:bg-gray-750 text-white py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            View Full Queue
          </button>

          <button
            onClick={onShare}
            className="bg-gray-800 hover:bg-gray-750 text-white py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>

        {/* Upvote Button (if applicable) */}
        {onUpvote && request.status !== 'completed' && request.status !== 'vetoed' && (
          <button
            onClick={onUpvote}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 mb-4"
          >
            ❤️ Upvote My Request
          </button>
        )}

        {/* Add Another Request */}
        <button
          onClick={onAddAnother}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Another Request
        </button>
      </div>
    </div>
  );
};
