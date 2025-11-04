/**
 * Accept Request Panel - DJ Side (Feature 10)
 * Expanded details panel when DJ taps a request to accept or skip
 */

import React from 'react';
import { X, CheckCircle, Music, Clock, Users, Heart, SkipForward } from 'lucide-react';

export interface RequestDetails {
  requestId: string;
  songTitle: string;
  artistName: string;
  albumName?: string;
  albumArt?: string;
  genre?: string;
  duration?: string;
  releaseYear?: string;
  userName: string;
  userTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  userPhoto?: string;
  requestCount: number;
  requestType: 'STANDARD' | 'SPOTLIGHT' | 'GROUP';
  price: number;
  paymentMethod?: string;
  paymentLast4?: string;
  submittedAt: number;
  dedication?: string;
  groupContributors?: number;
  groupContributions?: number;
}

interface AcceptRequestPanelProps {
  request: RequestDetails;
  onAccept: () => void;
  onSkip?: () => void;
  onClose: () => void;
  isProcessing?: boolean;
}

const TIER_COLORS = {
  BRONZE: 'from-amber-700 to-amber-800',
  SILVER: 'from-gray-400 to-gray-500',
  GOLD: 'from-yellow-400 to-yellow-500',
  PLATINUM: 'from-slate-300 to-slate-400',
};

const TIER_BADGES = {
  BRONZE: '🥉',
  SILVER: '🥈',
  GOLD: '🥇',
  PLATINUM: '💎',
};

export const AcceptRequestPanel: React.FC<AcceptRequestPanelProps> = ({
  request,
  onAccept,
  onSkip,
  onClose,
  isProcessing = false,
}) => {
  const waitTime = Math.floor((Date.now() - request.submittedAt) / 60000);
  const waitTimeStr = waitTime < 1 ? 'Just now' : `${waitTime} min${waitTime > 1 ? 's' : ''} ago`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center z-50 animate-slide-up">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl border-t sm:border border-purple-500/30 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Ready to Accept?</h2>
            <p className="text-purple-100 text-sm">Review request details</p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Song Details */}
          <div className="flex items-start gap-4">
            {request.albumArt ? (
              <img
                src={request.albumArt}
                alt={request.songTitle}
                className="w-32 h-32 rounded-2xl object-cover shadow-2xl flex-shrink-0"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl flex-shrink-0">
                <Music className="w-16 h-16 text-white" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-white mb-1">{request.songTitle}</h3>
              <p className="text-xl text-gray-300 mb-2">{request.artistName}</p>
              
              {request.albumName && (
                <p className="text-sm text-gray-400 mb-2">{request.albumName}</p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {request.genre && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full">
                    {request.genre}
                  </span>
                )}
                {request.duration && (
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    {request.duration}
                  </span>
                )}
                {request.releaseYear && (
                  <span className="text-gray-500 text-sm">{request.releaseYear}</span>
                )}
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-gray-800/50 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-3">Requested by:</p>
            
            <div className="flex items-center gap-3">
              {request.userPhoto ? (
                <img
                  src={request.userPhoto}
                  alt={request.userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                  {request.userName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-lg">{request.userName}</span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${TIER_COLORS[request.userTier]} text-white`}>
                    {TIER_BADGES[request.userTier]} {request.userTier}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  {request.requestCount === 1 ? 'First request' : `${request.requestCount}${request.requestCount === 2 ? 'nd' : request.requestCount === 3 ? 'rd' : 'th'} request`} at this event
                </p>
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-400 font-bold text-lg">Price Paid:</span>
              <span className="text-3xl font-bold text-yellow-400">R{request.price.toFixed(2)}</span>
            </div>

            {request.paymentMethod && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Payment method:</span>
                <span className="text-white">
                  {request.paymentMethod} {request.paymentLast4 && `****${request.paymentLast4}`}
                </span>
              </div>
            )}
          </div>

          {/* Request Type & Special Info */}
          {request.requestType === 'SPOTLIGHT' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <p className="text-yellow-400 font-bold">Priority Request</p>
                <p className="text-sm text-gray-400">User paid for spotlight slot</p>
              </div>
            </div>
          )}

          {request.requestType === 'GROUP' && request.groupContributors && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-blue-400 font-bold">Group Request</p>
                <p className="text-sm text-gray-400">
                  {request.groupContributors} {request.groupContributors === 1 ? 'person' : 'people'} contributed
                  {request.groupContributions && ` • R${request.groupContributions.toFixed(2)} each`}
                </p>
              </div>
            </div>
          )}

          {/* Dedication */}
          {request.dedication && (
            <div className="bg-pink-500/10 border border-pink-500/30 rounded-2xl p-4">
              <div className="flex items-start gap-2 mb-2">
                <Heart className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                <p className="text-pink-400 font-bold">Dedication:</p>
              </div>
              <p className="text-white italic pl-7">"{request.dedication}"</p>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-800/30 rounded-xl p-3 flex items-center justify-between text-sm">
            <span className="text-gray-400">Submitted:</span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-white font-medium">{waitTimeStr}</span>
            </div>
          </div>

          {/* Action Hint */}
          <div className="text-center space-y-2">
            <p className="text-green-400 text-sm font-medium">↑ Swipe up to accept</p>
            <p className="text-red-400 text-sm font-medium">↓ Swipe down to veto</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-gray-900/90 backdrop-blur-lg border-t border-gray-700 p-4">
          <div className="flex gap-3">
            <button
              onClick={onAccept}
              disabled={isProcessing}
              className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-6 h-6" />
              <span>Accept</span>
            </button>

            {onSkip && (
              <button
                onClick={onSkip}
                disabled={isProcessing}
                className="px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <SkipForward className="w-5 h-5" />
                <span>Skip</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
