import React, { useState } from 'react';
import { HapticFeedback } from '../utils/haptics';

/**
 * Phase 6: Social Features
 * Friend system, upvoting, social sharing
 */

// Types
export interface Friend {
  userId: string;
  name: string;
  profileImage?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  status: 'online' | 'offline' | 'at_event';
  currentEvent?: {
    eventId: string;
    venueName: string;
  };
  mutualFriends?: number;
}

export interface SocialShare {
  platform: 'whatsapp' | 'twitter' | 'facebook' | 'instagram' | 'copy';
  url: string;
  text: string;
}

/**
 * Upvote Button Component
 */
interface UpvoteButtonProps {
  requestId: string;
  initialUpvotes: number;
  hasUpvoted?: boolean;
  onUpvote: (requestId: string) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UpvoteButton: React.FC<UpvoteButtonProps> = ({
  requestId,
  initialUpvotes,
  hasUpvoted = false,
  onUpvote,
  size = 'md',
  className = '',
}) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [isUpvoted, setIsUpvoted] = useState(hasUpvoted);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3',
  };

  const handleUpvote = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    HapticFeedback.buttonPress();

    try {
      await onUpvote(requestId);
      setIsUpvoted(!isUpvoted);
      setUpvotes(prev => isUpvoted ? prev - 1 : prev + 1);
      
      if (!isUpvoted) {
        HapticFeedback.requestAccepted();
      }
    } catch (error) {
      console.error('Upvote failed:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={isAnimating}
      className={`
        flex items-center gap-2 rounded-full
        ${isUpvoted ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
        ${sizeClasses[size]}
        transition-all duration-300
        ${isAnimating ? 'scale-110' : 'scale-100'}
        disabled:opacity-50
        ${className}
      `}
    >
      <span className={`${isAnimating ? 'animate-bounce' : ''}`}>
        {isUpvoted ? '❤️' : '🤍'}
      </span>
      <span className="font-semibold">{upvotes}</span>
    </button>
  );
};

/**
 * Friend List Component
 */
interface FriendListProps {
  friends: Friend[];
  onAddFriend?: (userId: string) => void;
  onRemoveFriend?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  className?: string;
}

