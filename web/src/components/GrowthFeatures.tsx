import React, { useState } from 'react';
import { Music, Award, TrendingUp, Calendar, MapPin, Clock, ChevronRight, Lock } from 'lucide-react';

/**
 * GROWTH FEATURES
 * Long-term progression systems that keep users engaged
 */

// Types
interface GenrePath {
  genre: string;
  level: number; // 0-5
  songsRequested: number;
  nextMilestone: number;
  badges: string[];
  color: string;
}

interface MemoryEntry {
  id: string;
  date: Date;
  venueName: string;
  location: string;
  song: {
    title: string;
    artist: string;
    genre: string;
  };
  status: 'played' | 'vetoed';
  mood?: 'energetic' | 'chill' | 'romantic' | 'party';
  upvotes: number;
}

/**
 * GENRE EXPLORATION TREE
 * Visual skill tree showing mastery paths across genres
 */

interface GenreExplorationTreeProps {
  paths: GenrePath[];
  onSelectGenre: (genre: string) => void;
  className?: string;
}

export const GenreExplorationTree: React.FC<GenreExplorationTreeProps> = ({
  paths,
  onSelectGenre,
  className = '',
}) => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const getMilestones = (level: number): { songs: number; badge: string; title: string }[] => {
    return [
      { songs: 0, badge: '🌱', title: 'Novice' },
      { songs: 10, badge: '🌿', title: 'Explorer' },
      { songs: 25, badge: '🌳', title: 'Enthusiast' },
      { songs: 50, badge: '🏆', title: 'Connoisseur' },
      { songs: 100, badge: '👑', title: 'Master' },
      { songs: 200, badge: '💎', title: 'Legend' },
    ];
  };

  const getProgressColor = (genre: string): string => {
    const colors: Record<string, string> = {
      'Pop': 'from-pink-500 to-rose-500',
      'Rock': 'from-red-600 to-orange-600',
      'Hip Hop': 'from-purple-600 to-indigo-600',
      'Electronic': 'from-cyan-500 to-blue-600',
      'R&B': 'from-amber-600 to-yellow-600',
      'Jazz': 'from-emerald-600 to-teal-600',
    };
    return colors[genre] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className={`bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-6 border border-indigo-500/50 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Genre Exploration Tree</h3>
          <p className="text-sm text-indigo-200">Master your musical journey</p>
        </div>
      </div>

      {/* Genre Paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paths.map((path) => {
          const milestones = getMilestones(path.level);
          const currentMilestone = milestones[path.level];
          const nextMilestone = milestones[path.level + 1];
          const progress = nextMilestone 
            ? ((path.songsRequested - currentMilestone.songs) / (nextMilestone.songs - currentMilestone.songs)) * 100
            : 100;

          return (
            <div
              key={path.genre}
              onClick={() => {
                setSelectedPath(path.genre);
                onSelectGenre(path.genre);
              }}
              className={`bg-black/30 rounded-xl p-4 cursor-pointer transition-all hover:bg-black/40 ${
                selectedPath === path.genre ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-white font-bold">{path.genre}</h4>
                </div>
                <div className="text-2xl">{currentMilestone.badge}</div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">{currentMilestone.title}</span>
                  <span className="text-white font-semibold">
                    {path.songsRequested}/{nextMilestone?.songs || path.songsRequested}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getProgressColor(path.genre)} transition-all duration-500`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Milestone Path */}
              <div className="flex items-center justify-between">
                {milestones.slice(0, 6).map((milestone, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center ${
                      idx <= path.level ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        idx <= path.level
                          ? `bg-gradient-to-br ${getProgressColor(path.genre)}`
                          : 'bg-gray-700'
                      }`}
                    >
                      {idx <= path.level ? milestone.badge : <Lock className="w-4 h-4 text-gray-500" />}
                    </div>
                    <span className="text-2xs text-gray-500 mt-1">{milestone.songs}</span>
                  </div>
                ))}
              </div>

              {/* Next Unlock */}
              {nextMilestone && (
                <div className="mt-3 p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                  <p className="text-xs text-indigo-300 text-center">
                    {nextMilestone.songs - path.songsRequested} more to unlock {nextMilestone.badge} {nextMilestone.title}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">
            {paths.reduce((sum, p) => sum + p.songsRequested, 0)}
          </div>
          <div className="text-xs text-gray-400">Total Requests</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">
            {paths.filter(p => p.level >= 3).length}
          </div>
          <div className="text-xs text-gray-400">Mastered Genres</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">
            {paths.reduce((sum, p) => sum + p.badges.length, 0)}
          </div>
          <div className="text-xs text-gray-400">Badges Earned</div>
        </div>
      </div>
    </div>
  );
};

/**
 * SONIC MEMORY LANE
 * Beautiful timeline of all user's music requests
 */

interface SonicMemoryLaneProps {
  memories: MemoryEntry[];
  onMemoryClick?: (memory: MemoryEntry) => void;
  className?: string;
}

