/**
 * Knowledge Base - Search Maulana's writings via LightRAG API
 * Falls back to local articles.json if LightRAG is unavailable
 */

import articlesData from '../knowledge/articles.json';
import { extractBookKey } from './book-links';

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
 * Filters out index entries, truncated text, links, book metadata, etc.
 */
function isHighQualityPassage(content) {
  if (!content || typeof content !== 'string') return false;

  const lowerContent = content.toLowerCase();

  // Too short to be meaningful
  if (content.length < 150) return false;

  // Contains navigation/link text
  if (lowerContent.includes('click here')) return false;
  if (content.includes('Read Now')) return false;

  // Book metadata/cover page indicators
  if (lowerContent.includes('maulana wahiduddin khan') &&
      (content.match(/wahiduddin khan/gi) || []).length > 2) return false;
  if (lowerContent.includes('islamic scholar')) return false;
  if (lowerContent.includes('peace activist')) return false;
  if (lowerContent.includes('cps international') && lowerContent.includes('founder')) return false;

  // Index/table of contents - Arabic names with numbers (Allah's names list)
  if (content.match(/al-[A-Z][a-z]+\s*\([^)]+\)/g)?.length > 2) return false;

  // Contains Arabic text mixed with sequential numbers (index entries)
  if (content.match(/\d+\s+[a-z]+-[A-Z]/g)?.length > 2) return false;

  // Page numbers embedded in words (like "141animals")
  if (content.match(/\d{2,}[a-z]/gi)) return false;

  // Looks like an index or table of contents (many page numbers)
  const pageNumberCount = (content.match(/p\.\s*\d+/gi) || []).length;
  if (pageNumberCount > 2) return false;

  // Too many standalone numbers (likely index)
  const numberCount = (content.match(/\b\d+\b/g) || []).length;
  if (numberCount > 8) return false;

  // Contains too many names/proper nouns in succession (likely index)
  if (content.match(/[A-Z][a-z]+,\s*p\./)) return false;

  // Starts with a number or bullet
  if (/^\d+[\.\)]\s/.test(content.trim())) return false;

  // Contains truncation indicators
  if (content.includes('...') && content.split('...').length > 3) return false;

  // Check for coherent sentences (should have periods followed by capitals)
  const sentenceCount = (content.match(/\.\s+[A-Z]/g) || []).length;
  if (sentenceCount < 2 && content.length > 200) return false;

  // Check for word diversity (avoid repetitive text)
  const words = content.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  if (words.length > 20 && uniqueWords.size / words.length < 0.4) return false;

  // Should contain actual meaningful words
  const meaningfulWords = ['god', 'allah', 'life', 'world', 'man', 'human', 'truth', 'faith',
    'heart', 'soul', 'spirit', 'wisdom', 'knowledge', 'peace', 'love', 'nature', 'creation',
    'prayer', 'gratitude', 'blessing', 'believe', 'think', 'understand', 'realize'];
  const hasMeaningfulContent = meaningfulWords.some(word => lowerContent.includes(word));
  if (!hasMeaningfulContent) return false;

  return true;
}

/**
 * Clean up passage content for display
 */
function cleanPassageContent(content) {
  let cleaned = content
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n+/g, ' ') // Remove newlines
    .replace(/Click Here.*?(?=\.|$)/gi, '') // Remove "Click Here" text
    .replace(/Read Now.*?(?=\.|$)/gi, '') // Remove "Read Now" text
    .replace(/\d{2,}(?=[a-zA-Z])/g, '') // Remove numbers stuck to words
    .replace(/MAULANA WAHIDUDDIN KHAN/gi, '') // Remove repeated author name caps
    .replace(/\([^)]*[\u0600-\u06FF][^)]*\)/g, '') // Remove Arabic in parentheses
    .replace(/\s{2,}/g, ' ') // Clean up double spaces
    .trim();

  // Truncate to ~300 chars at a sentence boundary
  if (cleaned.length > 350) {
    const truncatePoint = cleaned.lastIndexOf('.', 320);
    if (truncatePoint > 150) {
      cleaned = cleaned.substring(0, truncatePoint + 1);
    } else {
      // No good sentence break, truncate at word boundary
      cleaned = cleaned.substring(0, 300).replace(/\s+\S*$/, '') + '...';
    }
  }

  return cleaned;
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
        rawContent: chunk.content,                    // Full original for modal
        source: 'Maulana Wahiduddin Khan',
        bookName: parseBookName(chunk.file_path),
        bookKey: extractBookKey(chunk.file_path),     // For CPS URL mapping
        filePath: chunk.file_path,
        score: chunk.score || 1
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
    rawContent: a.content,
    source: a.source,
    bookName: a.source,
    bookKey: null,  // No book key for fallback articles
    filePath: null,
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
      rawContent: a.content,
      source: a.source,
      bookName: a.source,
      bookKey: null,
      filePath: null,
    }));
  }

  return [
    {
      content: `Spirituality in Islam is the direct result of contemplation, the kind of intellectual development that takes place when a believer ponders over the Creator and His creation. The source of Islamic spirituality is observation and reflection, rather than any sort of mysterious exercises.`,
      rawContent: `Spirituality in Islam is the direct result of contemplation, the kind of intellectual development that takes place when a believer ponders over the Creator and His creation. The source of Islamic spirituality is observation and reflection, rather than any sort of mysterious exercises.`,
      source: 'Maulana Wahiduddin Khan - CPS International',
      bookName: 'CPS International',
      bookKey: null,
      filePath: null,
    },
    {
      content: `Gratitude is not just saying thanks; it is recognizing God's blessings in every moment. When we develop this awareness, even ordinary events become extraordinary signs of divine wisdom.`,
      rawContent: `Gratitude is not just saying thanks; it is recognizing God's blessings in every moment. When we develop this awareness, even ordinary events become extraordinary signs of divine wisdom.`,
      source: 'Maulana Wahiduddin Khan',
      bookName: 'Maulana Wahiduddin Khan',
      bookKey: null,
      filePath: null,
    },
    {
      content: `The universe is like a vast book, and those who contemplate it discover the glory of its Author. Every scientific discovery is an unveiling of God's creative wisdom.`,
      rawContent: `The universe is like a vast book, and those who contemplate it discover the glory of its Author. Every scientific discovery is an unveiling of God's creative wisdom.`,
      source: 'Maulana Wahiduddin Khan',
      bookName: 'Maulana Wahiduddin Khan',
      bookKey: null,
      filePath: null,
    },
  ];
}
