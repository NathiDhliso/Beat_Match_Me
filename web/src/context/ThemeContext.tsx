/**
 * BEATMATCHME THEME CONTEXT
 * Manages theme mode (BeatMatchMe/Gold/Platinum) and dark/light mode switching
 * 
 * Usage:
 * const { themeMode, setThemeMode, isDark, toggleDarkMode, currentTheme } = useTheme();
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ThemeMode, Theme } from '../theme/tokens';
import { 
  getTheme, 
  applyThemeCSSVars,
  isThemeMode 
} from '../theme/tokens';

interface ThemeContextType {
  // Dark/Light Mode
  isDark: boolean;
  toggleDarkMode: () => void;
  setIsDark: (isDark: boolean) => void;
  
  // Theme Mode (BeatMatchMe/Gold/Platinum)
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  currentTheme: Theme;
  
  // Utility
  isInitialized: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Local storage keys
const THEME_MODE_KEY = 'beatmatchme-theme-mode';
const DARK_MODE_KEY = 'beatmatchme-dark-mode';

interface ThemeProviderProps {
  children: ReactNode;
  defaultThemeMode?: ThemeMode;
  defaultDarkMode?: boolean;
}

export function ThemeProvider({ 
  children, 
  defaultThemeMode = 'BeatMatchMe',
  defaultDarkMode = true 
}: ThemeProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultThemeMode);
  const [isDark, setIsDarkState] = useState<boolean>(defaultDarkMode);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      // Load theme mode
      const savedThemeMode = localStorage.getItem(THEME_MODE_KEY);
      if (savedThemeMode && isThemeMode(savedThemeMode)) {
        setThemeModeState(savedThemeMode);
      }

      // Load dark mode
      const savedDarkMode = localStorage.getItem(DARK_MODE_KEY);
      if (savedDarkMode !== null) {
        setIsDarkState(savedDarkMode === 'true');
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkState(prefersDark);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading theme preferences:', error);
      setIsInitialized(true);
    }
  }, []);

  // Apply theme changes to DOM
  useEffect(() => {
    if (!isInitialized) return;

    try {
      // Apply CSS variables for current theme
      applyThemeCSSVars(themeMode);

      // Apply dark/light mode class
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }

      // Save to localStorage
      localStorage.setItem(THEME_MODE_KEY, themeMode);
      localStorage.setItem(DARK_MODE_KEY, isDark.toString());
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [themeMode, isDark, isInitialized]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const setIsDark = (dark: boolean) => {
    setIsDarkState(dark);
  };

  const toggleDarkMode = () => {
    setIsDarkState(prev => !prev);
  };

  const currentTheme = getTheme(themeMode);

  const value: ThemeContextType = {
    isDark,
    toggleDarkMode,
    setIsDark,
    themeMode,
    setThemeMode,
    currentTheme,
    isInitialized,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * Hook to get theme-aware CSS classes
 * Returns className strings based on current theme
 */
export function useThemeClasses() {
  const { currentTheme, themeMode } = useTheme();
  
  return {
    // Gradient classes
    gradientPrimary: `bg-gradient-to-r ${currentTheme.gradientPrimary}`,
    gradientHover: `bg-gradient-to-r ${currentTheme.gradientHover}`,
    gradientBackground: `bg-gradient-to-br ${currentTheme.gradientBackground}`,
    gradientCard: `bg-gradient-to-br ${currentTheme.gradientCard}`,
    
    // Background classes
    bgPrimary: `bg-[${currentTheme.primary}]`,
    bgSecondary: `bg-[${currentTheme.secondary}]`,
    
    // Text classes
    textPrimary: `text-[${currentTheme.primary}]`,
    textSecondary: `text-[${currentTheme.secondary}]`,
    textAccent: `text-[${currentTheme.accent}]`,
    
    // Border classes
    borderPrimary: `border-[${currentTheme.borderColor}]`,
    
    // Orbital classes
    orbitalRing: `bg-gradient-to-r ${currentTheme.orbitalRing}`,
    
    // Theme mode
    themeMode,
    currentTheme,
  };
}

/**
 * Hook to get theme-aware inline styles
 * Use when Tailwind classes are not sufficient
 */
export function useThemeStyles() {
  const { currentTheme } = useTheme();
  
  return {
    gradient: {
      background: currentTheme.cssVars['--theme-gradient'],
    },
    gradientBackground: {
      background: currentTheme.cssVars['--theme-gradient-bg'],
    },
    primary: {
      color: currentTheme.primary,
    },
    primaryBg: {
      backgroundColor: currentTheme.primary,
    },
    secondary: {
      color: currentTheme.secondary,
    },
    secondaryBg: {
      backgroundColor: currentTheme.secondary,
    },
    border: {
      borderColor: currentTheme.borderColor,
    },
    shadow: {
      boxShadow: `0 4px 12px ${currentTheme.shadowColor}`,
    },
    orbitalGlow: {
      boxShadow: `0 0 20px ${currentTheme.orbitalGlow}`,
    },
  };
}

export default ThemeContext;
