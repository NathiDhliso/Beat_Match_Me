import { Image } from 'react-native';

interface ImageCacheEntry {
  uri: string;
  timestamp: number;
}

const imageCache = new Map<string, ImageCacheEntry>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const imageOptimization = {
  prefetchImages: async (uris: string[]): Promise<void> => {
    try {
      await Promise.all(
        uris.map(uri => Image.prefetch(uri))
      );
    } catch (error) {
      console.error('Image prefetch error:', error);
    }
  },

  getCachedUri: (uri: string): string => {
    const cached = imageCache.get(uri);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.uri;
    }
    
    imageCache.set(uri, { uri, timestamp: Date.now() });
    return uri;
  },

  clearCache: (): void => {
    imageCache.clear();
  },

  getOptimizedUri: (uri: string, width?: number, height?: number): string => {
    if (!uri) return '';
    
    if (uri.includes('cloudinary') || uri.includes('imgix')) {
      const params = [];
      if (width) params.push(`w_${width}`);
      if (height) params.push(`h_${height}`);
      params.push('f_auto', 'q_auto');
      
      return uri.includes('?') 
        ? `${uri}&${params.join(',')}`
        : `${uri}?${params.join(',')}`;
    }
    
    return uri;
  },

  preloadEventImages: async (events: any[]): Promise<void> => {
    const imageUris = events
      .map(event => event.image)
      .filter(Boolean);
    
    await imageOptimization.prefetchImages(imageUris);
  },
};

export const ImageConfig = {
  thumbnail: { width: 100, height: 100 },
  card: { width: 400, height: 400 },
  fullscreen: { width: 800, height: 800 },
};
