/**
 * Haptic Feedback System for Web
 * Uses Vibration API for tactile feedback
 */

export type HapticPattern = 
  | 'light_tap'
  | 'medium_tap'
  | 'heavy_tap'
  | 'success'
  | 'error'
  | 'notification'
  | 'beat_pulse';

interface HapticConfig {
  pattern: number | number[];
  description: string;
}

const HAPTIC_PATTERNS: Record<HapticPattern, HapticConfig> = {
  light_tap: {
    pattern: 10,
    description: 'Button press',
  },
  medium_tap: {
    pattern: 20,
    description: 'Queue position change',
  },
  heavy_tap: {
    pattern: 30,
    description: 'Request accepted',
  },
  success: {
    pattern: [20, 50, 10, 50, 10],
    description: 'Request completed (ascending)',
  },
  error: {
    pattern: [30, 100, 30],
    description: 'Veto notification (two sharp taps)',
  },
  notification: {
    pattern: 25,
    description: 'Coming up alert',
  },
  beat_pulse: {
    pattern: 15,
    description: 'Rhythm sync (repeating)',
  },
};

/**
 * Check if vibration API is supported
 */
export function isHapticSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Trigger haptic feedback
 */
export function triggerHaptic(pattern: HapticPattern): void {
  if (!isHapticSupported()) {
    return;
  }

  const config = HAPTIC_PATTERNS[pattern];
  if (!config) {
    console.warn(`Unknown haptic pattern: ${pattern}`);
    return;
  }

  try {
    navigator.vibrate(config.pattern);
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
}

/**
 * Custom haptic pattern
 */
export function triggerCustomHaptic(pattern: number | number[]): void {
  if (!isHapticSupported()) {
    return;
  }

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
}

/**
 * Stop all vibrations
 */
export function stopHaptic(): void {
  if (!isHapticSupported()) {
    return;
  }

  try {
    navigator.vibrate(0);
  } catch (error) {
    console.error('Haptic stop error:', error);
  }
}

/**
 * Beat pulse synchronization
 * Triggers haptic on beat detection
 */
let lastBeatTime = 0;
const MIN_BEAT_INTERVAL = 500; // Max 2 per second

export function triggerBeatPulse(): void {
  const now = Date.now();
  if (now - lastBeatTime < MIN_BEAT_INTERVAL) {
    return; // Throttle to avoid annoyance
  }

  lastBeatTime = now;
  triggerHaptic('beat_pulse');
}

/**
 * Haptic settings management
 */
export type HapticIntensity = 'off' | 'low' | 'medium' | 'high';

const INTENSITY_MULTIPLIERS: Record<HapticIntensity, number> = {
  off: 0,
  low: 0.5,
  medium: 1.0,
  high: 1.5,
};

let currentIntensity: HapticIntensity = 'medium';

export function setHapticIntensity(intensity: HapticIntensity): void {
  currentIntensity = intensity;
  localStorage.setItem('haptic_intensity', intensity);
}

export function getHapticIntensity(): HapticIntensity {
  const stored = localStorage.getItem('haptic_intensity');
  return (stored as HapticIntensity) || 'medium';
}

/**
 * Trigger haptic with intensity adjustment
 */
export function triggerHapticWithIntensity(pattern: HapticPattern): void {
  if (currentIntensity === 'off') {
    return;
  }

  const config = HAPTIC_PATTERNS[pattern];
  const multiplier = INTENSITY_MULTIPLIERS[currentIntensity];

  if (Array.isArray(config.pattern)) {
    const adjustedPattern = config.pattern.map((value, index) => {
      // Only adjust vibration durations (odd indices), not pauses
      return index % 2 === 0 ? Math.round(value * multiplier) : value;
    });
    triggerCustomHaptic(adjustedPattern);
  } else {
    triggerCustomHaptic(Math.round(config.pattern * multiplier));
  }
}

/**
 * React hook for haptic feedback
 */
export function useHaptic() {
  const trigger = (pattern: HapticPattern) => {
    triggerHapticWithIntensity(pattern);
  };

  const triggerCustom = (pattern: number | number[]) => {
    if (currentIntensity === 'off') return;
    triggerCustomHaptic(pattern);
  };

  return {
    trigger,
    triggerCustom,
    stop: stopHaptic,
    isSupported: isHapticSupported(),
    setIntensity: setHapticIntensity,
    getIntensity: getHapticIntensity,
  };
}

/**
 * Haptic feedback for common UI interactions
 */
export const HapticFeedback = {
  // Button interactions
  buttonPress: () => triggerHapticWithIntensity('light_tap'),
  buttonLongPress: () => triggerHapticWithIntensity('medium_tap'),
  
  // Queue interactions
  queueUpdate: () => triggerHapticWithIntensity('medium_tap'),
  requestAccepted: () => triggerHapticWithIntensity('heavy_tap'),
  requestPlaying: () => triggerHapticWithIntensity('notification'),
  requestCompleted: () => triggerHapticWithIntensity('success'),
  requestVetoed: () => triggerHapticWithIntensity('error'),
  
  // Payment interactions
  paymentSuccess: () => triggerHapticWithIntensity('success'),
  paymentError: () => triggerHapticWithIntensity('error'),
  
  // Achievement unlocked
  achievementUnlocked: () => triggerCustomHaptic([30, 100, 20, 100, 30, 100, 20]),
  
  // Milestone reached
  milestoneReached: () => triggerCustomHaptic([40, 100, 30, 100, 40, 100, 30, 100, 40]),
};
