/**
 * Audience Interface Components
 * Event Companion experience with innovative UX
 */

import React, { useState } from 'react';
import { Music, Heart, X, Check, Zap, Mic, Camera } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { HapticFeedback } from '../utils/haptics';
import styles from './AudienceInterface.module.css';

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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const currentEvent = events[currentIndex];

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    HapticFeedback.buttonPress();

    setTimeout(() => {
      if (direction === 'right' && currentEvent) {
        HapticFeedback.requestAccepted();
        onSelectEvent(currentEvent.id);
      } else {
        setCurrentIndex(prev => Math.min(prev + 1, events.length));
        setSwipeDirection(null);
        setDragOffset(0);
      }
    }, 300);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    if (touchStart) {
      const offset = e.targetTouches[0].clientX - touchStart;
      setDragOffset(offset);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setDragOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleSwipe('left');
    } else if (isRightSwipe) {
      handleSwipe('right');
    } else {
      setDragOffset(0);
    }
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, currentEvent]);

  // Show "No more events" screen
  if (currentIndex >= events.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md px-4">
          <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-white text-2xl font-bold mb-2">That's all for now!</h3>
          <p className="text-gray-400 mb-6">No more events nearby. Check back later for new events.</p>
          <button
            onClick={() => setCurrentIndex(0)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition-all"
          >
            Review Events Again
          </button>
        </div>
      </div>
    );
  }

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
    <div className={`h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 ${styles.lazyBlur}`}>
      <div className="relative w-full max-w-md">
        {/* Event Counter */}
        <div className="text-center mb-4">
          <span className="text-gray-400 text-sm">
            Event {currentIndex + 1} of {events.length}
          </span>
        </div>

        {/* Event Card */}
        <div
          className={`bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 cursor-grab active:cursor-grabbing ${swipeDirection === 'left' ? 'animate-swipe-left' : ''
            } ${swipeDirection === 'right' ? 'animate-swipe-right' : ''}`}
          style={{
            height: 'min(600px, 65vh)',
            transform: swipeDirection ? undefined : `translateX(${dragOffset}px) rotate(${dragOffset * 0.02}deg)`,
            transition: swipeDirection ? 'all 0.3s ease-out' : dragOffset ? 'none' : 'all 0.3s ease-out',
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Event Image/Gradient - Phase 8: Lazy loaded */}
          <div className="h-2/3 relative bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
            {currentEvent.image ? (
              <LazyLoadImage
                src={currentEvent.image}
                alt={currentEvent.venueName}
                className="w-full h-full object-cover"
                effect="blur"
              />
            ) : (
              <Music className="w-32 h-32 text-white/50" />
            )}

            {/* Distance Badge */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-lg rounded-full px-4 py-2">
              <span className="text-white font-semibold">{currentEvent.distance}</span>
            </div>

            {/* Swipe Direction Indicators */}
            {dragOffset !== 0 && (
              <>
                {/* Skip indicator (left) */}
                {dragOffset < -30 && (
                  <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center backdrop-blur-sm transition-opacity">
                    <div className="text-center">
                      <X className="w-24 h-24 text-white mb-2 animate-pulse" />
                      <p className="text-white text-2xl font-bold">SKIP</p>
                    </div>
                  </div>
                )}
                {/* Join indicator (right) */}
                {dragOffset > 30 && (
                  <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center backdrop-blur-sm transition-opacity">
                    <div className="text-center">
                      <Heart className="w-24 h-24 text-white mb-2 animate-pulse" />
                      <p className="text-white text-2xl font-bold">JOIN</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Event Info - Minimized */}
          <div className="h-1/3 bg-black/80 backdrop-blur-lg p-6">
            <h2 className="text-3xl font-bold text-white mb-2">{currentEvent.venueName}</h2>
            <p className="text-purple-300 font-semibold mb-3 flex items-center gap-2"><Mic className="w-4 h-4" /> {currentEvent.djName}</p>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <Music className="w-4 h-4" />
                {currentEvent.genre}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {currentEvent.attendees} {currentEvent.attendees === 1 ? 'person' : 'people'}
              </span>
            </div>
          </div>
        </div>

        {/* Swipe Buttons */}
        <div className="flex justify-center gap-8 mt-8">
          <button
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center hover:scale-110 hover:bg-red-500/30 active:scale-95 transition-all"
            aria-label="Skip event"
          >
            <X className="w-8 h-8 text-red-500" />
          </button>

          <button
            onClick={() => handleSwipe('right')}
            className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center hover:scale-110 hover:bg-green-500/30 active:scale-95 transition-all"
            aria-label="Join event"
          >
            <Heart className="w-10 h-10 text-green-500" />
          </button>
        </div>

        {/* Swipe Hint */}
        <div className="text-center text-gray-400 text-sm mt-4 space-y-1">
          <p className="hidden md:block">
            Press <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">←</kbd> to skip or <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">→</kbd> to join
          </p>
          <p className="md:hidden">
            Swipe or tap buttons below
          </p>
        </div>
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
  selectedSongId?: string;
}

export const AlbumArtGrid: React.FC<AlbumGridProps> = ({ songs, onSelectSong, selectedSongId }) => {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop);
  };

  const handleSelectSong = (song: any) => {
    HapticFeedback.buttonPress();
    onSelectSong(song);
  };

  return (
    <div className="h-full overflow-y-auto pb-4" onScroll={handleScroll}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 p-4">
        {songs.map((song, index) => {
          // Parallax effect - different speeds for different rows
          const row = Math.floor(index / 4);
          const parallaxOffset = (scrollY * (row % 3 === 0 ? 0.05 : row % 3 === 1 ? 0.1 : 0.15));
          const isSelected = selectedSongId === song.id;

          return (
            <button
              key={song.id}
              className={`relative group cursor-pointer focus:outline-none rounded-2xl transition-all ${isSelected
                ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900'
                : 'focus:ring-2 focus:ring-purple-500'
                }`}
              style={{
                transform: `translateY(${parallaxOffset}px) scale(${isSelected ? 1.05 : 1})`,
                transition: 'transform 0.2s ease-out',
              }}
              onClick={() => handleSelectSong(song)}
              aria-label={`Select ${song.title} by ${song.artist}`}
            >
              {/* Album Art - Phase 8: Lazy loaded for performance */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 relative">
                {song.albumArt ? (
                  <LazyLoadImage
                    src={song.albumArt}
                    alt={song.title}
                    className="w-full h-full object-cover"
                    effect="blur"
                    placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%238B5CF6' width='100' height='100'/%3E%3C/svg%3E"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-12 h-12 text-white/50" />
                  </div>
                )}

                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute top-2 left-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-scale-in">
                    <Check className="w-5 h-5 text-gray-900" />
                  </div>
                )}

                {/* Hover Overlay - Minimal */}
                <div className={`absolute inset-0 bg-black/60 ${isSelected ? 'opacity-100 bg-yellow-400/20' : 'opacity-0'
                  } group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center justify-center`}>
                  <div className="text-center p-2">
                    <p className="text-white font-bold text-sm truncate">{song.title}</p>
                    <p className="text-gray-300 text-xs truncate">{song.artist}</p>
                  </div>
                </div>
              </div>

              {/* Remove Song Info on Mobile - Pure Visual */}
            </button>
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
  selectedSong?: string;
}

export const MassiveRequestButton: React.FC<RequestButtonProps> = ({ onPress, disabled, price, selectedSong }) => {
  const handlePress = () => {
    if (!disabled) {
      HapticFeedback.buttonLongPress();
      onPress();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent pointer-events-none z-30">
      {!selectedSong && (
        <p className="text-center text-gray-400 text-sm mb-3 pointer-events-none">
          👆 Tap a song above to select it
        </p>
      )}
      <button
        onClick={handlePress}
        disabled={disabled}
        className={`w-full h-16 sm:h-20 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold text-lg sm:text-2xl shadow-2xl pointer-events-auto ${disabled ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-glow hover:scale-105 active:scale-95'
          } transition-all flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3`}
        style={{
          boxShadow: disabled
            ? '0 0 20px rgba(168, 85, 247, 0.3)'
            : '0 0 40px rgba(168, 85, 247, 0.6), 0 0 80px rgba(168, 85, 247, 0.3)',
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Zap className="w-6 h-6 sm:w-8 sm:h-8" />
          <span className="hidden sm:inline">{selectedSong ? `Request "${selectedSong}" - R${price}` : 'Select a Song'}</span>
          <span className="sm:hidden text-base">{selectedSong ? `R${price}` : 'Select Song'}</span>
          <Zap className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        {selectedSong && (
          <span className="text-xs sm:text-sm text-purple-200 truncate max-w-[200px] sm:max-w-xs sm:hidden">
            {selectedSong}
          </span>
        )}
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
          {[...Array(20)].map((_, i) => {
            const randomX = (Math.random() - 0.5) * 200;
            const randomY = Math.random() * 300 + 100;
            return (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '50%',
                  animationDelay: `${Math.random() * 0.5}s`,
                  '--x': `${randomX}px`,
                  '--y': `${randomY}px`,
                } as React.CSSProperties}
              />
            );
          })}
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
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 flex items-center justify-center z-50">
      <div className="text-center relative">
        {/* Confetti Burst */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => {
            const randomX = (Math.random() - 0.5) * 400;
            const randomY = Math.random() * 400 + 100;
            return (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full animate-confetti"
                style={{
                  left: `${50 + (Math.random() - 0.5) * 100}%`,
                  top: '50%',
                  background: `hsl(${Math.random() * 360}, 70%, 60%)`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  '--x': `${randomX}px`,
                  '--y': `${randomY}px`,
                } as React.CSSProperties}
              />
            );
          })}
        </div>

        {/* Now Playing Badge */}
        <div className="bg-black/50 backdrop-blur-lg rounded-3xl p-12 border-4 border-yellow-400 shadow-2xl">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-pulse-glow">
            <Music className="w-16 h-16 text-white" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 animate-scale-in">NOW PLAYING</h1>
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">{songTitle}</h2>
          <p className="text-xl text-gray-300">{artist}</p>

          <div className="mt-8 text-sm text-gray-400">
            <p className="flex items-center justify-center gap-2">Screenshot this moment! <Camera className="w-4 h-4" /></p>
          </div>
        </div>
      </div>
    </div>
  );
};
