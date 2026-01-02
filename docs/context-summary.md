# Spiritual Reflections Project - Context Summary

**Last Updated:** 2026-01-02 03:30:00

## Project Overview
A Next.js 14 application that transforms news articles into spiritual reflections in the style of Maulana Wahiduddin Khan, using LightRAG for semantic search over his literature.

## Live URLs
- **Public Site:** https://spiritual-reflections.vercel.app/
- **Admin Panel:** https://spiritual-reflections.vercel.app/admin
- **GitHub:** https://github.com/infoai1/spiritual-reflections

## Architecture
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lora font
- **Backend:** Next.js API routes
- **AI/RAG:** LightRAG (Docker) with GPT-4o for LLM, OpenAI embeddings
- **Database:** Supabase (PostgreSQL) for curated articles + LightRAG vector storage
- **Auth:** Simple password-based admin authentication

## Key Features Implemented

### Phase 1: Core Features
1. **News Grid with Spiritual Interpretations**
   - Fetches news from NewsAPI (BBC, Reuters, Al Jazeera, AP, The Hindu)
   - Filters unsuitable content (violence, crime, politics)
   - Generates spiritual interpretations via LightRAG

2. **Two-Section Interpretation Layout**
   - "What Happened" - factual summary
   - "Spiritual Reflection" - Tafakkur-style insights

3. **Executive Summary ("In Brief")**
   - One sentence spiritual insight for busy readers

4. **Quote Formatting**
   - Quran verses in quotes with reference
   - Maulana quotes properly formatted

5. **Quranic Perspective Section**
   - Concept name + Arabic + meaning
   - Related verses with connections

### Phase 2: Categories & Bug Fixes (2026-01-02)
1. **4 News Categories**
   - Inspiration (amber) - stories of overcoming challenges
   - Science (blue) - discoveries inspiring God's remembrance
   - Nature (green) - wildlife, oceans, forests
   - Health (teal) - well-being and healing

2. **Bug Fix: "Article Not Found"**
   - Detail page now uses same categorized API as home page
   - Searches across all categories to find clicked article

### Phase 3: Admin Panel (2026-01-02)
1. **Admin Authentication**
   - Password-based login (ADMIN_PASSWORD env var)
   - HMAC-signed session tokens in HttpOnly cookies
   - 24-hour session expiry

2. **Admin Dashboard** (`/admin`)
   - Stats: total articles, pending queue, added this week
   - Quick action buttons

3. **Queue Management** (`/admin/queue`)
   - "Fetch New Articles" pulls from NewsAPI
   - AI scoring shows suitability score
   - Approve with category selection or Reject
   - Articles move to database on approval

4. **Articles Management** (`/admin/articles`)
   - List all published articles with pagination
   - Filter by category and status
   - Hide/Restore/Delete actions
   - View original article link

5. **Add Article** (`/admin/add`)
   - **URL Import:** Auto-fetch title, description, image from any URL
   - **Manual Entry:** Full form with all fields
   - Category selection before publish

6. **Curated Content Priority**
   - News API now checks Supabase first
   - Falls back to NewsAPI if database empty
   - Approved articles appear on public site

## File Structure
```
/root/spiritual-reflections/
├── app/
│   ├── page.js                    # Categorized home page
│   ├── news/[id]/page.js          # Article detail page
│   ├── favorites/page.js          # Saved favorites
│   ├── admin/
│   │   ├── layout.js              # Admin layout with auth
│   │   ├── page.js                # Dashboard
│   │   ├── login/page.js          # Login form
│   │   ├── queue/page.js          # Queue management
│   │   ├── articles/page.js       # Articles management
│   │   └── add/page.js            # Add article form
│   └── api/
│       ├── news/route.js          # News API (Supabase + NewsAPI)
│       ├── interpret/route.js     # Interpretation API
│       └── admin/
│           ├── login/route.js     # Auth login
│           ├── logout/route.js    # Auth logout
│           ├── verify/route.js    # Session verification
│           ├── queue/route.js     # Queue CRUD
│           ├── queue/[id]/route.js
│           ├── articles/route.js  # Articles CRUD
│           ├── articles/[id]/route.js
│           └── fetch-url/route.js # URL metadata extraction
├── components/
│   ├── NewsCard.js
│   ├── SpiritualInterpretation.js
│   ├── ShareButtons.js
│   └── FavoriteButton.js
├── lib/
│   ├── supabase.js                # Supabase client & operations
│   ├── admin-auth.js              # Session management
│   ├── claude.js                  # LightRAG integration
│   ├── categories.js              # Category definitions + Quranic concepts
│   ├── news-filter.js             # Scoring algorithm
│   ├── newsapi.js                 # NewsAPI integration
│   ├── cache.js                   # In-memory cache
│   └── quran-verses.js            # Verse selection
└── docs/
    └── context-summary.md         # This file
```

