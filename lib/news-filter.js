/**
 * News Filter - Analyzes and filters news for spiritual interpretation suitability
 *
 * This module scores news articles based on their potential for meaningful
 * spiritual interpretation in the style of Maulana Wahiduddin Khan.
 *
 * Also provides category-based filtering for Inspiration and Science sections.
 */

import { NEWS_CATEGORIES } from './categories';

// Keywords that indicate news suitable for spiritual reflection
const POSITIVE_KEYWORDS = {
  // Nature & Creation (God's signs)
  nature: ['nature', 'natural', 'wildlife', 'forest', 'ocean', 'mountain', 'river', 'animal', 'plant', 'ecosystem'],
  science: ['discovery', 'research', 'scientist', 'study', 'breakthrough', 'found', 'evidence', 'phenomenon'],
  space: ['space', 'universe', 'galaxy', 'star', 'planet', 'cosmic', 'astronomy', 'nasa', 'telescope', 'mars', 'moon'],
  environment: ['climate', 'environment', 'conservation', 'renewable', 'sustainable', 'green', 'clean', 'preservation'],
  health: ['health', 'medical', 'cure', 'treatment', 'healing', 'wellness', 'recovery', 'breakthrough'],
  technology: ['innovation', 'technology', 'advancement', 'progress', 'development', 'solution'],
  community: ['community', 'volunteer', 'charity', 'help', 'support', 'together', 'unity', 'peace'],
  wisdom: ['wisdom', 'knowledge', 'education', 'learning', 'understanding', 'ancient', 'history'],
  wonder: ['amazing', 'remarkable', 'extraordinary', 'miracle', 'wonder', 'beautiful', 'stunning', 'incredible'],
};

// Keywords that indicate news NOT suitable for spiritual reflection
const NEGATIVE_KEYWORDS = {
  violence: ['murder', 'killed', 'shooting', 'attack', 'terrorist', 'bomb', 'explosion', 'war', 'conflict', 'violence'],
  crime: ['crime', 'criminal', 'arrest', 'prison', 'jail', 'robbery', 'theft', 'fraud', 'scam'],
  politics: ['election', 'politician', 'political', 'campaign', 'vote', 'party', 'opposition', 'scandal'],
  celebrity: ['celebrity', 'hollywood', 'bollywood', 'movie star', 'singer', 'gossip', 'divorce', 'affair'],
  negative: ['death toll', 'disaster', 'tragedy', 'crisis', 'collapse', 'failure', 'scandal', 'controversy'],
};

/**
 * Calculate suitability score for a news article
 * Higher score = more suitable for spiritual interpretation
 *
 * @param {Object} article - News article with title, description, content
 * @returns {Object} - { score, reasons, isRecommended }
 */
export function scoreArticle(article) {
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();

  let positiveScore = 0;
  let negativeScore = 0;
  const reasons = [];

  // Check positive keywords
  for (const [category, keywords] of Object.entries(POSITIVE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        positiveScore += 1;
        if (!reasons.includes(category)) {
          reasons.push(category);
        }
      }
    }
  }

  // Check negative keywords (heavy penalty)
  for (const [category, keywords] of Object.entries(NEGATIVE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        negativeScore += 3; // Heavier weight for negative
      }
    }
  }

  const finalScore = positiveScore - negativeScore;

  return {
    score: finalScore,
    positiveScore,
    negativeScore,
    reasons: reasons.slice(0, 3), // Top 3 reasons
    isRecommended: finalScore > 0 && negativeScore < 3,
  };
}

/**
 * Filter and sort news articles by suitability
 *
 * @param {Array} articles - Array of news articles
 * @param {number} limit - Maximum number of articles to return
 * @returns {Array} - Filtered and sorted articles
 */
export function filterNews(articles, limit = 10) {
  const scored = articles.map(article => ({
    ...article,
    suitability: scoreArticle(article),
  }));

  // Filter to only recommended articles, then sort by score
  const filtered = scored
    .filter(a => a.suitability.isRecommended)
    .sort((a, b) => b.suitability.score - a.suitability.score)
    .slice(0, limit);

  // If we don't have enough, add some neutral ones
  if (filtered.length < limit) {
    const neutral = scored
      .filter(a => !a.suitability.isRecommended && a.suitability.negativeScore < 5)
      .sort((a, b) => b.suitability.score - a.suitability.score)
      .slice(0, limit - filtered.length);

    filtered.push(...neutral);
  }

  return filtered;
}

/**
 * Generate a brief explanation of why this news is suitable
 */
export function getSuitabilityReason(article) {
  const { reasons } = article.suitability || scoreArticle(article);

  const reasonDescriptions = {
    nature: "reflects on God's creation in nature",
    science: "scientific discovery reveals divine wisdom",
    space: "cosmic wonders demonstrate Creator's vastness",
    environment: "reminds us of our duty as stewards of Earth",
    health: "shows blessings of life and healing",
    technology: "human ingenuity as a divine gift",
    community: "demonstrates unity and compassion",
    wisdom: "connects to timeless knowledge",
    wonder: "evokes awe at creation's marvels",
  };

  if (reasons.length === 0) return "suitable for spiritual reflection";

  return reasons
    .map(r => reasonDescriptions[r])
    .filter(Boolean)
    .join(', ');
}

// ============================================================================
// CATEGORY-BASED SCORING (for Inspiration & Science sections)
// ============================================================================

/**
 * Calculate category-specific quality score for an article
 * Higher score = better fit for category + higher quality story
 *
 * @param {Object} article - News article
 * @param {string} categoryId - Category ID ('inspiration' or 'science')
 * @returns {Object} - Detailed scoring breakdown
 */
