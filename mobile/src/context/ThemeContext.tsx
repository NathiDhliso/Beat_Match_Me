/**
 * BEATMATCHME THEME CONTEXT - React Native
 * Manages theme mode (BeatMatchMe/Gold/Platinum) and dark/light mode
 * Ported from web/src/context/ThemeContext.tsx
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import type { ThemeMode, Theme } from '../theme/tokens';
import { getTheme, isThemeMode } from '../theme/tokens';

interface ThemeContextType {
  isDark: boolean;
  toggleDarkMode: () => void;
  setIsDark: (isDark: boolean) => void;
  
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  currentTheme: Theme;
  
  isInitialized: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_MODE_KEY = '@beatmatchme_theme_mode';
const DARK_MODE_KEY = '@beatmatchme_dark_mode';

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

  useEffect(() => {
    loadThemePreferences();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveThemePreferences();
    }
  }, [themeMode, isDark, isInitialized]);

  const loadThemePreferences = async () => {
    try {
      const savedThemeMode = await AsyncStorage.getItem(THEME_MODE_KEY);
      if (savedThemeMode && isThemeMode(savedThemeMode)) {
        setThemeModeState(savedThemeMode);
      }

      const savedDarkMode = await AsyncStorage.getItem(DARK_MODE_KEY);
      if (savedDarkMode !== null) {
        setIsDarkState(savedDarkMode === 'true');
      } else {
        const colorScheme = Appearance.getColorScheme();
        setIsDarkState(colorScheme === 'dark');
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading theme preferences:', error);
      setIsInitialized(true);
    }
  };

  const saveThemePreferences = async () => {
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, themeMode);
      await AsyncStorage.setItem(DARK_MODE_KEY, isDark.toString());
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  };

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

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}
