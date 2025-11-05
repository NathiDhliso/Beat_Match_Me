/**
 * Rate Limiter Service
 * Prevents API abuse and spam requests
 */

interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestRecord {
  timestamp: number;
  count: number;
}

class RateLimiter {
  private requests: Map<string, RequestRecord[]> = new Map();
  private config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  /**
   * Try to consume a token for the given key
   * Returns true if allowed, false if rate limit exceeded
   */
  tryConsume(key: string = 'default'): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests for this key
    let keyRequests = this.requests.get(key) || [];

    // Remove expired requests
    keyRequests = keyRequests.filter(req => req.timestamp > windowStart);

    // Check if limit exceeded
    const totalRequests = keyRequests.reduce((sum, req) => sum + req.count, 0);
    if (totalRequests >= this.config.maxRequests) {
      return false;
    }

    // Add new request
    keyRequests.push({ timestamp: now, count: 1 });
    this.requests.set(key, keyRequests);

    return true;
  }

  /**
   * Get remaining requests allowed in current window
   */
  getRemaining(key: string = 'default'): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    const keyRequests = this.requests.get(key) || [];
    const validRequests = keyRequests.filter(req => req.timestamp > windowStart);
    const totalRequests = validRequests.reduce((sum, req) => sum + req.count, 0);

    return Math.max(0, this.config.maxRequests - totalRequests);
  }

  /**
   * Get time until rate limit resets (in ms)
   */
  getResetTime(key: string = 'default'): number {
    const keyRequests = this.requests.get(key) || [];
    if (keyRequests.length === 0) return 0;

    const oldestRequest = keyRequests[0];
    const resetTime = oldestRequest.timestamp + this.config.windowMs;
    return Math.max(0, resetTime - Date.now());
  }

  /**
   * Clear rate limit for a key
   */
  clear(key: string = 'default'): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.requests.clear();
  }
}

/**
 * Create a rate limiter with specified config
 */
export function createRateLimiter(config: RateLimiterConfig): RateLimiter {
  return new RateLimiter(config);
}

// Pre-configured rate limiters for common use cases
export const requestRateLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 60000, // 1 minute
});

export const searchRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60000, // 1 minute
});

export const upvoteRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60000, // 1 minute
});

export const vetoRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60000, // 1 minute
});
