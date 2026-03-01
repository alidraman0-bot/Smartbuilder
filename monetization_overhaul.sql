-- monetization_overhaul.sql
-- Migration to USD pricing and 4-tier plan system

-- 1. Update plan_type enum (if possible, otherwise handle as text in logic)
-- In Supabase, you can't easily modify ENUMs. If it exists, we handle it.
-- Based on supabase_schema.sql: CREATE TYPE plan_type AS ENUM ('starter','pro','team','enterprise');
-- We need to add 'free'. 
-- Note: Paystack plans correspond to starter, pro, team. Free is internal.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type' AND 'free' = ANY (enum_range(NULL::plan_type)::text[])) THEN
        ALTER TYPE plan_type ADD VALUE 'free' BEFORE 'starter';
    END IF;
END $$;

-- 2. Update subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paystack_customer_code TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT;

-- 3. Update plan_features matrix
-- Clear existing and re-seed
DELETE FROM plan_features;

INSERT INTO plan_features (plan, features) VALUES
('free', '{
  "idea_clicks": 20,
  "ideas_per_click": 5,
  "global_domains": "basic",
  "idea_history_limit": 10,
  "mvp_builder": false,
  "freeze_build": false,
  "deployment": false,
  "team_access": false,
  "max_projects": 0,
  "prd_generation": false,
  "github_connection": false,
  "pdf_exports": false,
  "market_research": "none"
}'),
('starter', '{
  "idea_clicks": 200,
  "ideas_per_click": 10,
  "global_domains": "advanced",
  "idea_history_limit": -1,
  "mvp_builder": true,
  "freeze_build": false,
  "deployment": false,
  "team_access": false,
  "max_projects": 1,
  "prd_generation": true,
  "github_connection": true,
  "pdf_exports": true,
  "market_research": "basic"
}'),
('pro', '{
  "idea_clicks": -1,
  "ideas_per_click": 10,
  "global_domains": "advanced",
  "idea_history_limit": -1,
  "mvp_builder": true,
  "freeze_build": true,
  "deployment": true,
  "team_access": false,
  "max_projects": 5,
  "prd_generation": true,
  "github_connection": true,
  "pdf_exports": true,
  "market_research": "full",
  "priority_queue": true
}'),
('team', '{
  "idea_clicks": -1,
  "ideas_per_click": 10,
  "global_domains": "advanced",
  "idea_history_limit": -1,
  "mvp_builder": true,
  "freeze_build": true,
  "deployment": true,
  "team_access": true,
  "max_projects": -1,
  "prd_generation": true,
  "github_connection": true,
  "pdf_exports": true,
  "market_research": "full",
  "priority_queue": true,
  "usage_analytics": true,
  "exec_dashboards": true
}');
