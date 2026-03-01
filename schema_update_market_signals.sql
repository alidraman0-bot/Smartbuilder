-- schema_update_market_signals.sql
-- Create table to store market signals from Reddit, HN, and News

CREATE TABLE IF NOT EXISTS market_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL, -- e.g., 'Reddit', 'Hacker News', 'Product Hunt', 'Google Trends'
    topic TEXT NOT NULL,
    summary TEXT,
    trend_score NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient querying by newest first
CREATE INDEX IF NOT EXISTS idx_market_signals_created_at ON market_signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_signals_source ON market_signals(source);
