/**
 * News Filter - Analyzes and filters news for spiritual interpretation suitability
 *
 * This module scores news articles based on their potential for meaningful
 * spiritual interpretation in the style of Maulana Wahiduddin Khan.
 */

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
