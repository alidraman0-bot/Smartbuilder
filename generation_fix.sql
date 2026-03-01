-- Generation & Rate Limiting Fix Schema

-- 1. Create missing tables
CREATE TABLE IF NOT EXISTS idea_seeds (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    dimensions jsonb NOT NULL,
    reserved_by uuid,
    reserved_at timestamptz,
    used boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Partitioned table for ideas v2
CREATE TABLE IF NOT EXISTS ideas_v2 (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    idea_id uuid NOT NULL,
    title text NOT NULL,
    thesis text,
    market_size text,
    problem_bullets jsonb,
    target_customer jsonb,
    monetization jsonb,
    why_now_bullets jsonb,
    alternatives_structured jsonb,
    mvp_scope_bullets jsonb,
    confidence_reasoning_bullets jsonb,
    risks_structured jsonb,
    confidence_score integer,
    market_score integer,
    execution_complexity integer,
    created_at timestamptz DEFAULT now()
);

-- 2. Create RPC for Rate Limiting
CREATE OR REPLACE FUNCTION get_rate_limit_status(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
    v_usage_minute int;
    v_usage_day int;
    v_usage_month int;
BEGIN
    -- Get usage counts
    SELECT count(*) INTO v_usage_minute 
    FROM idea_generation_usage 
    WHERE user_id = p_user_id AND created_at > now() - interval '1 minute';
    
    SELECT count(*) INTO v_usage_day 
    FROM idea_generation_usage 
    WHERE user_id = p_user_id AND created_at > now() - interval '1 day';
    
    SELECT count(*) INTO v_usage_month 
    FROM idea_generation_usage 
    WHERE user_id = p_user_id AND created_at > now() - interval '30 days';

    result = jsonb_build_object(
        'usage_minute', v_usage_minute,
        'usage_day', v_usage_day,
        'usage_month', v_usage_month
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
