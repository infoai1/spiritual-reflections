# Spiritual Reflections

A webapp that transforms news into spiritual wisdom in the style of **Maulana Wahiduddin Khan** (1925-2021).

## What This App Does

1. **Fetches news** from NewsAPI (BBC, Reuters, Al Jazeera, etc.)
2. **Filters** news suitable for spiritual interpretation (science, nature, health - not crime/violence)
3. **Interprets** each news using Claude AI with RAG (Retrieval Augmented Generation)
4. **Displays** spiritual reflections that evoke gratitude, God's glory, and awareness of the Hereafter

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS (dark theme)
- **AI**: Claude API with RAG
- **News**: NewsAPI.org
- **Storage**: LocalStorage (favorites)

## Project Structure

```
spiritual-reflections/
├── app/
│   ├── page.js                    # Home - news grid
│   ├── news/[id]/page.js          # News detail + interpretation
│   ├── favorites/page.js          # Saved favorites
│   ├── api/news/route.js          # Fetch + filter news
│   ├── api/interpret/route.js     # Claude interpretation
│   ├── layout.js                  # Root layout
│   └── globals.css                # Dark theme styles
├── components/
│   ├── NewsCard.js                # News card component
│   ├── SpiritualInterpretation.js # Interpretation display
│   ├── ShareButtons.js            # Social sharing
│   └── FavoriteButton.js          # Save to favorites
├── lib/
│   ├── newsapi.js                 # NewsAPI helper
│   ├── claude.js                  # Claude + RAG integration
│   ├── knowledge-base.js          # Search Maulana's writings
│   ├── news-filter.js             # Filter suitable news
│   └── favorites.js               # LocalStorage helpers
├── knowledge/
│   ├── articles.json              # Scraped/sample articles
│   └── books/                     # Processed PDF books
├── scripts/
│   ├── scrape-cps.js              # Scrape cpsglobal.org
│   └── process-pdf.js             # Extract text from PDFs
└── .env.example                   # Environment template
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API keys:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   - `NEWS_API_KEY` - Get free key at https://newsapi.org
   - `ANTHROPIC_API_KEY` - Get at https://console.anthropic.com

3. **Add knowledge base (optional but recommended):**
   ```bash
   # Process a PDF book
   node scripts/process-pdf.js /path/to/book.pdf
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Key Features

### News Filtering Logic (`lib/news-filter.js`)
- Scores articles based on keywords
- **Positive**: nature, science, space, health, community, wisdom
- **Negative**: violence, crime, politics, celebrity gossip
- Only shows top 10 most suitable articles

### RAG System (`lib/knowledge-base.js`)
- Searches Maulana's writings for relevant passages
- Passes context to Claude for authentic interpretations
- Falls back to sample teachings if knowledge base is empty

### Interpretation Prompt (`lib/claude.js`)
Claude is instructed to:
1. See God's signs (Ayat) in events
2. Evoke gratitude (Shukr)
3. Remind of Hereafter (Akhirat)
4. Encourage contemplation (Tafakkur)
5. Use gentle, wise, contemplative style

## Design

- **Theme**: Dark mode with gold accents
- **Colors**:
  - Background: #1a1a2e
  - Cards: #16213e
  - Gold: #d4af37
  - Text: #faf8f5 (cream)

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

## Inspired By

Maulana Wahiduddin Khan's approach of **Tafakkur** (contemplation) -
transforming worldly observations into spiritual wisdom.

> "The universe is like a vast book, and those who contemplate it
> discover the glory of its Author."
> — Maulana Wahiduddin Khan
