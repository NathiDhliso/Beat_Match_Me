/**
 * BEATMATCHME THEME TOKENS
 * Single source of truth for all colors, gradients, and theme definitions
 * 
 * Usage:
 * import { themes, getTheme, tierColors } from '@/theme/tokens';
 * const theme = getTheme('gold'); // or 'BeatMatchMe' or 'platinum'
 */

export type ThemeMode = 'BeatMatchMe' | 'gold' | 'platinum';
export type UserTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

// ============================================
// 3-THEME SYSTEM FOR ELITE DJs
// ============================================

export interface Theme {
  id: ThemeMode;
  name: string;
  description: string;
  
  // Primary Colors
  primary: string;
  primaryDark: string;
  primaryLight: string;
  
  // Secondary Colors
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  
  // Gradients (Tailwind classes)
  gradientPrimary: string;
  gradientHover: string;
  gradientBackground: string;
  gradientCard: string;
  
  // CSS Variables (for inline styles when Tailwind classes can't be used)
  cssVars: Record<string, string>;
  
  // Accent Colors
  accent: string;
  accentMuted: string;
  
  // Orbital Interface
  orbitalRing: string;
  orbitalGlow: string;
  
  // Border & Shadow
  borderColor: string;
  shadowColor: string;
}

export const themes: Record<ThemeMode, Theme> = {
  BeatMatchMe: {
    id: 'BeatMatchMe',
    name: 'BeatMatchMe Original',
    description: 'Signature purple & pink gradients for the original BeatMatchMe experience',
    
    // Primary Colors
    primary: '#8B5CF6',           // Purple-600
    primaryDark: '#7C3AED',       // Purple-700
    primaryLight: '#A78BFA',      // Purple-400
    
    // Secondary Colors
    secondary: '#EC4899',         // Pink-600
    secondaryDark: '#DB2777',     // Pink-700
    secondaryLight: '#F472B6',    // Pink-400
    
    // Gradients (Tailwind classes)
    gradientPrimary: 'from-purple-600 to-pink-600',
    gradientHover: 'from-purple-700 to-pink-700',
    gradientBackground: 'from-gray-900 via-purple-900 to-gray-900',
    gradientCard: 'from-purple-600/20 to-pink-600/20',
    
    // CSS Variables (for inline styles)
    cssVars: {
      '--theme-primary': '#8B5CF6',
      '--theme-primary-dark': '#7C3AED',
      '--theme-primary-light': '#A78BFA',
      '--theme-secondary': '#EC4899',
      '--theme-secondary-dark': '#DB2777',
      '--theme-secondary-light': '#F472B6',
      '--theme-gradient': 'linear-gradient(to right, #8B5CF6, #EC4899)',
      '--theme-gradient-bg': 'linear-gradient(to bottom right, #111827, #581c87, #0a0a0a)',
      '--theme-orbital-glow': 'rgba(139, 92, 246, 0.3)',
    },
    
    // Accent Colors
    accent: '#A78BFA',            // Purple-400 (text highlights)
    accentMuted: '#6B7280',       // Gray-500 (disabled states)
    
    // Orbital Interface
    orbitalRing: 'from-purple-500 to-pink-500',
    orbitalGlow: 'rgba(139, 92, 246, 0.3)',
    
    // Border & Shadow
    borderColor: '#7C3AED',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
  },
  
  gold: {
    id: 'gold',
    name: 'Gold Luxury',
    description: 'Rich Egyptian gold theme for elite venues and luxury events',
    
    // Primary Colors
    primary: '#D4AF37',           // Rich Gold
    primaryDark: '#B8860B',       // Dark Goldenrod
    primaryLight: '#FFD700',      // Gold
    
    // Secondary Colors
    secondary: '#F59E0B',         // Amber-500
    secondaryDark: '#D97706',     // Amber-600
    secondaryLight: '#FBBF24',    // Amber-400
    
    // Gradients (Tailwind classes)
    gradientPrimary: 'from-yellow-500 to-amber-600',
    gradientHover: 'from-yellow-600 to-amber-700',
    gradientBackground: 'from-gray-900 via-amber-900 to-gray-900',
    gradientCard: 'from-yellow-500/20 to-amber-600/20',
    
    // CSS Variables
    cssVars: {
      '--theme-primary': '#D4AF37',
      '--theme-primary-dark': '#B8860B',
      '--theme-primary-light': '#FFD700',
      '--theme-secondary': '#F59E0B',
      '--theme-secondary-dark': '#D97706',
      '--theme-secondary-light': '#FBBF24',
      '--theme-gradient': 'linear-gradient(to right, #D4AF37, #F59E0B)',
      '--theme-gradient-bg': 'linear-gradient(to bottom right, #111827, #78350f, #0a0a0a)',
      '--theme-orbital-glow': 'rgba(212, 175, 55, 0.4)',
    },
    
    // Accent Colors
    accent: '#FBBF24',            // Amber-400 (text highlights)
    accentMuted: '#78350F',       // Amber-900 (disabled states)
    
    // Orbital Interface
    orbitalRing: 'from-yellow-500 to-amber-500',
    orbitalGlow: 'rgba(212, 175, 55, 0.4)',
    
    // Border & Shadow
    borderColor: '#D4AF37',
    shadowColor: 'rgba(212, 175, 55, 0.5)',
  },
  
  platinum: {
    id: 'platinum',
    name: 'Platinum Elite',
    description: 'Sleek platinum theme for international DJs and premium experiences',
    
    // Primary Colors
    primary: '#E5E4E2',           // Platinum
    primaryDark: '#C0C0C0',       // Silver
    primaryLight: '#F5F5F5',      // Whitesmoke
    
    // Secondary Colors
    secondary: '#94A3B8',         // Slate-400
    secondaryDark: '#64748B',     // Slate-500
    secondaryLight: '#CBD5E1',    // Slate-300
    
    // Gradients (Tailwind classes)
    gradientPrimary: 'from-gray-300 to-slate-400',
    gradientHover: 'from-gray-400 to-slate-500',
    gradientBackground: 'from-gray-900 via-slate-900 to-gray-900',
    gradientCard: 'from-gray-300/20 to-slate-400/20',
    
    // CSS Variables
    cssVars: {
      '--theme-primary': '#E5E4E2',
      '--theme-primary-dark': '#C0C0C0',
      '--theme-primary-light': '#F5F5F5',
      '--theme-secondary': '#94A3B8',
      '--theme-secondary-dark': '#64748B',
      '--theme-secondary-light': '#CBD5E1',
      '--theme-gradient': 'linear-gradient(to right, #E5E4E2, #94A3B8)',
      '--theme-gradient-bg': 'linear-gradient(to bottom right, #111827, #1e293b, #0a0a0a)',
      '--theme-orbital-glow': 'rgba(229, 228, 226, 0.3)',
    },
    
    // Accent Colors
    accent: '#CBD5E1',            // Slate-300 (text highlights)
    accentMuted: '#475569',       // Slate-600 (disabled states)
    
    // Orbital Interface
    orbitalRing: 'from-gray-300 to-slate-300',
    orbitalGlow: 'rgba(229, 228, 226, 0.3)',
    
    // Border & Shadow
    borderColor: '#94A3B8',
    shadowColor: 'rgba(148, 163, 184, 0.5)',
  },
};

