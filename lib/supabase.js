/**
 * Supabase Client Configuration
 *
 * Two clients are provided:
 * - supabase: For public read operations (uses anon key)
 * - supabaseAdmin: For admin write operations (uses service role key)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Only create clients if URL is configured
let supabase = null;
let supabaseAdmin = null;

if (supabaseUrl && supabaseAnonKey) {
  // Public client for read operations
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

if (supabaseUrl && supabaseServiceKey) {
  // Admin client for write operations (server-side only)
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

export { supabase, supabaseAdmin };

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Get approved articles from database
 * @param {Object} options - Query options
 * @param {number} options.limit - Max articles to return
 * @param {string} options.category - Filter by category
 * @returns {Promise<Array>} - Array of articles
 */
export async function getApprovedArticles(options = {}) {
  const { limit = 20, category = null } = options;

  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return [];
    }

    // Transform to match NewsAPI format
    return (data || []).map(article => ({
      id: article.external_id || article.id,
      title: article.title,
      description: article.description,
      content: article.content,
      source: article.source,
      author: article.author,
      url: article.url,
      urlToImage: article.url_to_image,
      publishedAt: article.published_at,
      category: article.category,
      suitability: {
        score: article.ai_score || 0,
        isRecommended: true
      }
    }));
  } catch (error) {
    console.error('Supabase error:', error);
    return [];
  }
}

/**
 * Get pending queue items
 * @returns {Promise<Array>} - Array of pending articles
 */
export async function getPendingQueue() {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('pending_queue')
      .select('*')
      .eq('status', 'pending')
      .order('ai_score', { ascending: false });

    if (error) {
      console.error('Error fetching queue:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Supabase error:', error);
    return [];
  }
}

/**
 * Add articles to pending queue
 * @param {Array} articles - Articles to add
 * @returns {Promise<Object>} - { added, skipped }
 */
export async function addToQueue(articles) {
  if (!isSupabaseConfigured()) {
    return { added: 0, skipped: 0, error: 'Supabase not configured' };
  }

  let added = 0;
  let skipped = 0;

  for (const article of articles) {
    try {
      const { error } = await supabaseAdmin
        .from('pending_queue')
        .upsert({
          external_id: article.id,
          title: article.title,
          description: article.description,
          content: article.content,
          source: article.source,
          url: article.url,
          url_to_image: article.urlToImage,
          suggested_category: article.category || null,
          ai_score: article.suitability?.score || 0,
          ai_reasons: article.suitability?.reasons || [],
          status: 'pending'
        }, {
          onConflict: 'external_id',
          ignoreDuplicates: true
        });

      if (error) {
        skipped++;
      } else {
        added++;
      }
    } catch (err) {
      skipped++;
    }
  }

  return { added, skipped };
}

/**
 * Approve an article from queue
 * @param {string} queueId - Queue item ID
 * @param {string} category - Final category
 * @returns {Promise<Object>} - Result
 */
export async function approveArticle(queueId, category) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Get the queue item
    const { data: queueItem, error: fetchError } = await supabaseAdmin
      .from('pending_queue')
      .select('*')
      .eq('id', queueId)
      .single();

    if (fetchError || !queueItem) {
      return { success: false, error: 'Queue item not found' };
    }

    // Insert into articles
    const { error: insertError } = await supabaseAdmin
      .from('articles')
      .insert({
        external_id: queueItem.external_id,
        title: queueItem.title,
        description: queueItem.description,
        content: queueItem.content,
        source: queueItem.source,
        url: queueItem.url,
        url_to_image: queueItem.url_to_image,
        category: category || queueItem.suggested_category,
        ai_score: queueItem.ai_score,
        status: 'approved'
      });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // Delete from queue
    await supabaseAdmin
      .from('pending_queue')
      .delete()
      .eq('id', queueId);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Reject an article from queue
 * @param {string} queueId - Queue item ID
 * @returns {Promise<Object>} - Result
 */
export async function rejectArticle(queueId) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('pending_queue')
      .update({ status: 'rejected' })
      .eq('id', queueId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete an article
 * @param {string} articleId - Article ID
 * @returns {Promise<Object>} - Result
 */
export async function deleteArticle(articleId) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create a new article manually
 * @param {Object} article - Article data
 * @returns {Promise<Object>} - Result with created article
 */
export async function createArticle(article) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Generate external_id from URL or title
    const externalId = generateExternalId(article.url || article.title);

    const { data, error } = await supabaseAdmin
      .from('articles')
      .insert({
        external_id: externalId,
        title: article.title,
        description: article.description,
        content: article.content,
        source: article.source,
        author: article.author,
        url: article.url,
        url_to_image: article.urlToImage,
        published_at: article.publishedAt || new Date().toISOString(),
        category: article.category,
        ai_score: article.aiScore || 0,
        status: 'approved'
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, article: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate stable ID from string (matching newsapi.js logic)
 */
function generateExternalId(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get all articles for admin management
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - { articles, total }
 */
export async function getAllArticles(options = {}) {
  const { page = 1, limit = 20, status = null, category = null } = options;

  if (!isSupabaseConfigured()) {
    return { articles: [], total: 0 };
  }

  try {
    let query = supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return { articles: [], total: 0 };
    }

    return { articles: data || [], total: count || 0 };
  } catch (error) {
    console.error('Supabase error:', error);
    return { articles: [], total: 0 };
  }
}

/**
 * Update article status
 * @param {string} articleId - Article ID
 * @param {string} status - New status ('approved', 'hidden')
 * @returns {Promise<Object>} - Result
 */
export async function updateArticleStatus(articleId, status) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('articles')
      .update({ status })
      .eq('id', articleId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
