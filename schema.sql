-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects Table
create table projects (
  project_id uuid primary key default uuid_generate_v4(),
  name text not null,
  framework text,
  environment text default 'Production',
  status text default 'active',
  root_directory text default './',
  latest_deployment_id text,
  url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Deployments Table
create table deployments (
  deployment_id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(project_id) on delete cascade,
  status text not null, -- success, building, failed
  commit_message text,
  environment text,
  url text,
  version text,
  duration text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Environment Variables Table
create table environment_variables (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(project_id) on delete cascade,
  key text not null,
  value text not null, -- In real app, encrypt this!
  target text[], -- Array of strings: ['Production', 'Preview']
  created_at timestamptz default now()
);

-- Activity Logs Table
create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(project_id) on delete cascade,
  user_id text,
  user_name text,
  action text,
  target text,
  environment text,
  details text,
  timestamp timestamptz default now()
);

-- Teams Table (Simplified)
create table team_members (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(project_id) on delete cascade,
  user_id text not null,
  email text not null,
  role text not null,
  created_at timestamptz default now()
);
