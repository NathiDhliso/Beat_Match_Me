import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@BeatMatchMe:';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export const cacheManager = {
  async set<T>(key: string, data: T, expiryMs: number = CACHE_EXPIRY_MS): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(
        `${CACHE_PREFIX}${key}`,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  async get<T>(key: string, expiryMs: number = CACHE_EXPIRY_MS): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const age = Date.now() - cacheItem.timestamp;

      if (age > expiryMs) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },

  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    expiryMs: number = CACHE_EXPIRY_MS
  ): Promise<T> {
    const cached = await this.get<T>(key, expiryMs);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetchFn();
    await this.set(key, fresh, expiryMs);
    return fresh;
  },
};

export const CACHE_KEYS = {
  EVENTS: 'events',
  TRACKLIST: (eventId: string) => `tracklist:${eventId}`,
  QUEUE: (setId: string) => `queue:${setId}`,
  USER_PROFILE: 'user:profile',
  THEME: 'theme',
};
