-- startup_blueprints_schema.sql
-- Stores AI-generated startup blueprints, linked to a startup project record

-- Force recreation to ensure column changes are applied
DROP TABLE IF EXISTS startup_blueprints CASCADE;

CREATE TABLE startup_blueprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES startup_projects(id) ON DELETE CASCADE,
    overview TEXT,
    problem TEXT,
    solution TEXT,
    market_size TEXT,
    target_customers TEXT,
    revenue_model TEXT,
    competitive_landscape TEXT,
    mvp_features TEXT,
    tech_architecture TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    share_token UUID DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups by project
CREATE INDEX IF NOT EXISTS idx_startup_blueprints_project_id ON startup_blueprints(project_id);
CREATE INDEX IF NOT EXISTS idx_startup_blueprints_share_token ON startup_blueprints(share_token);

-- Row-level security: users can only see blueprints for their own projects
ALTER TABLE startup_blueprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blueprints"
    ON startup_blueprints FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM startup_projects WHERE user_id = auth.uid()
        ) OR is_public = TRUE
    );

CREATE POLICY "Users can insert own blueprints"
    ON startup_blueprints FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM startup_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own blueprints"
    ON startup_blueprints FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM startup_projects WHERE user_id = auth.uid()
        )
    );
