/**
 * THEME CLASS MIGRATION UTILITY
 * Helper functions to convert hardcoded purple/pink colors to theme tokens
 * 
 * Usage:
 * import { migrateGradient, migrateColor, migrateHoverState } from '@/utils/themeClassMigration';
 * 
 * // Before: className="bg-gradient-to-r from-purple-600 to-pink-600"
 * // After: className={migrateGradient()}
 */

import { useThemeClasses } from '../context/ThemeContext';

/**
 * Mapping of hardcoded Tailwind classes to theme-aware equivalents
 */
export const colorMigrationMap = {
  // Purple colors (original primary)
  'text-purple-600': 'var(--theme-primary)',
  'text-purple-700': 'var(--theme-primary-dark)',
  'text-purple-400': 'var(--theme-primary-light)',
  'bg-purple-600': 'var(--theme-primary)',
  'bg-purple-700': 'var(--theme-primary-dark)',
  'bg-purple-400': 'var(--theme-primary-light)',
  'border-purple-600': 'var(--theme-primary)',
  'border-purple-700': 'var(--theme-primary-dark)',
  
  // Pink colors (original secondary)
  'text-pink-600': 'var(--theme-secondary)',
  'text-pink-700': 'var(--theme-secondary-dark)',
  'text-pink-400': 'var(--theme-secondary-light)',
  'bg-pink-600': 'var(--theme-secondary)',
  'bg-pink-700': 'var(--theme-secondary-dark)',
  'bg-pink-400': 'var(--theme-secondary-light)',
  'border-pink-600': 'var(--theme-secondary)',
  'border-pink-700': 'var(--theme-secondary-dark)',
  
  // Gradients
  'from-purple-600': 'from-[var(--theme-primary)]',
  'to-pink-600': 'to-[var(--theme-secondary)]',
  'from-purple-700': 'from-[var(--theme-primary-dark)]',
  'to-pink-700': 'to-[var(--theme-secondary-dark)]',
  'from-purple-500': 'from-[var(--theme-primary)]',
  'to-pink-500': 'to-[var(--theme-secondary)]',
  
  // Background gradients with opacity
  'from-purple-600/20': 'from-[var(--theme-primary)]/20',
  'to-pink-600/20': 'to-[var(--theme-secondary)]/20',
  
  // Hover states
  'hover:bg-purple-600': 'hover:bg-[var(--theme-primary)]',
  'hover:bg-purple-700': 'hover:bg-[var(--theme-primary-dark)]',
  'hover:text-purple-600': 'hover:text-[var(--theme-primary)]',
  'hover:from-purple-700': 'hover:from-[var(--theme-primary-dark)]',
  'hover:to-pink-700': 'hover:to-[var(--theme-secondary-dark)]',
};

/**
 * Convert hardcoded color class to theme-aware CSS variable
 * @param hardcodedClass - Original Tailwind class (e.g., 'text-purple-600')
 * @returns Theme-aware class using CSS variables
 */
export function migrateColor(hardcodedClass: string): string {
  return colorMigrationMap[hardcodedClass as keyof typeof colorMigrationMap] || hardcodedClass;
}

/**
 * Convert multiple hardcoded classes to theme-aware equivalents
 * @param classNames - Space-separated class names
 * @returns Migrated class names
 */
export function migrateClasses(classNames: string): string {
  return classNames
    .split(' ')
    .map(cls => migrateColor(cls))
    .join(' ');
}

/**
 * Hook to get theme-aware gradient classes
 * Replaces: "bg-gradient-to-r from-purple-600 to-pink-600"
 */
export function useThemeGradient(type: 'primary' | 'hover' | 'card' | 'background' = 'primary') {
  const { gradientPrimary, gradientHover, gradientCard, gradientBackground } = useThemeClasses();
  
  const gradientMap = {
    primary: gradientPrimary,
    hover: gradientHover,
    card: gradientCard,
    background: gradientBackground,
  };
  
  return gradientMap[type];
}