## Database Schema (Supabase)

### Table: `articles`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| external_id | VARCHAR | Unique ID for deduplication |
| title | TEXT | Article title |
| description | TEXT | Short description |
| content | TEXT | Full content |
| source | VARCHAR | News source name |
| author | VARCHAR | Author name |
| url | TEXT | Original article URL |
| url_to_image | TEXT | Image URL |
| published_at | TIMESTAMPTZ | Publication date |
| category | VARCHAR | inspiration/science/nature/health |
| ai_score | DECIMAL | Suitability score |
| status | VARCHAR | approved/hidden |
| created_at | TIMESTAMPTZ | When added |

### Table: `pending_queue`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| external_id | VARCHAR | Unique ID |
| title, description, etc. | | Same as articles |
| suggested_category | VARCHAR | AI-suggested category |
| ai_reasons | TEXT[] | Why it scored high |
| status | VARCHAR | pending/approved/rejected |
| fetched_at | TIMESTAMPTZ | When fetched |

### Table: `interpretation_cache`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| news_id | VARCHAR(255) | Unique news article ID |
| interpretation_data | JSONB | Cached interpretation (permanent) |
| created_at | TIMESTAMPTZ | When cached |

## Environment Variables

### Required for Public Site
```
NEWS_API_KEY=<newsapi.org key>
```

### Required for Admin Panel
```
ADMIN_PASSWORD=<secure password>
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

## LightRAG Configuration
```
/root/LightRAG-official/.env
- LLM: OpenAI GPT-4o
- Embeddings: OpenAI text-embedding-3-small (1536 dims)
- Graph: 24,335 nodes, 32,949 edges from Maulana's literature
- API: https://graph.spiritualmessage.org
```

## Known Issues & Solutions
1. **LightRAG Connection Error**: Fixed by setting `LLM_BINDING_HOST=https://api.openai.com/v1`
2. **Embedding Dimension Mismatch**: Keep using OpenAI embeddings (can't switch without re-indexing)
3. **Article Not Found Bug**: Fixed by using categorized API in detail page

## Recent Updates (2026-01-02)

### Session 1 Accomplishments
- [x] Fixed "Article not found" bug on detail page
- [x] Added Nature category (green theme)
- [x] Added Health category (teal theme)
- [x] Added Shifa (Healing) Quranic concept
- [x] Built complete admin panel with authentication
- [x] Implemented Supabase database integration
- [x] Created queue system for AI-curated news approval
- [x] Added URL metadata extraction for easy article import
- [x] Modified news API to prioritize curated content

### Session 2 Accomplishments
- [x] Fixed garbage passages in "Wisdom from Maulana's Books" section
  - Enhanced quality filtering to reject book metadata, indexes, table of contents
  - Filter embedded page numbers (like "141animals")
  - Require meaningful spiritual vocabulary
  - Truncate passages to ~300 chars at sentence boundaries
- [x] Implemented persistent interpretation caching via Supabase
  - Interpretations now cached permanently (saves API costs!)
  - Falls back to in-memory when Supabase not configured

### Git Commits
```
0df77a3 - Add persistent Supabase caching for interpretations
60f0eac - Fix garbage passages in Wisdom from Maulana's Books section
a763098 - Add admin panel for curating news content
5d8a1bb - Add Nature & Health categories, fix Article not found bug
```

## Pending Tasks
- [ ] Set up Supabase project and add env vars to Vercel
- [ ] Test Gemini 3 Pro integration (needs embedding compatibility)
- [ ] User news submission feature (future)

## Admin Panel Setup Instructions

1. Create Supabase project at supabase.com
2. Run SQL schema (see Database Schema section)
3. Add environment variables to Vercel
4. Redeploy for changes to take effect
5. Access admin at /admin/login

## Services Status
| Service | Status | URL |
|---------|--------|-----|
| Vercel (Frontend) | Running | spiritual-reflections.vercel.app |
| LightRAG (Docker) | Running | localhost:9621 / graph.spiritualmessage.org |
| Supabase | Setup Required | - |
