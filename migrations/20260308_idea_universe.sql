-- Migration: Idea Universe Architecture
-- Date: 2026-03-08

-- 1. Expand ideas_v2 table with top-level dimension columns
ALTER TABLE ideas_v2 
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS customer_segment TEXT,
ADD COLUMN IF NOT EXISTS problem TEXT,
ADD COLUMN IF NOT EXISTS technology TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS embedding VECTOR(1536); -- For similarity deduplication

-- 2. Create user_seen_ideas table
CREATE TABLE IF NOT EXISTS user_seen_ideas (
    user_id UUID NOT NULL,
    idea_id UUID NOT NULL REFERENCES ideas_v2(id) ON DELETE CASCADE,
    seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, idea_id)
);

-- 3. Create opportunity_analysis table
CREATE TABLE IF NOT EXISTS opportunity_analysis (
    idea_id UUID PRIMARY KEY REFERENCES ideas_v2(id) ON DELETE CASCADE,
    problem_score FLOAT DEFAULT 0,
    market_size_description TEXT,
    market_size_numeric BIGINT DEFAULT 0,
    competition_intensity TEXT,
    competitors JSONB DEFAULT '[]',
    growth_trend TEXT,
    opportunity_score FLOAT DEFAULT 0,
    why_now TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ideas_v2_title ON ideas_v2(title);
CREATE INDEX IF NOT EXISTS idx_ideas_v2_user_id ON ideas_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_user_seen_ideas_user_id ON user_seen_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_v2_dimensions ON ideas_v2(industry, customer_segment, problem);
