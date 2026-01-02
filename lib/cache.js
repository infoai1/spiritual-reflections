/**
 * Persistent cache for spiritual interpretations using Supabase
 * Falls back to in-memory cache when Supabase is not configured
 *
 * Interpretations are cached permanently to save API costs
 */

import { supabase, supabaseAdmin, isSupabaseConfigured } from './supabase';

// Fallback in-memory cache
const memoryCache = new Map();

/**
 * Get cached interpretation by news ID
 * @param {string} newsId - The news article ID
 * @returns {Promise<Object|null>} - Cached data or null if not found
 */
export async function getCached(newsId) {
  // Try Supabase first
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('interpretation_cache')
        .select('*')
        .eq('news_id', newsId)
        .single();

      if (data && !error) {
        console.log(`[Cache] SUPABASE HIT for news: ${newsId}`);
        return data.interpretation_data;
      }
    } catch (err) {
      console.log('[Cache] Supabase lookup failed, trying memory');
    }
  }

  // Fallback to memory cache
  const item = memoryCache.get(newsId);
  if (item) {
    console.log(`[Cache] MEMORY HIT for news: ${newsId}`);
    return item.data;
  }

  return null;
}

/**
 * Store interpretation in cache (persistent Supabase + memory fallback)
 * @param {string} newsId - The news article ID
 * @param {Object} data - The interpretation data to cache
 */
export async function setCache(newsId, data) {
  // Always store in memory as backup
  memoryCache.set(newsId, {
    data,
    cachedAt: Date.now()
  });

  // Try to store in Supabase for persistence
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from('interpretation_cache')
        .upsert({
          news_id: newsId,
          interpretation_data: data,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'news_id'
        });

      if (error) {
        console.log('[Cache] Supabase store failed:', error.message);
      } else {
        console.log(`[Cache] SUPABASE STORED for news: ${newsId} (permanent)`);
      }
    } catch (err) {
      console.log('[Cache] Supabase store error:', err.message);
    }
  } else {
    console.log(`[Cache] MEMORY STORED for news: ${newsId} (until restart)`);
  }
}

/**
 * Clear a specific cache entry
 * @param {string} newsId - The news article ID
 */
export async function clearCache(newsId) {
  memoryCache.delete(newsId);

  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      await supabaseAdmin
        .from('interpretation_cache')
        .delete()
        .eq('news_id', newsId);
    } catch (err) {
      console.log('[Cache] Supabase delete error:', err.message);
    }
  }
}

/**
 * Clear all cache entries
 */
export async function clearAllCache() {
  memoryCache.clear();

  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      await supabaseAdmin
        .from('interpretation_cache')
        .delete()
        .neq('news_id', ''); // Delete all rows
      console.log('[Cache] All Supabase entries cleared');
    } catch (err) {
      console.log('[Cache] Supabase clear error:', err.message);
    }
  }

  console.log('[Cache] All memory entries cleared');
}

/**
 * Get cache stats
 * @returns {Promise<Object>} - Cache statistics
 */
export async function getCacheStats() {
  let supabaseCount = 0;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { count } = await supabase
        .from('interpretation_cache')
        .select('*', { count: 'exact', head: true });
      supabaseCount = count || 0;
    } catch (err) {
      console.log('[Cache] Supabase count error:', err.message);
    }
  }

  return {
    memorySize: memoryCache.size,
    supabaseSize: supabaseCount,
    memoryEntries: Array.from(memoryCache.keys())
  };
}
