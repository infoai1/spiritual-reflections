/**
 * Simple in-memory cache for spiritual interpretations
 * Caches generated reflections to avoid regenerating on each page load
 */

const cache = new Map();

// TTL in milliseconds (7 days)
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000;

/**
 * Get cached interpretation by news ID
 * @param {string} newsId - The news article ID
 * @returns {Object|null} - Cached data or null if not found/expired
 */
export function getCached(newsId) {
  const item = cache.get(newsId);

  if (!item) {
    return null;
  }

  // Check if expired
  if (Date.now() > item.expiresAt) {
    cache.delete(newsId);
    return null;
  }

  console.log(`[Cache] HIT for news: ${newsId}`);
  return item.data;
}

/**
 * Store interpretation in cache
 * @param {string} newsId - The news article ID
 * @param {Object} data - The interpretation data to cache
 * @param {number} ttlMs - Time to live in milliseconds (default 7 days)
 */
export function setCache(newsId, data, ttlMs = DEFAULT_TTL) {
  cache.set(newsId, {
    data,
    cachedAt: Date.now(),
    expiresAt: Date.now() + ttlMs
  });

  console.log(`[Cache] STORED for news: ${newsId}, expires in ${ttlMs / (24 * 60 * 60 * 1000)} days`);
}

/**
 * Clear a specific cache entry
 * @param {string} newsId - The news article ID
 */
export function clearCache(newsId) {
  cache.delete(newsId);
}

/**
 * Clear all cache entries
 */
export function clearAllCache() {
  cache.clear();
  console.log('[Cache] All entries cleared');
}

/**
 * Get cache stats
 * @returns {Object} - Cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.keys())
  };
}
