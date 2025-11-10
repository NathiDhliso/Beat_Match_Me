import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

export interface CelebrationEffectProps {
  /** Trigger celebration */
  isActive: boolean;
  /** Type of milestone achieved */
  milestone: 'revenue' | 'requests' | 'custom';
  /** Milestone value for display */
  value?: number;
  /** Custom message to display */
  message?: string;
  /** Duration in milliseconds */
  duration?: number;
  /** Callback when celebration ends */
  onComplete?: () => void;
}

/**
 * Celebration Effect Component
 * Shows confetti and milestone message for achievements
 * 
 * @example
 * ```tsx
 * <CelebrationEffect
 *   isActive={revenue >= 1000}
 *   milestone="revenue"
 *   value={1000}
 *   duration={5000}
 *   onComplete={() => setShowCelebration(false)}
 * />
 * ```
 */
export const CelebrationEffect: React.FC<CelebrationEffectProps> = ({
  isActive,
  milestone,
  value,
  message,
  duration = 5000,
  onComplete,
}) => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [numberOfPieces, setNumberOfPieces] = useState(200);
  const haptic = useHapticFeedback();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      haptic.celebrate();
      
      // Gradually reduce confetti pieces
      const interval = setInterval(() => {
        setNumberOfPieces((prev) => Math.max(0, prev - 20));
      }, 500);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        onComplete?.();
      }, duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isActive, duration, onComplete, haptic]);

  if (!isActive) return null;

  const getMilestoneMessage = () => {
    if (message) return message;
    
    switch (milestone) {
      case 'revenue':
        return `🎉 R${value} Revenue Milestone! 🎉`;
      case 'requests':
        return `🎵 ${value} Requests Accepted! 🎵`;
      default:
        return '🎊 Achievement Unlocked! 🎊';
    }
  };

  const getMilestoneColor = () => {
    switch (milestone) {
      case 'revenue':
        return 'from-green-500 to-emerald-600';
      case 'requests':
        return 'from-purple-500 to-pink-600';
      default:
        return 'from-blue-500 to-cyan-600';
    }
  };

  return (
    <>
      {/* Confetti */}
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        numberOfPieces={numberOfPieces}
        recycle={false}
        colors={['#9d00ff', '#00d9ff', '#ff006e', '#ffd700', '#ff1744', '#00ff00']}
        gravity={0.3}
      />

      {/* Milestone Message */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="animate-bounce-in">
          <div
            className={`bg-gradient-to-r ${getMilestoneColor()} text-white px-8 py-6 rounded-2xl shadow-2xl text-center`}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-2 animate-glow">
              {getMilestoneMessage()}
            </h2>
            {milestone === 'revenue' && (
              <p className="text-xl md:text-2xl opacity-90">
                Keep the momentum going! 💰
              </p>
            )}
            {milestone === 'requests' && (
              <p className="text-xl md:text-2xl opacity-90">
                The crowd loves you! 🔥
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
