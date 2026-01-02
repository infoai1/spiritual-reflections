/**
 * Book URL Mapping
 * Maps LightRAG file paths to CPS website book URLs
 */

// Map PDF filenames (from LightRAG) to CPS website URLs
const BOOK_URL_MAP = {
  // Core books
  'god_arises': 'https://cpsglobal.org/books/god-arises',
  'islam_and_peace': 'https://cpsglobal.org/books/islam-and-peace',
  'the_purpose_of_life': 'https://cpsglobal.org/books/the-purpose-of-life',
  'purpose_of_life': 'https://cpsglobal.org/books/the-purpose-of-life',
  'a_treasury_of_the_quran': 'https://cpsglobal.org/books/a-treasury-of-the-quran',
  'treasury_of_quran': 'https://cpsglobal.org/books/a-treasury-of-the-quran',
  'paradise': 'https://cpsglobal.org/books/paradise-the-destination-of-man',
  'paradise_the_destination_of_man': 'https://cpsglobal.org/books/paradise-the-destination-of-man',
  'a_simple_introduction_to_islam': 'https://cpsglobal.org/books/a-simple-introduction-to-islam',
  'simple_introduction': 'https://cpsglobal.org/books/a-simple-introduction-to-islam',
  'the_seekers_guide': 'https://cpsglobal.org/books/the-seekers-guide',
  'seekers_guide': 'https://cpsglobal.org/books/the-seekers-guide',
  'islam_rediscovered': 'https://cpsglobal.org/books/islam-rediscovered',
  'the_quran': 'https://cpsglobal.org/books/the-quran',
  'quran': 'https://cpsglobal.org/books/the-quran',
  'quran_translation': 'https://cpsglobal.org/books/the-quran',
  'what_is_islam': 'https://cpsglobal.org/books/what-is-islam',
  'god_and_the_life_hereafter': 'https://cpsglobal.org/books/god-and-the-life-hereafter',
  'life_hereafter': 'https://cpsglobal.org/books/god-and-the-life-hereafter',

  // Additional books
  'principles_for_purposeful_living': 'https://cpsglobal.org/books/100-principles-for-purposeful-living',
  '100_principles': 'https://cpsglobal.org/books/100-principles-for-purposeful-living',
  'about_the_hadith': 'https://cpsglobal.org/books/about-the-hadith',
  'hadith': 'https://cpsglobal.org/books/about-the-hadith',
  'women_in_islam': 'https://cpsglobal.org/books/women-in-islam',
  'quranic_wisdom': 'https://cpsglobal.org/books/quranic-wisdom',
  'islamic_parenting': 'https://cpsglobal.org/books/islamic-parenting-nurturing-your-childs-true-potential',

  // Spirit of Islam magazine
  'spirit_of_islam': 'https://cpsglobal.org/magazines',
  'soi': 'https://cpsglobal.org/magazines',

  // Articles (generic pattern)
  'article': 'https://cpsglobal.org/articles',
  'articles': 'https://cpsglobal.org/articles',
};

/**
 * Extract book key from LightRAG file path
 * @param {string} filePath - e.g., "/inputs/god_arises.pdf"
 * @returns {string|null} - Book key like "god_arises"
 */
export function extractBookKey(filePath) {
  if (!filePath || filePath === 'unknown_source') return null;

  // Extract filename without extension
  const fileName = filePath.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase();

  // Remove common prefixes/suffixes
  return fileName
    .replace(/^(the_|a_)/, '')
    .replace(/(_v\d+|_final|_revised)$/, '')
    .trim();
}

/**
 * Get CPS website URL for a book
 * @param {string} bookKey - e.g., "god_arises"
 * @returns {string} - CPS website URL
 */
export function getBookUrl(bookKey) {
  if (!bookKey) return 'https://cpsglobal.org/books';

  const key = bookKey.toLowerCase();

  // Try exact match first
  if (BOOK_URL_MAP[key]) {
    return BOOK_URL_MAP[key];
  }

  // Try partial match
  for (const [mapKey, url] of Object.entries(BOOK_URL_MAP)) {
    if (key.includes(mapKey) || mapKey.includes(key)) {
      return url;
    }
  }

  // Try constructing URL from book key (common pattern)
  const slug = key.replace(/_/g, '-');
  return `https://cpsglobal.org/books/${slug}`;
}

/**
 * Check if source is an article (vs book)
 * @param {string} filePath - Source file path
 * @returns {boolean}
 */
export function isArticle(filePath) {
  if (!filePath) return false;
  const lower = filePath.toLowerCase();
  return lower.includes('article') || lower.includes('soi') || lower.includes('spirit_of_islam');
}
