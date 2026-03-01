-- opportunity_runs_schema.sql
-- Stores history of automated opportunity discovery runs

CREATE TABLE IF NOT EXISTS opportunity_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    signals_used JSONB NOT NULL,
    ideas_generated JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_opportunity_runs_user_id ON opportunity_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_runs_created_at ON opportunity_runs(created_at DESC);
