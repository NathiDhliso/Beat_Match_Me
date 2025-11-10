/**
 * Haptic Feedback Hook
 * Provides vibration feedback for user interactions
 * Uses the Vibration API (supported on most mobile devices)
 */

export const useHapticFeedback = () => {
  const vibrate = (pattern: number | number[]) => {
    // Check if vibration API is supported
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn('Vibration API error:', error);
      }
    }
  };

  return {
    // Subtle tap - for light interactions
    light: () => vibrate(10),
    
    // Medium feedback - for button presses
    medium: () => vibrate(20),
    
    // Strong feedback - for important actions
    heavy: () => vibrate(30),
    
    // Success pattern - double pulse
    success: () => vibrate([10, 50, 10]),
    
    // Error pattern - strong double pulse
    error: () => vibrate([30, 100, 30]),
    
    // Swipe threshold reached
    swipeThreshold: () => vibrate(15),
    
    // Milestone celebration - triple pulse
    celebrate: () => vibrate([20, 60, 20, 60, 20]),
    
    // Long press detected
    longPress: () => vibrate(25),
    
    // Custom pattern
    custom: (pattern: number | number[]) => vibrate(pattern),
  };
};
