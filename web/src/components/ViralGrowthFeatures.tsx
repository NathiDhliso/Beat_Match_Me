import React, { useState, useEffect } from 'react';
import { Heart, Music, Users, Share2, Download, Camera, Trophy, Sparkles, TrendingUp } from 'lucide-react';

/**
 * VIRAL GROWTH FEATURES
 * Features designed to create shareable moments and drive organic user acquisition
 */

// Types
interface User {
  userId: string;
  name: string;
  profileImage?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
}

interface MatchedUser extends User {
  matchScore: number; // 0-100
  sharedGenres: string[];
  sharedSongs: Song[];
  mutualFriends?: number;
}

/**
 * DANCE FLOOR BONDS
 * Social matching algorithm that connects users with similar music taste
 */

interface DanceFloorBondsProps {
  currentUser: User;
  matches: MatchedUser[];
  onConnect: (userId: string) => void;
  onDismiss: () => void;
  className?: string;
}

export const DanceFloorBonds: React.FC<DanceFloorBondsProps> = ({
  currentUser,
  matches,
  onConnect,
  onDismiss,
  className = '',
}) => {
  const [selectedMatch, setSelectedMatch] = useState<MatchedUser | null>(null);

  const getMatchQuality = (score: number): { label: string; color: string; emoji: string } => {
    if (score >= 90) return { label: 'Perfect Match', color: 'from-pink-500 to-rose-500', emoji: '💖' };
    if (score >= 75) return { label: 'Great Match', color: 'from-purple-500 to-pink-500', emoji: '💜' };
    if (score >= 60) return { label: 'Good Match', color: 'from-blue-500 to-purple-500', emoji: '💙' };
    return { label: 'Potential Match', color: 'from-cyan-500 to-blue-500', emoji: '💚' };
  };

  return (
    <div className={`bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-6 border border-pink-500/50 ${className} animate-slide-up`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Dance Floor Bonds</h3>
            <p className="text-sm text-pink-200">You share musical chemistry!</p>
          </div>
        </div>
        <button onClick={onDismiss} className="text-white/70 hover:text-white">
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {matches.map((match) => {
          const quality = getMatchQuality(match.matchScore);
          return (
            <div
              key={match.userId}
              className="bg-black/20 rounded-xl p-4 hover:bg-black/30 transition-all cursor-pointer"
              onClick={() => setSelectedMatch(match)}
            >
              <div className="flex items-center gap-4">
                {/* Profile */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold overflow-hidden">
                    {match.profileImage ? (
                      <img src={match.profileImage} alt={match.name} className="w-full h-full object-cover" />
                    ) : (
                      match.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 text-2xl">{quality.emoji}</div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-semibold">{match.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${quality.color} text-white`}>
                      {quality.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">
                    {match.sharedGenres.slice(0, 3).join(', ')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {match.sharedSongs.length} songs in common
                    {match.mutualFriends && ` • ${match.mutualFriends} mutual friends`}
                  </p>
                </div>

                {/* Match Score */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{match.matchScore}%</div>
                  <div className="text-xs text-gray-400">Match</div>
                </div>
              </div>

              {/* Connect Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onConnect(match.userId);
                }}
                className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                Connect with {match.name.split(' ')[0]}
              </button>
            </div>
          );
        })}
      </div>

      {/* Post-Event Summary */}
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
        <p className="text-sm text-white text-center">
          <Sparkles className="w-4 h-4 inline mr-1" />
          {matches.length} people matched your vibe tonight - say hi!
        </p>
      </div>
    </div>
  );
};

/**
 * PLAYLIST AUTO-GENERATION
 * Export user's requests to Spotify/Apple Music
 */

interface PlaylistGeneratorProps {
  eventName: string;
  venueName: string;
  date: Date;
  songs: Song[];
  onExport: (platform: 'spotify' | 'apple' | 'share') => void;
  className?: string;
}

export const PlaylistGenerator: React.FC<PlaylistGeneratorProps> = ({
  eventName,
  venueName,
  date,
  songs,
  onExport,
  className = '',
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExport = async (platform: 'spotify' | 'apple' | 'share') => {
    setIsGenerating(true);
    await onExport(platform);
    setIsGenerating(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const playlistTitle = `${eventName} @ ${venueName}`;
  const playlistDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/50 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
          <Music className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Your Night in Music</h3>
          <p className="text-sm text-green-200">Export your soundtrack</p>
        </div>
      </div>

      {/* Playlist Preview */}
      <div className="bg-black/30 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-4 mb-3">
          {/* Album Art Placeholder */}
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <Music className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-white">{playlistTitle}</h4>
            <p className="text-sm text-gray-400">{playlistDate}</p>
            <p className="text-xs text-gray-500">{songs.length} songs</p>
          </div>
        </div>

        {/* Song List Preview */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {songs.slice(0, 5).map((song, index) => (
            <div key={song.id} className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-6">{index + 1}.</span>
              <div className="flex-1">
                <p className="text-white">{song.title}</p>
                <p className="text-gray-400 text-xs">{song.artist}</p>
              </div>
            </div>
          ))}
          {songs.length > 5 && (
            <p className="text-xs text-gray-500 text-center">+ {songs.length - 5} more songs</p>
          )}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleExport('spotify')}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1DB954] text-white font-semibold rounded-lg hover:bg-[#1ed760] transition-all disabled:opacity-50"
        >
          <Music className="w-5 h-5" />
          Spotify
        </button>
        <button
          onClick={() => handleExport('apple')}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-red-600 transition-all disabled:opacity-50"
        >
          <Music className="w-5 h-5" />
          Apple Music
        </button>
      </div>

      <button
        onClick={() => handleExport('share')}
        disabled={isGenerating}
        className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all disabled:opacity-50"
      >
        <Share2 className="w-5 h-5" />
        Share Playlist
      </button>

      {/* Success Message */}
      {showSuccess && (
        <div className="mt-3 p-3 bg-green-500/20 border border-green-500 rounded-lg animate-bounce-in">
          <p className="text-sm text-green-300 text-center">
            ✓ Playlist created! Check your library.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * HALL OF FAME LEADERBOARD
 * Public display of top requesters
 */

interface LeaderboardEntry {
  rank: number;
  user: User;
  stats: {
    totalRequests: number;
    successfulRequests: number;
    totalSpent: number;
    favoriteGenre: string;
  };
  badges: string[];
}

interface HallOfFameProps {
  leaderboard: LeaderboardEntry[];
  currentUserId?: string;
  timeframe: 'today' | 'week' | 'month' | 'alltime';
  onTimeframeChange: (timeframe: 'today' | 'week' | 'month' | 'alltime') => void;
  className?: string;
}

export const HallOfFame: React.FC<HallOfFameProps> = ({
  leaderboard,
  currentUserId,
  timeframe,
  onTimeframeChange,
  className = '',
}) => {
  const getRankColor = (rank: number): string => {
    if (rank === 1) return 'from-gold-400 to-gold-600';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-600 to-orange-700';
    return 'from-blue-500 to-purple-500';
  };

  const getRankEmoji = (rank: number): string => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '⭐';
  };

  return (
    <div className={`bg-gradient-to-br from-gold-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-6 border border-gold-500/50 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Hall of Fame</h3>
            <p className="text-sm text-gold-200">Top Curators</p>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {(['today', 'week', 'month', 'alltime'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-gold-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {tf === 'alltime' ? 'All Time' : tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {leaderboard.map((entry) => {
          const isCurrentUser = entry.user.userId === currentUserId;
          const rankColor = getRankColor(entry.rank);

          return (
            <div
              key={entry.user.userId}
              className={`relative bg-black/30 rounded-xl p-4 ${
                isCurrentUser ? 'ring-2 ring-gold-500 shadow-glow-gold' : ''
              } hover:bg-black/40 transition-all`}
            >
              {/* Rank Badge */}
              <div className={`absolute -top-2 -left-2 w-10 h-10 bg-gradient-to-br ${rankColor} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                {entry.rank <= 3 ? getRankEmoji(entry.rank) : entry.rank}
              </div>

              <div className="flex items-center gap-4 ml-6">
                {/* Profile */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold overflow-hidden">
                  {entry.user.profileImage ? (
                    <img src={entry.user.profileImage} alt={entry.user.name} className="w-full h-full object-cover" />
                  ) : (
                    entry.user.name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-bold">{entry.user.name}</h4>
                    {isCurrentUser && (
                      <span className="text-xs px-2 py-0.5 bg-gold-500 text-white rounded-full">You</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-300">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      {entry.stats.successfulRequests} played
                    </span>
                    <span className="text-gray-400">
                      {entry.stats.favoriteGenre}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-gold-400">
                    R{entry.stats.totalSpent}
                  </div>
                  <div className="text-xs text-gray-400">Total Spent</div>
                </div>
              </div>

              {/* Badges */}
              {entry.badges.length > 0 && (
                <div className="flex gap-1 mt-3 ml-6">
                  {entry.badges.map((badge, idx) => (
                    <span key={idx} className="text-lg" title={badge}>
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Message */}
      <div className="mt-4 p-3 bg-gradient-to-r from-gold-500/20 to-orange-500/20 rounded-lg border border-gold-500/30">
        <p className="text-sm text-white text-center">
          <Trophy className="w-4 h-4 inline mr-1" />
          Keep requesting to climb the ranks!
        </p>
      </div>
    </div>
  );
};

/**
 * GROUP PHOTO TRIGGER
 * Camera prompt when group request plays
 */

interface GroupPhotoTriggerProps {
  songTitle: string;
  contributors: User[];
  onCapture: (photo: Blob) => void;
  onDismiss: () => void;
  className?: string;
}

export const GroupPhotoTrigger: React.FC<GroupPhotoTriggerProps> = ({
  songTitle,
  contributors,
  onCapture,
  onDismiss,
  className = '',
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleCaptureClick = () => {
    setIsCameraActive(true);
    // In production: Open camera interface
    // For now: Simulate capture
    setTimeout(() => {
      const mockBlob = new Blob(['mock photo'], { type: 'image/jpeg' });
      onCapture(mockBlob);
      setIsCameraActive(false);
    }, 1000);
  };

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in ${className}`}>
      <div className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 border border-purple-500/50 animate-bounce-in">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Capture This Moment!</h3>
          <p className="text-purple-200">Your group request is playing</p>
        </div>

        {/* Song Info */}
        <div className="bg-black/30 rounded-xl p-4 mb-6">
          <p className="text-lg font-bold text-white text-center mb-2">🎵 {songTitle}</p>
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-purple-300" />
            <p className="text-sm text-purple-300">
              {contributors.length} contributors
            </p>
          </div>
        </div>

        {/* Contributors */}
        <div className="flex justify-center gap-2 mb-6">
          {contributors.slice(0, 5).map((user) => (
            <div
              key={user.userId}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden"
              title={user.name}
            >
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
          ))}
          {contributors.length > 5 && (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">
              +{contributors.length - 5}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleCaptureClick}
            disabled={isCameraActive}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
          >
            {isCameraActive ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Opening Camera...
              </>
            ) : (
              <>
                <Camera className="w-6 h-6" />
                Take Group Photo
              </>
            )}
          </button>
          <button
            onClick={onDismiss}
            className="w-full px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
