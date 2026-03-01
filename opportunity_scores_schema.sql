-- opportunity_scores_schema.sql
-- Stores venture analysis scores for generated opportunities

CREATE TABLE IF NOT EXISTS opportunity_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id TEXT NOT NULL, -- Logical ID to link to the idea
    score DECIMAL(3, 1) NOT NULL,
    market_demand TEXT NOT NULL,
    competition TEXT NOT NULL,
    revenue_potential TEXT NOT NULL,
    build_difficulty TEXT NOT NULL,
    trend TEXT NOT NULL,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_opportunity_scores_idea_id ON opportunity_scores(idea_id);
