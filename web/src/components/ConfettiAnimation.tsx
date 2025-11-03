import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
}

interface ConfettiAnimationProps {
  trigger: boolean;
  duration?: number;
  count?: number;
  colors?: string[];
}

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  trigger,
  duration = 3000,
  count = 50,
  colors = ['#00d9ff', '#9d00ff', '#ff006e', '#ffd700', '#ffbe0b'],
}) => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (trigger) {
      const pieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        velocityX: (Math.random() - 0.5) * 2,
        velocityY: Math.random() * 2 + 1,
        rotationSpeed: (Math.random() - 0.5) * 10,
      }));

      setConfetti(pieces);

      setTimeout(() => {
        setConfetti([]);
      }, duration);
    }
  }, [trigger, count, duration, colors]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animation: `confetti ${duration}ms ease-out forwards`,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Success animation with confetti and checkmark
 */
interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  show,
  message = 'Success!',
  onComplete,
}) => {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <>
      <ConfettiAnimation trigger={show} />
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="animate-bounce-in bg-gray-900/70 backdrop-blur-xl rounded-3xl p-8 shadow-glass-lg border border-white/10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center animate-scale-in">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white">{message}</p>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Milestone celebration animation
 */
interface MilestoneCelebrationProps {
  milestone: number;
  show: boolean;
  onComplete?: () => void;
}

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  milestone,
  show,
  onComplete,
}) => {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <>
      <ConfettiAnimation trigger={show} count={100} duration={4000} />
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="animate-bounce-in">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gold-500 rounded-full blur-3xl opacity-50 animate-pulse" />
            
            {/* Main content */}
            <div className="relative bg-gradient-to-br from-gold-400 to-gold-600 rounded-3xl p-12 shadow-glow-gold">
              <div className="flex flex-col items-center gap-6">
                <div className="text-6xl animate-float">🎉</div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-white mb-2">
                    R{milestone.toLocaleString()}
                  </p>
                  <p className="text-xl text-gold-100">
                    Milestone Reached!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
