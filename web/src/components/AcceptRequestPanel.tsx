/**
 * Accept Request Panel - DJ Side (Feature 10)
 * Expanded details panel when DJ taps a request to accept or skip
 * Phase 3: CSS Modularization - Using CSS Modules
 * Phase 8: Performance - Lazy loaded images
 */

import React from 'react';
import { X, CheckCircle, Music, Clock, Users, Heart, SkipForward } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import styles from './AcceptRequestPanel.module.css';

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

// Helper function to get tier gradient colors
const getTierGradient = (tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'): string => {
  const gradients = {
    BRONZE: 'rgb(180 83 9), rgb(146 64 14)', // amber-700 to amber-800
    SILVER: 'rgb(156 163 175), rgb(107 114 128)', // gray-400 to gray-500
    GOLD: 'rgb(250 204 21), rgb(234 179 8)', // yellow-400 to yellow-500
    PLATINUM: 'rgb(203 213 225), rgb(148 163 184)', // slate-300 to slate-400
  };
  return gradients[tier];
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
    <div className={styles.overlay}>
      <div className={styles.panel}>
        {/* Header */}
        <div 
          className={styles.header}
          style={{ background: 'linear-gradient(to right, rgb(147 51 234), rgb(236 72 153))' }}
        >
          <div className={styles.headerContent}>
            <h2 className={styles.headerTitle}>Ready to Accept?</h2>
            <p className={styles.headerSubtitle}>Review request details</p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className={styles.closeButton}
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Song Details */}
          <div className={styles.songSection}>
            {request.albumArt ? (
              <LazyLoadImage
                src={request.albumArt}
                alt={request.songTitle}
                className={styles.albumArt}
                effect="blur"
                width={200}
                height={200}
              />
            ) : (
              <div className={styles.albumArtPlaceholder}>
                <Music className="w-16 h-16 text-white" />
              </div>
            )}

            <div className={styles.songInfo}>
              <h3 className={styles.songTitle}>{request.songTitle}</h3>
              <p className={styles.artistName}>{request.artistName}</p>
              
              {request.albumName && (
                <p className={styles.albumName}>{request.albumName}</p>
              )}

              <div className={styles.metadata}>
                {request.genre && (
                  <span className={styles.genreBadge}>
                    {request.genre}
                  </span>
                )}
                {request.duration && (
                  <span className={styles.duration}>
                    <Clock className="w-4 h-4" />
                    {request.duration}
                  </span>
                )}
                {request.releaseYear && (
                  <span className={styles.year}>{request.releaseYear}</span>
                )}
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className={styles.userCard}>
            <p className={styles.userLabel}>Requested by:</p>
            
            <div className={styles.userInfo}>
              {request.userPhoto ? (
                <img
                  src={request.userPhoto}
                  alt={request.userName}
                  className={styles.userPhoto}
                />
              ) : (
                <div className={styles.userPhotoPlaceholder}>
                  {request.userName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className={styles.userDetails}>
                <div className={styles.userNameRow}>
                  <span className={styles.userName}>{request.userName}</span>
                  <span 
                    className={styles.tierBadge}
                    style={{ background: `linear-gradient(to right, ${getTierGradient(request.userTier)})` }}
                  >
                    {TIER_BADGES[request.userTier]} {request.userTier}
                  </span>
                </div>
                <p className={styles.requestCountText}>
                  {request.requestCount === 1 ? 'First request' : `${request.requestCount}${request.requestCount === 2 ? 'nd' : request.requestCount === 3 ? 'rd' : 'th'} request`} at this event
                </p>
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div className={styles.priceCard}>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Price Paid:</span>
              <span className={styles.priceAmount}>R{request.price.toFixed(2)}</span>
            </div>

            {request.paymentMethod && (
              <div className={styles.paymentRow}>
                <span className={styles.paymentLabel}>Payment method:</span>
                <span className={styles.paymentValue}>
                  {request.paymentMethod} {request.paymentLast4 && `****${request.paymentLast4}`}
                </span>
              </div>
            )}
          </div>

          {/* Request Type & Special Info */}
          {request.requestType === 'SPOTLIGHT' && (
            <div className={styles.spotlightCard}>
              <div className={styles.spotlightIcon}>
                <span>⭐</span>
              </div>
              <div>
                <p className={styles.spotlightTitle}>Priority Request</p>
                <p className={styles.spotlightDescription}>User paid for spotlight slot</p>
              </div>
            </div>
          )}

          {request.requestType === 'GROUP' && request.groupContributors && (
            <div className={styles.groupCard}>
              <div className={styles.groupIcon}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className={styles.groupContent}>
                <p className={styles.groupTitle}>Group Request</p>
                <p className={styles.groupDescription}>
                  {request.groupContributors} {request.groupContributors === 1 ? 'person' : 'people'} contributed
                  {request.groupContributions && ` • R${request.groupContributions.toFixed(2)} each`}
                </p>
              </div>
            </div>
          )}

          {/* Dedication */}
          {request.dedication && (
            <div className={styles.dedicationCard}>
              <div className={styles.dedicationHeader}>
                <Heart className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                <p className={styles.dedicationLabel}>Dedication:</p>
              </div>
              <p className={styles.dedicationText}>"{request.dedication}"</p>
            </div>
          )}

          {/* Metadata */}
          <div className={styles.metadataRow}>
            <span className={styles.metadataLabel}>Submitted:</span>
            <div className={styles.metadataValue}>
              <Clock className="w-4 h-4 text-gray-500" />
              <span className={styles.metadataTime}>{waitTimeStr}</span>
            </div>
          </div>

          {/* Action Hint */}
          <div className={styles.actionHint}>
            <p className={styles.hintAccept}>↑ Swipe up to accept</p>
            <p className={styles.hintVeto}>↓ Swipe down to veto</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.footer}>
          <div className={styles.actions}>
            <button
              onClick={onAccept}
              disabled={isProcessing}
              className={styles.acceptButton}
            >
              <CheckCircle className="w-6 h-6" />
              <span>Accept</span>
            </button>

            {onSkip && (
              <button
                onClick={onSkip}
                disabled={isProcessing}
                className={styles.skipButton}
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
