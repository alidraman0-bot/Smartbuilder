-- Project Memory System Schema

-- Ideas Table
CREATE TABLE IF NOT EXISTS ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    thesis TEXT NOT NULL,
    source TEXT NOT NULL, -- user_input | ai_generated
    confidence_score INTEGER,
    status TEXT DEFAULT 'draft', -- draft | promoted | archived
    content JSONB, -- Full AI output blob
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research Snapshots Table
CREATE TABLE IF NOT EXISTS research_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    idea_id UUID REFERENCES ideas(id) ON DELETE SET NULL,
    market_size JSONB,
    trends JSONB,
    charts JSONB,
    assumptions JSONB,
    sources JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Plan Versions Table
CREATE TABLE IF NOT EXISTS business_plan_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    research_snapshot_id UUID REFERENCES research_snapshots(id) ON DELETE SET NULL,
    content JSONB NOT NULL,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRD Versions Table
CREATE TABLE IF NOT EXISTS prd_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    business_plan_version_id UUID REFERENCES business_plan_versions(id) ON DELETE SET NULL,
    content JSONB NOT NULL,
    status TEXT DEFAULT 'draft', -- draft | final | locked
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory Events Table (The Spine)
CREATE TABLE IF NOT EXISTS memory_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- idea_created, research_snapshot_created, prd_locked, etc.
    title TEXT NOT NULL,
    description TEXT,
    artifact_ref_type TEXT, -- ideas, research_snapshots, etc.
    artifact_ref_id UUID,
    actor TEXT NOT NULL, -- user | smartbuilder_ai
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Edits Table (The Trust Layer)
CREATE TABLE IF NOT EXISTS user_edits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artifact_type TEXT NOT NULL, -- business_plan, prd, etc.
    artifact_id UUID NOT NULL,
    edit_type TEXT NOT NULL, -- override | note | assumption
    content JSONB NOT NULL,
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idea Lineage (Tracking evolution)
CREATE TABLE IF NOT EXISTS idea_lineage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    child_artifact_type TEXT NOT NULL, -- research_snapshot, bp_version, etc.
    child_artifact_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
