-- Add run_id and build_id to deployments
alter table deployments 
add column run_id text,
add column build_id text;
