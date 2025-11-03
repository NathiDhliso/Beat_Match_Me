import React, { useState } from 'react';
import { HapticFeedback } from '../utils/haptics';

/**
 * "Feeling Lucky" Request - Random song selection
 */
interface FeelingLuckyProps {
  onSongSelected: (song: { title: string; artist: string; genre: string }) => void;
  availableSongs: Array<{ title: string; artist: string; genre: string }>;
  className?: string;
}

export const FeelingLucky: React.FC<FeelingLuckyProps> = ({
  onSongSelected,
  availableSongs = [],
  className = '',
}) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleFeelingLucky = () => {
    if (!availableSongs || availableSongs.length === 0) return;

    setIsSpinning(true);
    HapticFeedback.buttonPress();

    // Simulate spinning animation
    setTimeout(() => {
      const randomSong = availableSongs[Math.floor(Math.random() * availableSongs.length)];
      onSongSelected(randomSong);
      setIsSpinning(false);
      HapticFeedback.requestAccepted();
    }, 1500);
  };

  return (
    <button
      onClick={handleFeelingLucky}
      disabled={isSpinning || !availableSongs || availableSongs.length === 0}
      className={`
        relative px-6 py-4 rounded-2xl
        bg-gradient-to-r from-secondary-500 to-accent-500
        text-white font-bold text-lg
        shadow-glow-purple
        transition-all duration-300
        hover:scale-105 hover:shadow-glow-magenta
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isSpinning ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        <span className={`text-2xl ${isSpinning ? 'animate-spin' : ''}`}>🎲</span>
        <span>{isSpinning ? 'Finding your vibe...' : "I'm Feeling Lucky"}</span>
      </div>
    </button>
  );
};

/**
 * Genre Roulette Wheel - Spin to select genre
 */
interface GenreRouletteProps {
  genres: string[];
  onGenreSelected: (genre: string) => void;
  className?: string;
}

export const GenreRoulette: React.FC<GenreRouletteProps> = ({
  genres = [],
  onGenreSelected,
  className = '',
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (isSpinning || !genres || genres.length === 0) return;

    setIsSpinning(true);
    HapticFeedback.buttonPress();

    // Random rotation (3-5 full spins + random offset)
    const spins = 3 + Math.random() * 2;
    const randomOffset = Math.random() * 360;
    const totalRotation = rotation + (spins * 360) + randomOffset;

    setRotation(totalRotation);

    // Calculate selected genre based on final position
    setTimeout(() => {
      const normalizedRotation = totalRotation % 360;
      const segmentSize = 360 / genres.length;
      const selectedIndex = Math.floor(normalizedRotation / segmentSize);
      const genre = genres[selectedIndex];

      setSelectedGenre(genre);
      setIsSpinning(false);
      onGenreSelected(genre);
      HapticFeedback.requestAccepted();
    }, 3000);
  };

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      {/* Roulette Wheel */}
      <div className="relative w-64 h-64">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-gold-500" />
        </div>

        {/* Wheel */}
        <div
          className="w-full h-full rounded-full border-4 border-white shadow-glow-cyan overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
          }}
        >
          {genres.map((genre, index) => {
            const segmentAngle = 360 / genres.length;
            const startAngle = index * segmentAngle;
            const colors = [
              'bg-primary-500',
              'bg-secondary-500',
              'bg-accent-500',
              'bg-spotlight-500',
              'bg-gold-500',
            ];
            const color = colors[index % colors.length];

            return (
              <div
                key={genre}
                className={`absolute w-full h-full ${color} opacity-80`}
                style={{
                  clipPath: `polygon(50% 50%, 
                    ${50 + 50 * Math.cos((startAngle * Math.PI) / 180)}% ${50 + 50 * Math.sin((startAngle * Math.PI) / 180)}%, 
                    ${50 + 50 * Math.cos(((startAngle + segmentAngle) * Math.PI) / 180)}% ${50 + 50 * Math.sin(((startAngle + segmentAngle) * Math.PI) / 180)}%)`,
                }}
              >
                <div
                  className="absolute top-1/4 left-1/2 -translate-x-1/2 text-white font-bold text-xs text-center"
                  style={{
                    transform: `rotate(${startAngle + segmentAngle / 2}deg)`,
                  }}
                >
                  {genre}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning || !genres || genres.length === 0}
        className={`
          px-8 py-3 rounded-xl
          bg-gradient-to-r from-gold-400 to-gold-600
          text-white font-bold text-lg
          shadow-glow-gold
          transition-all duration-300
          hover:scale-105
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
      </button>

      {/* Selected Genre Display */}
      {selectedGenre && !isSpinning && (
        <div className="animate-bounce-in bg-gray-900/70 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
          <p className="text-white text-center">
            <span className="text-gold-500 font-bold text-xl">{selectedGenre}</span>
            <br />
            <span className="text-sm text-gray-400">Browse {selectedGenre} songs</span>
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Daily/Weekly Challenges
 */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  progress: number;
  target: number;
  reward: string;
  expiresAt: number;
  completed: boolean;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onClaim?: () => void;
  className?: string;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onClaim,
  className = '',
}) => {
  const progress = (challenge.progress / challenge.target) * 100;
  const timeLeft = challenge.expiresAt - Date.now();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));

  return (
    <div
      className={`
        relative p-6 rounded-2xl
        ${challenge.type === 'daily' ? 'bg-gradient-to-br from-primary-500/20 to-secondary-500/20' : 'bg-gradient-to-br from-gold-500/20 to-accent-500/20'}
        border-2 ${challenge.type === 'daily' ? 'border-primary-500/50' : 'border-gold-500/50'}
        backdrop-blur-sm
        ${className}
      `}
    >
      {/* Challenge Type Badge */}
      <div className="absolute -top-3 -right-3">
        <div className={`
          px-3 py-1 rounded-full text-xs font-bold
          ${challenge.type === 'daily' ? 'bg-primary-500' : 'bg-gold-500'}
          text-white
        `}>
          {challenge.type === 'daily' ? '📅 Daily' : '🏆 Weekly'}
        </div>
      </div>

      {/* Challenge Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
          <p className="text-sm text-gray-400 mt-1">{challenge.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">
              {challenge.progress} / {challenge.target}
            </span>
            <span className="text-gray-400">{hoursLeft}h left</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${challenge.type === 'daily' ? 'bg-gradient-to-r from-primary-500 to-secondary-500' : 'bg-gradient-to-r from-gold-400 to-gold-600'} transition-all duration-500`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Reward */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            <span className="text-sm text-gray-300">{challenge.reward}</span>
          </div>

          {challenge.completed && (
            <button
              onClick={onClaim}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-lg transition-colors"
            >
              Claim Reward
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Challenges List
 */
interface ChallengesListProps {
  challenges: Challenge[];
  onClaimReward: (challengeId: string) => void;
  className?: string;
}

export const ChallengesList: React.FC<ChallengesListProps> = ({
  challenges,
  onClaimReward,
  className = '',
}) => {
  const dailyChallenges = challenges.filter(c => c.type === 'daily');
  const weeklyChallenges = challenges.filter(c => c.type === 'weekly');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Daily Challenges */}
      {dailyChallenges.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📅</span>
            <span>Daily Challenges</span>
          </h2>
          <div className="space-y-3">
            {dailyChallenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onClaim={() => onClaimReward(challenge.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Weekly Challenges */}
      {weeklyChallenges.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🏆</span>
            <span>Weekly Challenges</span>
          </h2>
          <div className="space-y-3">
            {weeklyChallenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onClaim={() => onClaimReward(challenge.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