export function scoreCategoryArticle(article, categoryId) {
  const category = NEWS_CATEGORIES[categoryId];
  if (!category) {
    return { score: 0, categoryMatch: false, reason: 'Unknown category' };
  }

  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();

  let categoryScore = 0;
  let qualityScore = 0;
  const matchedKeywords = [];

  // Category keyword matching (weighted by importance)
  for (const keyword of category.keywords.high || []) {
    if (text.includes(keyword.toLowerCase())) {
      categoryScore += 10;
      matchedKeywords.push(keyword);
    }
  }
  for (const keyword of category.keywords.medium || []) {
    if (text.includes(keyword.toLowerCase())) {
      categoryScore += 5;
      matchedKeywords.push(keyword);
    }
  }
  for (const keyword of category.keywords.low || []) {
    if (text.includes(keyword.toLowerCase())) {
      categoryScore += 2;
      matchedKeywords.push(keyword);
    }
  }

  // Story quality indicators
  const qualityIndicators = {
    hasQuotes: (text.match(/["'].*?["']/g) || []).length > 0,
    hasNumbers: (text.match(/\d+/g) || []).length > 2,
    hasProperLength: text.length > 200,
    hasEmotionalWords: ['amazing', 'remarkable', 'incredible', 'inspiring', 'extraordinary', 'miracle', 'breakthrough'].some(w => text.includes(w)),
    hasPersonalStory: ['he said', 'she said', 'told', 'explained', 'family', 'community', 'years'].some(w => text.includes(w)),
    hasPositiveOutcome: ['success', 'achieve', 'overcome', 'recover', 'discover', 'found', 'reveal', 'first'].some(w => text.includes(w))
  };

  // Quality score calculation
  if (qualityIndicators.hasQuotes) qualityScore += 3;
  if (qualityIndicators.hasNumbers) qualityScore += 2;
  if (qualityIndicators.hasProperLength) qualityScore += 5;
  if (qualityIndicators.hasEmotionalWords) qualityScore += 5;
  if (qualityIndicators.hasPersonalStory) qualityScore += 4;
  if (qualityIndicators.hasPositiveOutcome) qualityScore += 4;

  // Get spiritual suitability (from existing logic)
  const suitability = scoreArticle(article);
  const spiritualBonus = suitability.isRecommended ? 10 : (suitability.score > 0 ? 5 : 0);

  // Penalty for negative content
  const negativePenalty = suitability.negativeScore * 3;

  const totalScore = categoryScore + qualityScore + spiritualBonus - negativePenalty;

  return {
    score: totalScore,
    categoryScore,
    qualityScore,
    spiritualBonus,
    negativePenalty,
    categoryMatch: categoryScore >= 5,
    matchedKeywords: matchedKeywords.slice(0, 5),
    qualityIndicators,
    suitability,
    isBestCandidate: totalScore >= 20 && categoryScore >= 10 && suitability.isRecommended
  };
}

/**
 * Get best articles for each category
 * Returns the top articles per category based on quality + category fit
 *
 * @param {Array} articles - Array of news articles
 * @returns {Object} - { categoryId: { best, topThree, total } }
 */
export function getBestArticlesByCategory(articles) {
  const result = {};

  for (const [categoryId, category] of Object.entries(NEWS_CATEGORIES)) {
    const scoredArticles = articles.map(article => ({
      ...article,
      categoryScore: scoreCategoryArticle(article, categoryId)
    }));

    // Filter to only matching articles, sort by score
    const categoryArticles = scoredArticles
      .filter(a => a.categoryScore.categoryMatch && a.categoryScore.suitability.isRecommended)
      .sort((a, b) => b.categoryScore.score - a.categoryScore.score);

    result[categoryId] = {
      best: categoryArticles[0] || null,
      topThree: categoryArticles.slice(0, 3),
      total: categoryArticles.length,
      category: {
        name: category.name,
        description: category.description,
        icon: category.icon
      }
    };
  }

  return result;
}

/**
 * Filter and categorize all news into sections
 * Returns structured data for the categorized landing page
 *
 * @param {Array} articles - Array of news articles
 * @param {Object} options - { bestPerCategory: 3, maxAll: 12 }
 * @returns {Object} - { inspiration: [...], science: [...], all: [...] }
 */
export function filterAndCategorizeNews(articles, options = {}) {
  const { bestPerCategory = 3, maxAll = 12 } = options;

  const categorized = {
    inspiration: [],
    science: [],
    nature: [],
    health: [],
    all: []
  };

  // Get best articles for each category
  const categoryBest = getBestArticlesByCategory(articles);

  categorized.inspiration = categoryBest.inspiration?.topThree.slice(0, bestPerCategory) || [];
  categorized.science = categoryBest.science?.topThree.slice(0, bestPerCategory) || [];
  categorized.nature = categoryBest.nature?.topThree.slice(0, bestPerCategory) || [];
  categorized.health = categoryBest.health?.topThree.slice(0, bestPerCategory) || [];

  // Get IDs of articles already in categories
  const usedIds = new Set([
    ...categorized.inspiration.map(a => a.id),
    ...categorized.science.map(a => a.id),
    ...categorized.nature.map(a => a.id),
    ...categorized.health.map(a => a.id)
  ]);

  // Get remaining articles for "All News" section
  const remainingArticles = articles
    .filter(a => !usedIds.has(a.id))
    .map(a => ({ ...a, suitability: scoreArticle(a) }))
    .filter(a => a.suitability.isRecommended)
    .sort((a, b) => b.suitability.score - a.suitability.score)
    .slice(0, maxAll);

  categorized.all = remainingArticles;

  return categorized;
}
