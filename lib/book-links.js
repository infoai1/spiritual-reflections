/**
 * Book URL Mapping
 * Maps LightRAG file paths to CPS website book URLs
 */

// Map PDF/DOCX filenames (from LightRAG) to CPS website URLs
const BOOK_URL_MAP = {
  // === User's 21 Books (from Google Drive) ===
  'the_way_to_find_god': 'https://cpsglobal.org/books/the-way-to-find-god',
  'way_to_find_god': 'https://cpsglobal.org/books/the-way-to-find-god',

  'how_to_establish_peace_in_the_holyland': 'https://cpsglobal.org/books/how-to-establish-peace-in-the-holy-land',
  'peace_in_the_holyland': 'https://cpsglobal.org/books/how-to-establish-peace-in-the-holy-land',

  'the_five_pillars_of_islam': 'https://cpsglobal.org/books/the-five-pillars-of-islam',
  'five_pillars_of_islam': 'https://cpsglobal.org/books/the-five-pillars-of-islam',

  'a_simple_introduction_to_islam': 'https://cpsglobal.org/books/a-simple-introduction-to-islam',
  'simple_introduction_to_islam': 'https://cpsglobal.org/books/a-simple-introduction-to-islam',
  'simple_introduction': 'https://cpsglobal.org/books/a-simple-introduction-to-islam',

  'polygamy_and_islam': 'https://cpsglobal.org/books/polygamy-and-islam',
  'polygamy': 'https://cpsglobal.org/books/polygamy-and-islam',

  'dawah_mission_of_muslim_ummah': 'https://cpsglobal.org/books/dawah-mission-of-muslim-ummah',
  'dawah_mission': 'https://cpsglobal.org/books/dawah-mission-of-muslim-ummah',

  'palestine_charting_a_peaceful_course': 'https://cpsglobal.org/books/palestine-charting-a-peaceful-course',
  'palestine': 'https://cpsglobal.org/books/palestine-charting-a-peaceful-course',

  'a_brief_history_of_dawah': 'https://cpsglobal.org/books/a-brief-history-of-dawah',
  'brief_history_of_dawah': 'https://cpsglobal.org/books/a-brief-history-of-dawah',

  'a_case_of_discovery_dawah_booklet': 'https://cpsglobal.org/books/a-case-of-discovery',
  'case_of_discovery': 'https://cpsglobal.org/books/a-case-of-discovery',

  'the_prophet_muhammad_a_simple_guide_to_his_life': 'https://cpsglobal.org/books/the-prophet-muhammad-a-simple-guide-to-his-life',
  'prophet_muhammad_simple_guide': 'https://cpsglobal.org/books/the-prophet-muhammad-a-simple-guide-to-his-life',

  'the_revolutionary_role_of_islam_dawah': 'https://cpsglobal.org/books/the-revolutionary-role-of-islam',
  'revolutionary_role_of_islam': 'https://cpsglobal.org/books/the-revolutionary-role-of-islam',

  'god_and_the_life_hereafter': 'https://cpsglobal.org/books/god-and-the-life-hereafter',
  'life_hereafter': 'https://cpsglobal.org/books/god-and-the-life-hereafter',

  'islamic_activism_dawah': 'https://cpsglobal.org/books/islamic-activism',
  'islamic_activism': 'https://cpsglobal.org/books/islamic-activism',

  'the_brief_life_of_prophet_muhammad': 'https://cpsglobal.org/books/the-brief-life-of-prophet-muhammad',
  'brief_life_of_prophet_muhammad': 'https://cpsglobal.org/books/the-brief-life-of-prophet-muhammad',

  'the_concept_of_god_book': 'https://cpsglobal.org/books/the-concept-of-god',
  'concept_of_god': 'https://cpsglobal.org/books/the-concept-of-god',

  'paradise_the_phase_of_human_civilization': 'https://cpsglobal.org/books/paradise-the-destination-of-man',
  'paradise': 'https://cpsglobal.org/books/paradise-the-destination-of-man',

  'conversion_an_intellectual_transformation': 'https://cpsglobal.org/books/conversion-an-intellectual-transformation',
  'conversion': 'https://cpsglobal.org/books/conversion-an-intellectual-transformation',

  'spirituality_in_islam': 'https://cpsglobal.org/books/spirituality-in-islam',
  'spirituality': 'https://cpsglobal.org/books/spirituality-in-islam',

  'in_search_of_god_from': 'https://cpsglobal.org/books/in-search-of-god',
  'in_search_of_god': 'https://cpsglobal.org/books/in-search-of-god',
  'search_of_god': 'https://cpsglobal.org/books/in-search-of-god',

  'islam_and_sultan': 'https://cpsglobal.org/books/islam-and-sultan',

  'muhammad_the_ideal_character': 'https://cpsglobal.org/books/muhammad-the-ideal-character',
  'ideal_character': 'https://cpsglobal.org/books/muhammad-the-ideal-character',

  // === Other Core Books ===
  'god_arises': 'https://cpsglobal.org/books/god-arises',
  'islam_and_peace': 'https://cpsglobal.org/books/islam-and-peace',
  'the_purpose_of_life': 'https://cpsglobal.org/books/the-purpose-of-life',
  'purpose_of_life': 'https://cpsglobal.org/books/the-purpose-of-life',
  'a_treasury_of_the_quran': 'https://cpsglobal.org/books/a-treasury-of-the-quran',
  'treasury_of_quran': 'https://cpsglobal.org/books/a-treasury-of-the-quran',
  'the_seekers_guide': 'https://cpsglobal.org/books/the-seekers-guide',
  'seekers_guide': 'https://cpsglobal.org/books/the-seekers-guide',
  'islam_rediscovered': 'https://cpsglobal.org/books/islam-rediscovered',
  'the_quran': 'https://cpsglobal.org/books/the-quran',
  'quran': 'https://cpsglobal.org/books/the-quran',
  'what_is_islam': 'https://cpsglobal.org/books/what-is-islam',

  // === Additional Books ===
  'principles_for_purposeful_living': 'https://cpsglobal.org/books/100-principles-for-purposeful-living',
  '100_principles': 'https://cpsglobal.org/books/100-principles-for-purposeful-living',
  'about_the_hadith': 'https://cpsglobal.org/books/about-the-hadith',
  'hadith': 'https://cpsglobal.org/books/about-the-hadith',
  'women_in_islam': 'https://cpsglobal.org/books/women-in-islam',
  'quranic_wisdom': 'https://cpsglobal.org/books/quranic-wisdom',

  // === Spirit of Islam Magazine ===
  'spirit_of_islam': 'https://cpsglobal.org/magazines',
  'soi': 'https://cpsglobal.org/magazines',

  // === Articles (generic) ===
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
