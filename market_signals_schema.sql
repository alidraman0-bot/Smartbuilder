-- market_signals_schema.sql
-- Create table to store market signals from Reddit, HN, and News

CREATE TABLE IF NOT EXISTS market_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL, -- 'reddit', 'hn', 'news'
    title TEXT NOT NULL,
    description TEXT,
    url TEXT UNIQUE,
    signal_strength NUMERIC NOT NULL,
    category TEXT NOT NULL, -- 'problem', 'trend', 'product'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient querying by source and recreation time
CREATE INDEX IF NOT EXISTS idx_market_signals_created_at ON market_signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_signals_source ON market_signals(source);

-- ── NEW: Real Market Data Engine Tables ──

-- Store extracted high-value keywords for an idea
CREATE TABLE IF NOT EXISTS market_keywords (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id    UUID REFERENCES ideas(id) ON DELETE CASCADE,
    keywords   JSONB NOT NULL, -- Array of strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store search interest growth and momentum per keyword
CREATE TABLE IF NOT EXISTS trend_signals (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id    UUID REFERENCES ideas(id) ON DELETE CASCADE,
    keyword    TEXT NOT NULL,
    growth     TEXT, -- e.g. "+47%"
    momentum   TEXT, -- e.g. "rising"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store detected competitors for a specific idea
CREATE TABLE IF NOT EXISTS competitor_signals (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id          UUID REFERENCES ideas(id) ON DELETE CASCADE,
    company_name     TEXT NOT NULL,
    description      TEXT,
    website          TEXT,
    funding_estimate TEXT,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store capital flow estimates and funding activity
CREATE TABLE IF NOT EXISTS funding_signals (
    id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id                   UUID REFERENCES ideas(id) ON DELETE CASCADE,
    total_estimated_funding   TEXT, -- e.g. "$210M"
    num_startups_funded       INTEGER,
    recent_activity_score     TEXT, -- "High", "Medium", "Low"
    created_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_keywords_idea_id ON market_keywords(idea_id);
CREATE INDEX IF NOT EXISTS idx_trend_signals_idea_id ON trend_signals(idea_id);
CREATE INDEX IF NOT EXISTS idx_competitor_signals_idea_id ON competitor_signals(idea_id);
CREATE INDEX IF NOT EXISTS idx_funding_signals_idea_id ON funding_signals(idea_id);
