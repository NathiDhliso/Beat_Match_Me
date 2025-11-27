/**
 * THEME SWITCHER COMPONENT
 * Allows users to switch between BeatMatchMe (purple), Gold, and Platinum themes
 * 
 * Usage:
 * <ThemeSwitcher />
 * <ThemeSwitcher compact /> // Minimal version for mobile
 */

import { useTheme } from '../context/ThemeContext';
import { getAllThemes } from '../theme/tokens';
import type { ThemeMode } from '../theme/tokens';
import { Music, Crown, Award } from 'lucide-react';

const getLightModeClasses = (isDark: boolean, isActive: boolean) => {
  if (isActive) return '';
  return isDark 
    ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border-2 border-gray-700/50'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border-2 border-gray-200';
};

interface ThemeSwitcherProps {
  compact?: boolean;
  className?: string;
}

// Theme icons mapping
const themeIcons = {
  BeatMatchMe: Music,
  gold: Crown,
  platinum: Award,
};

export default function ThemeSwitcher({ compact = false, className = '' }: ThemeSwitcherProps) {
  const { themeMode, setThemeMode, currentTheme, isDark } = useTheme();
  const themes = getAllThemes();

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    
    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  if (compact) {
    return (
      <div className={`flex gap-2 ${className}`}>
        {themes.map((theme) => {
          const Icon = themeIcons[theme.id];
          const isActive = themeMode === theme.id;
          
          return (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r ' + currentTheme.gradientPrimary + ' text-white shadow-lg scale-105' 
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                }
              `}
              title={theme.name}
              aria-label={`Switch to ${theme.name} theme`}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        Theme
      </label>
      
      <div className="grid grid-cols-1 gap-3">
        {themes.map((theme) => {
          const Icon = themeIcons[theme.id];
          const isActive = themeMode === theme.id;
          
          return (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`
                relative flex items-center gap-4 p-4 rounded-xl 
                transition-all duration-300 text-left
                ${isActive 
                  ? 'bg-gradient-to-r ' + currentTheme.gradientPrimary + ' text-white shadow-xl scale-[1.02] border-2 border-white/20' 
                  : getLightModeClasses(isDark, isActive)
                }
              `}
              aria-label={`Switch to ${theme.name} theme`}
              aria-pressed={isActive}
            >
              {/* Icon */}
              <div className={`
                flex items-center justify-center w-12 h-12 rounded-lg
                ${isActive 
                  ? 'bg-white/20' 
                  : isDark ? 'bg-gray-700/50' : 'bg-gray-200'
                }
              `}>
                <Icon className="w-6 h-6" />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="font-bold text-base">{theme.name}</div>
                <div className={`text-xs ${isActive ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {theme.description}
                </div>
              </div>
              
              {/* Active Indicator */}
              {isActive && (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                  <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Theme Preview Info */}
      <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-800/30 border-gray-700/50' : 'bg-gray-100 border-gray-200'} border`}>
        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Current: </span>
          {currentTheme.name}
        </div>
      </div>
    </div>
  );
}

/**
 * Horizontal Theme Switcher for Headers/Toolbars
 */
export function ThemeSwitcherHorizontal({ className = '' }: { className?: string }) {
  const { themeMode, setThemeMode, currentTheme } = useTheme();
  const themes = getAllThemes();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {themes.map((theme) => {
        const Icon = themeIcons[theme.id];
        const isActive = themeMode === theme.id;
        
        return (
          <button
            key={theme.id}
            onClick={() => setThemeMode(theme.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold
              transition-all duration-200
              ${isActive 
                ? 'bg-gradient-to-r ' + currentTheme.gradientPrimary + ' text-white shadow-lg' 
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }
            `}
            title={theme.name}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{theme.name.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Minimal Dropdown Theme Switcher
 */
export function ThemeSwitcherDropdown({ className = '' }: { className?: string }) {
  const { themeMode, setThemeMode, currentTheme } = useTheme();
  const themes = getAllThemes();

  return (
    <select
      value={themeMode}
      onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
      className={`
        px-4 py-2 rounded-lg 
        bg-gray-800/50 text-white border border-gray-700
        hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-all duration-200
        ${className}
      `}
      style={{
        ['--tw-ring-color' as string]: currentTheme.primary,
      } as React.CSSProperties}
    >
      {themes.map((theme) => (
        <option key={theme.id} value={theme.id}>
          {theme.name}
        </option>
      ))}
    </select>
  );
}
