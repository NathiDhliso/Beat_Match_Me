import { useState, useEffect, useCallback } from 'react';

export interface UseLocalStorageOptions<T> {
  /** Default value if key doesn't exist */
  defaultValue: T;
  /** Custom serializer (default: JSON.stringify) */
  serializer?: (value: T) => string;
  /** Custom deserializer (default: JSON.parse) */
  deserializer?: (value: string) => T;
  /** Sync across tabs/windows (default: true) */
  syncAcrossTabs?: boolean;
}

/**
 * Hook for persistent localStorage with TypeScript support
 * Automatically syncs across browser tabs
 * 
 * @example
 * ```tsx
 * const [theme, setTheme] = useLocalStorage('theme', {
 *   defaultValue: 'dark',
 * });
 * 
 * const [position, setPosition] = useLocalStorage('bubble-position', {
 *   defaultValue: { x: 100, y: 100 },
 * });
 * ```
 */
export const useLocalStorage = <T>(
  key: string,
  options: UseLocalStorageOptions<T>
) => {
  const {
    defaultValue,
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    syncAcrossTabs = true,
  } = options;

  // Initialize state with stored value or default
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // Update localStorage when value changes
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function like useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serializer(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, serializer]
  );

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // Sync state across tabs/windows
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserializer(e.newValue));
        } catch (error) {
          console.warn(`Error syncing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserializer, syncAcrossTabs]);

  return [storedValue, setValue, removeValue] as const;
};
