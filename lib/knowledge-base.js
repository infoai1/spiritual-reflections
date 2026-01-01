/**
 * Knowledge Base - Search Maulana's writings via LightRAG API
 * Falls back to local articles.json if LightRAG is unavailable
 */

import articlesData from '../knowledge/articles.json';

const LIGHTRAG_URL = 'https://graph.spiritualmessage.org/query/data';

/**
 * Extract readable book name from file path
 * e.g., "/inputs/god_arises.pdf" → "God Arises"
 */
function parseBookName(filePath) {
  if (!filePath || filePath === 'unknown_source') {
    return 'Maulana Wahiduddin Khan';
  }
  const fileName = filePath.split('/').pop().replace(/\.[^.]+$/, '');
  return fileName
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Check if a passage is high quality and readable
 * Filters out index entries, truncated text, links, etc.
 */
function isHighQualityPassage(content) {
  if (!content || typeof content !== 'string') return false;

  // Too short to be meaningful
  if (content.length < 100) return false;

  // Contains navigation/link text
  if (content.toLowerCase().includes('click here')) return false;
  if (content.includes('Read Now')) return false;

  // Looks like an index or table of contents (many page numbers)
  const pageNumberCount = (content.match(/p\.\s*\d+/gi) || []).length;
  if (pageNumberCount > 3) return false;

  // Too many numbers (likely index)
  const numberCount = (content.match(/\d+/g) || []).length;
  if (numberCount > 10 && content.length < 500) return false;

  // Contains too many names/proper nouns in succession (likely index)
  if (content.match(/[A-Z][a-z]+,\s*p\./)) return false;

  // Starts with a number or bullet
  if (/^\d+[\.\)]\s/.test(content.trim())) return false;

  // Contains truncation indicators
  if (content.includes('...') && content.split('...').length > 3) return false;

  // Check for coherent sentences (should have periods followed by capitals)
  const sentenceCount = (content.match(/\.\s+[A-Z]/g) || []).length;
  if (sentenceCount < 1 && content.length > 200) return false;

  return true;
}

/**
 * Clean up passage content for display
 */
function cleanPassageContent(content) {
  return content
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n+/g, ' ') // Remove newlines
    .replace(/Click Here.*?(?=\.|$)/gi, '') // Remove "Click Here" text
    .replace(/Read Now.*?(?=\.|$)/gi, '') // Remove "Read Now" text
    .trim();
}

/**
 * Search for relevant passages using LightRAG semantic search
 */
export async function searchKnowledgeBase(newsTitle, newsContent, maxResults = 5) {
  try {
    // More specific query for better results
    const query = `Find meaningful spiritual teachings and wisdom from Maulana Wahiduddin Khan about: ${newsTitle}. Look for complete paragraphs with profound insights about life, faith, gratitude, or contemplation.`;

    const response = await fetch(LIGHTRAG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        mode: 'mix',
        top_k: maxResults * 3, // Request more, then filter
      })
    });

    if (!response.ok) {
      throw new Error(`LightRAG returned ${response.status}`);
    }

    const result = await response.json();
    const chunks = result.data?.chunks || [];

    // Filter for high-quality passages only
    const qualityPassages = chunks
      .filter(chunk => isHighQualityPassage(chunk.content))
      .slice(0, maxResults)
      .map(chunk => ({
        content: cleanPassageContent(chunk.content),
        source: 'Maulana Wahiduddin Khan',
        bookName: parseBookName(chunk.file_path),
        score: 1
      }));

    // If no quality passages found, use fallback
    if (qualityPassages.length === 0) {
      console.log('No quality passages from LightRAG, using fallback');
      return getFallbackPassages(maxResults);
    }

    return qualityPassages;
  } catch (error) {
    console.error('LightRAG error, using fallback:', error.message);
    return getFallbackPassages(maxResults);
  }
}

/**
 * Fallback to local articles.json when LightRAG is unavailable
 */
function getFallbackPassages(maxResults) {
  const articles = articlesData || [];
  return articles.slice(0, maxResults).map(a => ({
    content: a.content,
    source: a.source,
    bookName: a.source,
    score: 1
  }));
}

/**
 * Get sample teachings for when knowledge base is empty
 */
export function getSampleTeachings() {
  if (articlesData && articlesData.length > 0) {
    return articlesData.slice(0, 3).map(a => ({
      content: a.content,
      source: a.source,
      bookName: a.source,
    }));
  }

  return [
    {
      content: `Spirituality in Islam is the direct result of contemplation, the kind of intellectual development that takes place when a believer ponders over the Creator and His creation. The source of Islamic spirituality is observation and reflection, rather than any sort of mysterious exercises.`,
      source: 'Maulana Wahiduddin Khan - CPS International',
      bookName: 'CPS International',
    },
    {
      content: `Gratitude is not just saying thanks; it is recognizing God's blessings in every moment. When we develop this awareness, even ordinary events become extraordinary signs of divine wisdom.`,
      source: 'Maulana Wahiduddin Khan',
      bookName: 'Maulana Wahiduddin Khan',
    },
    {
      content: `The universe is like a vast book, and those who contemplate it discover the glory of its Author. Every scientific discovery is an unveiling of God's creative wisdom.`,
      source: 'Maulana Wahiduddin Khan',
      bookName: 'Maulana Wahiduddin Khan',
    },
  ];
}
