# Spiritual Reflections - Project Context

## Overview
A webapp that fetches news from reputable sources and interprets them in the style of **Maulana Wahiduddin Khan** (1925-2021), founder of CPS International. Transforms material news into spiritual lessons.

## Live URL
https://spiritual-reflections.vercel.app/

## GitHub Repository
https://github.com/infoai1/spiritual-reflections

## Core Concept
- Fetches 10+ news from reputed sources (BBC, Reuters, Al Jazeera, AP, The Hindu)
- Filters news suitable for spiritual interpretation (science, nature, health - not crime/violence)
- Uses Claude AI with RAG to interpret news in Maulana's style
- Evokes: God's glory, Akhirat (Hereafter) awareness, gratitude (Shukr), contemplation (Tafakkur)

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (dark theme with gold accents)
- **News API**: NewsAPI.org
- **AI**: Claude API (Anthropic) with RAG
- **Knowledge Base**: 42 teachings from Maulana's books
- **Storage**: LocalStorage for favorites
- **Deployment**: Vercel

## Key Files

### API Routes
- `app/api/news/route.js` - Fetches and filters news from NewsAPI
- `app/api/interpret/route.js` - Claude interpretation with RAG

### Pages
- `app/page.js` - Home page with news grid
- `app/news/[id]/page.js` - News detail with spiritual interpretation
- `app/favorites/page.js` - Saved favorites

### Components
- `components/NewsCard.js` - News card (dark theme)
- `components/SpiritualInterpretation.js` - Interpretation display
- `components/ShareButtons.js` - WhatsApp, Twitter, Facebook
- `components/FavoriteButton.js` - Save to favorites

### Libraries
- `lib/newsapi.js` - NewsAPI with stable ID generation
- `lib/claude.js` - Claude API + RAG integration
- `lib/knowledge-base.js` - Search Maulana's teachings
- `lib/news-filter.js` - Score/filter suitable news
- `lib/favorites.js` - LocalStorage utilities

### Knowledge Base
- `knowledge/articles.json` - 42 teachings from 12+ books

## Environment Variables (Vercel)
```
NEWS_API_KEY=<newsapi.org key>
ANTHROPIC_API_KEY=<claude api key>
```

## Design
- **Background**: Deep navy (#1a1a2e, #16213e)
- **Text**: Soft white/cream
- **Accents**: Gold (#d4af37)
- **Cards**: Dark (#0f3460) with subtle borders

## Key Features
1. News grid with thumbnails
2. Spiritual interpretation using Maulana's actual teachings (RAG)
3. Save favorites (localStorage)
4. Share on social media
5. Dark elegant theme

## Maulana's Interpretation Style
- Tafakkur (deep reflection)
- Tadabbur (contemplation)
- Tawassum (deriving lessons)
- Transforms material observations into spiritual awakening
- References Quranic concepts
- Focuses on God's signs (Ayat), gratitude, Hereafter

## Books in Knowledge Base
1. God Arises
2. The Seeker's Guide
3. Islam and World Peace
4. Essence of Quranic Wisdom
5. Prophet Muhammad: Messenger of Peace
6. The Art of Clear Thinking
7. Women in Islam
8. The Reality of Life
9. Discovering God
10. The Reality of Monotheism
11. Spirit of Islam Magazine
12. Daily Dose of Wisdom

## Bug Fixes Applied
1. **Vercel file system error**: Changed `fs.readFileSync` to direct JSON import in knowledge-base.js
2. **Article not found**: Changed from `Date.now()` to stable hash-based IDs in newsapi.js

## Stable ID Generation
```javascript
function createStableId(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
```

## Future Enhancements
- Add more books to knowledge base
- User can provide PDF books for processing
- More news sources
- Enhanced sharing with interpretation preview
