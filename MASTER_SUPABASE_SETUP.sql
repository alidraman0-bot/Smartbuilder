-- ========================================================
-- MASTER SUPABASE SETUP FOR SMARTBUILDER
-- Consolidates Infrastructure + Billing + Visibility Fixes
-- ========================================================

-- 1. ENUMS (Run these first, ignored if they already exist via DO blocks)
-- ========================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('founder','builder','viewer','admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'org_role') THEN
        CREATE TYPE org_role AS ENUM ('owner','admin','member');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
        CREATE TYPE project_status AS ENUM ('draft','iterating','stable','frozen');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
        CREATE TYPE plan_type AS ENUM ('starter','pro','team','enterprise');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'build_status') THEN
        CREATE TYPE build_status AS ENUM ('success','failed','rolled_back');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('trialing','active','past_due','cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_provider') THEN
        CREATE TYPE billing_provider AS ENUM ('paystack','stripe');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_event_type') THEN
        CREATE TYPE billing_event_type AS ENUM (
            'subscription_created','payment_succeeded','payment_failed',
            'subscription_cancelled','subscription_updated','payment_method_updated'
        );
    END IF;
END $$;

-- 2. TABLES (Safe Creation)
-- ========================================================

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role user_role DEFAULT 'builder',
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id),
  plan plan_type DEFAULT 'starter',
  created_at timestamptz DEFAULT now()
);

-- Org Members
CREATE TABLE IF NOT EXISTS org_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role org_role DEFAULT 'member'
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider billing_provider NOT NULL DEFAULT 'paystack',
  plan text NOT NULL CHECK (plan IN ('starter','pro','team','enterprise')),
  status subscription_status NOT NULL DEFAULT 'trialing',
  provider_customer_id text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(org_id),
  UNIQUE(provider_subscription_id)
);

-- Plan Features
CREATE TABLE IF NOT EXISTS plan_features (
  plan text PRIMARY KEY,
  features jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider billing_provider NOT NULL,
  card_brand text,
  last4 text,
  exp_month int,
  exp_year int,
  provider_auth_code text,
  is_default boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(org_id, provider)
);

-- Billing Events
CREATE TABLE IF NOT EXISTS billing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider billing_provider NOT NULL,
  event_type billing_event_type NOT NULL,
  amount integer,
  currency text DEFAULT 'NGN',
  raw_payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  status project_status DEFAULT 'draft',
  github_repo text,
  created_at timestamptz DEFAULT now()
);

-- 3. ENABLE RLS
-- ========================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES (Visibility Fixes)
-- ========================================================

-- Org Members (Crucial for identifying memberships)
DROP POLICY IF EXISTS "Users can view own memberships" ON org_members;
CREATE POLICY "Users can view own memberships" ON org_members FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can be added to orgs" ON org_members;
CREATE POLICY "Users can be added to orgs" ON org_members FOR INSERT WITH CHECK (true);

-- Organizations (Owners/Members can see)
DROP POLICY IF EXISTS "Members can view organizations" ON organizations;
CREATE POLICY "Members can view organizations" ON organizations FOR SELECT USING (
  owner_id = auth.uid() 
  OR 
  id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
);

-- Subscriptions
DROP POLICY IF EXISTS "org_members_read_subscription" ON subscriptions;
CREATE POLICY "org_members_read_subscription" ON subscriptions FOR SELECT USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
);

-- Plan Features
DROP POLICY IF EXISTS "public_read_plan_features" ON plan_features;
CREATE POLICY "public_read_plan_features" ON plan_features FOR SELECT USING (true);

-- 5. SEED DATA
-- ========================================================
INSERT INTO plan_features (plan, features) VALUES
('starter', '{"freeze_build": false, "deployment": false, "custom_domain": false, "team_access": false, "max_projects": 1}')
ON CONFLICT (plan) DO UPDATE SET features = EXCLUDED.features;

INSERT INTO plan_features (plan, features) VALUES
('pro', '{"freeze_build": true, "deployment": true, "custom_domain": true, "team_access": false, "max_projects": 5}')
ON CONFLICT (plan) DO UPDATE SET features = EXCLUDED.features;

INSERT INTO plan_features (plan, features) VALUES
('team', '{"freeze_build": true, "deployment": true, "custom_domain": true, "team_access": true, "max_projects": -1}')
ON CONFLICT (plan) DO UPDATE SET features = EXCLUDED.features;

-- 6. PERMISSIONS
-- ========================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
