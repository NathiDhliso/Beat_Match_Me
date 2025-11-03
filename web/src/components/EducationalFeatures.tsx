import React, { useState } from 'react';
import { BookOpen, Music, TrendingUp, Users, Calendar, Heart, Star, Award } from 'lucide-react';

// ============================================================================
// EDUCATIONAL MOMENTS
// ============================================================================

interface DidYouKnowCardProps {
  song: {
    title: string;
    artist: string;
    year?: number;
    fact: string;
    trivia?: string;
  };
}

export const DidYouKnowCard: React.FC<DidYouKnowCardProps> = ({ song }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl p-5 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="bg-indigo-500 rounded-full p-2 flex-shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-indigo-600 mb-1">Did You Know?</h4>
          <p className="text-lg font-bold text-gray-800 mb-1">{song.title}</p>
          <p className="text-sm text-gray-600 mb-2">by {song.artist}</p>
          
          <div className="bg-white/60 rounded-lg p-3 mb-2">
            <p className="text-sm text-gray-700">{song.fact}</p>
          </div>
          
          {song.trivia && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                {isExpanded ? '▼ Show less' : '▶ Learn more'}
              </button>
              
              {isExpanded && (
                <div className="mt-2 bg-white/60 rounded-lg p-3 animate-fadeIn">
                  <p className="text-sm text-gray-700">{song.trivia}</p>
                </div>
              )}
            </>
          )}
          
          {song.year && (
            <div className="mt-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span className="text-xs text-gray-600">Released in {song.year}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// GENRE DEEP-DIVE
// ============================================================================

interface GenreDeepDiveProps {
  genre: string;
  description: string;
  keyArtists: string[];
  characteristics: string[];
  popularSongs: Array<{ title: string; artist: string }>;
}

export const GenreDeepDive: React.FC<GenreDeepDiveProps> = ({ 
  genre, 
  description, 
  keyArtists, 
  characteristics,
  popularSongs 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'artists' | 'songs'>('overview');
  
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-purple-500 rounded-full p-3">
          <Music className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{genre}</h3>
          <p className="text-sm text-gray-600">Genre Deep-Dive</p>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'artists', label: 'Key Artists' },
          { id: 'songs', label: 'Popular Songs' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white/60 text-gray-700 hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="bg-white/70 rounded-xl p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">About {genre}</h4>
              <p className="text-sm text-gray-700">{description}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Characteristics</h4>
              <div className="flex flex-wrap gap-2">
                {characteristics.map((char, idx) => (
                  <span
                    key={idx}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'artists' && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Key Artists</h4>
            <div className="grid grid-cols-2 gap-2">
              {keyArtists.map((artist, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 flex items-center gap-2"
                >
                  <Star className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-800">{artist}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'songs' && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Popular Songs</h4>
            <div className="space-y-2">
              {popularSongs.map((song, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3"
                >
                  <p className="font-semibold text-gray-800">{song.title}</p>
                  <p className="text-sm text-gray-600">{song.artist}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// DJ TIPS & INSIGHTS
// ============================================================================

interface DJTipsProps {
  insights: Array<{
    type: 'transition' | 'crowd' | 'timing' | 'genre';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

export const DJTips: React.FC<DJTipsProps> = ({ insights }) => {
  const impactColors = {
    high: 'from-green-500 to-emerald-600',
    medium: 'from-yellow-500 to-orange-500',
    low: 'from-blue-500 to-cyan-500',
  };
  
  const typeIcons = {
    transition: TrendingUp,
    crowd: Users,
    timing: Calendar,
    genre: Music,
  };
  
  return (
    <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-3">
          <Award className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">DJ Insights</h3>
          <p className="text-sm text-gray-600">Personalized tips for your crowd</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight, idx) => {
          const Icon = typeIcons[insight.type];
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className={`bg-gradient-to-r ${impactColors[insight.impact]} rounded-full p-2 flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-800">{insight.title}</h4>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      insight.impact === 'high' 
                        ? 'bg-green-100 text-green-700'
                        : insight.impact === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {insight.impact.toUpperCase()} IMPACT
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// EVENT STORY MODE
// ============================================================================

export interface EventContribution {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'request' | 'upvote' | 'dedication' | 'tip';
  songTitle?: string;
  songArtist?: string;
  message?: string;
  timestamp: Date;
  impact: number; // 1-100
}

interface EventStoryModeProps {
  eventName: string;
  contributions: EventContribution[];
  totalEnergy: number;
  peakMoment?: {
    time: Date;
    description: string;
  };
}

export const EventStoryMode: React.FC<EventStoryModeProps> = ({ 
  eventName, 
  contributions, 
  totalEnergy,
  peakMoment 
}) => {
  const [filter, setFilter] = useState<'all' | 'request' | 'upvote' | 'dedication' | 'tip'>('all');
  
  const filteredContributions = filter === 'all' 
    ? contributions 
    : contributions.filter(c => c.type === filter);
  
  const typeColors = {
    request: 'from-blue-500 to-cyan-500',
    upvote: 'from-green-500 to-emerald-500',
    dedication: 'from-pink-500 to-rose-500',
    tip: 'from-yellow-500 to-orange-500',
  };
  
  const typeLabels = {
    request: '🎵 Requested',
    upvote: '👍 Upvoted',
    dedication: '💝 Dedicated',
    tip: '💰 Tipped',
  };
  
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{eventName}</h2>
        <p className="text-sm text-gray-600">Collective Story Timeline</p>
        
        {/* Energy Meter */}
        <div className="mt-4 bg-white/70 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Event Energy</span>
            <span className="text-lg font-bold text-purple-600">{totalEnergy}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-500"
              style={{ width: `${totalEnergy}%` }}
            />
          </div>
        </div>
        
        {/* Peak Moment */}
        {peakMoment && (
          <div className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-5 h-5" />
              <span className="font-bold">Peak Moment</span>
            </div>
            <p className="text-sm">{peakMoment.description}</p>
            <p className="text-xs mt-1 opacity-80">
              {peakMoment.time.toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
      
      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {(['all', 'request', 'upvote', 'dedication', 'tip'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
              filter === type
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white/60 text-gray-700 hover:bg-white'
            }`}
          >
            {type === 'all' ? 'All' : typeLabels[type]}
          </button>
        ))}
      </div>
      
      {/* Timeline */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredContributions.map((contribution, idx) => (
          <div
            key={contribution.id}
            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                {contribution.userAvatar ? (
                  <img src={contribution.userAvatar} alt={contribution.userName} className="w-full h-full rounded-full" />
                ) : (
                  contribution.userName.charAt(0).toUpperCase()
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-800">{contribution.userName}</span>
                  <span className="text-xs text-gray-500">
                    {contribution.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                
                <div className={`inline-block bg-gradient-to-r ${typeColors[contribution.type]} text-white px-3 py-1 rounded-full text-xs font-semibold mb-2`}>
                  {typeLabels[contribution.type]}
                </div>
                
                {contribution.songTitle && (
                  <div className="bg-gray-50 rounded-lg p-2 mb-2">
                    <p className="text-sm font-semibold text-gray-800">{contribution.songTitle}</p>
                    {contribution.songArtist && (
                      <p className="text-xs text-gray-600">{contribution.songArtist}</p>
                    )}
                  </div>
                )}
                
                {contribution.message && (
                  <p className="text-sm text-gray-700 italic">"{contribution.message}"</p>
                )}
                
                {/* Impact Indicator */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${contribution.impact}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{contribution.impact}% impact</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="mt-4 bg-white/70 rounded-xl p-4">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Heart className="w-4 h-4 text-pink-500" />
          <span>
            <strong>{contributions.length}</strong> contributions made tonight's magic
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// VENUE CONSISTENCY PROFILES
// ============================================================================

interface VenueProfileProps {
  venueName: string;
  topGenres: Array<{ genre: string; percentage: number }>;
  successfulSongs: Array<{ title: string; artist: string; playCount: number }>;
  bestTimes: Array<{ timeRange: string; vibe: string }>;
  recommendations: string[];
}

export const VenueConsistencyProfile: React.FC<VenueProfileProps> = ({ 
  venueName, 
  topGenres, 
  successfulSongs,
  bestTimes,
  recommendations 
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-500 rounded-full p-3">
          <Music className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">{venueName}</h3>
          <p className="text-sm text-gray-600">Venue Vibe Profile</p>
        </div>
      </div>
      
      {/* Top Genres */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">What Works Here</h4>
        <div className="space-y-2">
          {topGenres.map((genre, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{genre.genre}</span>
                <span className="text-blue-600 font-semibold">{genre.percentage}%</span>
              </div>
              <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                  style={{ width: `${genre.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Successful Songs */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">Songs That Always Hit</h4>
        <div className="space-y-2">
          {successfulSongs.slice(0, 3).map((song, idx) => (
            <div key={idx} className="bg-white/70 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{song.title}</p>
                <p className="text-xs text-gray-600">{song.artist}</p>
              </div>
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                {song.playCount}x played
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Best Times */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">Vibe by Time</h4>
        <div className="grid grid-cols-2 gap-2">
          {bestTimes.map((time, idx) => (
            <div key={idx} className="bg-white/70 rounded-lg p-3">
              <p className="text-xs text-gray-600">{time.timeRange}</p>
              <p className="text-sm font-semibold text-gray-800">{time.vibe}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <Star className="w-5 h-5" />
          Pro Tips
        </h4>
        <ul className="space-y-1 text-sm">
          {recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-yellow-300">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
