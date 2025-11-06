import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const themes = {
  beatbyme: {
    name: 'BeatByMe',
    background: ['#1f2937', '#111827'],
    card: '#374151',
    cardSecondary: '#1f2937',
    text: '#ffffff',
    textSecondary: '#9ca3af',
    textTertiary: '#6b7280',
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#a855f7',
    gradient: ['#8b5cf6', '#ec4899'],
    success: '#10b981',
    warning: '#fbbf24',
    error: '#ef4444',
    border: '#374151',
    shadow: '#000000',
  },
  gold: {
    name: 'Gold',
    background: ['#1f2937', '#111827'],
    card: '#374151',
    cardSecondary: '#1f2937',
    text: '#ffffff',
    textSecondary: '#9ca3af',
    textTertiary: '#6b7280',
    primary: '#d4af37',
    secondary: '#f59e0b',
    accent: '#fbbf24',
    gradient: ['#d4af37', '#f59e0b'],
    success: '#10b981',
    warning: '#fbbf24',
    error: '#ef4444',
    border: '#374151',
    shadow: '#000000',
  },
  platinum: {
    name: 'Platinum',
    background: ['#1f2937', '#111827'],
    card: '#374151',
    cardSecondary: '#1f2937',
    text: '#ffffff',
    textSecondary: '#9ca3af',
    textTertiary: '#6b7280',
    primary: '#e5e4e2',
    secondary: '#94a3b8',
    accent: '#cbd5e1',
    gradient: ['#e5e4e2', '#94a3b8'],
    success: '#10b981',
    warning: '#fbbf24',
    error: '#ef4444',
    border: '#374151',
    shadow: '#000000',
  },
  // Legacy light theme (kept for backwards compatibility)
  light: {
    name: 'Light',
    background: ['#f3f4f6', '#e5e7eb'],
    card: '#ffffff',
    cardSecondary: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#a855f7',
    gradient: ['#8b5cf6', '#ec4899'],
    success: '#10b981',
    warning: '#fbbf24',
    error: '#ef4444',
    border: '#e5e7eb',
    shadow: '#000000',
  },
};

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('beatbyme');
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  const theme = themes[themeMode] || themes.beatbyme;

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
