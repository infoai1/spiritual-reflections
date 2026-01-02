# Spiritual Reflections Project - Context Summary

**Last Updated:** 2026-01-02 02:00:00

## Project Overview
A Next.js 14 application that transforms news articles into spiritual reflections in the style of Maulana Wahiduddin Khan, using LightRAG for semantic search over his literature.

## Architecture
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lora font
- **Backend:** Next.js API routes
- **AI/RAG:** LightRAG (Docker) with GPT-4o for LLM, OpenAI embeddings
- **Database:** LightRAG's vector storage with 24,335 indexed nodes from Maulana's books

## Key Features Implemented (Phase 1 + 2)
1. **Categorized Landing Page (4 Categories)**
   - Inspiration section (amber theme) - stories of overcoming challenges
   - Science section (blue theme) - discoveries inspiring God's remembrance
   - Nature section (green theme) - God's signs in wildlife, oceans, forests
   - Health section (teal theme) - blessings of well-being and healing
   - Quality scoring algorithm for best articles

2. **Executive Summary ("In Brief")**
   - One sentence spiritual insight for busy readers

3. **Quote Formatting**
   - Quran verses in quotes with reference
   - Maulana quotes properly formatted

4. **Quranic Perspective Section**
   - Concept name + Arabic + meaning
   - Related verses with connections (if found)

5. **Bug Fix: Article Not Found**
   - Detail page now fetches categorized news (same as home page)
   - Searches across all categories to find the clicked article

## File Structure
```
/root/spiritual-reflections/
├── app/
│   ├── page.js                  # Categorized home page
│   ├── news/[id]/page.js        # Article detail page
│   └── api/
│       ├── news/route.js        # News API with categories
│       └── interpret/route.js   # Interpretation API
├── components/
│   ├── NewsCard.js              # Article card component
│   ├── SpiritualInterpretation.js # Full interpretation display
│   ├── ShareButtons.js
│   └── FavoriteButton.js
├── lib/
│   ├── claude.js                # LightRAG integration + prompts
│   ├── categories.js            # Category definitions
│   ├── news-filter.js           # Scoring algorithm
│   ├── newsapi.js               # NewsAPI integration
│   └── quran-verses.js          # Verse selection
└── docs/
    └── context-summary.md       # This file
```

## LightRAG Configuration
```
/root/LightRAG-official/.env
- LLM: OpenAI GPT-4o
- Embeddings: OpenAI text-embedding-3-small (1536 dims)
- Graph: 24,335 nodes, 32,949 edges from Maulana's literature
```

## Known Issues & Solutions
1. **LightRAG Connection Error**: Fixed by setting `LLM_BINDING_HOST=https://api.openai.com/v1`
2. **Embedding Dimension Mismatch**: Keep using OpenAI embeddings (can't switch to Gemini without re-indexing)

## Recent Updates (2026-01-01)
- Enhanced prompt with learnings from "Leading a Spiritual Life" book:
  - "Convert material events into spiritual content"
  - "Take challenges as challenges, not as evil"
  - "Trees as silent speakers" metaphor
  - Cognitive reframing and mind-based spirituality
  - Challenge-oriented thinking
- Fixed LightRAG connection issues (LLM_BINDING_HOST setting)

## Pending Tasks
- [ ] Test Gemini 3 Pro integration (model available but needs embedding compatibility)
- [ ] User news submission feature (Phase 3)

## API Keys (stored in .env files)
- OpenAI: For LLM + embeddings
- NewsAPI: For fetching news
- Gemini: Available for future use

## Deployment
- Deployed on Vercel at spiritual-reflections.vercel.app
- LightRAG runs on local Docker container (port 9621)
