-- ============================================
-- SMARTBUILDER BILLING SCHEMA
-- Production-grade billing infrastructure
-- Paystack-first, Stripe-ready architecture
-- ============================================

-- 1. ENUMS (TYPE DEFINITIONS)
-- ============================================

CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'cancelled'
);

CREATE TYPE billing_provider AS ENUM (
  'paystack',
  'stripe'
);

CREATE TYPE billing_event_type AS ENUM (
  'subscription_created',
  'payment_succeeded',
  'payment_failed',
  'subscription_cancelled',
  'subscription_updated',
  'payment_method_updated'
);


-- 2. SUBSCRIPTIONS TABLE (CORE)
-- ============================================
-- Single source of truth for org billing status

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Organization reference
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Billing provider details
  provider billing_provider NOT NULL DEFAULT 'paystack',
  plan text NOT NULL CHECK (plan IN ('starter','pro','team','enterprise')),
  
  -- Status tracking
  status subscription_status NOT NULL DEFAULT 'trialing',
  
  -- Provider-specific identifiers
  provider_customer_id text,
  provider_subscription_id text,
  
  -- Billing period
  current_period_start timestamptz,
  current_period_end timestamptz,
  
  -- Cancellation handling
  cancel_at_period_end boolean DEFAULT false,
  cancelled_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  UNIQUE(org_id),  -- One subscription per org
  UNIQUE(provider_subscription_id)  -- Idempotency protection
);

-- Indexes for performance
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_provider_sub_id ON subscriptions(provider_subscription_id);


-- 3. BILLING EVENTS TABLE (IMMUTABLE LEDGER)
-- ============================================
-- Append-only audit trail for compliance

CREATE TABLE billing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Event details
  provider billing_provider NOT NULL,
  event_type billing_event_type NOT NULL,
  
  -- Payment details
  amount integer,  -- in kobo (Paystack) / cents (Stripe)
  currency text DEFAULT 'NGN',
  
  -- Full webhook payload (for debugging & audit)
  raw_payload jsonb NOT NULL,
  
  -- Timestamp
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_billing_events_org_id ON billing_events(org_id);
CREATE INDEX idx_billing_events_subscription_id ON billing_events(subscription_id);
CREATE INDEX idx_billing_events_created_at ON billing_events(created_at DESC);
CREATE INDEX idx_billing_events_event_type ON billing_events(event_type);


-- 4. PAYMENT METHODS TABLE (REFERENCE ONLY)
-- ============================================
-- Non-sensitive card data for display purposes

CREATE TABLE payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Organization reference
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Provider
  provider billing_provider NOT NULL,
  
  -- Card details (non-sensitive)
  card_brand text,  -- visa, mastercard, verve
  last4 text,
  exp_month int,
  exp_year int,
  
  -- Provider authorization reference
  provider_auth_code text,
  
  -- Status
  is_default boolean DEFAULT true,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  UNIQUE(org_id, provider)  -- One payment method per org per provider
);

-- Indexes
CREATE INDEX idx_payment_methods_org_id ON payment_methods(org_id);


-- 5. PLAN FEATURES TABLE (FEATURE FLAGS)
-- ============================================
-- JSON-based feature matrix for zero-migration pricing changes

CREATE TABLE plan_features (
  plan text PRIMARY KEY,
  features jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed data with feature matrix
INSERT INTO plan_features (plan, features) VALUES
('starter', '{
  "freeze_build": false,
  "deployment": false,
  "custom_domain": false,
  "team_access": false,
  "executive_reports": false,
  "api_access": false,
  "max_projects": 3,
  "max_team_members": 1,
  "build_freezes_per_month": 0
}'),
('pro', '{
  "freeze_build": true,
  "deployment": true,
  "custom_domain": true,
  "team_access": false,
  "executive_reports": false,
  "api_access": false,
  "max_projects": -1,
  "max_team_members": 1,
  "build_freezes_per_month": 10
}'),
('team', '{
  "freeze_build": true,
  "deployment": true,
  "custom_domain": true,
  "team_access": true,
  "executive_reports": true,
  "api_access": true,
  "max_projects": -1,
  "max_team_members": 5,
  "build_freezes_per_month": -1
}'),
('enterprise', '{
  "freeze_build": true,
  "deployment": true,
  "custom_domain": true,
  "team_access": true,
  "executive_reports": true,
  "api_access": true,
  "max_projects": -1,
  "max_team_members": -1,
  "build_freezes_per_month": -1
}');


-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all billing tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

-- Subscriptions: org members can read their org's subscription
CREATE POLICY "org_members_read_subscription" 
ON subscriptions
FOR SELECT
USING (
  org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  )
);

-- Subscriptions: Service role can write (webhooks)
CREATE POLICY "service_role_write_subscriptions" 
ON subscriptions
FOR ALL
USING (auth.role() = 'service_role');

-- Billing events: org members can read their org's events
CREATE POLICY "org_members_read_billing_events" 
ON billing_events
FOR SELECT
USING (
  org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  )
);

-- Billing events: Service role can write (webhooks)
CREATE POLICY "service_role_write_billing_events" 
ON billing_events
FOR ALL
USING (auth.role() = 'service_role');

-- Payment methods: org members can read their org's payment methods
CREATE POLICY "org_members_read_payment_methods" 
ON payment_methods
FOR SELECT
USING (
  org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  )
);

-- Payment methods: Service role can write
CREATE POLICY "service_role_write_payment_methods" 
ON payment_methods
FOR ALL
USING (auth.role() = 'service_role');

-- Plan features: everyone can read (no sensitive data)
CREATE POLICY "public_read_plan_features" 
ON plan_features
FOR SELECT
USING (true);


-- 7. UPDATED_AT TRIGGER
-- ============================================
-- Auto-update updated_at timestamp

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_features_updated_at BEFORE UPDATE ON plan_features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- MIGRATION NOTES
-- ============================================
-- 
-- This schema extends the existing supabase_schema.sql
-- Run this after the core schema is applied
--
-- To apply:
-- 1. Connect to Supabase via SQL editor or psql
-- 2. Run this entire file
-- 3. Verify tables created: \dt
-- 4. Verify RLS enabled: \d+ subscriptions
--
-- ============================================
