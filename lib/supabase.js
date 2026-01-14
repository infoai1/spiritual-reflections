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

/**
 * Get article by external ID (for shared links)
 * Checks both approved and auto_saved articles
 * @param {string} externalId - The external ID (hash)
 * @returns {Promise<Object|null>} - Article or null
 */
export async function getArticleById(externalId) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('external_id', externalId)
      .in('status', ['approved', 'auto_saved'])
      .single();

    if (error || !data) {
      return null;
    }

    // Transform to match NewsAPI format
    return {
      id: data.external_id || data.id,
      title: data.title,
      description: data.description,
      content: data.content,
      source: data.source,
      author: data.author,
      url: data.url,
      urlToImage: data.url_to_image,
      publishedAt: data.published_at,
      category: data.category,
      suitability: {
        score: data.ai_score || 0,
        isRecommended: true
      }
    };
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    return null;
  }
}

/**
 * Auto-save article when viewed (for link persistence)
 * Only saves if article doesn't already exist
 * @param {Object} article - Article data
 * @returns {Promise<Object>} - Result
 */
export async function autoSaveArticle(article) {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Use upsert to avoid duplicates
    const { error } = await supabaseAdmin
      .from('articles')
      .upsert({
        external_id: article.id,
        title: article.title,
        description: article.description,
        content: article.content,
        source: article.source,
        author: article.author,
        url: article.url,
        url_to_image: article.urlToImage,
        published_at: article.publishedAt || new Date().toISOString(),
        category: article.category || null,
        ai_score: article.suitability?.score || 0,
        status: 'auto_saved'
      }, {
        onConflict: 'external_id',
        ignoreDuplicates: true  // Don't overwrite existing articles
      });

    if (error) {
      console.log('[AutoSave] Failed:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[AutoSave] Article saved:', article.id);
    return { success: true };
  } catch (error) {
    console.log('[AutoSave] Error:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// AI INTERPRETATION APPROVAL WORKFLOW
// ============================================

/**
 * Save article with AI-generated interpretation
 * Status is 'pending' until admin approves
 * @param {Object} article - News article data
 * @param {Object} aiContent - AI-generated content
 * @returns {Promise<Object>} - Result
 */
export async function saveArticleWithAI(article, aiContent) {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const externalId = article.id || generateExternalId(article.url || article.title);

    const { data, error } = await supabaseAdmin
      .from('articles')
      .upsert({
        external_id: externalId,
        title: article.title,
        description: article.description,
        content: article.content,
        source: article.source,
        author: article.author,
        url: article.url,
        url_to_image: article.urlToImage,
        published_at: article.publishedAt || new Date().toISOString(),
        category: article.category || null,
        // AI-generated content
        ai_what_happened: aiContent.whatHappened,
        ai_interpretation: aiContent.interpretation,
        ai_inline_citations: aiContent.inlineCitations || [],
        ai_quranic_perspective: aiContent.quranicPerspective || null,
        ai_generated_at: new Date().toISOString(),
        // Status pending until approved
        status: 'pending',
        ai_score: article.suitability?.score || 0,
      }, {
        onConflict: 'external_id',
      })
      .select()
      .single();

    if (error) {
      console.error('[SaveWithAI] Error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[SaveWithAI] Saved article with AI:', externalId);
    return { success: true, article: data };
  } catch (error) {
    console.error('[SaveWithAI] Error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get article with AI content (for display)
 * Only returns approved articles to public
 * @param {string} externalId - Article external ID
 * @param {boolean} adminView - If true, returns pending articles too
 * @returns {Promise<Object|null>} - Article with AI or null
 */
export async function getArticleWithAI(externalId, adminView = false) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const client = adminView ? supabaseAdmin : supabase;
    let query = client
      .from('articles')
      .select('*')
      .eq('external_id', externalId);

    if (!adminView) {
      query = query.eq('status', 'approved');
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return null;
    }

    // Transform to include AI content
    return {
      id: data.external_id,
      title: data.title,
      description: data.description,
      content: data.content,
      source: data.source,
      author: data.author,
      url: data.url,
      urlToImage: data.url_to_image,
      publishedAt: data.published_at,
      category: data.category,
      status: data.status,
      // AI content
      aiContent: {
        whatHappened: data.ai_what_happened,
        interpretation: data.ai_interpretation,
        inlineCitations: data.ai_inline_citations || [],
        quranicPerspective: data.ai_quranic_perspective,
        generatedAt: data.ai_generated_at,
      },
      reviewedAt: data.reviewed_at,
      reviewedBy: data.reviewed_by,
    };
  } catch (error) {
    console.error('Error fetching article with AI:', error);
    return null;
  }
}

/**
 * Get pending articles with AI content for admin review
 * @returns {Promise<Array>} - Array of pending articles
 */
export async function getPendingArticlesWithAI() {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('status', 'pending')
      .not('ai_interpretation', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending articles:', error);
      return [];
    }

    return (data || []).map(article => ({
      id: article.id,
      externalId: article.external_id,
      title: article.title,
      description: article.description,
      source: article.source,
      url: article.url,
      urlToImage: article.url_to_image,
      category: article.category,
      createdAt: article.created_at,
      // AI preview
      aiPreview: {
        whatHappened: article.ai_what_happened,
        interpretation: article.ai_interpretation?.substring(0, 300) + '...',
        hasQuranicPerspective: !!article.ai_quranic_perspective?.found,
        generatedAt: article.ai_generated_at,
      },
    }));
  } catch (error) {
    console.error('Supabase error:', error);
    return [];
  }
}

/**
 * Approve article with AI content
 * @param {string} articleId - Article UUID
 * @param {string} reviewedBy - Admin name/email
 * @returns {Promise<Object>} - Result
 */
export async function approveArticleWithAI(articleId, reviewedBy = 'admin') {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('articles')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy,
      })
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
 * Reject article with AI content
 * @param {string} articleId - Article UUID
 * @param {string} reviewedBy - Admin name/email
 * @returns {Promise<Object>} - Result
 */
export async function rejectArticleWithAI(articleId, reviewedBy = 'admin') {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('articles')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy,
      })
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
 * Get approved articles with AI content for public display
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of approved articles
 */
export async function getApprovedArticlesWithAI(options = {}) {
  const { limit = 20, category = null } = options;

  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('status', 'approved')
      .not('ai_interpretation', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching approved articles:', error);
      return [];
    }

    return (data || []).map(article => ({
      id: article.external_id,
      title: article.title,
      description: article.description,
      content: article.content,
      source: article.source,
      author: article.author,
      url: article.url,
      urlToImage: article.url_to_image,
      publishedAt: article.published_at,
      category: article.category,
      hasAI: !!article.ai_interpretation,
    }));
  } catch (error) {
    console.error('Supabase error:', error);
    return [];
  }
}
