-- pipeline_schema.sql
-- Tracks the lifecycle of a startup project

-- Force recreation to ensure schema consistency
DROP TABLE IF EXISTS startup_projects CASCADE;

CREATE TABLE startup_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    startup_name TEXT NOT NULL,
    current_stage TEXT NOT NULL DEFAULT 'IDEA',
    idea_id UUID,
    research_id UUID,
    prd_id UUID,
    mvp_id UUID,
    launch_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Constraint for valid stages
-- Stages: IDEA, RESEARCH, PRD, MVP, LAUNCH, MONITORING
ALTER TABLE startup_projects DROP CONSTRAINT IF EXISTS check_valid_stage_projects;
ALTER TABLE startup_projects ADD CONSTRAINT check_valid_stage_projects 
CHECK (current_stage IN ('IDEA', 'RESEARCH', 'PRD', 'MVP', 'LAUNCH', 'MONITORING'));

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_startup_projects_user_id ON startup_projects(user_id);

-- RLS Policies
ALTER TABLE startup_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own startup projects"
    ON startup_projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own startup projects"
    ON startup_projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own startup projects"
    ON startup_projects FOR UPDATE
    USING (auth.uid() = user_id);
