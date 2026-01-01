/**
 * NewsAPI Integration
 * Fetches news from reputable sources
 */

const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';

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
  ];
}
