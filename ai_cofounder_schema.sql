-- ai_cofounder_schema.sql
-- Stores AI-generated advice and analysis for startup projects

CREATE TABLE IF NOT EXISTS ai_cofounder_advice (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES startup_projects(id) ON DELETE CASCADE,
    health_score NUMERIC(4,2) DEFAULT 0.0,
    key_insights JSONB DEFAULT '[]',
    risks JSONB DEFAULT '[]',
    next_actions JSONB DEFAULT '[]',
    analysis_context JSONB DEFAULT '{}', -- Store what inputs led to this advice
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for project lookups
CREATE INDEX IF NOT EXISTS idx_ai_cofounder_advice_project_id ON ai_cofounder_advice(project_id);

-- RLS Policies
ALTER TABLE ai_cofounder_advice ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view advice for their own projects"
    ON ai_cofounder_advice FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM startup_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert advice for their own projects"
    ON ai_cofounder_advice FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM startup_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update advice for their own projects"
    ON ai_cofounder_advice FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM startup_projects WHERE user_id = auth.uid()
        )
    );
