/**
 * Knowledge Base - Search Maulana's writings for relevant passages
 */

import fs from 'fs';
import path from 'path';

// Cache for loaded knowledge
let articlesCache = null;
let booksCache = null;

/**
 * Load articles from the knowledge directory
 */
function loadArticles() {
  if (articlesCache) return articlesCache;

  try {
    const articlesPath = path.join(process.cwd(), 'knowledge', 'articles.json');
    if (fs.existsSync(articlesPath)) {
      articlesCache = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));
    } else {
      articlesCache = [];
    }
  } catch (error) {
    console.error('Error loading articles:', error);
    articlesCache = [];
  }

  return articlesCache;
}

/**
 * Load all books from the knowledge/books directory
 */
function loadBooks() {
  if (booksCache) return booksCache;

  try {
    const booksDir = path.join(process.cwd(), 'knowledge', 'books');
    booksCache = [];

    if (fs.existsSync(booksDir)) {
      const files = fs.readdirSync(booksDir).filter(f => f.endsWith('.json'));

      for (const file of files) {
        const bookPath = path.join(booksDir, file);
        const book = JSON.parse(fs.readFileSync(bookPath, 'utf-8'));
        booksCache.push(book);
      }
    }
  } catch (error) {
    console.error('Error loading books:', error);
    booksCache = [];
  }

  return booksCache;
}

/**
 * Search for relevant passages based on keywords from the news
 */
export function searchKnowledgeBase(newsTitle, newsContent, maxResults = 3) {
  const articles = loadArticles();
  const books = loadBooks();

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

  // Search in book chunks
  for (const book of books) {
    for (const chunk of book.chunks || []) {
      const score = calculateRelevance(chunk.content, keywords, chunk.themes);
      if (score > 0) {
        results.push({
          type: 'book',
          content: chunk.content,
          source: `${book.title} by ${book.author}`,
          score,
        });
      }
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
  const spiritualThemes = ['gratitude', 'contemplation', 'hereafter', 'peace', 'faith', 'wisdom'];
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
  return [
    {
      content: `Spirituality in Islam is the direct result of contemplation, the kind of intellectual
development that takes place when a believer ponders over the Creator and His creation.
The source of Islamic spirituality is observation and reflection, rather than any sort of mysterious exercises.`,
      source: 'Maulana Wahiduddin Khan - CPS International',
    },
    {
      content: `Gratitude is not just saying thanks; it is recognizing God's blessings in every moment.
When we develop this awareness, even ordinary events become extraordinary signs of divine wisdom.`,
      source: 'Maulana Wahiduddin Khan',
    },
    {
      content: `The universe is like a vast book, and those who contemplate it discover the glory of its Author.
Every scientific discovery is an unveiling of God's creative wisdom.`,
      source: 'Maulana Wahiduddin Khan',
    },
  ];
}
