-- Project Memory System Schema

-- Ideas Table
create table if not exists public.ideas (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references projects(project_id) on delete cascade not null,
    title text not null,
    thesis text,
    source text default 'ai_generated', -- 'ai_generated', 'user_submission'
    confidence_score integer,
    content jsonb, -- Stores the full idea object (market_size, problem_bullets, etc.)
    status text default 'draft', -- 'draft', 'researched', 'approved', 'discarded'
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Research Snapshots Table
create table if not exists public.research_snapshots (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references projects(project_id) on delete cascade not null,
    idea_id uuid references ideas(id) on delete cascade,
    market_size jsonb,
    trends jsonb,
    charts jsonb,
    assumptions jsonb,
    sources jsonb,
    created_at timestamptz default now()
);

-- Business Plan Versions Table
create table if not exists public.business_plan_versions (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references projects(project_id) on delete cascade not null,
    research_snapshot_id uuid references research_snapshots(id),
    version_number integer not null,
    content jsonb, -- Full business plan structure
    created_at timestamptz default now()
);

-- PRD Versions Table
create table if not exists public.prd_versions (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references projects(project_id) on delete cascade not null,
    business_plan_version_id uuid references business_plan_versions(id),
    content jsonb, -- Full PRD structure
    status text default 'draft', -- 'draft', 'locked'
    created_at timestamptz default now()
);

-- Memory Events Table (The Ledger)
create table if not exists public.memory_events (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references projects(project_id) on delete cascade not null,
    type text not null, -- 'idea_created', 'research_completed', 'plan_generated', 'prd_locked'
    title text not null,
    description text,
    actor text default 'system', -- 'user', 'smartbuilder_ai', 'system'
    artifact_ref_type text, -- 'ideas', 'business_plan_versions', etc.
    artifact_ref_id uuid,
    metadata jsonb,
    created_at timestamptz default now()
);

-- Enable RLS
alter table ideas enable row level security;
alter table research_snapshots enable row level security;
alter table business_plan_versions enable row level security;
alter table prd_versions enable row level security;
alter table memory_events enable row level security;

-- Basic Policies (Allow all for service role, restrict read/write for users based on project access)
-- Note: Assuming authentication is handled via Supabase Auth and RLS policies on 'projects' table exist.
-- For MVP, we'll allow public access or authenticated access. Here is a permissive policy for authenticated users:

create policy "Enable all access for authenticated users" on ideas for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on research_snapshots for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on business_plan_versions for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on prd_versions for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on memory_events for all using (auth.role() = 'authenticated');

-- Also allow service_role to do everything (Supabase default usually covers this, but good to be explicit if needed)
