import React, { useState, useEffect } from 'react';
import { X, Music, User, Heart, DollarSign, Check, Ban } from 'lucide-react';
import { RequestBadge } from '../ui/RequestBadge';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import type { Request } from '../core/CircularQueueVisualizer/types';

export interface RequestDetailsModalProps {
  request: Request | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (id: string) => void;
  onVeto: (id: string) => void;
}

/**
 * Full-screen modal displaying detailed request information
 * Shows large album art, song details, requester info, and action buttons
 */
export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  isOpen,
  onClose,
  onAccept,
  onVeto,
}) => {
  const [imageError, setImageError] = useState(false);
  const haptic = useHapticFeedback();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen || !request) return null;

  const handleClose = () => {
    haptic.light();
    onClose();
  };

  const handleAccept = () => {
    haptic.success();
    onAccept(request.id);
    onClose();
  };

  const handleVeto = () => {
    haptic.error();
    onVeto(request.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Album Art Section */}
        <div className="relative w-full aspect-square bg-gradient-to-br from-purple-900/20 to-blue-900/20">
          {request.albumArt && !imageError ? (
            <img
              src={request.albumArt}
              alt={`${request.songTitle} album art`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-32 h-32 text-white/30" />
            </div>
          )}
          
          {/* Position Badge */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-full">
            <span className="text-white font-bold text-lg">#{request.position}</span>
          </div>

          {/* Request Type Badge */}
          <div className="absolute top-4 left-20">
            <RequestBadge type={request.type} price={request.price} />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* Song Info */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{request.songTitle}</h2>
            <p className="text-lg text-gray-400">{request.artistName}</p>
          </div>

          {/* Requester Info */}
          {request.userName && (
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
              {request.userAvatar ? (
                <img
                  src={request.userAvatar}
                  alt={request.userName}
                  className="w-12 h-12 rounded-full border-2 border-purple-500"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-400" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-white font-semibold">{request.userName}</p>
                {request.userTier && (
                  <p className="text-sm text-gray-400">{request.userTier} Member</p>
                )}
              </div>
              {request.price && (
                <div className="flex items-center gap-1 text-green-400 font-bold">
                  <DollarSign className="w-5 h-5" />
                  <span>R{request.price.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Dedication Message */}
          {request.dedication && (
            <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-pink-400" />
                <p className="text-pink-400 font-semibold">Dedication</p>
              </div>
              <p className="text-white italic">"{request.dedication}"</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-white transition-colors shadow-lg shadow-green-500/30"
            >
              <Check className="w-6 h-6" />
              Accept Request
            </button>
            <button
              onClick={handleVeto}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white transition-colors shadow-lg shadow-red-500/30"
            >
              <Ban className="w-6 h-6" />
              Veto Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
