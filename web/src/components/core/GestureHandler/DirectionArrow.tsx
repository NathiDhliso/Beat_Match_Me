import React from 'react';

interface DirectionArrowProps {
  direction: 'left' | 'right' | 'up' | 'down';
}

/**
 * Arrow hint that shows during swipe gestures
 * Indicates which direction the user is swiping
 */
export const DirectionArrow: React.FC<DirectionArrowProps> = ({ direction }) => {
  const arrowSymbol = {
    left: '←',
    right: '→',
    up: '↑',
    down: '↓',
  };

  return (
    <div 
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{
        animation: 'fadeInScale 0.2s ease-out',
        zIndex: 2,
      }}
    >
      <div 
        className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-xl border-2 border-white/50 flex items-center justify-center shadow-2xl"
        style={{
          transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        <span className="text-4xl text-white drop-shadow-lg">
          {arrowSymbol[direction]}
        </span>
      </div>
    </div>
  );
};