/**
 * Hook to get theme-aware button classes
 * Combines gradient, hover, and common button styles
 */
export function useThemeButton(variant: 'primary' | 'secondary' | 'outline' = 'primary') {
  const { gradientPrimary, gradientHover, textPrimary, borderPrimary } = useThemeClasses();
  
  const baseClasses = 'px-6 py-3 rounded-xl font-medium transition-all shadow-lg';
  
  const variantClasses = {
    primary: `${gradientPrimary} text-white hover:${gradientHover} hover:shadow-xl`,
    secondary: `bg-white/10 text-white hover:bg-white/20 border border-white/20`,
    outline: `border-2 ${borderPrimary} ${textPrimary} hover:bg-white/5`,
  };
  
  return `${baseClasses} ${variantClasses[variant]}`;
}

/**
 * Hook to get theme-aware card classes
 * Replaces hardcoded purple/pink cards with theme gradient
 */
export function useThemeCard(variant: 'default' | 'elevated' | 'gradient' = 'default') {
  const { gradientCard } = useThemeClasses();
  
  const variantClasses = {
    default: 'bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700',
    elevated: 'bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-600 shadow-xl',
    gradient: `${gradientCard} backdrop-blur-sm rounded-2xl p-6 border border-gray-700`,
  };
  
  return variantClasses[variant];
}

/**
 * Convert inline hex colors to theme CSS variables
 * @param style - React style object with hardcoded colors
 * @returns Style object with CSS variables
 */
export function migrateInlineStyles(style: React.CSSProperties): React.CSSProperties {
  const migratedStyle = { ...style };
  
  // Map of hardcoded hex colors to CSS variables
  const hexToVar = {
    '#8B5CF6': 'var(--theme-primary)',           // Purple-600
    '#7C3AED': 'var(--theme-primary-dark)',      // Purple-700
    '#A78BFA': 'var(--theme-primary-light)',     // Purple-400
    '#EC4899': 'var(--theme-secondary)',         // Pink-600
    '#DB2777': 'var(--theme-secondary-dark)',    // Pink-700
    '#F472B6': 'var(--theme-secondary-light)',   // Pink-400
  };
  
  // Migrate background colors
  if (migratedStyle.backgroundColor && typeof migratedStyle.backgroundColor === 'string') {
    const upperHex = migratedStyle.backgroundColor.toUpperCase();
    migratedStyle.backgroundColor = hexToVar[upperHex as keyof typeof hexToVar] || migratedStyle.backgroundColor;
  }
  
  // Migrate text colors
  if (migratedStyle.color && typeof migratedStyle.color === 'string') {
    const upperHex = migratedStyle.color.toUpperCase();
    migratedStyle.color = hexToVar[upperHex as keyof typeof hexToVar] || migratedStyle.color;
  }
  
  // Migrate border colors
  if (migratedStyle.borderColor && typeof migratedStyle.borderColor === 'string') {
    const upperHex = migratedStyle.borderColor.toUpperCase();
    migratedStyle.borderColor = hexToVar[upperHex as keyof typeof hexToVar] || migratedStyle.borderColor;
  }
  
  // Migrate gradients in background
  if (migratedStyle.background && typeof migratedStyle.background === 'string') {
    let gradient = migratedStyle.background;
    Object.entries(hexToVar).forEach(([hex, cssVar]) => {
      gradient = gradient.replace(new RegExp(hex, 'gi'), cssVar);
    });
    migratedStyle.background = gradient;
  }
  
  return migratedStyle;
}

/**
 * Utility to find and log hardcoded purple/pink colors in a string
 * Useful for migration auditing
 * @param className - Class names to check
 * @returns Array of hardcoded colors found
 */
