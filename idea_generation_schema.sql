-- ============================================================================
-- SMARTBUILDER — GLOBAL IDEA GENERATION SYSTEM (PRODUCTION SCHEMA)
-- ============================================================================
-- This schema supports:
--   • Millions of users
--   • Billions of ideas over time
--   • Zero visible repetition per user/project
--   • Horizontal scaling via partitioning
--   • Atomic seed reservation (race-condition safe)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. DIMENSION TABLES (Global Idea Space)
-- ============================================================================
-- These tables define the multi-dimensional space for idea generation.
-- Total combinations: 195 × 80 × 60 × 50 × 40 × 30 × 25 ≈ 1.17 QUADRILLION

-- 1.1 GEOGRAPHIES (195 countries + major regions)
CREATE TABLE IF NOT EXISTS idea_dimensions_geography (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    region TEXT, -- e.g., "North America", "Southeast Asia"
    market_tier TEXT, -- "tier_1", "tier_2", "tier_3" (for filtering)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 INDUSTRIES (80+ industry verticals)
CREATE TABLE IF NOT EXISTS idea_dimensions_industry (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT, -- e.g., "B2B SaaS", "Consumer", "Healthcare"
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 PROBLEM ARCHETYPES (60 common startup problem patterns)
CREATE TABLE IF NOT EXISTS idea_dimensions_problem (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 TARGET PERSONAS (50 user personas)
CREATE TABLE IF NOT EXISTS idea_dimensions_persona (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 CONSTRAINTS (40 constraint types)
CREATE TABLE IF NOT EXISTS idea_dimensions_constraint (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 TECHNOLOGY VECTORS (30 tech stacks/approaches)
CREATE TABLE IF NOT EXISTS idea_dimensions_technology (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT, -- e.g., "AI/ML", "Blockchain", "No-code"
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 BUSINESS MODELS (25 monetization approaches)
CREATE TABLE IF NOT EXISTS idea_dimensions_business_model (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. IDEA SEEDS (Atomic Reservation System)
-- ============================================================================
-- Seeds represent pre-computed dimension combinations.
-- Each seed is reserved before AI generation to prevent duplicates.

CREATE TABLE IF NOT EXISTS idea_seeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Composite seed hash (prevents global duplicates)
    seed_hash TEXT NOT NULL,
    
    -- Context
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id UUID, -- From Supabase Auth (auth.users.id)
    
    -- Dimension Vector (what makes this seed unique)
    geography_id INTEGER REFERENCES idea_dimensions_geography(id),
    industry_id INTEGER REFERENCES idea_dimensions_industry(id),
    problem_id INTEGER REFERENCES idea_dimensions_problem(id),
    persona_id INTEGER REFERENCES idea_dimensions_persona(id),
    constraint_id INTEGER REFERENCES idea_dimensions_constraint(id),
    technology_id INTEGER REFERENCES idea_dimensions_technology(id),
    business_model_id INTEGER REFERENCES idea_dimensions_business_model(id),
    
    -- Entropy components
    timestamp_bucket TIMESTAMPTZ NOT NULL, -- 5-second window
    crypto_entropy TEXT NOT NULL, -- From secrets.token_hex()
    
    -- Status tracking
    status TEXT DEFAULT 'reserved' CHECK (status IN ('reserved', 'used', 'released')),
    reserved_at TIMESTAMPTZ DEFAULT NOW(),
    used_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY HASH (project_id);

-- Create initial partitions (4 partitions for horizontal scaling)
CREATE TABLE idea_seeds_p0 PARTITION OF idea_seeds FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE idea_seeds_p1 PARTITION OF idea_seeds FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE idea_seeds_p2 PARTITION OF idea_seeds FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE idea_seeds_p3 PARTITION OF idea_seeds FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- Indexes for fast lookups
CREATE INDEX idx_idea_seeds_project_status ON idea_seeds(project_id, status);
CREATE INDEX idx_idea_seeds_user_status ON idea_seeds(user_id, status) WHERE user_id IS NOT NULL;
CREATE INDEX idx_idea_seeds_hash ON idea_seeds(seed_hash);
CREATE INDEX idx_idea_seeds_reserved_at ON idea_seeds(reserved_at) WHERE status = 'reserved';

-- Unique constraint: No duplicate seed_hash per project
CREATE UNIQUE INDEX idx_idea_seeds_unique_per_project ON idea_seeds(project_id, seed_hash);

-- ============================================================================
-- 3. IDEAS TABLE (Partitioned for Scale)
-- ============================================================================
-- Modified to include seed_id and partitioned by project_id

-- Drop old ideas table if migrating (CAUTION: Only in development)
-- DROP TABLE IF EXISTS ideas CASCADE;

-- Create new partitioned ideas table
CREATE TABLE IF NOT EXISTS ideas_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relationships
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id UUID, -- User who generated this idea
    seed_id UUID REFERENCES idea_seeds(id), -- Which seed generated this idea
    
    -- Idea content
    title TEXT NOT NULL,
    thesis TEXT,
    source TEXT DEFAULT 'ai_generated', -- 'ai_generated', 'user_submission'
    confidence_score INTEGER,
    content JSONB, -- Full idea object (market_size, problem_bullets, etc.)
    status TEXT DEFAULT 'draft', -- 'draft', 'researched', 'approved', 'discarded'
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY HASH (project_id);

-- Create initial partitions (4 partitions for horizontal scaling)
CREATE TABLE ideas_v2_p0 PARTITION OF ideas_v2 FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE ideas_v2_p1 PARTITION OF ideas_v2 FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE ideas_v2_p2 PARTITION OF ideas_v2 FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE ideas_v2_p3 PARTITION OF ideas_v2 FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- Indexes for performance
CREATE INDEX idx_ideas_v2_project ON ideas_v2(project_id, created_at DESC);
CREATE INDEX idx_ideas_v2_user ON ideas_v2(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_ideas_v2_seed ON ideas_v2(seed_id) WHERE seed_id IS NOT NULL;
CREATE INDEX idx_ideas_v2_status ON ideas_v2(project_id, status);

-- Unique constraint: No duplicate titles per project (soft uniqueness)
CREATE UNIQUE INDEX idx_ideas_v2_unique_title_per_project ON ideas_v2(project_id, LOWER(title));

-- ============================================================================
-- 4. RATE LIMITING TABLES
-- ============================================================================

-- 4.1 Rate limit configurations (per plan tier)
CREATE TABLE IF NOT EXISTS rate_limit_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_type TEXT NOT NULL UNIQUE, -- 'starter', 'pro', 'team', 'enterprise'
    
    -- Limits
    clicks_per_minute INTEGER DEFAULT 10, -- Soft limit
    clicks_per_day INTEGER NOT NULL, -- Hard limit
    burst_allowance INTEGER DEFAULT 3, -- Allow short bursts
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with default plans
INSERT INTO rate_limit_config (plan_type, clicks_per_minute, clicks_per_day, burst_allowance) VALUES
    ('starter', 10, 50, 3),
    ('pro', 20, 500, 5),
    ('team', 50, 2000, 10),
    ('enterprise', 100, 999999, 20)
ON CONFLICT (plan_type) DO NOTHING;

-- 4.2 Usage tracking (for rate limiting + billing)
CREATE TABLE IF NOT EXISTS idea_generation_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Context
    user_id UUID NOT NULL,
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    org_id UUID, -- From organizations table (if applicable)
    
    -- Usage details
    ideas_generated INTEGER DEFAULT 5, -- Number of ideas in this generation
    ai_calls INTEGER DEFAULT 1, -- Should be 1 for batch generation
    
    -- Cost tracking (optional for future billing)
    estimated_cost_usd NUMERIC(10, 6),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for usage data (easier to archive/delete old data)
CREATE TABLE idea_generation_usage_2026_02 PARTITION OF idea_generation_usage
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE idea_generation_usage_2026_03 PARTITION OF idea_generation_usage
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
-- Add more partitions as needed

-- Indexes for rate limiting queries
CREATE INDEX idx_usage_user_recent ON idea_generation_usage(user_id, created_at DESC);
CREATE INDEX idx_usage_project_recent ON idea_generation_usage(project_id, created_at DESC);
CREATE INDEX idx_usage_org_recent ON idea_generation_usage(org_id, created_at DESC) WHERE org_id IS NOT NULL;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE idea_seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_generation_usage ENABLE ROW LEVEL SECURITY;

-- Policies for idea_seeds (only service role can access directly)
CREATE POLICY "Service role full access on idea_seeds" ON idea_seeds
    FOR ALL USING (auth.role() = 'service_role');

-- Policies for ideas_v2 (users can see ideas from their projects)
CREATE POLICY "Users can view project ideas" ON ideas_v2
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN org_members om ON om.org_id = p.org_id
            WHERE om.user_id = auth.uid()
        )
        OR user_id = auth.uid()
    );

CREATE POLICY "Service role full access on ideas_v2" ON ideas_v2
    FOR ALL USING (auth.role() = 'service_role');

-- Policies for usage tracking (users can see their own usage)
CREATE POLICY "Users can view own usage" ON idea_generation_usage
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role full access on usage" ON idea_generation_usage
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- 6.1 Function to check if seed exists (for collision detection)
CREATE OR REPLACE FUNCTION check_seed_collision(
    p_project_id UUID,
    p_seed_hash TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM idea_seeds
        WHERE project_id = p_project_id
        AND seed_hash = p_seed_hash
    );
END;
$$ LANGUAGE plpgsql;

-- 6.2 Function to release expired reserved seeds (cleanup job)
CREATE OR REPLACE FUNCTION release_expired_seeds() RETURNS INTEGER AS $$
DECLARE
    rows_updated INTEGER;
BEGIN
    -- Release seeds reserved more than 5 minutes ago
    UPDATE idea_seeds
    SET status = 'released'
    WHERE status = 'reserved'
    AND reserved_at < NOW() - INTERVAL '5 minutes';
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RETURN rows_updated;
END;
$$ LANGUAGE plpgsql;

-- 6.3 Function to get user's rate limit status
CREATE OR REPLACE FUNCTION get_rate_limit_status(
    p_user_id UUID,
    p_plan_type TEXT DEFAULT 'starter'
) RETURNS TABLE (
    clicks_last_minute INTEGER,
    clicks_today INTEGER,
    limit_per_minute INTEGER,
    limit_per_day INTEGER,
    is_rate_limited BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM idea_generation_usage
         WHERE user_id = p_user_id
         AND created_at > NOW() - INTERVAL '1 minute') as clicks_last_minute,
        
        (SELECT COUNT(*)::INTEGER FROM idea_generation_usage
         WHERE user_id = p_user_id
         AND created_at > NOW() - INTERVAL '1 day') as clicks_today,
        
        rlc.clicks_per_minute as limit_per_minute,
        rlc.clicks_per_day as limit_per_day,
        
        (SELECT COUNT(*) FROM idea_generation_usage
         WHERE user_id = p_user_id
         AND created_at > NOW() - INTERVAL '1 minute') >= rlc.clicks_per_minute
        OR
        (SELECT COUNT(*) FROM idea_generation_usage
         WHERE user_id = p_user_id
         AND created_at > NOW() - INTERVAL '1 day') >= rlc.clicks_per_day
        as is_rate_limited
    FROM rate_limit_config rlc
    WHERE rlc.plan_type = p_plan_type;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. SEED DATA FOR DIMENSIONS
-- ============================================================================
-- This seeds the dimension tables with starter data.
-- In production, you'd have a comprehensive list.

-- Sample Geographies (expand to 195)
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

-- Sample Industries (expand to 80+)
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

-- Sample Problem Archetypes (expand to 60)
INSERT INTO idea_dimensions_problem (name, description) VALUES
    ('Manual Process Inefficiency', 'Tasks that are done manually and could be automated'),
    ('Information Asymmetry', 'One party has more information than another'),
    ('High Transaction Costs', 'Expensive intermediary or friction in transactions'),
    ('Coordination Failure', 'Multiple parties fail to coordinate effectively'),
    ('Trust Deficit', 'Lack of trust between parties'),
    ('Discovery Problem', 'Hard to find the right solution/product/service'),
    ('Quality Assurance Gap', 'No way to verify quality or authenticity'),
    ('Time Waste', 'Excessive time spent on low-value activities'),
    ('Access Barrier', 'Underserved population can''t access solution'),
    ('Complexity Overload', 'Existing solutions are too complex')
ON CONFLICT (name) DO NOTHING;

-- Sample Personas (expand to 50)
INSERT INTO idea_dimensions_persona (name, description) VALUES
    ('Small Business Owner', '1-50 employees, budget-conscious'),
    ('Enterprise IT Manager', 'Large org, security-focused'),
    ('Freelancer / Solopreneur', 'Individual, time-constrained'),
    ('Mid-market Operations Lead', '50-500 employees, efficiency-focused'),
    ('Consumer (Gen Z)', 'Digital native, mobile-first'),
    ('Consumer (Millennial)', 'Tech-savvy, value-conscious'),
    ('Consumer (Boomer)', 'Less tech-savvy, trust-focused'),
    ('Developer / Engineer', 'Technical, tool-driven'),
    ('Marketing Professional', 'Growth-focused, data-driven'),
    ('Healthcare Provider', 'Compliance-focused, patient-centric')
ON CONFLICT (name) DO NOTHING;

-- Sample Constraints (expand to 40)
INSERT INTO idea_dimensions_constraint (name, description) VALUES
    ('Low Upfront Capital', 'Can be built with minimal funding'),
    ('Must be Regulatory Compliant', 'Heavy compliance requirements'),
    ('Network Effects Required', 'Value increases with more users'),
    ('Asset-Light Model', 'No physical inventory or assets'),
    ('Fast Time-to-Market', 'Can MVP in under 30 days'),
    ('Data Privacy Critical', 'Must handle sensitive data'),
    ('High Switching Costs', 'Sticky once adopted'),
    ('Platform Play', 'Multi-sided marketplace'),
    ('API-First', 'Designed for integration'),
    ('Mobile-Only', 'No desktop version needed')
ON CONFLICT (name) DO NOTHING;

-- Sample Technologies (expand to 30)
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

-- Sample Business Models (expand to 25)
INSERT INTO idea_dimensions_business_model (name, description) VALUES
    ('SaaS (Per Seat)', 'Monthly subscription per user'),
    ('Usage-Based Pricing', 'Pay for what you use'),
    ('Freemium', 'Free tier + paid upgrades'),
    ('Marketplace (Take Rate)', 'Commission on transactions'),
    ('Enterprise Licensing', 'Annual contracts with custom pricing'),
    ('Advertising', 'Free product, ad-supported'),
    ('Affiliate / Referral', 'Commission on referrals'),
    ('One-Time Purchase', 'Upfront payment, lifetime access'),
    ('Subscription Box', 'Recurring physical product delivery'),
    ('Professional Services', 'Consulting or implementation fees')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 8. MIGRATION NOTES
-- ============================================================================
-- To migrate from old 'ideas' table to 'ideas_v2':
-- 1. Rename old table: ALTER TABLE ideas RENAME TO ideas_legacy;
-- 2. Create ideas_v2 (this schema)
-- 3. Copy data: INSERT INTO ideas_v2 (id, project_id, title, thesis, source, confidence_score, content, status, created_at, updated_at)
--               SELECT id, project_id, title, thesis, source, confidence_score, content, status, created_at, updated_at
--               FROM ideas_legacy;
-- 4. Update application to use ideas_v2
-- 5. Once verified, drop ideas_legacy

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
