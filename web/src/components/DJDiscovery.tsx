import React, { useState } from 'react';
import { Search, Music, DollarSign, CheckCircle, XCircle } from 'lucide-react';

// DJ Profile Interface
export interface DJProfile {
  djId: string;
  name: string;
  photo?: string;
  bio?: string;
  genres: string[];
  basePrice: number;
  isAcceptingRequests: boolean;
  currentEvent?: string;
  rating?: number;
  totalRequests?: number;
}

// DJ Card Component
interface DJCardProps {
  dj: DJProfile;
  onViewLibrary: (djId: string) => void;
  onSelectDJ: (djId: string) => void;
}

export const DJCard: React.FC<DJCardProps> = ({ dj, onViewLibrary, onSelectDJ }) => {
  return (
    <div 
      className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-all cursor-pointer"
      onClick={() => onSelectDJ(dj.djId)}
    >
      {/* DJ Photo & Status */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          {dj.photo ? (
            <img 
              src={dj.photo} 
              alt={dj.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
          )}
          
          {/* Availability Indicator */}
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-800 flex items-center justify-center ${
            dj.isAcceptingRequests ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {dj.isAcceptingRequests ? (
              <CheckCircle className="w-3 h-3 text-white" />
            ) : (
              <XCircle className="w-3 h-3 text-white" />
            )}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{dj.name}</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-1 rounded ${
              dj.isAcceptingRequests 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {dj.isAcceptingRequests ? 'Taking Requests' : 'Not Available'}
            </span>
            {dj.rating && (
              <span className="text-yellow-400">★ {dj.rating.toFixed(1)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {dj.bio && (
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{dj.bio}</p>
      )}

      {/* Genres */}
      <div className="flex flex-wrap gap-2 mb-4">
        {dj.genres.slice(0, 3).map((genre, index) => (
          <span 
            key={index}
            className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
          >
            {genre}
          </span>
        ))}
        {dj.genres.length > 3 && (
          <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
            +{dj.genres.length - 3} more
          </span>
        )}
      </div>

      {/* Pricing & Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-yellow-400">
          <DollarSign className="w-4 h-4" />
          <span className="font-semibold">R{dj.basePrice}</span>
          <span className="text-gray-500 text-sm">base price</span>
        </div>
        {dj.totalRequests && (
          <span className="text-gray-400 text-sm">
            {dj.totalRequests} requests
          </span>
        )}
      </div>

      {/* Actions */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewLibrary(dj.djId);
        }}
        className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
      >
        View Library
      </button>
    </div>
  );
};

// DJ List Component
interface DJListProps {
  djs: DJProfile[];
  eventName?: string;
  onViewLibrary: (djId: string) => void;
  onSelectDJ: (djId: string) => void;
}

export const DJList: React.FC<DJListProps> = ({ 
  djs, 
  eventName, 
  onViewLibrary, 
  onSelectDJ 
}) => {
  return (
    <div className="space-y-4">
      {eventName && (
        <h2 className="text-2xl font-bold text-white mb-4">
          DJs at {eventName}
        </h2>
      )}
      
      {djs.length === 0 ? (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No DJs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {djs.map((dj) => (
            <DJCard
              key={dj.djId}
              dj={dj}
              onViewLibrary={onViewLibrary}
              onSelectDJ={onSelectDJ}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// DJ Search Component
interface DJSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  availableGenres: string[];
}

export interface SearchFilters {
  genre?: string;
  availableOnly: boolean;
  maxPrice?: number;
}

export const DJSearch: React.FC<DJSearchProps> = ({ onSearch, availableGenres }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    availableOnly: false
  });

  const handleSearch = () => {
    onSearch(query, filters);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search DJs by name..."
          className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Genre Filter */}
        <select
          value={filters.genre || ''}
          onChange={(e) => setFilters({ ...filters, genre: e.target.value || undefined })}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="">All Genres</option>
          {availableGenres.map((genre) => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>

        {/* Available Only Toggle */}
        <label className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
            className="w-4 h-4 accent-purple-500"
          />
          <span className="text-white text-sm">Available Only</span>
        </label>

        {/* Max Price Filter */}
        <input
          type="number"
          value={filters.maxPrice || ''}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Max price (R)"
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-32"
        />

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Search
        </button>
      </div>
    </div>
  );
};

// DJ Availability Notification
interface DJAvailabilityNotificationProps {
  djName: string;
  onDismiss: () => void;
  onViewLibrary: () => void;
}

export const DJAvailabilityNotification: React.FC<DJAvailabilityNotificationProps> = ({
  djName,
  onDismiss,
  onViewLibrary
}) => {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-[slideDown_0.3s_ease-out]">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg shadow-2xl p-4 flex items-center gap-4 max-w-md">
        <CheckCircle className="w-8 h-8 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-lg">{djName} is Now Taking Requests!</p>
          <p className="text-sm text-green-100">Check out their library and make a request</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onViewLibrary}
            className="px-4 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            View Library
          </button>
          <button
            onClick={onDismiss}
            className="px-3 py-2 bg-green-700 hover:bg-green-800 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
