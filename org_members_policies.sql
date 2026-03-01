-- ============================================
-- FIX: Organization Visibility Policies
-- Allows users to see their own memberships
-- ============================================

-- 1. Enable RLS on org_members (if not already)
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Users can view own memberships" ON org_members;
DROP POLICY IF EXISTS "Members can view organizations" ON organizations;

-- 3. Create permissive SELECT policy for org_members
-- Allow users to see memberships where they are the user
CREATE POLICY "Users can view own memberships" 
ON org_members
FOR SELECT
USING (auth.uid() = user_id);

-- 4. Create permissive INSERT policy for org_members
-- Allow service role and authed users to be added to orgs
CREATE POLICY "Users can be added to orgs" 
ON org_members
FOR INSERT
WITH CHECK (true); -- Usually restricted by backend logic/service role

-- 5. Update Organizations visibility
CREATE POLICY "Members can view organizations" 
ON organizations
FOR SELECT 
USING (
  owner_id = auth.uid() 
  OR 
  id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
);

-- 6. Ensure Service Role has full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
