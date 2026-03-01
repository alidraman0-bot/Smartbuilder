-- ============================================================================
-- DEPLOYMENT SCRIPT FOR GLOBAL IDEA GENERATION SYSTEM
-- ============================================================================
-- This script safely deploys the new schema alongside existing tables.
-- Run this in your Supabase SQL Editor.
-- ============================================================================

-- Step 1: Create dimension tables (if they don't exist)
-- ============================================================================

-- 1.1 GEOGRAPHIES
CREATE TABLE IF NOT EXISTS idea_dimensions_geography (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    region TEXT,
    market_tier TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 INDUSTRIES
CREATE TABLE IF NOT EXISTS idea_dimensions_industry (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 PROBLEM ARCHETYPES
CREATE TABLE IF NOT EXISTS idea_dimensions_problem (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 TARGET PERSONAS
CREATE TABLE IF NOT EXISTS idea_dimensions_persona (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 CONSTRAINTS
CREATE TABLE IF NOT EXISTS idea_dimensions_constraint (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 TECHNOLOGY VECTORS
CREATE TABLE IF NOT EXISTS idea_dimensions_technology (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 BUSINESS MODELS
CREATE TABLE IF NOT EXISTS idea_dimensions_business_model (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Seed dimension tables with starter data
-- ============================================================================

INSERT INTO idea_dimensions_geography (name, region, market_tier) VALUES
    ('United States', 'North America', 'tier_1'),
    ('United Kingdom', 'Europe', 'tier_1'),
    ('Germany', 'Europe', 'tier_1'),
    ('Nigeria', 'Africa', 'tier_2'),
    ('India', 'South Asia', 'tier_2'),
    ('Brazil', 'South America', 'tier_2'),
    ('Singapore', 'Southeast Asia', 'tier_1'),
    ('Kenya', 'Africa', 'tier_2'),
    ('Canada', 'North America', 'tier_1'),
    ('Australia', 'Oceania', 'tier_1'),
    ('Japan', 'East Asia', 'tier_1'),
    ('South Korea', 'East Asia', 'tier_1'),
    ('France', 'Europe', 'tier_1'),
    ('UAE', 'Middle East', 'tier_1'),
    ('Mexico', 'North America', 'tier_2')
ON CONFLICT (name) DO NOTHING;

INSERT INTO idea_dimensions_industry (name, category) VALUES
    ('Healthcare', 'B2B'),
    ('Education Technology', 'B2B/B2C'),
    ('Fintech', 'B2B/B2C'),
    ('Logistics & Supply Chain', 'B2B'),
    ('Real Estate', 'B2B/B2C'),
    ('Legal Tech', 'B2B'),
    ('HR Tech', 'B2B'),
    ('Marketing & Sales Tools', 'B2B'),
    ('Developer Tools', 'B2B'),
    ('Cybersecurity', 'B2B'),
    ('E-commerce Enablement', 'B2B'),
    ('Food & Beverage', 'B2C'),
    ('Wellness & Fitness', 'B2C'),
    ('Gaming & Entertainment', 'B2C'),
    ('Climate Tech', 'B2B/B2C')
ON CONFLICT (name) DO NOTHING;

INSERT INTO idea_dimensions_problem (name, description) VALUES
    ('Manual Process Inefficiency', 'Tasks done manually that could be automated'),
    ('Information Asymmetry', 'One party has more information than another'),
    ('High Transaction Costs', 'Expensive intermediary or friction'),
    ('Coordination Failure', 'Multiple parties fail to coordinate'),
    ('Trust Deficit', 'Lack of trust between parties'),
    ('Discovery Problem', 'Hard to find the right solution'),
    ('Quality Assurance Gap', 'No way to verify quality'),
    ('Time Waste', 'Excessive time on low-value activities'),
    ('Access Barrier', 'Underserved population cannot access solution'),
    ('Complexity Overload', 'Existing solutions are too complex')
ON CONFLICT (name) DO NOTHING;

INSERT INTO idea_dimensions_persona (name, description) VALUES
    ('Small Business Owner', '1-50 employees, budget-conscious'),
    ('Enterprise IT Manager', 'Large org, security-focused'),
    ('Freelancer / Solopreneur', 'Individual, time-constrained'),
    ('Mid-market Operations Lead', '50-500 employees'),
    ('Consumer (Gen Z)', 'Digital native, mobile-first'),
    ('Consumer (Millennial)', 'Tech-savvy, value-conscious'),
    ('Consumer (Boomer)', 'Less tech-savvy, trust-focused'),
    ('Developer / Engineer', 'Technical, tool-driven'),
    ('Marketing Professional', 'Growth-focused, data-driven'),
    ('Healthcare Provider', 'Compliance-focused, patient-centric')
ON CONFLICT (name) DO NOTHING;

INSERT INTO idea_dimensions_constraint (name, description) VALUES
    ('Low Upfront Capital', 'Can be built with minimal funding'),
    ('Must be Regulatory Compliant', 'Heavy compliance requirements'),
    ('Network Effects Required', 'Value increases with more users'),
    ('Asset-Light Model', 'No physical inventory'),
    ('Fast Time-to-Market', 'Can MVP in under 30 days'),
    ('Data Privacy Critical', 'Must handle sensitive data'),
    ('High Switching Costs', 'Sticky once adopted'),
    ('Platform Play', 'Multi-sided marketplace'),
    ('API-First', 'Designed for integration'),
    ('Mobile-Only', 'No desktop version needed')
ON CONFLICT (name) DO NOTHING;

INSERT INTO idea_dimensions_technology (name, category) VALUES
    ('AI/ML (LLMs)', 'AI/ML'),
    ('AI/ML (Computer Vision)', 'AI/ML'),
    ('Blockchain / Web3', 'Blockchain'),
    ('No-Code / Low-Code', 'Developer Tools'),
    ('API Aggregation', 'Integration'),
    ('IoT Sensors', 'Hardware'),
    ('Edge Computing', 'Infrastructure'),
    ('Progressive Web App', 'Frontend'),
    ('Serverless Architecture', 'Backend'),
    ('Real-time Collaboration', 'Product')
ON CONFLICT (name) DO NOTHING;

INSERT INTO idea_dimensions_business_model (name, description) VALUES
    ('SaaS (Per Seat)', 'Monthly subscription per user'),
    ('Usage-Based Pricing', 'Pay for what you use'),
    ('Freemium', 'Free tier + paid upgrades'),
    ('Marketplace (Take Rate)', 'Commission on transactions'),
    ('Enterprise Licensing', 'Annual contracts'),
    ('Advertising', 'Free product, ad-supported'),
    ('Affiliate / Referral', 'Commission on referrals'),
    ('One-Time Purchase', 'Upfront payment'),
    ('Subscription Box', 'Recurring physical delivery'),
    ('Professional Services', 'Consulting or implementation fees')
ON CONFLICT (name) DO NOTHING;

-- Step 3: Create rate limiting tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS rate_limit_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type TEXT NOT NULL UNIQUE,
    clicks_per_minute INTEGER DEFAULT 10,
    clicks_per_day INTEGER NOT NULL,
    burst_allowance INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO rate_limit_config (plan_type, clicks_per_minute, clicks_per_day, burst_allowance) VALUES
    ('starter', 10, 50, 3),
    ('pro', 20, 500, 5),
    ('team', 50, 2000, 10),
    ('enterprise', 100, 999999, 20)
ON CONFLICT (plan_type) DO NOTHING;

-- Step 4: Create partitioned idea_seeds table
-- ============================================================================

-- Check if table exists before creating
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'idea_seeds') THEN
        CREATE TABLE idea_seeds (
            id UUID DEFAULT gen_random_uuid(),
            seed_hash TEXT NOT NULL,
            project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
            user_id UUID,
            geography_id INTEGER REFERENCES idea_dimensions_geography(id),
            industry_id INTEGER REFERENCES idea_dimensions_industry(id),
            problem_id INTEGER REFERENCES idea_dimensions_problem(id),
            persona_id INTEGER REFERENCES idea_dimensions_persona(id),
            constraint_id INTEGER REFERENCES idea_dimensions_constraint(id),
            technology_id INTEGER REFERENCES idea_dimensions_technology(id),
            business_model_id INTEGER REFERENCES idea_dimensions_business_model(id),
            timestamp_bucket TIMESTAMPTZ NOT NULL,
            crypto_entropy TEXT NOT NULL,
            status TEXT DEFAULT 'reserved' CHECK (status IN ('reserved', 'used', 'released')),
            reserved_at TIMESTAMPTZ DEFAULT NOW(),
            used_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            PRIMARY KEY (id, project_id)
        ) PARTITION BY HASH (project_id);

        -- Create partitions
        CREATE TABLE idea_seeds_p0 PARTITION OF idea_seeds FOR VALUES WITH (MODULUS 4, REMAINDER 0);
        CREATE TABLE idea_seeds_p1 PARTITION OF idea_seeds FOR VALUES WITH (MODULUS 4, REMAINDER 1);
        CREATE TABLE idea_seeds_p2 PARTITION OF idea_seeds FOR VALUES WITH (MODULUS 4, REMAINDER 2);
        CREATE TABLE idea_seeds_p3 PARTITION OF idea_seeds FOR VALUES WITH (MODULUS 4, REMAINDER 3);

        -- Create indexes
        CREATE INDEX idx_idea_seeds_project_status ON idea_seeds(project_id, status);
        CREATE INDEX idx_idea_seeds_user_status ON idea_seeds(user_id, status) WHERE user_id IS NOT NULL;
        CREATE INDEX idx_idea_seeds_hash ON idea_seeds(seed_hash);
        CREATE INDEX idx_idea_seeds_reserved_at ON idea_seeds(reserved_at) WHERE status = 'reserved';
        CREATE UNIQUE INDEX idx_idea_seeds_unique_per_project ON idea_seeds(project_id, seed_hash);

        -- Enable RLS
        ALTER TABLE idea_seeds ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Service role full access on idea_seeds" ON idea_seeds FOR ALL USING (auth.role() = 'service_role');
    END IF;
END
$$;

-- Step 5: Create partitioned ideas_v2 table (alongside existing ideas table)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ideas_v2') THEN
        CREATE TABLE ideas_v2 (
            id UUID DEFAULT gen_random_uuid(),
            project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
            user_id UUID,
            seed_id UUID,
            title TEXT NOT NULL,
            thesis TEXT,
            source TEXT DEFAULT 'ai_generated',
            confidence_score INTEGER,
            content JSONB,
            status TEXT DEFAULT 'draft',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            PRIMARY KEY (id, project_id)
        ) PARTITION BY HASH (project_id);

        -- Create partitions
        CREATE TABLE ideas_v2_p0 PARTITION OF ideas_v2 FOR VALUES WITH (MODULUS 4, REMAINDER 0);
        CREATE TABLE ideas_v2_p1 PARTITION OF ideas_v2 FOR VALUES WITH (MODULUS 4, REMAINDER 1);
        CREATE TABLE ideas_v2_p2 PARTITION OF ideas_v2 FOR VALUES WITH (MODULUS 4, REMAINDER 2);
        CREATE TABLE ideas_v2_p3 PARTITION OF ideas_v2 FOR VALUES WITH (MODULUS 4, REMAINDER 3);

        -- Create indexes
        CREATE INDEX idx_ideas_v2_project ON ideas_v2(project_id, created_at DESC);
        CREATE INDEX idx_ideas_v2_user ON ideas_v2(user_id, created_at DESC) WHERE user_id IS NOT NULL;
        CREATE INDEX idx_ideas_v2_seed ON ideas_v2(seed_id) WHERE seed_id IS NOT NULL;
        CREATE INDEX idx_ideas_v2_status ON ideas_v2(project_id, status);
        CREATE UNIQUE INDEX idx_ideas_v2_unique_title_per_project ON ideas_v2(project_id, LOWER(title));

        -- Enable RLS
        ALTER TABLE ideas_v2 ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Service role full access on ideas_v2" ON ideas_v2 FOR ALL USING (auth.role() = 'service_role');
    END IF;
END
$$;

-- Step 6: Create usage tracking table
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'idea_generation_usage') THEN
        CREATE TABLE idea_generation_usage (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
            org_id UUID,
            ideas_generated INTEGER DEFAULT 5,
            ai_calls INTEGER DEFAULT 1,
            estimated_cost_usd NUMERIC(10, 6),
            created_at TIMESTAMPTZ DEFAULT NOW()
        ) PARTITION BY RANGE (created_at);

        -- Create current month partition
        CREATE TABLE idea_generation_usage_2026_02 PARTITION OF idea_generation_usage
            FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
        CREATE TABLE idea_generation_usage_2026_03 PARTITION OF idea_generation_usage
            FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

        -- Create indexes
        CREATE INDEX idx_usage_user_recent ON idea_generation_usage(user_id, created_at DESC);
        CREATE INDEX idx_usage_project_recent ON idea_generation_usage(project_id, created_at DESC);
        CREATE INDEX idx_usage_org_recent ON idea_generation_usage(org_id, created_at DESC) WHERE org_id IS NOT NULL;

        -- Enable RLS
        ALTER TABLE idea_generation_usage ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can view own usage" ON idea_generation_usage FOR SELECT USING (user_id = auth.uid());
        CREATE POLICY "Service role full access on usage" ON idea_generation_usage FOR ALL USING (auth.role() = 'service_role');
    END IF;
END
$$;

-- ============================================================================
-- DEPLOYMENT COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Restart your backend server
-- 2. Test with: python test_idea_generation_system.py
-- 3. Try generating ideas via the API
-- ============================================================================
