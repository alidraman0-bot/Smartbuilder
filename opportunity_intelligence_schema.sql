-- opportunity_intelligence_schema.sql
-- Upgrades existing opportunity_scores table and adds ideas + idea_signals tables

-- ─────────────────────────────────────────────
-- 1. Upgrade opportunity_scores
--    Adds startup_id FK, numeric per-factor scores, and analysis_json blob
-- ─────────────────────────────────────────────
ALTER TABLE opportunity_scores
    ADD COLUMN IF NOT EXISTS startup_id       UUID REFERENCES startups(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS demand_score     NUMERIC(4,2),
    ADD COLUMN IF NOT EXISTS market_size_score NUMERIC(4,2),
    ADD COLUMN IF NOT EXISTS competition_score NUMERIC(4,2),
    ADD COLUMN IF NOT EXISTS revenue_score    NUMERIC(4,2),
    ADD COLUMN IF NOT EXISTS trend_score      NUMERIC(4,2),
    ADD COLUMN IF NOT EXISTS difficulty_score NUMERIC(4,2),
    ADD COLUMN IF NOT EXISTS analysis_json    JSONB;

CREATE INDEX IF NOT EXISTS idx_opportunity_scores_startup_id ON opportunity_scores(startup_id);

-- ─────────────────────────────────────────────
-- 2. ideas table upgrade
--    Ensures the existing ideas table has the columns needed for intelligence
--    (user_id, idea_text, opportunity_score)
-- ─────────────────────────────────────────────
ALTER TABLE ideas
    ADD COLUMN IF NOT EXISTS user_id           UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS idea_text         TEXT,
    ADD COLUMN IF NOT EXISTS opportunity_score NUMERIC(4,2);

-- Backfill idea_text from title if idea_text is null (optional but helpful)
UPDATE ideas SET idea_text = title WHERE idea_text IS NULL AND title IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_opportunity_score ON ideas(opportunity_score);

-- Ensure RLS is enabled
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists and recreate (to ensure clean apply)
DROP POLICY IF EXISTS "Users can manage their own ideas" ON ideas;
CREATE POLICY "Users can manage their own ideas"
    ON ideas FOR ALL
    USING (user_id = auth.uid() OR auth.uid() IS NULL) -- Allow service role if needed, simplified
    WITH CHECK (user_id = auth.uid());


-- ─────────────────────────────────────────────
-- 3. idea_signals table
--    Individual market signals associated with an idea, with a weight
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS idea_signals (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id    UUID REFERENCES ideas(id) ON DELETE CASCADE,
    source     TEXT NOT NULL,
    signal     TEXT NOT NULL,
    weight     NUMERIC(4,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idea_signals_idea_id ON idea_signals(idea_id);

ALTER TABLE idea_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage signals for their ideas"
    ON idea_signals FOR ALL
    USING (
        idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid())
    );
