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
 * Search for relevant passages using LightRAG semantic search
 */
export async function searchKnowledgeBase(newsTitle, newsContent, maxResults = 5) {
  try {
    const query = `Spiritual wisdom and teachings of Maulana Wahiduddin Khan relevant to: ${newsTitle}. ${newsContent?.substring(0, 500) || ''}`;

    const response = await fetch(LIGHTRAG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        mode: 'mix',
        top_k: maxResults,
      })
    });

    if (!response.ok) {
      throw new Error(`LightRAG returned ${response.status}`);
    }

    const result = await response.json();
    const chunks = result.data?.chunks || [];

    if (chunks.length === 0) {
      console.log('LightRAG returned no chunks, using fallback');
      return getFallbackPassages(maxResults);
    }

    return chunks.map(chunk => ({
      content: chunk.content,
      source: 'Maulana Wahiduddin Khan',
      bookName: parseBookName(chunk.file_path),
      score: 1
    }));
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