// ============================================
// TIER COLORS (SINGLE SOURCE OF TRUTH)
// Replaces all 3 different TIER_COLORS definitions across the codebase
// ============================================

export interface TierColor {
  hex: string;
  gradient: string;
  tailwind: string;
  cssVar: string;
}

export const tierColors: Record<UserTier, TierColor> = {
  BRONZE: {
    hex: '#cd7f32',
    gradient: 'from-amber-700 to-orange-600',
    tailwind: 'bg-amber-700 text-amber-100',
    cssVar: '--tier-bronze',
  },
  SILVER: {
    hex: '#c0c0c0',
    gradient: 'from-gray-400 to-gray-500',
    tailwind: 'bg-gray-400 text-gray-900',
    cssVar: '--tier-silver',
  },
  GOLD: {
    hex: '#ffd700',
    gradient: 'from-yellow-400 to-yellow-500',
    tailwind: 'bg-yellow-400 text-yellow-900',
    cssVar: '--tier-gold',
  },
  PLATINUM: {
    hex: '#e5e4e2',
    gradient: 'from-slate-300 to-slate-400',
    tailwind: 'bg-slate-300 text-slate-900',
    cssVar: '--tier-platinum',
  },
};

// ============================================
// TIER DISCOUNT MULTIPLIERS
// Centralized pricing logic
// ============================================

