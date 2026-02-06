-- MVP Builder Schema

-- Builder Sessions
create table builder_sessions (
    session_id uuid primary key default uuid_generate_v4(),
    run_id text not null,
    status text not null, -- S0-S6
    project_name text,
    build_mode text default 'UI',
    build_version integer default 1,
    prd_snapshot jsonb,
    research_snapshot jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Build Artifacts (Files)
create table build_artifacts (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid references builder_sessions(session_id) on delete cascade,
    file_path text not null,
    content text,
    file_type text,
    version integer not null,
    created_at timestamptz default now()
);

-- Execution Timeline / Logs
create table builder_logs (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid references builder_sessions(session_id) on delete cascade,
    message text not null,
    event_type text not null, -- info, success, warning, error
    timestamp timestamptz default now(),
    meta jsonb
);

-- Snapshots (for Revert)
create table builder_snapshots (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid references builder_sessions(session_id) on delete cascade,
    version integer not null,
    files_snapshot jsonb,
    created_at timestamptz default now()
);
