-- 1.1 ENUM TYPES
CREATE TYPE user_role AS ENUM ('founder','builder','viewer','admin');
CREATE TYPE org_role AS ENUM ('owner','admin','member');
CREATE TYPE project_status AS ENUM ('draft','iterating','stable','frozen');
CREATE TYPE plan_type AS ENUM ('starter','pro','team','enterprise');
CREATE TYPE build_status AS ENUM ('success','failed','rolled_back');

-- 1.2 PROFILES
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role user_role DEFAULT 'builder',
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 1.3 ORGANIZATIONS
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id),
  plan plan_type DEFAULT 'starter',
  created_at timestamptz DEFAULT now()
);

-- 1.4 ORG MEMBERS
CREATE TABLE org_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role org_role DEFAULT 'member'
);

-- 1.5 PROJECTS
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  status project_status DEFAULT 'draft',
  github_repo text,
  created_at timestamptz DEFAULT now()
);

-- 1.6 PROJECT MEMORY (CORE INTELLIGENCE)
CREATE TABLE project_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  summary text,
  files_changed jsonb,
  prd_version text,
  build_version text,
  created_at timestamptz DEFAULT now()
);

-- 1.7 PRDs
CREATE TABLE prds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  version text,
  content jsonb,
  created_at timestamptz DEFAULT now()
);

-- 1.8 MARKET RESEARCH
CREATE TABLE market_research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  data jsonb,
  sources jsonb,
  trends jsonb,
  created_at timestamptz DEFAULT now()
);

-- 1.9 BUILDS
CREATE TABLE builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  version text,
  status build_status,
  created_at timestamptz DEFAULT now()
);

-- 1.10 FREEZE ARTIFACTS
CREATE TABLE freeze_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  build_id uuid REFERENCES builds(id),
  manifest jsonb,
  metadata jsonb,
  checksum jsonb,
  storage_path text,
  created_at timestamptz DEFAULT now()
);

-- 4.1 BILLING TABLES
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id),
  provider text DEFAULT 'paystack',
  plan plan_type,
  status text,
  current_period_end timestamptz
);
CREATE TABLE usage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid,
  metric text,
  value integer,
  recorded_at timestamptz DEFAULT now()
);

-- ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE prds ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE freeze_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

-- SIMPLE POLICIES (PLACEHOLDERS - NEED REFINEMENT FOR PROD)
-- Profiles: Users can view their own profile and profiles of users in their orgs.
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Organizations: Owners/Members can view their organizations.
CREATE POLICY "Members can view organizations" ON organizations
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM org_members WHERE org_id = id)
    OR
    owner_id = auth.uid()
  );

-- Projects: Members of the org can view projects.
CREATE POLICY "Org members can view projects" ON projects
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
    OR
    org_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

-- TODO: Add more granular policies based on 'user_role' and 'org_role'
