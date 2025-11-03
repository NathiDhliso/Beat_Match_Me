/**
 * Gradient Color System for Emotional States
 * Based on Phase 7 and Phase 15 specifications
 */

export type EmotionalState = 
  | 'building_energy'
  | 'peak_hype'
  | 'intimate_moment'
  | 'cool_down'
  | 'euphoria';

export interface GradientConfig {
  colors: string[];
  angle: number;
  name: string;
}

export const GRADIENTS: Record<EmotionalState, GradientConfig> = {
  building_energy: {
    name: 'Building Energy',
    colors: ['#9d00ff', '#00d9ff'], // Violet → Cyan
    angle: 135,
  },
  peak_hype: {
    name: 'Peak Hype',
    colors: ['#ff006e', '#ffbe0b'], // Magenta → Gold
    angle: 135,
  },
  intimate_moment: {
    name: 'Intimate Moment',
    colors: ['#ff1744', '#ff6f00'], // Deep Rose → Warm Amber
    angle: 135,
  },
  cool_down: {
    name: 'Cool Down',
    colors: ['#02f2e2', '#80deea'], // Teal → Ice Blue
    angle: 135,
  },
  euphoria: {
    name: 'Euphoria',
    colors: ['#ff0080', '#ff8c00', '#ffd700', '#00ff00', '#00bfff', '#8a2be2'], // Rainbow
    angle: 135,
  },
};

/**
 * Generate CSS gradient string from emotional state
 */
export function getGradientCSS(state: EmotionalState, hueOffset: number = 0): string {
  const config = GRADIENTS[state];
  const colors = config.colors.map(color => {
    if (hueOffset === 0) return color;
    return adjustHue(color, hueOffset);
  });
  
  return `linear-gradient(${config.angle}deg, ${colors.join(', ')})`;
}

/**
 * Adjust hue of a hex color by offset degrees
 */
function adjustHue(hex: string, offset: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.h = (hsl.h + offset) % 360;
  if (hsl.h < 0) hsl.h += 360;
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s, l };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Get random gradient with optional hue variation
 * 1-in-50 chance for ultra-rare northern lights variant
 */
export function getRandomGradient(): { state: EmotionalState; hueOffset: number; isRare: boolean } {
  const states: EmotionalState[] = ['building_energy', 'peak_hype', 'intimate_moment', 'cool_down', 'euphoria'];
  const isRare = Math.random() < 0.02; // 1 in 50 chance
  
  if (isRare) {
    return {
      state: 'euphoria',
      hueOffset: Math.random() * 30 - 15, // ±15 degree variation
      isRare: true,
    };
  }
  
  const state = states[Math.floor(Math.random() * states.length)];
  const hueOffset = Math.random() * 20 - 10; // ±10 degree variation
  
  return { state, hueOffset, isRare: false };
}

/**
 * Interpolate between two colors
 */
export function interpolateColor(
  value: number,
  range: [number, number],
  colors: [string, string]
): string {
  const [min, max] = range;
  const [color1, color2] = colors;
  
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return color1;
  
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * normalized);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * normalized);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * normalized);
  
  return rgbToHex(r, g, b);
}
