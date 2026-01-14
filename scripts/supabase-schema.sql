-- Spiritual Reflections - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Articles table with AI interpretation columns
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,

  -- News article data
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  source TEXT,
  author TEXT,
  url TEXT,
  url_to_image TEXT,
  published_at TIMESTAMPTZ,
  category TEXT,

  -- AI-generated interpretation
  ai_what_happened TEXT,
  ai_interpretation TEXT,
  ai_inline_citations JSONB DEFAULT '[]',
  ai_quranic_perspective JSONB,
  ai_generated_at TIMESTAMPTZ,

  -- Approval workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'auto_saved')),
  ai_score REAL DEFAULT 0,

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);

-- Pending queue for news articles awaiting AI generation
CREATE TABLE IF NOT EXISTS pending_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,

  -- News article data
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  source TEXT,
  url TEXT,
  url_to_image TEXT,
  suggested_category TEXT,

  -- AI scoring
  ai_score REAL DEFAULT 0,
  ai_reasons TEXT[],

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_external_id ON articles(external_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pending_queue_status ON pending_queue(status);

-- Row Level Security (optional but recommended)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_queue ENABLE ROW LEVEL SECURITY;

-- Public read policy for approved articles
CREATE POLICY "Public can read approved articles" ON articles
  FOR SELECT USING (status IN ('approved', 'auto_saved'));

-- Service role can do everything
CREATE POLICY "Service role full access articles" ON articles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access queue" ON pending_queue
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
