/**
 * Audience Interface Components
 * Event Companion experience with innovative UX
 */

import React, { useState } from 'react';
import { Music, Heart, X, Check, Zap } from 'lucide-react';

/**
 * Event Discovery - Tinder-style card stack
 */
interface Event {
  id: string;
  venueName: string;
  djName: string;
  genre: string;
  distance: string;
  attendees: number;
  image?: string;
}

interface EventDiscoveryProps {
  events: Event[];
  onSelectEvent: (eventId: string) => void;
}

export const EventDiscovery: React.FC<EventDiscoveryProps> = ({ events, onSelectEvent }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const currentEvent = events[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    
    setTimeout(() => {
      if (direction === 'right' && currentEvent) {
        onSelectEvent(currentEvent.id);
      } else {
        setCurrentIndex(prev => Math.min(prev + 1, events.length - 1));
        setSwipeDirection(null);
      }
    }, 300);
  };

  if (!currentEvent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No events nearby</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="relative w-full max-w-md">
        {/* Event Card */}
        <div
          className={`bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
            swipeDirection === 'left' ? 'animate-swipe-left' : ''
          } ${swipeDirection === 'right' ? 'animate-swipe-right' : ''}`}
          style={{ height: 'min(600px, 70vh)' }}
        >
          {/* Event Image/Gradient */}
          <div className="h-2/3 relative bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            {currentEvent.image ? (
              <img src={currentEvent.image} alt={currentEvent.venueName} className="w-full h-full object-cover" />
            ) : (
              <Music className="w-32 h-32 text-white/50" />
            )}
            
            {/* Distance Badge */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-lg rounded-full px-4 py-2">
              <span className="text-white font-semibold">{currentEvent.distance}</span>
            </div>
          </div>

          {/* Event Info */}
          <div className="h-1/3 bg-black/80 backdrop-blur-lg p-6">
            <h2 className="text-3xl font-bold text-white mb-2">{currentEvent.venueName}</h2>
            <p className="text-purple-300 text-lg mb-3">DJ {currentEvent.djName}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Music className="w-4 h-4" />
                {currentEvent.genre}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {currentEvent.attendees} here
              </span>
            </div>
          </div>
        </div>

        {/* Swipe Buttons */}
        <div className="flex justify-center gap-8 mt-8">
          <button
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center hover:scale-110 transition-all"
          >
            <X className="w-8 h-8 text-red-500" />
          </button>
          
          <button
            onClick={() => handleSwipe('right')}
            className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center hover:scale-110 transition-all"
          >
            <Heart className="w-10 h-10 text-green-500" />
          </button>
        </div>

        {/* Swipe Hint */}
        <p className="text-center text-gray-400 text-sm mt-4">
          Swipe right to join • Swipe left to skip
        </p>
      </div>
    </div>
  );
};

/**
 * Album Art Grid with Parallax
 */
interface AlbumGridProps {
  songs: Array<{
    id: string;
    title: string;
    artist: string;
    albumArt?: string;
    genre: string;
  }>;
  onSelectSong: (song: any) => void;
}