export const SonicMemoryLane: React.FC<SonicMemoryLaneProps> = ({
  memories,
  onMemoryClick,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'played' | 'vetoed'>('all');

  const filteredMemories = memories.filter(m => 
    filter === 'all' || m.status === filter
  );

  const getMoodColor = (mood?: string): string => {
    switch (mood) {
      case 'energetic': return 'from-red-500 to-orange-500';
      case 'chill': return 'from-blue-500 to-cyan-500';
      case 'romantic': return 'from-pink-500 to-rose-500';
      case 'party': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getMoodEmoji = (mood?: string): string => {
    switch (mood) {
      case 'energetic': return '⚡';
      case 'chill': return '😌';
      case 'romantic': return '💕';
      case 'party': return '🎉';
      default: return '🎵';
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className={`bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/50 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Sonic Memory Lane</h3>
            <p className="text-sm text-purple-200">Your musical journey</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(['all', 'played', 'vetoed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-blue-500" />

        {/* Memories */}
        <div className="space-y-6">
          {filteredMemories.map((memory, index) => (
            <div
              key={memory.id}
              onClick={() => onMemoryClick?.(memory)}
              className="relative pl-16 cursor-pointer group"
            >
              {/* Timeline Dot */}
              <div className={`absolute left-3 w-6 h-6 rounded-full bg-gradient-to-br ${getMoodColor(memory.mood)} flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform`}>
                <span className="text-xs">{getMoodEmoji(memory.mood)}</span>
              </div>

              {/* Memory Card */}
              <div className="bg-black/30 rounded-xl p-4 hover:bg-black/40 transition-all">
                {/* Date & Location */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(memory.date)}</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    memory.status === 'played'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {memory.status === 'played' ? '✓ Played' : '✕ Vetoed'}
                  </div>
                </div>

                {/* Song Info */}
                <div className="mb-2">
                  <h4 className="text-white font-bold text-lg">{memory.song.title}</h4>
                  <p className="text-gray-300 text-sm">{memory.song.artist}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                    {memory.song.genre}
                  </span>
                </div>

                {/* Venue */}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{memory.venueName}</span>
                  </div>
                  {memory.upvotes > 0 && (
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-gold-400" />
                      <span className="text-gold-400">{memory.upvotes} upvotes</span>
                    </div>
                  )}
                </div>

                {/* Mood Tag */}
                {memory.mood && (
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r ${getMoodColor(memory.mood)} bg-opacity-20 rounded-full text-xs text-white`}>
                      {getMoodEmoji(memory.mood)} {memory.mood}
                    </span>
                  </div>
                )}
              </div>

              {/* Connector Line to Next */}
              {index < filteredMemories.length - 1 && (
                <div className="absolute left-6 top-full w-0.5 h-6 bg-gradient-to-b from-purple-500/50 to-transparent" />
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMemories.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No memories yet. Start requesting songs!</p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{memories.length}</div>
          <div className="text-xs text-gray-400">Total Memories</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">
            {memories.filter(m => m.status === 'played').length}
          </div>
          <div className="text-xs text-gray-400">Songs Played</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {new Set(memories.map(m => m.venueName)).size}
          </div>
          <div className="text-xs text-gray-400">Venues Visited</div>
        </div>
      </div>

      {/* On This Day */}
      {memories.some(m => {
        const today = new Date();
        const memDate = new Date(m.date);
        return memDate.getMonth() === today.getMonth() && memDate.getDate() === today.getDate();
      }) && (
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
          <p className="text-sm text-white text-center flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            On this day last year, you requested "{memories.find(m => {
              const today = new Date();
              const memDate = new Date(m.date);
              return memDate.getMonth() === today.getMonth() && memDate.getDate() === today.getDate();
            })?.song.title}"
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * TASTE EVOLUTION GRAPH
 * Visual chart showing how musical preferences changed over time
 */

interface TasteEvolutionProps {
  genreData: Array<{
    month: string;
    genres: Record<string, number>; // genre -> percentage
  }>;
  className?: string;
}

export const TasteEvolution: React.FC<TasteEvolutionProps> = ({
  genreData,
  className = '',
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(genreData.length - 1);

  const getGenreColor = (genre: string): string => {
    const colors: Record<string, string> = {
      'Pop': '#ec4899',
      'Rock': '#ef4444',
      'Hip Hop': '#8b5cf6',
      'Electronic': '#06b6d4',
      'R&B': '#f59e0b',
      'Jazz': '#10b981',
    };
    return colors[genre] || '#6b7280';
  };

  const currentData = genreData[selectedMonth];
  const sortedGenres = Object.entries(currentData.genres)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className={`bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/50 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Taste Evolution</h3>
          <p className="text-sm text-cyan-200">How your music taste has changed</p>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {genreData.map((data, index) => (
          <button
            key={index}
            onClick={() => setSelectedMonth(index)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              selectedMonth === index
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {data.month}
          </button>
        ))}
      </div>

      {/* Pie Chart (Simple Bar Version) */}
      <div className="space-y-3 mb-6">
        {sortedGenres.map(([genre, percentage]) => (
          <div key={genre}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-semibold">{genre}</span>
              <span className="text-gray-400">{percentage}%</span>
            </div>
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: getGenreColor(genre),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="bg-black/20 rounded-xl p-4">
        <h4 className="text-white font-bold mb-2 flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          Insights
        </h4>
        <p className="text-sm text-gray-300">
          You used to love <span className="text-pink-400 font-semibold">Pop</span>, 
          now you're into <span className="text-cyan-400 font-semibold">Electronic</span>! 
          Your taste is evolving. 🎧
        </p>
      </div>
    </div>
  );
};
