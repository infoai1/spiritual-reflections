/**
 * NewsAPI Integration
 * Fetches news from reputable sources
 * Supports category-based fetching for Inspiration and Science sections
 */

import { NEWS_CATEGORIES } from './categories';

const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';
const EVERYTHING_API_URL = 'https://newsapi.org/v2/everything';

/**
 * Create a stable ID from a string (for consistent article IDs)
 */
function createStableId(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// Reputable news sources
const SOURCES = [
  'bbc-news',
  'reuters',
  'al-jazeera-english',
  'associated-press',
  'the-hindu',
].join(',');

// Categories that work well for spiritual interpretation
const CATEGORIES = ['general', 'science', 'technology', 'health'];

/**
 * Fetch top news headlines
 */
export async function fetchNews(category = 'general', pageSize = 10) {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    console.warn('NEWS_API_KEY not set, using sample news');
    return getSampleNews();
  }

  try {
    const params = new URLSearchParams({
      sources: SOURCES,
      pageSize: pageSize.toString(),
      apiKey,
    });

    const response = await fetch(`${NEWS_API_URL}?${params}`);
    const data = await response.json();

    if (data.status !== 'ok') {
      console.error('NewsAPI error:', data.message);
      return getSampleNews();
    }

    return data.articles.map((article, index) => ({
      id: createStableId(article.url || article.title || `article-${index}`),
      title: article.title,
      description: article.description || '',
      content: article.content || article.description || '',
      source: article.source?.name || 'Unknown',
      author: article.author,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return getSampleNews();
  }
}

/**
 * Fetch news by search query
 */
export async function searchNews(query, pageSize = 10) {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    return getSampleNews().filter(
      n => n.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  try {
    const params = new URLSearchParams({
      q: query,
      pageSize: pageSize.toString(),
      sortBy: 'relevancy',
      apiKey,
    });

    const response = await fetch(`https://newsapi.org/v2/everything?${params}`);
    const data = await response.json();

    if (data.status !== 'ok') {
      console.error('NewsAPI error:', data.message);
      return getSampleNews();
    }

    return data.articles.map((article, index) => ({
      id: createStableId(article.url || article.title || `search-${index}`),
      title: article.title,
      description: article.description || '',
      content: article.content || article.description || '',
      source: article.source?.name || 'Unknown',
      author: article.author,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
    }));
  } catch (error) {
    console.error('Error searching news:', error);
    return getSampleNews();
  }
}

/**
 * Sample news for development/demo
 */
function getSampleNews() {
  return [
    {
      id: 'sample-1',
      title: 'Scientists Discover New Evidence of Water on Mars',
      description: 'NASA researchers have found compelling evidence of subsurface water ice on Mars, opening new possibilities for future exploration.',
      content: 'In a groundbreaking discovery, NASA scientists have detected significant deposits of water ice beneath the Martian surface. This finding could revolutionize our understanding of the Red Planet and pave the way for future human missions.',
      source: 'BBC News',
      author: 'Science Correspondent',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'sample-2',
      title: 'Global Climate Summit Reaches Historic Agreement',
      description: 'World leaders commit to ambitious carbon reduction targets at the international climate conference.',
      content: 'Leaders from over 190 countries have agreed to unprecedented measures to combat climate change, including significant reductions in carbon emissions over the next decade.',
      source: 'Reuters',
      author: 'Environment Editor',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'sample-3',
      title: 'Breakthrough in Renewable Energy Storage Technology',
      description: 'New battery technology promises to make solar and wind power more reliable and accessible.',
      content: 'Scientists have developed a revolutionary battery technology that can store renewable energy for weeks, potentially solving one of the biggest challenges in the transition to clean energy.',
      source: 'Al Jazeera',
      author: 'Technology Reporter',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'sample-4',
      title: 'Medical Research Shows Promise in Treating Age-Related Diseases',
      description: 'New treatments could help millions of elderly patients lead healthier lives.',
      content: 'A team of international researchers has made significant progress in understanding the biological mechanisms of aging, leading to potential treatments for diseases like Alzheimer\'s and Parkinson\'s.',
      source: 'Associated Press',
      author: 'Health Correspondent',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'sample-5',
      title: 'Space Telescope Captures Stunning Images of Distant Galaxy',
      description: 'The images reveal new details about the formation of stars and planets billions of light years away.',
      content: 'Astronomers have released breathtaking images from the latest space telescope, showing unprecedented details of a galaxy formed just 500 million years after the Big Bang.',
      source: 'BBC News',
      author: 'Science Editor',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'sample-6',
      title: 'Ocean Conservation Efforts Show Positive Results',
      description: 'Marine protected areas are helping fish populations recover in key regions.',
      content: 'A decade of conservation efforts is finally paying off as marine biologists report significant recovery of fish populations in protected ocean areas around the world.',
      source: 'Reuters',
      author: 'Environment Correspondent',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'sample-7',
      title: 'Archaeological Discovery Reveals Ancient Civilization\'s Advanced Knowledge',
      description: 'Excavations uncover evidence of sophisticated astronomical understanding in ancient cultures.',
      content: 'Archaeologists have uncovered artifacts that suggest ancient civilizations had far more advanced understanding of astronomy and mathematics than previously thought.',
      source: 'The Hindu',
      author: 'Culture Reporter',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'sample-8',
      title: 'New Study Highlights Benefits of Forest Preservation',
      description: 'Forests play even larger role in climate regulation than previously estimated.',
      content: 'A comprehensive global study has revealed that forests absorb 30% more carbon dioxide than previously calculated, emphasizing the critical importance of forest preservation.',
      source: 'Al Jazeera',
      author: 'Climate Correspondent',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'sample-9',
      title: 'Community Gardens Transform Urban Neighborhoods',
      description: 'Urban gardening initiatives bring communities together while improving local food security.',
      content: 'Cities around the world are seeing the transformative power of community gardens, which not only provide fresh produce but also create spaces for neighbors to connect and support each other.',
      source: 'Associated Press',
      author: 'Community Reporter',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'sample-10',
      title: 'Astronomers Detect Signals from Exoplanet\'s Atmosphere',
      description: 'The discovery could help identify planets capable of supporting life.',
      content: 'For the first time, scientists have detected water vapor and other molecules in the atmosphere of an exoplanet in the habitable zone of its star, bringing us closer to finding potentially habitable worlds.',
      source: 'BBC News',
      author: 'Space Correspondent',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800',
      publishedAt: new Date().toISOString(),
    },
    // Inspiration sample stories
    {
      id: 'sample-11',
      title: 'Teen Overcomes Disability to Become Paralympic Champion',
      description: 'Against all odds, a young athlete with a rare condition has triumphed at the international games.',
      content: 'Born with a rare genetic condition that doctors said would prevent her from ever walking, Maria has not only learned to walk but has become a Paralympic gold medalist through years of determination and perseverance.',
      source: 'BBC News',
      author: 'Sports Correspondent',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'sample-12',
      title: 'Community Rebuilds After Natural Disaster Through Unity',
      description: 'Neighbors come together to rebuild homes and lives after devastating earthquake.',
      content: 'In the aftermath of a devastating earthquake, a small community has shown remarkable resilience. Through collective effort and unwavering hope, they have rebuilt not just structures but stronger bonds of human connection.',
      source: 'Reuters',
      author: 'Community Reporter',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800',
      publishedAt: new Date().toISOString(),
    },
  ];
}

// ============================================================================
// CATEGORY-SPECIFIC FETCHING
// ============================================================================

/**
 * Fetch news by category using search queries
 * Uses category-specific search terms for better results
 *
 * @param {string} categoryId - Category ID ('inspiration' or 'science')
 * @param {number} pageSize - Number of articles to fetch
 * @returns {Promise<Array>} - Array of news articles
 */
export async function fetchNewsByCategory(categoryId, pageSize = 5) {
  const category = NEWS_CATEGORIES[categoryId];
  if (!category) {
    console.warn(`Unknown category: ${categoryId}`);
    return getSampleNewsByCategory(categoryId);
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.warn('NEWS_API_KEY not set, using sample news');
    return getSampleNewsByCategory(categoryId);
  }

  try {
    // Use the first search query for the category
    const searchQuery = category.searchQueries[0];

    const params = new URLSearchParams({
      q: searchQuery,
      pageSize: (pageSize * 2).toString(), // Fetch more to filter
      sortBy: 'relevancy',
      language: 'en',
      apiKey,
    });

    const response = await fetch(`${EVERYTHING_API_URL}?${params}`);
    const data = await response.json();

    if (data.status !== 'ok') {
      console.error('NewsAPI error:', data.message);
      return getSampleNewsByCategory(categoryId);
    }

    return data.articles.slice(0, pageSize).map((article, index) => ({
      id: createStableId(article.url || article.title || `${categoryId}-${index}`),
      title: article.title,
      description: article.description || '',
      content: article.content || article.description || '',
      source: article.source?.name || 'Unknown',
      author: article.author,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      category: categoryId,
    }));
  } catch (error) {
    console.error(`Error fetching ${categoryId} news:`, error);
    return getSampleNewsByCategory(categoryId);
  }
}

/**
 * Fetch all categorized news in a single efficient batch
 * Budget-conscious: Uses minimal API calls
 *
 * @param {Object} options - { perCategory: 5, forAllSection: 10 }
 * @returns {Promise<Object>} - { inspiration: [...], science: [...], all: [...] }
 */
export async function fetchCategorizedNews(options = {}) {
  const { perCategory = 5, forAllSection = 10 } = options;

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.log('Using sample news for categorized fetch');
    return {
      inspiration: getSampleNewsByCategory('inspiration'),
      science: getSampleNewsByCategory('science'),
      all: getSampleNews().slice(0, forAllSection)
    };
  }

  try {
    // Parallel fetch for each category + general news (max 3 API calls)
    const [inspirationNews, scienceNews, generalNews] = await Promise.all([
      fetchNewsByCategory('inspiration', perCategory * 2),
      fetchNewsByCategory('science', perCategory * 2),
      fetchNews('general', forAllSection * 2)
    ]);

    return {
      inspiration: inspirationNews.slice(0, perCategory),
      science: scienceNews.slice(0, perCategory),
      all: generalNews.slice(0, forAllSection)
    };
  } catch (error) {
    console.error('Error fetching categorized news:', error);
    return {
      inspiration: getSampleNewsByCategory('inspiration'),
      science: getSampleNewsByCategory('science'),
      all: getSampleNews()
    };
  }
}

/**
 * Get sample news filtered by category for development/demo
 *
 * @param {string} categoryId - Category ID
 * @returns {Array} - Sample articles matching category
 */
function getSampleNewsByCategory(categoryId) {
  const samples = getSampleNews();

  if (categoryId === 'inspiration') {
    // Filter for inspiration stories (overcome, community, resilience)
    return samples.filter(n => {
      const text = `${n.title} ${n.description}`.toLowerCase();
      return text.includes('community') ||
             text.includes('overcome') ||
             text.includes('champion') ||
             text.includes('rebuild') ||
             text.includes('conservation');
    });
  }

  if (categoryId === 'science') {
    // Filter for science stories (discovery, space, research)
    return samples.filter(n => {
      const text = `${n.title} ${n.description}`.toLowerCase();
      return text.includes('scien') ||
             text.includes('discover') ||
             text.includes('space') ||
             text.includes('research') ||
             text.includes('astronomers') ||
             text.includes('telescope');
    });
  }

  return samples;
}