export const AlbumArtGrid: React.FC<AlbumGridProps> = ({ songs, onSelectSong }) => {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop);
  };

  return (
    <div className="h-full overflow-y-auto" onScroll={handleScroll}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {songs.map((song, index) => {
          // Parallax effect - different speeds for different rows
          const row = Math.floor(index / 4);
          const parallaxOffset = (scrollY * (row % 3 === 0 ? 0.1 : row % 3 === 1 ? 0.2 : 0.3));
          
          return (
            <div
              key={song.id}
              className="relative group cursor-pointer"
              style={{
                transform: `translateY(${parallaxOffset}px)`,
                transition: 'transform 0.1s ease-out',
              }}
              onClick={() => onSelectSong(song)}
            >
              {/* Album Art */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 relative">
                {song.albumArt ? (
                  <img src={song.albumArt} alt={song.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-12 h-12 text-white/50" />
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-white font-semibold text-sm mb-1 truncate">{song.title}</p>
                    <p className="text-gray-300 text-xs truncate">{song.artist}</p>
                  </div>
                </div>

                {/* Genre Badge */}
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {song.genre}
                </div>
              </div>

              {/* Song Info (Mobile) */}
              <div className="mt-2 md:hidden">
                <p className="text-white text-sm font-semibold truncate">{song.title}</p>
                <p className="text-gray-400 text-xs truncate">{song.artist}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Massive Pulsing Request Button
 */
interface RequestButtonProps {
  onPress: () => void;
  disabled?: boolean;
  price: number;
}

export const MassiveRequestButton: React.FC<RequestButtonProps> = ({ onPress, disabled, price }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
      <button
        onClick={onPress}
        disabled={disabled}
        className={`w-full h-20 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold text-2xl shadow-2xl pointer-events-auto ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-glow hover:scale-105'
        } transition-all flex items-center justify-center gap-3`}
        style={{
          boxShadow: '0 0 40px rgba(168, 85, 247, 0.6), 0 0 80px rgba(168, 85, 247, 0.3)',
        }}
      >
        <Zap className="w-8 h-8" />
        <span>Request Song - R{price}</span>
        <Zap className="w-8 h-8" />
      </button>
    </div>
  );
};

/**
 * Locked In Animation
 */
interface LockedInProps {
  songTitle: string;
  onComplete: () => void;
}

export const LockedInAnimation: React.FC<LockedInProps> = ({ songTitle, onComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 animate-scale-in">
      <div className="text-center">
        {/* Checkmark Circle */}
        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center animate-scale-in shadow-2xl">
          <Check className="w-16 h-16 text-white animate-bounce" />
        </div>

        {/* Locked In Text */}
        <h2 className="text-4xl font-bold text-white mb-2 animate-scale-in">Locked In!</h2>
        <p className="text-xl text-gray-300 mb-4">{songTitle}</p>
        
        {/* Confetti Effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '50%',
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Energy Beam Queue Position
 */
interface EnergyBeamProps {
  position: number;
  totalInQueue: number;
  songTitle: string;
}

export const EnergyBeam: React.FC<EnergyBeamProps> = ({ position, totalInQueue, songTitle }) => {
  const percentage = ((totalInQueue - position + 1) / totalInQueue) * 100;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
      <div className="relative w-4 h-full">
        {/* Beam Container */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-pink-500/20 to-transparent">
          {/* Moving Beacon */}
          <div
            className="absolute left-0 right-0 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-2xl animate-pulse-glow transition-all duration-1000"
            style={{
              bottom: `${percentage}%`,
              boxShadow: '0 0 30px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.4)',
            }}
          >
            {/* Position Badge */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-lg rounded-full px-4 py-2 whitespace-nowrap">
              <p className="text-yellow-400 font-bold text-sm">#{position}</p>
              <p className="text-white text-xs">{songTitle}</p>
            </div>
          </div>
        </div>

        {/* Coming Up Next Indicator */}
        {position <= 2 && (
          <div className="absolute top-20 left-8 bg-green-500/20 backdrop-blur-lg rounded-2xl px-6 py-3 border-2 border-green-500 animate-heartbeat">
            <p className="text-green-400 font-bold text-lg">Coming Up Next!</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Now Playing Celebration
 */
interface NowPlayingProps {
  songTitle: string;
  artist: string;
  onDismiss: () => void;
}

export const NowPlayingCelebration: React.FC<NowPlayingProps> = ({ songTitle, artist, onDismiss }) => {
  React.useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 flex items-center justify-center z-50 animate-vinyl-spin">
      <div className="text-center relative">
        {/* Confetti Burst */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-confetti"
              style={{
                left: `${50 + (Math.random() - 0.5) * 100}%`,
                top: '50%',
                background: `hsl(${Math.random() * 360}, 70%, 60%)`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Now Playing Badge */}
        <div className="bg-black/50 backdrop-blur-lg rounded-3xl p-12 border-4 border-yellow-400 shadow-2xl">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-pulse-glow">
            <Music className="w-16 h-16 text-white" />
          </div>

          <h1 className="text-5xl font-bold text-white mb-4 animate-scale-in">NOW PLAYING</h1>
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">{songTitle}</h2>
          <p className="text-xl text-gray-300">{artist}</p>

          <div className="mt-8 text-sm text-gray-400">
            <p>Screenshot this moment! 📸</p>
          </div>
        </div>
      </div>
    </div>
  );
};
