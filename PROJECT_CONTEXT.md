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
- Uses **LightRAG** to interpret news in Maulana's style (semantic search + AI generation)
- Evokes: God's glory, Akhirat (Hereafter) awareness, gratitude (Shukr), contemplation (Tafakkur)

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (dark theme with gold accents)
- **News API**: NewsAPI.org
- **AI/RAG**: LightRAG (with GPT-4o-mini) - contains all of Maulana's books
- **LightRAG API**: https://graph.spiritualmessage.org
- **Fallback Knowledge Base**: 42 teachings in `knowledge/articles.json`
- **Storage**: LocalStorage for favorites
- **Deployment**: Vercel

## LightRAG Integration

### API Endpoints Used
- **`/query`** - Generates spiritual interpretation (AI-generated response)
- **`/query/data`** - Retrieves relevant passages from Maulana's books

### How It Works
1. User clicks a news article
2. `lib/claude.js` calls LightRAG `/query` with the news + interpretation style prompt
3. `lib/knowledge-base.js` calls `/query/data` to get relevant book passages
4. Response displayed with interpretation + "Related Teachings" with book sources

### LightRAG Server
- **URL**: https://graph.spiritualmessage.org
- **Docs**: https://graph.spiritualmessage.org/redoc
- **WebUI**: https://graph.spiritualmessage.org/webui/documents
- **Query Mode**: `mix` (hybrid knowledge graph + vector search)
- **LLM**: GPT-4o-mini
- **Embeddings**: text-embedding-3-small

### Fallback Behavior
If LightRAG is unavailable, falls back to:
- Local `knowledge/articles.json` (42 teachings)
- Generic fallback interpretation text

## Key Files

### API Routes
- `app/api/news/route.js` - Fetches and filters news from NewsAPI
- `app/api/interpret/route.js` - Calls LightRAG for interpretation

### Pages
- `app/page.js` - Home page with news grid
- `app/news/[id]/page.js` - News detail with spiritual interpretation
- `app/favorites/page.js` - Saved favorites

### Components
- `components/NewsCard.js` - News card (dark theme)
- `components/SpiritualInterpretation.js` - Interpretation display with book sources
- `components/ShareButtons.js` - WhatsApp, Twitter, Facebook
- `components/FavoriteButton.js` - Save to favorites

### Libraries
- `lib/newsapi.js` - NewsAPI with stable ID generation
- `lib/claude.js` - LightRAG `/query` integration for interpretations
- `lib/knowledge-base.js` - LightRAG `/query/data` for passage retrieval
- `lib/news-filter.js` - Score/filter suitable news
- `lib/favorites.js` - LocalStorage utilities

### Knowledge Base (Fallback)
- `knowledge/articles.json` - 42 teachings from 12+ books (used when LightRAG unavailable)

## Environment Variables (Vercel)
```
NEWS_API_KEY=<newsapi.org key>
```
Note: ANTHROPIC_API_KEY no longer required - using LightRAG instead

## Design
- **Background**: Deep navy (#1a1a2e, #16213e)
- **Text**: Soft white/cream
- **Accents**: Gold (#d4af37)
- **Cards**: Dark (#0f3460) with subtle borders

## Key Features
1. News grid with thumbnails
2. Spiritual interpretation using LightRAG (Maulana's full book library)
3. Related Teachings with source book attribution
4. Save favorites (localStorage)
5. Share on social media
6. Dark elegant theme

## Maulana's Interpretation Style
- Tafakkur (deep reflection)
- Tadabbur (contemplation)
- Tawassum (deriving lessons)
- Transforms material observations into spiritual awakening
- References Quranic concepts
- Focuses on God's signs (Ayat), gratitude, Hereafter

## Books in LightRAG Knowledge Base
All of Maulana Wahiduddin Khan's books are indexed in LightRAG, including:
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
13. And many more...

## Bug Fixes Applied
1. **Vercel file system error**: Changed `fs.readFileSync` to direct JSON import in knowledge-base.js
2. **Article not found**: Changed from `Date.now()` to stable hash-based IDs in newsapi.js
3. **Repetitive reflections**: Integrated LightRAG for diverse, semantic-search based passages
4. **Vercel can't reach localhost**: Changed LightRAG URL from localhost:9621 to https://graph.spiritualmessage.org

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

## Architecture Diagram
```
User clicks news
       ↓
/api/interpret (Next.js API route)
       ↓
┌──────────────────────────────────┐
│  LightRAG API                    │
│  https://graph.spiritualmessage.org │
│  ┌─────────────┐ ┌────────────┐  │
│  │ /query      │ │ /query/data│  │
│  │ (AI interp) │ │ (passages) │  │
│  └─────────────┘ └────────────┘  │
└──────────────────────────────────┘
       ↓
Spiritual Interpretation + Related Teachings
       ↓
SpiritualInterpretation.js component
```

## Future Enhancements
- Enhanced passage relevance scoring
- More news sources
- Enhanced sharing with interpretation preview
- User-submitted questions for spiritual guidance
