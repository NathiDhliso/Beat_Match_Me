import React, { createContext, useContext, useState, useEffect } from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';

/**
 * DARK MODE THEME
 * Sophisticated black and platinum grey gradients for users who prefer elegance and simplicity
 */

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'auto',
}) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode');
    return (saved as ThemeMode) || defaultMode;
  });

  const [isDark, setIsDark] = useState(() => {
    // Initialize based on mode - FORCE DARK MODE ON FIRST LOAD
    const saved = localStorage.getItem('theme-mode');
    const initialMode = (saved as ThemeMode) || defaultMode;
    
    // Force dark mode on first load
    if (!saved && defaultMode === 'dark') {
      document.documentElement.classList.add('dark');
      return true;
    }
    
    if (initialMode === 'dark') return true;
    if (initialMode === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const updateTheme = () => {
      let shouldBeDark = false;

      if (mode === 'dark') {
        shouldBeDark = true;
      } else if (mode === 'light') {
        shouldBeDark = false;
      } else {
        // Auto mode - check system preference
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      console.log('Updating theme:', { mode, shouldBeDark });
      setIsDark(shouldBeDark);
      document.documentElement.classList.toggle('dark', shouldBeDark);
      document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
      console.log('HTML classes:', document.documentElement.className);
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (mode === 'auto') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode(isDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ mode, isDark, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * THEME TOGGLE BUTTON
 * Elegant toggle for switching between light and dark modes
 */

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
}) => {
  const { mode, setMode } = useTheme();

  const handleModeChange = (newMode: ThemeMode) => {
    console.log('Changing theme to:', newMode);
    setMode(newMode);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Theme
        </span>
      )}
      
      <div className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => handleModeChange('light')}
          className={`p-2 rounded-md transition-all ${
            mode === 'light'
              ? 'bg-white dark:bg-gray-700 shadow-sm'
              : 'hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
          title="Light mode"
        >
          <Sun className={`w-4 h-4 ${mode === 'light' ? 'text-yellow-500' : 'text-gray-500'}`} />
        </button>
        
        <button
          onClick={() => handleModeChange('auto')}
          className={`p-2 rounded-md transition-all ${
            mode === 'auto'
              ? 'bg-white dark:bg-gray-700 shadow-sm'
              : 'hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
          title="Auto (system)"
        >
          <Sparkles className={`w-4 h-4 ${mode === 'auto' ? 'text-blue-500' : 'text-gray-500'}`} />
        </button>
        
        <button
          onClick={() => handleModeChange('dark')}
          className={`p-2 rounded-md transition-all ${
            mode === 'dark'
              ? 'bg-white dark:bg-gray-700 shadow-sm'
              : 'hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
          title="Dark mode"
        >
          <Moon className={`w-4 h-4 ${mode === 'dark' ? 'text-indigo-500' : 'text-gray-500'}`} />
        </button>
      </div>
    </div>
  );
};

/**
 * SOPHISTICATED DARK MODE GRADIENTS
 * Black and platinum grey color palette
 */

export const DarkModeGradients = {
  // Primary backgrounds
  background: {
    light: 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    dark: 'dark:bg-gradient-to-br dark:from-black dark:via-gray-900 dark:to-gray-950',
  },
  
  // Card backgrounds
  card: {
    light: 'bg-white/80 backdrop-blur-lg border border-gray-200',
    dark: 'dark:bg-black/60 dark:backdrop-blur-lg dark:border dark:border-gray-800',
  },
  
  // Platinum accents
  platinum: {
    light: 'bg-gradient-to-br from-gray-300 to-gray-400',
    dark: 'dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-600',
  },
  
  // Sophisticated buttons
  button: {
    primary: {
      light: 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-black',
      dark: 'dark:bg-gradient-to-r dark:from-gray-200 dark:to-gray-100 dark:text-black dark:hover:from-white dark:hover:to-gray-200',
    },
    secondary: {
      light: 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 hover:from-gray-300 hover:to-gray-400',
      dark: 'dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-700 dark:text-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600',
    },
  },
  
  // Glass morphism
  glass: {
    light: 'bg-white/40 backdrop-blur-xl border border-gray-200/50',
    dark: 'dark:bg-black/40 dark:backdrop-blur-xl dark:border dark:border-gray-700/50',
  },
  
  // Shadows and glows
  shadow: {
    light: 'shadow-lg shadow-gray-200/50',
    dark: 'dark:shadow-2xl dark:shadow-black/50',
  },
  
  glow: {
    platinum: {
      light: 'shadow-lg shadow-gray-300/50',
      dark: 'dark:shadow-2xl dark:shadow-gray-500/20',
    },
  },
};

/**
 * DARK MODE WRAPPER COMPONENT
 * Applies sophisticated dark mode styling to children
 */

interface DarkModeWrapperProps {
  children: React.ReactNode;
  variant?: 'default' | 'card' | 'glass';
  className?: string;
}

export const DarkModeWrapper: React.FC<DarkModeWrapperProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return `${DarkModeGradients.card.light} ${DarkModeGradients.card.dark} ${DarkModeGradients.shadow.light} ${DarkModeGradients.shadow.dark}`;
      case 'glass':
        return `${DarkModeGradients.glass.light} ${DarkModeGradients.glass.dark}`;
      default:
        return `${DarkModeGradients.background.light} ${DarkModeGradients.background.dark}`;
    }
  };

  return (
    <div className={`${getVariantClasses()} ${className} transition-colors duration-300`}>
      {children}
    </div>
  );
};

/**
 * SOPHISTICATED CARD COMPONENT
 * Elegant card with dark mode support
 */

interface SophisticatedCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  platinum?: boolean;
}

export const SophisticatedCard: React.FC<SophisticatedCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  className = '',
  platinum = false,
}) => {
  return (
    <div
      className={`
        ${platinum 
          ? `${DarkModeGradients.platinum.light} ${DarkModeGradients.platinum.dark} ${DarkModeGradients.glow.platinum.light} ${DarkModeGradients.glow.platinum.dark}`
          : `${DarkModeGradients.card.light} ${DarkModeGradients.card.dark} ${DarkModeGradients.shadow.light} ${DarkModeGradients.shadow.dark}`
        }
        rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]
        ${className}
      `}
    >
      {(title || subtitle || icon) && (
        <div className="flex items-center gap-4 mb-4">
          {icon && (
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              ${platinum 
                ? 'bg-white/20 dark:bg-black/20' 
                : 'bg-gray-100 dark:bg-gray-800'
              }
            `}>
              {icon}
            </div>
          )}
          <div className="flex-1">
            {title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="text-gray-800 dark:text-gray-200">
        {children}
      </div>
    </div>
  );
};

/**
 * ELEGANT BUTTON COMPONENT
 * Sophisticated button with dark mode support
 */

interface ElegantButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'platinum';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const ElegantButton: React.FC<ElegantButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return `${DarkModeGradients.button.primary.light} ${DarkModeGradients.button.primary.dark}`;
      case 'secondary':
        return `${DarkModeGradients.button.secondary.light} ${DarkModeGradients.button.secondary.dark}`;
      case 'platinum':
        return `${DarkModeGradients.platinum.light} ${DarkModeGradients.platinum.dark} text-white dark:text-black`;
      default:
        return '';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        font-semibold rounded-xl
        transition-all duration-300
        hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${DarkModeGradients.shadow.light} ${DarkModeGradients.shadow.dark}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

/**
 * TEXT COMPONENTS
 * Typography with dark mode support
 */

export const DarkModeText = {
  heading: 'text-gray-900 dark:text-gray-100',
  body: 'text-gray-700 dark:text-gray-300',
  muted: 'text-gray-500 dark:text-gray-500',
  accent: 'text-gray-800 dark:text-gray-200',
};

/**
 * DIVIDER COMPONENT
 * Elegant separator with dark mode
 */

interface DividerProps {
  className?: string;
  platinum?: boolean;
}

export const Divider: React.FC<DividerProps> = ({ className = '', platinum = false }) => {
  return (
    <div
      className={`
        h-px w-full
        ${platinum 
          ? 'bg-gradient-to-r from-transparent via-gray-400 to-transparent dark:via-gray-600'
          : 'bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700'
        }
        ${className}
      `}
    />
  );
};
