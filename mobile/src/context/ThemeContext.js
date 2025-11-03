import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const themes = {
  dark: {
    background: ['#1f2937', '#111827'],
    card: '#374151',
    cardSecondary: '#1f2937',
    text: '#ffffff',
    textSecondary: '#9ca3af',
    textTertiary: '#6b7280',
    primary: '#8b5cf6',
    secondary: '#ec4899',
    success: '#10b981',
    warning: '#fbbf24',
    error: '#ef4444',
    border: '#374151',
    shadow: '#000000',
  },
  light: {
    background: ['#f3f4f6', '#e5e7eb'],
    card: '#ffffff',
    cardSecondary: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    primary: '#8b5cf6',
    secondary: '#ec4899',
    success: '#10b981',
    warning: '#fbbf24',
    error: '#ef4444',
    border: '#e5e7eb',
    shadow: '#000000',
  },
};

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  const theme = isDark ? themes.dark : themes.light;

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
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