export const tierDiscounts: Record<UserTier, number> = {
  BRONZE: 1.0,   // No discount
  SILVER: 0.9,   // 10% discount
  GOLD: 0.8,     // 20% discount
  PLATINUM: 0.7, // 30% discount
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get theme configuration by mode
 * @param mode - 'BeatMatchMe' | 'gold' | 'platinum'
 * @returns Theme configuration object
 */
export function getTheme(mode: ThemeMode): Theme {
  return themes[mode];
}

/**
 * Get tier color configuration
 * @param tier - User tier level
 * @returns Tier color configuration
 */
export function getTierColor(tier: UserTier): TierColor {
  return tierColors[tier];
}

/**
 * Get tier discount multiplier
 * @param tier - User tier level
 * @returns Discount multiplier (1.0 = no discount, 0.7 = 30% off)
 */
export function getTierDiscount(tier: UserTier): number {
  return tierDiscounts[tier];
}

/**
 * Apply theme CSS variables to document root
 * Call this when theme changes to update CSS custom properties
 * @param mode - Theme mode to apply
 */
export function applyThemeCSSVars(mode: ThemeMode): void {
  const theme = themes[mode];
  Object.entries(theme.cssVars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  
  // Also set data-theme attribute for CSS selectors
  document.documentElement.setAttribute('data-theme', mode);
}

/**
 * Generate Tailwind class string for theme-aware components
 * @param mode - Theme mode
 * @param type - Type of styling to apply
 * @returns Tailwind class string
 */
export function themeClass(
  mode: ThemeMode,
  type: 'gradient' | 'gradient-hover' | 'bg' | 'text' | 'border' | 'shadow'
): string {
  const theme = themes[mode];
  
  const classMap = {
    'gradient': `bg-gradient-to-r ${theme.gradientPrimary}`,
    'gradient-hover': `bg-gradient-to-r ${theme.gradientHover}`,
    'bg': `bg-[${theme.primary}]`,
    'text': `text-[${theme.primary}]`,
    'border': `border-[${theme.primary}]`,
    'shadow': `shadow-[0_4px_12px_${theme.shadowColor}]`,
  };
  
  return classMap[type];
}

/**
 * Get tier-based background color with opacity
 * Useful for tier badges and highlights
 * @param tier - User tier
 * @param opacity - Opacity value (0-1), defaults to 0.25
 * @returns CSS color string with opacity
 */
export function getTierBackgroundColor(tier: UserTier, opacity: number = 0.25): string {
  const tierColor = tierColors[tier];
  // Convert hex to rgba
  const hex = tierColor.hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Calculate final price after tier discount
 * @param basePrice - Base price before discount
 * @param tier - User tier
 * @returns Final price after tier discount
 */
export function calculateTierPrice(basePrice: number, tier: UserTier): number {
  const multiplier = tierDiscounts[tier];
  return Math.round(basePrice * multiplier * 100) / 100; // Round to 2 decimals
}

/**
 * Get theme-aware gradient CSS for inline styles
 * @param mode - Theme mode
 * @returns CSS gradient string
 */
export function getThemeGradient(mode: ThemeMode): string {
  return themes[mode].cssVars['--theme-gradient'];
}

/**
 * Get all theme modes for theme switcher
 * @returns Array of theme mode objects with display info
 */
export function getAllThemes(): Array<{ id: ThemeMode; name: string; description: string }> {
  return Object.values(themes).map(theme => ({
    id: theme.id,
    name: theme.name,
    description: theme.description,
  }));
}

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Check if a string is a valid theme mode
 */
export function isThemeMode(value: string): value is ThemeMode {
  return ['BeatMatchMe', 'gold', 'platinum'].includes(value);
}

/**
 * Check if a string is a valid user tier
 */
export function isUserTier(value: string): value is UserTier {
  return ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].includes(value);
}

// ============================================
// DEFAULT EXPORTS
// ============================================

export default {
  themes,
  tierColors,
  tierDiscounts,
  getTheme,
  getTierColor,
  getTierDiscount,
  applyThemeCSSVars,
  themeClass,
  getTierBackgroundColor,
  calculateTierPrice,
  getThemeGradient,
  getAllThemes,
  isThemeMode,
  isUserTier,
};
