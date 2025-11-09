/**
 * BEATMATCHME THEME TOKENS - React Native
 * Single source of truth for all colors, gradients, and theme definitions
 * Ported from web/src/theme/tokens.ts
 */

export type ThemeMode = 'BeatMatchMe' | 'gold' | 'platinum';
export type UserTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface Theme {
  id: ThemeMode;
  name: string;
  description: string;
  
  primary: string;
  primaryDark: string;
  primaryLight: string;
  
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  
  accent: string;
  accentMuted: string;
  
  orbitalRing: string[];
  orbitalGlow: string;
  
  borderColor: string;
  shadowColor: string;
}

export const themes: Record<ThemeMode, Theme> = {
  BeatMatchMe: {
    id: 'BeatMatchMe',
    name: 'BeatMatchMe Original',
    description: 'Signature purple & pink gradients',
    
    primary: '#8B5CF6',
    primaryDark: '#7C3AED',
    primaryLight: '#A78BFA',
    
    secondary: '#EC4899',
    secondaryDark: '#DB2777',
    secondaryLight: '#F472B6',
    
    accent: '#A78BFA',
    accentMuted: '#6B7280',
    
    orbitalRing: ['#8B5CF6', '#EC4899'],
    orbitalGlow: 'rgba(139, 92, 246, 0.3)',
    
    borderColor: '#7C3AED',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
  },
  
  gold: {
    id: 'gold',
    name: 'Gold Luxury',
    description: 'Rich Egyptian gold theme',
    
    primary: '#D4AF37',
    primaryDark: '#B8860B',
    primaryLight: '#FFD700',
    
    secondary: '#F59E0B',
    secondaryDark: '#D97706',
    secondaryLight: '#FBBF24',
    
    accent: '#FBBF24',
    accentMuted: '#78350F',
    
    orbitalRing: ['#D4AF37', '#F59E0B'],
    orbitalGlow: 'rgba(212, 175, 55, 0.4)',
    
    borderColor: '#D4AF37',
    shadowColor: 'rgba(212, 175, 55, 0.5)',
  },
  
  platinum: {
    id: 'platinum',
    name: 'Platinum Elite',
    description: 'Sleek platinum theme',
    
    primary: '#E5E4E2',
    primaryDark: '#C0C0C0',
    primaryLight: '#F5F5F5',
    
    secondary: '#94A3B8',
    secondaryDark: '#64748B',
    secondaryLight: '#CBD5E1',
    
    accent: '#CBD5E1',
    accentMuted: '#475569',
    
    orbitalRing: ['#E5E4E2', '#94A3B8'],
    orbitalGlow: 'rgba(229, 228, 226, 0.3)',
    
    borderColor: '#94A3B8',
    shadowColor: 'rgba(148, 163, 184, 0.5)',
  },
};

export interface TierColor {
  hex: string;
  gradient: string[];
}

export const tierColors: Record<UserTier, TierColor> = {
  BRONZE: {
    hex: '#cd7f32',
    gradient: ['#B45309', '#EA580C'],
  },
  SILVER: {
    hex: '#c0c0c0',
    gradient: ['#9CA3AF', '#6B7280'],
  },
  GOLD: {
    hex: '#ffd700',
    gradient: ['#FACC15', '#EAB308'],
  },
  PLATINUM: {
    hex: '#e5e4e2',
    gradient: ['#CBD5E1', '#94A3B8'],
  },
};

export const tierDiscounts: Record<UserTier, number> = {
  BRONZE: 1.0,
  SILVER: 0.9,
  GOLD: 0.8,
  PLATINUM: 0.7,
};

export function getTheme(mode: ThemeMode): Theme {
  return themes[mode];
}

export function getTierColor(tier: UserTier): TierColor {
  return tierColors[tier];
}

export function getTierDiscount(tier: UserTier): number {
  return tierDiscounts[tier];
}

export function getTierBackgroundColor(tier: UserTier, opacity: number = 0.25): string {
  const tierColor = tierColors[tier];
  const hex = tierColor.hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function calculateTierPrice(basePrice: number, tier: UserTier): number {
  const multiplier = tierDiscounts[tier];
  return Math.round(basePrice * multiplier * 100) / 100;
}

export function isThemeMode(value: string): value is ThemeMode {
  return ['BeatMatchMe', 'gold', 'platinum'].includes(value);
}

export function isUserTier(value: string): value is UserTier {
  return ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].includes(value);
}

export default {
  themes,
  tierColors,
  tierDiscounts,
  getTheme,
  getTierColor,
  getTierDiscount,
  getTierBackgroundColor,
  calculateTierPrice,
  isThemeMode,
  isUserTier,
};
