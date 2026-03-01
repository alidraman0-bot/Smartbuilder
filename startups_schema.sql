-- startups_schema.sql
-- Tracks the progress of a startup through various pipeline stages

CREATE TABLE IF NOT EXISTS startups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    current_stage TEXT NOT NULL DEFAULT 'idea',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Constraint for valid stages
-- Stages: idea -> research -> prd -> build -> launch -> monitor
ALTER TABLE startups DROP CONSTRAINT IF EXISTS check_valid_stage;
ALTER TABLE startups ADD CONSTRAINT check_valid_stage 
CHECK (current_stage IN ('idea', 'research', 'prd', 'build', 'launch', 'monitor'));

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_startups_user_id ON startups(user_id);