export const FriendList: React.FC<FriendListProps> = ({
  friends,
  onAddFriend,
  onRemoveFriend,
  onViewProfile,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'at_event': return 'bg-blue-500';
      case 'offline': return 'bg-gray-500';
    }
  };

  const getStatusText = (friend: Friend) => {
    if (friend.status === 'at_event' && friend.currentEvent) {
      return `At ${friend.currentEvent.venueName}`;
    }
    return friend.status === 'online' ? 'Online' : 'Offline';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-12 bg-gray-800 text-white rounded-xl border border-gray-700 focus:border-primary-500 focus:outline-none"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
      </div>

      {/* Friends List */}
      <div className="space-y-2">
        {filteredFriends.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchQuery ? 'No friends found' : 'No friends yet'}
          </div>
        ) : (
          filteredFriends.map(friend => (
            <div
              key={friend.userId}
              className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors"
            >
              {/* Profile Image */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold overflow-hidden">
                  {friend.profileImage ? (
                    <img src={friend.profileImage} alt={friend.name} className="w-full h-full object-cover" />
                  ) : (
                    friend.name.charAt(0).toUpperCase()
                  )}
                </div>
                {/* Status Indicator */}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(friend.status)}`} />
              </div>

              {/* Friend Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold truncate">{friend.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    friend.tier === 'platinum' ? 'bg-gray-300 text-gray-900' :
                    friend.tier === 'gold' ? 'bg-gold-500 text-white' :
                    friend.tier === 'silver' ? 'bg-gray-400 text-gray-900' :
                    'bg-orange-700 text-white'
                  }`}>
                    {friend.tier}
                  </span>
                </div>
                <p className="text-sm text-gray-400 truncate">
                  {getStatusText(friend)}
                </p>
                {friend.mutualFriends && friend.mutualFriends > 0 && (
                  <p className="text-xs text-gray-500">
                    {friend.mutualFriends} mutual friends
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {onViewProfile && (
                  <button
                    onClick={() => onViewProfile(friend.userId)}
                    className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-lg transition-colors"
                  >
                    View
                  </button>
                )}
                {friend.status === 'at_event' && friend.currentEvent && (
                  <button
                    className="px-3 py-1.5 bg-secondary-500 hover:bg-secondary-600 text-white text-sm rounded-lg transition-colors"
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Social Share Component
 */
interface SocialShareProps {
  title: string;
  text: string;
  url: string;
  onShare?: (platform: SocialShare['platform']) => void;
  className?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  title,
  text,
  url,
  onShare,
  className = '',
}) => {
  const [showCopied, setShowCopied] = useState(false);

  const shareOptions: Array<{
    platform: SocialShare['platform'];
    label: string;
    icon: string;
    color: string;
    getUrl: () => string;
  }> = [
    {
      platform: 'whatsapp',
      label: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      getUrl: () => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    },
    {
      platform: 'twitter',
      label: 'Twitter',
      icon: '🐦',
      color: 'bg-blue-400 hover:bg-blue-500',
      getUrl: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      platform: 'facebook',
      label: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600 hover:bg-blue-700',
      getUrl: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      platform: 'instagram',
      label: 'Instagram',
      icon: '📷',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      getUrl: () => '', // Instagram doesn't support direct sharing
    },
    {
      platform: 'copy',
      label: 'Copy Link',
      icon: '🔗',
      color: 'bg-gray-600 hover:bg-gray-700',
      getUrl: () => url,
    },
  ];

  const handleShare = async (option: typeof shareOptions[0]) => {
    HapticFeedback.buttonPress();

    if (option.platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setShowCopied(true);
        HapticFeedback.requestAccepted();
        setTimeout(() => setShowCopied(false), 2000);
      } catch (error) {
        console.error('Copy failed:', error);
      }
    } else if (option.platform === 'instagram') {
      // Instagram requires native sharing
      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
        } catch (error) {
          console.error('Share failed:', error);
        }
      }
    } else {
      window.open(option.getUrl(), '_blank', 'width=600,height=400');
    }

    onShare?.(option.platform);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-white font-semibold">Share</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {shareOptions.map(option => (
          <button
            key={option.platform}
            onClick={() => handleShare(option)}
            className={`
              flex items-center justify-center gap-2 px-4 py-3 rounded-xl
              ${option.color}
              text-white font-medium
              transition-all duration-200
              hover:scale-105
            `}
          >
            <span className="text-xl">{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {showCopied && (
        <div className="text-center py-2 bg-green-500 text-white rounded-lg animate-bounce-in">
          ✓ Link copied to clipboard!
        </div>
      )}
    </div>
  );
};

/**
 * Friend Request Component
 */
interface FriendRequestProps {
  userId: string;
  name: string;
  profileImage?: string;
  mutualFriends: number;
  onAccept: (userId: string) => void;
  onDecline: (userId: string) => void;
  className?: string;
}

export const FriendRequest: React.FC<FriendRequestProps> = ({
  userId,
  name,
  profileImage,
  mutualFriends,
  onAccept,
  onDecline,
  className = '',
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    HapticFeedback.buttonPress();
    await onAccept(userId);
    HapticFeedback.requestAccepted();
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    HapticFeedback.buttonPress();
    await onDecline(userId);
  };

  return (
    <div className={`flex items-center gap-3 p-4 bg-gray-800 rounded-xl ${className}`}>
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold overflow-hidden">
        {profileImage ? (
          <img src={profileImage} alt={name} className="w-full h-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-white font-semibold">{name}</h3>
        <p className="text-sm text-gray-400">
          {mutualFriends} mutual {mutualFriends === 1 ? 'friend' : 'friends'}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          disabled={isProcessing}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          Accept
        </button>
        <button
          onClick={handleDecline}
          disabled={isProcessing}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

/**
 * Activity Feed Component
 */
export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  type: 'request' | 'upvote' | 'achievement' | 'friend';
  action: string;
  timestamp: number;
  metadata?: {
    songTitle?: string;
    venueName?: string;
    achievementName?: string;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  onLoadMore,
  hasMore = false,
  className = '',
}) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'request': return '🎵';
      case 'upvote': return '❤️';
      case 'achievement': return '🏆';
      case 'friend': return '👥';
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-white font-semibold">Friend Activity</h3>

      <div className="space-y-2">
        {activities.map(activity => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
              {activity.userImage ? (
                <img src={activity.userImage} alt={activity.userName} className="w-full h-full object-cover" />
              ) : (
                activity.userName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white text-sm">
                <span className="font-semibold">{activity.userName}</span>
                {' '}
                <span className="text-gray-400">{activity.action}</span>
              </p>
              {activity.metadata?.songTitle && (
                <p className="text-sm text-primary-400 truncate">
                  {activity.metadata.songTitle}
                </p>
              )}
              {activity.metadata?.venueName && (
                <p className="text-xs text-gray-500">
                  at {activity.metadata.venueName}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {getTimeAgo(activity.timestamp)}
              </p>
            </div>

            <span className="text-2xl flex-shrink-0">
              {getActivityIcon(activity.type)}
            </span>
          </div>
        ))}
      </div>

      {hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
        >
          Load More
        </button>
      )}
    </div>
  );
};
