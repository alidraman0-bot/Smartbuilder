-- ============================================================================
-- DEPLOYMENT VERIFICATION QUERIES
-- ============================================================================
-- Run these queries in Supabase SQL Editor to verify deployment success
-- ============================================================================

-- Query 1: Check all newly created tables exist
-- Expected: 11 tables should be listed
SELECT tablename, schemaname
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'idea_dimensions_geography',
    'idea_dimensions_industry',
    'idea_dimensions_problem',
    'idea_dimensions_persona',
    'idea_dimensions_constraint',
    'idea_dimensions_technology',
    'idea_dimensions_business_model',
    'idea_seeds',
    'ideas_v2',
    'idea_generation_usage',
    'rate_limit_config'
)
ORDER BY tablename;

-- ============================================================================

-- Query 2: Check partitions were created
-- Expected: Should show partitions like idea_seeds_p0, idea_seeds_p1, etc.
SELECT 
    parent.relname AS parent_table,
    child.relname AS partition_name
FROM pg_inherits
JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN pg_class child ON pg_inherits.inhrelid = child.oid
WHERE parent.relname IN ('idea_seeds', 'ideas_v2', 'idea_generation_usage')
ORDER BY parent_table, partition_name;

-- ============================================================================

-- Query 3: Count records in dimension tables
-- Expected: Each table should have 10-15 records
SELECT 'idea_dimensions_geography' as table_name, COUNT(*) as records FROM idea_dimensions_geography
UNION ALL
SELECT 'idea_dimensions_industry', COUNT(*) FROM idea_dimensions_industry
UNION ALL
SELECT 'idea_dimensions_problem', COUNT(*) FROM idea_dimensions_problem
UNION ALL
SELECT 'idea_dimensions_persona', COUNT(*) FROM idea_dimensions_persona
UNION ALL
SELECT 'idea_dimensions_constraint', COUNT(*) FROM idea_dimensions_constraint
UNION ALL
SELECT 'idea_dimensions_technology', COUNT(*) FROM idea_dimensions_technology
UNION ALL
SELECT 'idea_dimensions_business_model', COUNT(*) FROM idea_dimensions_business_model;

-- ============================================================================

-- Query 4: Check rate limiting config
-- Expected: 4 plan types (starter, pro, team, enterprise)
SELECT plan_type, clicks_per_day, clicks_per_minute, burst_allowance
FROM rate_limit_config
ORDER BY clicks_per_day;

-- ============================================================================
-- If all queries return expected results, deployment is successful!
-- Next step: Restart your backend server
-- ============================================================================