export function auditHardcodedColors(className: string): string[] {
  const hardcodedPatterns = [
    /purple-\d{3}/g,
    /pink-\d{3}/g,
    /#[0-9A-F]{6}/gi,
  ];
  
  const found: string[] = [];
  
  hardcodedPatterns.forEach(pattern => {
    const matches = className.match(pattern);
    if (matches) {
      found.push(...matches);
    }
  });
  
  return found;
}

/**
 * Generate migration report for a component's classes
 * @param classNames - Current class names
 * @returns Migration suggestions
 */
export function generateMigrationReport(classNames: string): {
  original: string;
  migrated: string;
  hardcodedColors: string[];
  needsMigration: boolean;
} {
  const hardcodedColors = auditHardcodedColors(classNames);
  const migrated = migrateClasses(classNames);
  
  return {
    original: classNames,
    migrated,
    hardcodedColors,
    needsMigration: hardcodedColors.length > 0,
  };
}

/**
 * Theme-aware shadow utility
 * Returns shadow class that adapts to current theme
 */
export function useThemeShadow(size: 'sm' | 'md' | 'lg' | 'xl' = 'md') {
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };
  
  // These use CSS variables defined in theme.css
  return shadowClasses[size];
}

/**
 * Batch migration utility for entire component
 * Scans JSX string and provides migration suggestions
 * @param jsxString - Component JSX as string
 * @returns Migration report
 */
export function migrateComponentClasses(jsxString: string): {
  totalHardcodedColors: number;
  suggestions: Array<{ line: number; original: string; suggested: string }>;
} {
  const lines = jsxString.split('\n');
  const suggestions: Array<{ line: number; original: string; suggested: string }> = [];
  let totalHardcodedColors = 0;
  
  lines.forEach((line, index) => {
    const classNameMatch = line.match(/className=["']([^"']+)["']/);
    if (classNameMatch) {
      const className = classNameMatch[1];
      const report = generateMigrationReport(className);
      
      if (report.needsMigration) {
        totalHardcodedColors += report.hardcodedColors.length;
        suggestions.push({
          line: index + 1,
          original: report.original,
          suggested: report.migrated,
        });
      }
    }
  });
  
  return { totalHardcodedColors, suggestions };
}

/**
 * Helper to convert tier colors to theme-aware classes
 * @param tier - User tier
 * @returns Theme-aware tier classes
 */
export function getThemeTierClasses(tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'): string {
  const tierClasses = {
    BRONZE: 'bg-gradient-to-r from-amber-700 to-orange-600 text-amber-100',
    SILVER: 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-900',
    GOLD: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900',
    PLATINUM: 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-900',
  };
  
  return tierClasses[tier];
}

// ============================================
// MIGRATION PATTERNS FOR COMMON USE CASES
// ============================================

/**
 * Common migration patterns with examples
 */
export const migrationPatterns = {
  // Button gradients
  primaryButton: {
    before: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    after: 'Use useThemeButton() hook or themeClasses.gradientPrimary',
  },
  
  // Card backgrounds
  gradientCard: {
    before: 'bg-gradient-to-br from-purple-600/20 to-pink-600/20',
    after: 'Use themeClasses.gradientCard',
  },
  
  // Text colors
  primaryText: {
    before: 'text-purple-600',
    after: 'text-[var(--theme-primary)] or themeClasses.textPrimary',
  },
  
  // Borders
  primaryBorder: {
    before: 'border-purple-600',
    after: 'border-[var(--theme-primary)] or themeClasses.borderPrimary',
  },
  
  // Inline styles
  inlineGradient: {
    before: "style={{ background: 'linear-gradient(to right, #8B5CF6, #EC4899)' }}",
    after: "style={themeStyles.gradient} or style={{ background: 'var(--theme-gradient)' }}",
  },
};

export default {
  migrateColor,
  migrateClasses,
  migrateInlineStyles,
  useThemeGradient,
  useThemeButton,
  useThemeCard,
  useThemeShadow,
  auditHardcodedColors,
  generateMigrationReport,
  migrateComponentClasses,
  getThemeTierClasses,
  migrationPatterns,
};
