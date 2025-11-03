import React from 'react';
import { Music, Heart, Crown, Zap, Check, X } from 'lucide-react';

interface QueueRequest {
  id: string;
  songTitle: string;
  artistName: string;
  userName: string;
  userTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  requestType: 'standard' | 'spotlight' | 'dedication';
  queuePosition: number;
  upvotes: number;
  dedication?: string;
  isOwn?: boolean;
}

interface PerformerQueueViewProps {
  currentlyPlaying?: QueueRequest;
  upNext: QueueRequest[];
  queue: QueueRequest[];
  onAccept: (requestId: string) => void;
  onVeto: (requestId: string) => void;
  onReorder?: (requestIds: string[]) => void;
}

export const PerformerQueueView: React.FC<PerformerQueueViewProps> = ({
  currentlyPlaying,
  upNext,
  queue,
  onAccept,
  onVeto,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Queue Management</h1>

        {/* Currently Playing */}
        {currentlyPlaying && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Music className="w-6 h-6 text-purple-400" />
              Now Playing
            </h2>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {currentlyPlaying.songTitle}
                  </h3>
                  <p className="text-xl text-purple-100">{currentlyPlaying.artistName}</p>
                  <p className="text-sm text-purple-200 mt-2">
                    Requested by {currentlyPlaying.userName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl">🎵</div>
                  <div className="mt-2 flex items-center gap-1 text-white">
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="font-bold">{currentlyPlaying.upvotes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Up Next (Next 3) */}
        {upNext.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Coming Up Next
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upNext.map((request, index) => (
                <div
                  key={request.id}
                  className="bg-gray-800 rounded-xl p-4 border-2 border-yellow-500/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-yellow-400">#{index + 1}</span>
                    {request.requestType === 'spotlight' && (
                      <Crown className="w-6 h-6 text-yellow-400" />
                    )}
                  </div>
                  <h3 className="font-bold text-white mb-1">{request.songTitle}</h3>
                  <p className="text-sm text-gray-400 mb-2">{request.artistName}</p>
                  <p className="text-xs text-gray-500">{request.userName}</p>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => onAccept(request.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => onVeto(request.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Veto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Queue */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Queue ({queue.length} requests)
          </h2>
          <div className="space-y-3">
            {queue.map((request) => (
              <div key={request.id} className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-gray-400">
                        #{request.queuePosition}
                      </span>
                      <div>
                        <h3 className="font-bold text-white">{request.songTitle}</h3>
                        <p className="text-sm text-gray-400">{request.artistName}</p>
                      </div>
                      {request.requestType === 'spotlight' && (
                        <Crown className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">{request.userName}</span>
                      <span className="flex items-center gap-1 text-pink-400">
                        <Heart className="w-4 h-4" />
                        {request.upvotes}
                      </span>
                    </div>
                    {request.dedication && (
                      <p className="text-sm text-gray-400 italic mt-2">"{request.dedication}"</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => onAccept(request.id)}
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-all"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onVeto(request.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface AudienceQueueViewProps {
  queue: QueueRequest[];
  currentlyPlaying?: QueueRequest;
  onUpvote: (requestId: string) => void;
}

export const AudienceQueueView: React.FC<AudienceQueueViewProps> = ({
  queue,
  currentlyPlaying,
  onUpvote,
}) => {
  const ownRequests = queue.filter(r => r.isOwn);
  const otherRequests = queue.filter(r => !r.isOwn);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Queue</h1>

        {/* Currently Playing */}
        {currentlyPlaying && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl">
              <p className="text-sm text-purple-200 mb-2">NOW PLAYING</p>
              <h2 className="text-2xl font-bold text-white mb-1">
                {currentlyPlaying.songTitle}
              </h2>
              <p className="text-purple-100">{currentlyPlaying.artistName}</p>
            </div>
          </div>
        )}

        {/* Own Requests */}
        {ownRequests.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Your Requests</h2>
            <div className="space-y-3">
              {ownRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-500 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-blue-400">
                        #{request.queuePosition}
                      </span>
                      <div>
                        <h3 className="font-bold text-white">{request.songTitle}</h3>
                        <p className="text-sm text-gray-300">{request.artistName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-pink-400">
                        <Heart className="w-5 h-5 fill-current" />
                        <span className="font-bold">{request.upvotes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Requests */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            All Requests ({otherRequests.length})
          </h2>
          <div className="space-y-3">
            {otherRequests.map((request) => (
              <div
                key={request.id}
                className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg font-bold text-gray-400">
                      #{request.queuePosition}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{request.songTitle}</h3>
                      <p className="text-sm text-gray-400">{request.artistName}</p>
                      <p className="text-xs text-gray-500 mt-1">{request.userName}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onUpvote(request.id)}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-pink-500 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="font-bold">{request.upvotes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
