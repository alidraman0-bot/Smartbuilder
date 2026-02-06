-- Domains Table
 crete table domains (
  domain text primary key,
  project_id uuid references projects(project_id) on delete cascade,
  type text default 'custom',
  status text default 'pending',
  dns_status text default 'pending',
  ssl_status text default 'pending',
  created_at timestamptz default now()
);
