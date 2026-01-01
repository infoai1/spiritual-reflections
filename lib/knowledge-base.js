/**
 * Knowledge Base - Search Maulana's writings for relevant passages
 * Using direct import for Vercel compatibility
 */

import articlesData from '../knowledge/articles.json';

/**
 * Search for relevant passages based on keywords from the news
 */
export function searchKnowledgeBase(newsTitle, newsContent, maxResults = 3) {
  const articles = articlesData || [];

  // Extract keywords from the news
  const keywords = extractKeywords(newsTitle + ' ' + newsContent);

  const results = [];

  // Search in articles
  for (const article of articles) {
    const score = calculateRelevance(article.content, keywords, article.themes);
    if (score > 0) {
      results.push({
        type: 'article',
        content: article.content,
        source: article.source,
        score,
      });
    }
  }

  // Sort by relevance and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

/**
 * Extract meaningful keywords from text
 */
function extractKeywords(text) {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'shall',
    'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'as', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'when', 'where', 'why',
    'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or',
    'because', 'until', 'while', 'although', 'though', 'after',
    'this', 'that', 'these', 'those', 'it', 'its', 'they', 'their',
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
}

/**
 * Calculate relevance score based on keyword matches and themes
 */
function calculateRelevance(content, keywords, themes = []) {
  const lowerContent = content.toLowerCase();
  let score = 0;

  // Keyword matches
  for (const keyword of keywords) {
    if (lowerContent.includes(keyword)) {
      score += 1;
    }
  }

  // Theme bonuses (spiritual themes are more relevant)
  const spiritualThemes = ['gratitude', 'contemplation', 'hereafter', 'peace', 'faith', 'wisdom', 'nature', 'patience'];
  for (const theme of themes) {
    if (spiritualThemes.includes(theme)) {
      score += 2;
    }
  }

  return score;
}

/**
 * Get sample teachings for when knowledge base is empty
 */
export function getSampleTeachings() {
  // Return first 3 from our articles as samples
  if (articlesData && articlesData.length > 0) {
    return articlesData.slice(0, 3).map(a => ({
      content: a.content,
      source: a.source,
    }));
  }

  return [
    {
      content: `Spirituality in Islam is the direct result of contemplation, the kind of intellectual development that takes place when a believer ponders over the Creator and His creation. The source of Islamic spirituality is observation and reflection, rather than any sort of mysterious exercises.`,
      source: 'Maulana Wahiduddin Khan - CPS International',
    },
    {
      content: `Gratitude is not just saying thanks; it is recognizing God's blessings in every moment. When we develop this awareness, even ordinary events become extraordinary signs of divine wisdom.`,
      source: 'Maulana Wahiduddin Khan',
    },
    {
      content: `The universe is like a vast book, and those who contemplate it discover the glory of its Author. Every scientific discovery is an unveiling of God's creative wisdom.`,
      source: 'Maulana Wahiduddin Khan',
    },
  ];
}
