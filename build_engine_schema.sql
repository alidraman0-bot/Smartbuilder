-- Build Engine Schema
-- Tables for the MVP Builder build orchestrator system

-- Build Plans (AI-generated architecture)
CREATE TABLE IF NOT EXISTS build_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id TEXT NOT NULL,
    plan JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Build Tasks (pipeline execution tracking)
CREATE TABLE IF NOT EXISTS build_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id TEXT NOT NULL,
    build_plan_id UUID REFERENCES build_plans(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL,
    task_order INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    result JSONB,
    error_log TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Build Logs (timeline events)
CREATE TABLE IF NOT EXISTS build_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES build_tasks(id) ON DELETE CASCADE,
    build_plan_id UUID REFERENCES build_plans(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    level TEXT DEFAULT 'info',
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_build_plans_project ON build_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_build_tasks_project ON build_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_build_tasks_plan ON build_tasks(build_plan_id);
CREATE INDEX IF NOT EXISTS idx_build_logs_task ON build_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_build_logs_plan ON build_logs(build_plan_id);

-- RLS Policies (permissive for MVP)
ALTER TABLE build_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for build_plans" ON build_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for build_tasks" ON build_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for build_logs" ON build_logs FOR ALL USING (true) WITH CHECK (true);
