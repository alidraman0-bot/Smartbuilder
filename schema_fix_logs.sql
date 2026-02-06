-- Deployment Logs Table
create table deployment_logs (
  log_id uuid primary key default uuid_generate_v4(),
  deployment_id uuid references deployments(deployment_id) on delete cascade,
  stage text,
  message text,
  level text, -- 'info', 'error', 'success'
  timestamp timestamptz default now()
);
