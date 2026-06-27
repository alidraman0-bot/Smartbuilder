create schema if not exists telemetry;
create schema if not exists finance;
create schema if not exists ai;

-- Logs table (realtime)
create table if not exists telemetry.logs (
    id uuid default uuid_generate_v4(),
    deployment_id text not null,
    timestamp timestamptz default now(),
    level text check (level in ('debug','info','warn','error')),
    message text,
    metadata jsonb,
    tenant_id text,
    primary key (id)
);

-- Metrics table (realtime)
create table if not exists telemetry.metrics (
    id uuid default uuid_generate_v4(),
    deployment_id text not null,
    timestamp timestamptz default now(),
    metric_name text not null,
    metric_value double precision,
    tags jsonb,
    tenant_id text,
    primary key (id)
);

-- Traces table (realtime)
create table if not exists telemetry.traces (
    id uuid default uuid_generate_v4(),
    trace_id text not null,
    span_id text not null,
    parent_span_id text,
    deployment_id text not null,
    timestamp timestamptz default now(),
    duration_ms bigint,
    name text,
    status text check (status in ('ok','error')),
    attributes jsonb,
    tenant_id text,
    primary key (id)
);

-- Events table (realtime)
create table if not exists telemetry.events (
    event_id uuid default uuid_generate_v4(),
    deployment_id text not null,
    timestamp timestamptz default now(),
    event_type text not null,
    payload jsonb,
    tenant_id text,
    primary key (event_id)
);

-- Payments analytics table (realtime)
create table if not exists finance.payments (
    payment_id uuid default uuid_generate_v4(),
    timestamp timestamptz default now(),
    user_id text,
    amount numeric(18,4),
    currency text,
    status text check (status in ('SUCCESS','FAILED','REFUNDED')),
    provider text,
    metadata jsonb,
    primary key (payment_id)
);

-- AI insights table (realtime)
create table if not exists ai.insights (
    insight_id uuid default uuid_generate_v4(),
    deployment_id text not null,
    timestamp timestamptz default now(),
    type text check (type in ('ANOMALY','RECOMMENDATION','ROOT_CAUSE')),
    title text,
    description text,
    severity text check (severity in ('LOW','MEDIUM','HIGH')),
    payload jsonb,
    primary key (insight_id)
);

-- Enable Realtime on all tables
alter publication supabase_realtime add table telemetry.logs with ("publish": "insert, update, delete");
alter publication supabase_realtime add table telemetry.metrics with ("publish": "insert, update, delete");
alter publication supabase_realtime add table telemetry.traces with ("publish": "insert, update, delete");
alter publication supabase_realtime add table telemetry.events with ("publish": "insert, update, delete");
alter publication supabase_realtime add table finance.payments with ("publish": "insert, update, delete");
alter publication supabase_realtime add table ai.insights with ("publish": "insert, update, delete");
