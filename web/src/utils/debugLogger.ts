/**
 * Debug Logger Utility
 * Centralized logging with configurable levels
 * Set via localStorage: localStorage.setItem('DEBUG_LEVEL', 'error')
 */

export type LogLevel = 'none' | 'error' | 'warn' | 'info' | 'debug' | 'verbose';

const LOG_LEVELS: Record<LogLevel, number> = {
  none: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  verbose: 5,
};

class DebugLogger {
  private currentLevel: LogLevel;

  constructor() {
    this.currentLevel = this.getStoredLevel();
  }

  private getStoredLevel(): LogLevel {
    if (typeof window === 'undefined') return 'info';
    
    const stored = localStorage.getItem('DEBUG_LEVEL') as LogLevel;
    return stored && stored in LOG_LEVELS ? stored : 'info';
  }

  setLevel(level: LogLevel) {
    this.currentLevel = level;
    if (typeof window !== 'undefined') {
      localStorage.setItem('DEBUG_LEVEL', level);
    }
  }

  getLevel(): LogLevel {
    return this.currentLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.currentLevel];
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(`❌ ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog('info')) {
      console.info(`ℹ️ ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog('debug')) {
      console.log(`🔍 ${message}`, ...args);
    }
  }

  verbose(message: string, ...args: any[]) {
    if (this.shouldLog('verbose')) {
      console.log(`📝 ${message}`, ...args);
    }
  }

  group(label: string, level: LogLevel = 'debug') {
    if (this.shouldLog(level)) {
      console.group(label);
    }
  }

  groupEnd() {
    if (this.shouldLog('debug')) {
      console.groupEnd();
    }
  }
}

// Singleton instance
export const logger = new DebugLogger();

// Quick setup function for production
export const setProductionLogging = () => {
  logger.setLevel('warn');
};

// Quick setup function for development
export const setDevelopmentLogging = () => {
  logger.setLevel('debug');
};

// Quick setup function for verbose debugging
export const setVerboseLogging = () => {
  logger.setLevel('verbose');
};

// Usage instructions
if (typeof window !== 'undefined') {
  (window as any).debugLogger = {
    setLevel: (level: LogLevel) => logger.setLevel(level),
    getLevel: () => logger.getLevel(),
    help: () => {
      console.log(`
🔧 Debug Logger Controls
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Available log levels (least to most verbose):
  none    - No logging
  error   - Only errors
  warn    - Errors + warnings
  info    - Errors + warnings + info
  debug   - Errors + warnings + info + debug
  verbose - Everything (very chatty!)

Usage in console:
  debugLogger.setLevel('warn')    // Set to warnings only
  debugLogger.setLevel('debug')   // Enable debug logging
  debugLogger.getLevel()          // Check current level

Current level: ${logger.getLevel()}
      `);
    },
  };
}
