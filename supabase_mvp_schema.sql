-- MVP Builder v2 Schema Upgrade

-- 1. Modify existing `projects` table (if needed) or create it if missing
CREATE TABLE IF NOT EXISTS projects (
  project_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  blueprint jsonb,
  architecture jsonb,
  preview_url text,
  status text DEFAULT 'planning',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- We might already have `projects`. Let's safely add columns to it if it exists
ALTER TABLE projects ADD COLUMN IF NOT EXISTS blueprint jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS architecture jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS preview_url text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sandbox_id text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create `project_files` table
CREATE TABLE IF NOT EXISTS project_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES projects(project_id) ON DELETE CASCADE,
    path text NOT NULL,
    content text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(project_id, path)
);

-- 3. Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- 4. Set up Policies
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (
  user_id = auth.uid() OR project_id IN (SELECT project_id FROM team_members WHERE user_id = auth.uid()::text)
);

DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (
  user_id = auth.uid() OR project_id IN (SELECT project_id FROM team_members WHERE user_id = auth.uid()::text)
);

DROP POLICY IF EXISTS "public_read_project_files" ON project_files;
CREATE POLICY "public_read_project_files" ON project_files FOR SELECT USING (true); -- Allow preview reading

DROP POLICY IF EXISTS "public_insert_project_files" ON project_files;
CREATE POLICY "public_insert_project_files" ON project_files FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_project_files" ON project_files;
CREATE POLICY "public_update_project_files" ON project_files FOR UPDATE USING (true);

-- 5. Create `project_edits` table (Phase 9)
CREATE TABLE IF NOT EXISTS project_edits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES projects(project_id) ON DELETE CASCADE,
    instruction text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Allow service role full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
