import React from 'react';
import { Music, DollarSign } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useAnimatedCounter } from '../../../hooks/useAnimatedCounter';
import { Counter } from './Counter';
import type { StatusArcProps } from './types';

/**
 * Status Arc - Wraps around screen edges with revenue and request counters
 * Phase 8: Memoized - only re-renders when revenue or requestCount change
 */
export const StatusArc: React.FC<StatusArcProps> = React.memo(({ revenue, requestCount }) => {
  const { currentTheme } = useTheme();
  
  // Animated counters for smooth number transitions
  const animatedRevenue = useAnimatedCounter(revenue, { decimals: 2, duration: 600 });
  const animatedRequests = useAnimatedCounter(requestCount, { duration: 500 });

  return (
    <>
      {/* Top Arc - More prominent with glow */}
      <div className="fixed top-0 left-0 right-0 h-1 sm:h-1.5 z-40">
        <div 
          className="h-full animate-pulse-glow"
          style={{
            background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.secondary}, ${currentTheme.accent}, ${currentTheme.secondary}, ${currentTheme.primary})`,
            boxShadow: `0 0 20px ${currentTheme.primary}80, 0 0 40px ${currentTheme.secondary}60`
          }}
        />
      </div>

      {/* Counters - Top Left Side by Side */}
      <div className="fixed top-2 sm:top-4 md:top-6 left-2 sm:left-4 md:left-6 z-40 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-4">
        <Counter 
          value={parseFloat(animatedRequests.formattedValue)}
          icon={<Music className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-pulse" />}
          color={currentTheme.primary}
        />
        
        <Counter 
          value={parseFloat(animatedRevenue.formattedValue)}
          icon={<DollarSign className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-pulse" />}
          color={currentTheme.accent}
          prefix="R"
        />
      </div>

      {/* Bottom Arc - More prominent with glow */}
      <div className="fixed bottom-0 left-0 right-0 h-1 sm:h-1.5 z-40">
        <div 
          className="h-full animate-pulse-glow"
          style={{
            background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.secondary}, ${currentTheme.accent}, ${currentTheme.secondary}, ${currentTheme.primary})`,
            boxShadow: `0 0 20px ${currentTheme.primary}80, 0 0 40px ${currentTheme.secondary}60`
          }}
        />
      </div>
    </>
  );
});

StatusArc.displayName = 'StatusArc';
