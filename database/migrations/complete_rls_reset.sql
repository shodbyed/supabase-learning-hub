-- =====================================================
-- COMPLETE RLS RESET - Clean Slate for Development
-- =====================================================
--
-- This migration does TWO things:
-- 1. Drops ALL existing RLS policies (removes broken/outdated policies)
-- 2. Disables RLS on ALL tables (allows unrestricted access during development)
--
-- WORKFLOW:
-- 1. Run this migration to start clean
-- 2. Build and test all features without RLS blocking you
-- 3. Later: Re-enable RLS table-by-table and write NEW policies based on actual usage
--
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Drop ALL RLS policies from ALL tables
-- =====================================================

DO $$
DECLARE
  r RECORD;
  policy_count INTEGER := 0;
BEGIN
  -- Loop through all policies in the public schema
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname
  ) LOOP
    -- Drop each policy
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname, r.schemaname, r.tablename);
    policy_count := policy_count + 1;
    RAISE NOTICE '[%] Dropped policy "%" on table "%"', policy_count, r.policyname, r.tablename;
  END LOOP;

  RAISE NOTICE '✅ Dropped % RLS policies total', policy_count;
END $$;

-- =====================================================
-- STEP 2: Disable RLS on ALL tables
-- =====================================================

DO $$
DECLARE
  r RECORD;
  table_count INTEGER := 0;
BEGIN
  -- Loop through all tables that have RLS enabled
  FOR r IN (
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND rowsecurity = true
    ORDER BY tablename
  ) LOOP
    -- Disable RLS on each table
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
    table_count := table_count + 1;
    RAISE NOTICE '[%] Disabled RLS on table "%"', table_count, r.tablename;
  END LOOP;

  RAISE NOTICE '✅ Disabled RLS on % tables total', table_count;
END $$;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify no policies remain (should return 0 rows)
-- SELECT schemaname, tablename, policyname
-- FROM pg_policies
-- WHERE schemaname = 'public';

-- Verify all tables have RLS disabled (should return 0 rows)
-- SELECT tablename
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND rowsecurity = true;

-- =====================================================
-- NOTES FOR FUTURE RLS IMPLEMENTATION
-- =====================================================

-- When you're ready to add RLS back:
--
-- 1. Enable RLS on specific tables:
--    ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
--
-- 2. Create policies based on actual usage patterns:
--    - Use organization_staff table (NOT league_operators)
--    - Make policies match actual user flows
--    - Test each policy as you add it
--
-- 3. Common policy patterns:
--    - Public read: USING (true)
--    - Organization members: EXISTS (SELECT 1 FROM organization_staff WHERE ...)
--    - Authenticated users: auth.uid() IS NOT NULL
--    - Developers/admins: (SELECT role FROM members WHERE user_id = auth.uid()) = 'developer'
--
