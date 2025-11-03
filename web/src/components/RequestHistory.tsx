import React, { useState } from 'react';
import { HapticFeedback } from '../utils/haptics';

/**
 * Phase 9: Advanced Request Features
 * Request history, backup lists, favorites
 */

export interface HistoricalRequest {
  requestId: string;
  songTitle: string;
  artistName: string;
  genre?: string;
  status: 'pending' | 'approved' | 'playing' | 'completed' | 'vetoed';
  requestType: 'standard' | 'spotlight' | 'group';
  price: number;
  eventId: string;
  venueName: string;
  submittedAt: number;
  playedAt?: number;
  vetoedAt?: number;
  dedication?: string;
  upvotes: number;
}

/**
 * Request History Component
 */
interface RequestHistoryProps {
  requests: HistoricalRequest[];
  onRequestAgain?: (request: HistoricalRequest) => void;
  onSaveToBackup?: (request: HistoricalRequest) => void;
  onExport?: () => void;
  className?: string;
}

export const RequestHistory: React.FC<RequestHistoryProps> = ({
  requests,
  onRequestAgain,
  onSaveToBackup,
  onExport,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'vetoed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'venue' | 'status'>('date');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = requests
    .filter(req => {
      if (filter === 'completed') return req.status === 'completed';
      if (filter === 'vetoed') return req.status === 'vetoed';
      return true;
    })
    .filter(req =>
      req.songTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.venueName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') return b.submittedAt - a.submittedAt;
      if (sortBy === 'venue') return a.venueName.localeCompare(b.venueName);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  const stats = {
    total: requests.length,
    completed: requests.filter(r => r.status === 'completed').length,
    vetoed: requests.filter(r => r.status === 'vetoed').length,
    totalSpent: requests.reduce((sum, r) => sum + r.price, 0),
  };

  const getStatusColor = (status: HistoricalRequest['status']) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'vetoed': return 'text-red-500';
      case 'playing': return 'text-blue-500';
      case 'approved': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: HistoricalRequest['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'vetoed': return '❌';
      case 'playing': return '🎶';
      case 'approved': return '⏳';
      default: return '📝';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Requests</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Played</p>
          <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Vetoed</p>
          <p className="text-2xl font-bold text-red-500">{stats.vetoed}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Spent</p>
          <p className="text-2xl font-bold text-gold-500">R{stats.totalSpent}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-xl p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search songs, artists, or venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-gray-700 text-white rounded-xl border border-gray-600 focus:border-primary-500 focus:outline-none"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              All ({requests.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              Played ({stats.completed})
            </button>
            <button
              onClick={() => setFilter('vetoed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'vetoed' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              Vetoed ({stats.vetoed})
            </button>
          </div>

          <div className="flex gap-2 ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm border border-gray-600 focus:border-primary-500 focus:outline-none"
            >
              <option value="date">Sort by Date</option>
              <option value="venue">Sort by Venue</option>
              <option value="status">Sort by Status</option>
            </select>

            {onExport && (
              <button
                onClick={onExport}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                📥 Export
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Request List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <span className="text-6xl mb-4 block">🎵</span>
            <p className="text-gray-400">No requests found</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div
              key={request.requestId}
              className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  <span className="text-3xl">{getStatusIcon(request.status)}</span>
                </div>

                {/* Request Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{request.songTitle}</h3>
                      <p className="text-gray-400 text-sm truncate">{request.artistName}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`text-sm font-semibold ${getStatusColor(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>📍 {request.venueName}</span>
                    <span>📅 {formatDate(request.submittedAt)}</span>
                    <span>💰 R{request.price}</span>
                    {request.upvotes > 0 && <span>❤️ {request.upvotes}</span>}
                    {request.genre && (
                      <span className="px-2 py-0.5 bg-gray-700 rounded-full text-xs">
                        {request.genre}
                      </span>
                    )}
                    {request.requestType === 'spotlight' && (
                      <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                        SPOTLIGHT
                      </span>
                    )}
                  </div>

                  {request.dedication && (
                    <p className="mt-2 text-sm text-gray-400 italic">
                      "{request.dedication}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {onRequestAgain && (
                    <button
                      onClick={() => {
                        HapticFeedback.buttonPress();
                        onRequestAgain(request);
                      }}
                      className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
                    >
                      Request Again
                    </button>
                  )}
                  {request.status === 'vetoed' && onSaveToBackup && (
                    <button
                      onClick={() => {
                        HapticFeedback.buttonPress();
                        onSaveToBackup(request);
                      }}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
                    >
                      Save to Backup
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Backup List Component
 */
export interface BackupRequest {
  id: string;
  songTitle: string;
  artistName: string;
  genre?: string;
  originalPrice: number;
  savedAt: number;
  expiresAt: number;
  originalEventId: string;
  vetoReason?: string;
}

interface BackupListProps {
  backupRequests: BackupRequest[];
  onRestore: (backup: BackupRequest) => void;
  onRemove: (id: string) => void;
  className?: string;
}

export const BackupList: React.FC<BackupListProps> = ({
  backupRequests,
  onRestore,
  onRemove,
  className = '',
}) => {
  const getDaysUntilExpiry = (expiresAt: number) => {
    const days = Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Backup List</h3>
        <span className="text-sm text-gray-400">{backupRequests.length} saved</span>
      </div>

      {backupRequests.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <span className="text-6xl mb-4 block">💾</span>
          <p className="text-gray-400">No backup requests</p>
          <p className="text-sm text-gray-500 mt-2">
            Vetoed requests are automatically saved here for 30 days
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {backupRequests.map(backup => {
            const daysLeft = getDaysUntilExpiry(backup.expiresAt);
            return (
              <div
                key={backup.id}
                className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{backup.songTitle}</h4>
                    <p className="text-gray-400 text-sm">{backup.artistName}</p>
                    {backup.vetoReason && (
                      <p className="text-red-400 text-xs mt-1">Veto reason: {backup.vetoReason}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>💰 R{backup.originalPrice}</span>
                      {backup.genre && <span>{backup.genre}</span>}
                      <span className={daysLeft <= 7 ? 'text-red-400' : ''}>
                        Expires in {daysLeft} days
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        HapticFeedback.buttonPress();
                        onRestore(backup);
                      }}
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => {
                        HapticFeedback.buttonPress();
                        onRemove(backup.id);
                      }}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Favorite Songs Component
 */
export interface FavoriteSong {
  id: string;
  songTitle: string;
  artistName: string;
  genre?: string;
  timesRequested: number;
  lastRequested?: number;
  averagePrice: number;
}

interface FavoriteSongsProps {
  favorites: FavoriteSong[];
  onQuickRequest: (song: FavoriteSong) => void;
  onRemoveFavorite: (id: string) => void;
  className?: string;
}

export const FavoriteSongs: React.FC<FavoriteSongsProps> = ({
  favorites,
  onQuickRequest,
  onRemoveFavorite,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFavorites = favorites.filter(fav =>
    fav.songTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fav.artistName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Favorite Songs</h3>
        <span className="text-sm text-gray-400">{favorites.length} favorites</span>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search favorites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-12 bg-gray-800 text-white rounded-xl border border-gray-700 focus:border-primary-500 focus:outline-none"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      </div>

      {/* Favorites List */}
      {filteredFavorites.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <span className="text-6xl mb-4 block">⭐</span>
          <p className="text-gray-400">No favorite songs yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Star songs from your request history to quick request them
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredFavorites.map(fav => (
            <div
              key={fav.id}
              className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">⭐</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold truncate">{fav.songTitle}</h4>
                  <p className="text-gray-400 text-sm truncate">{fav.artistName}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>🎵 {fav.timesRequested}x requested</span>
                    <span>💰 ~R{fav.averagePrice}</span>
                    {fav.genre && <span>{fav.genre}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      HapticFeedback.buttonPress();
                      onQuickRequest(fav);
                    }}
                    className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
                  >
                    Quick Request
                  </button>
                  <button
                    onClick={() => {
                      HapticFeedback.buttonPress();
                      onRemoveFavorite(fav.id);
                    }}
                    className="text-gray-400 hover:text-red-500 text-xs transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
