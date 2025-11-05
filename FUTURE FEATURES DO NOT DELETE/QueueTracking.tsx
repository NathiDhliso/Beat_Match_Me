/**
 * Queue Tracking Component
 * Feature 4: Track Request in Queue
 * Energy Beam visualization with real-time updates
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Share2, List, Info, Wifi, WifiOff } from 'lucide-react';
import { useQueueSubscription } from '../hooks/useQueueSubscription';

interface QueueTrackingProps {
  requestId: string;
  eventId: string;
  songTitle: string;
  artist: string;
  onBack: () => void;
}

interface OtherRequest {
  position: number;
  type: 'standard' | 'spotlight';
}

export const QueueTracking: React.FC<QueueTrackingProps> = ({
  requestId,
  eventId,
  songTitle,
  artist,
  onBack,
}) => {
  const { queueData, connectionStatus, refresh } = useQueueSubscription(requestId, eventId);
  
  const [showFullQueue, setShowFullQueue] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Mock other requests for visualization
  const [otherRequests, setOtherRequests] = useState<OtherRequest[]>([]);
  
  const queuePosition = queueData?.queuePosition || 8;
  const totalInQueue = 12;
  const songsAhead = queuePosition - 1;
  const estimatedWaitTime = queueData?.estimatedWaitTime || '~25 minutes';
  const queueStatus = queueData?.status || 'ACCEPTED';

  // Generate other requests for visualization
  useEffect(() => {
    const requests: OtherRequest[] = [];
    for (let i = 1; i <= totalInQueue; i++) {
      if (i !== queuePosition) {
        requests.push({
          position: i,
          type: Math.random() > 0.8 ? 'spotlight' : 'standard',
        });
      }
    }
    setOtherRequests(requests);
  }, [queuePosition, totalInQueue]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'My Song Request',
        text: `I just requested "${songTitle}" by ${artist}! Currently at position #${queuePosition} in queue. 🎵`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(
        `I just requested "${songTitle}" by ${artist}! Currently at position #${queuePosition} in queue. 🎵`
      );
    }
  };

  const getPositionMessage = () => {
    if (queuePosition === 1) return "YOU'RE NEXT!";
    if (queuePosition === 2) return "Coming Up Next!";
    if (queuePosition <= 3) return "Coming Soon!";
    return "In Queue";
  };

  const getStatusColor = () => {
    switch (queueStatus) {
      case 'ACCEPTED': return 'bg-green-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'PLAYING': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const beaconPosition = ((totalInQueue - queuePosition + 1) / totalInQueue) * 80;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </button>

          <div className="flex items-center gap-2">
            {connectionStatus.isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-semibold">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-semibold">Reconnecting...</span>
              </>
            )}
          </div>

          <button
            onClick={() => setShowInfo(true)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="fixed top-20 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <div
          className={`text-4xl md:text-5xl font-bold ${
            queuePosition <= 2 ? 'text-green-400 animate-heartbeat' : 'text-yellow-400'
          } drop-shadow-lg`}
        >
          {getPositionMessage()}
        </div>
      </div>

      {/* Energy Beam Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Beam Background */}
        <div className="relative w-2 h-full">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-pink-500/20 to-transparent" />
          
          {/* Particle Effects */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full animate-float"
                style={{
                  left: '50%',
                  bottom: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Other Requests (Dots) */}
          {otherRequests.map((req, i) => (
            <div
              key={i}
              className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full transition-all duration-1000 ${
                req.type === 'spotlight' ? 'bg-yellow-400' : 'bg-purple-500'
              } opacity-60`}
              style={{
                bottom: `${((totalInQueue - req.position + 1) / totalInQueue) * 80}%`,
              }}
            />
          ))}

          {/* User's Beacon */}
          <div
            className="absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-out"
            style={{ bottom: `${beaconPosition}%` }}
          >
            <div className="relative">
              {/* Glow Effect */}
              <div
                className={`absolute inset-0 -m-6 rounded-full blur-xl ${
                  queuePosition <= 2 ? 'bg-green-500' : 'bg-yellow-400'
                } opacity-50 animate-pulse-glow`}
              />
              
              {/* Beacon */}
              <div
                className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${
                  queuePosition <= 2
                    ? 'from-green-400 to-green-600'
                    : 'from-yellow-400 to-orange-500'
                } flex items-center justify-center shadow-2xl border-4 border-white/20`}
              >
                <span className="text-white font-bold text-2xl">#{queuePosition}</span>
              </div>

              {/* Trail Effect */}
              <div className="absolute left-1/2 top-full -translate-x-1/2 w-1 h-20 bg-gradient-to-b from-yellow-400/50 to-transparent" />
            </div>

            {/* Song Info Card */}
            <div className="absolute left-24 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-lg rounded-xl p-4 border border-white/10 min-w-[200px]">
              <p className="text-white font-bold mb-1">{songTitle}</p>
              <p className="text-gray-400 text-sm mb-2">{artist}</p>
              <p className="text-gray-500 text-xs">Requested just now</p>
            </div>
          </div>

          {/* Coming Soon Indicator */}
          {queuePosition <= 3 && (
            <div
              className="absolute left-20 bg-green-500/20 backdrop-blur-lg rounded-2xl px-6 py-3 border-2 border-green-500 animate-heartbeat"
              style={{ top: '10%' }}
            >
              <p className="text-green-400 font-bold text-lg">Coming Soon!</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
          {/* Progress Stats */}
          <div className="flex items-center justify-around bg-gray-800/50 rounded-xl p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{songsAhead}</p>
              <p className="text-sm text-gray-400">Songs Ahead</p>
            </div>
            <div className="h-12 w-px bg-gray-700" />
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{estimatedWaitTime}</p>
              <p className="text-sm text-gray-400">Est. Wait</p>
            </div>
          </div>

          {/* Queue Status */}
          <div className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Queue Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                <span className="text-white font-semibold">{queueStatus}</span>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowFullQueue(true)}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
            >
              <List className="w-5 h-5" />
              <span>View Queue</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Queue Modal */}
      {showFullQueue && (
        <div className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Full Queue</h3>
              <button
                onClick={() => setShowFullQueue(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3">
              {[...Array(totalInQueue)].map((_, i) => {
                const position = i + 1;
                const isUserRequest = position === queuePosition;
                const isSpotlight = Math.random() > 0.8;
                
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-xl flex items-center gap-4 ${
                      isUserRequest
                        ? 'bg-purple-900/50 border-2 border-purple-500'
                        : 'bg-gray-800'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                      <span className="text-purple-400 font-bold">#{position}</span>
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        {isUserRequest ? songTitle : 'Song Title'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {isUserRequest ? artist : 'Artist Name'}
                      </p>
                    </div>
                    
                    {isSpotlight && <span className="text-2xl">⭐</span>}
                    {isUserRequest && (
                      <div className="bg-purple-600 px-3 py-1 rounded-full">
                        <span className="text-white text-sm font-bold">YOU</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => setShowFullQueue(false)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Queue Help</h3>
            
            <div className="space-y-4 text-gray-300">
              <p>• Your position updates automatically as songs are played</p>
              <p>• Estimated wait time is calculated based on average song length</p>
              <p>• You'll get notified when you're next in queue</p>
              <p>• Pull down to refresh queue status</p>
              <p>• Continue browsing while keeping your place in queue</p>
            </div>
            
            <button
              onClick={() => setShowInfo(false)}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
