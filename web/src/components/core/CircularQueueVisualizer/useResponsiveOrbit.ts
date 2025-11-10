import { useState, useEffect } from 'react';

/**
 * Hook to handle responsive orbital sizing
 * Adapts orbit distance and card sizes based on screen size
 */
export const useResponsiveOrbit = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return {
    isMobile,
    orbitDistance: isMobile ? 110 : 140,
    cardSize: isMobile ? 'w-14 h-14' : 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24',
    containerSize: isMobile ? 'w-[280px] h-[280px]' : 'w-72 h-72 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem]',
    centerSize: isMobile ? 'w-20 h-20' : 'w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40',
    iconSize: isMobile ? 'w-10 h-10' : 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20',
  };
};
