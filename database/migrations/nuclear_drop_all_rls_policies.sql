-- Migration: Nuclear option - Drop ALL RLS policies from ALL tables
-- This removes every RLS policy in the public schema
-- After running this, RLS will still be ENABLED but with NO policies
-- You must then disable RLS on tables you want to access during development

BEGIN;

-- This script drops ALL RLS policies from ALL tables in the public schema
-- It's a nuclear option to clean up broken policies that reference league_operators

DO $$
DECLARE
  r RECORD;
BEGIN
  -- Loop through all policies in the public schema
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    -- Drop each policy
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname, r.schemaname, r.tablename);
    RAISE NOTICE 'Dropped policy % on table %.%', r.policyname, r.schemaname, r.tablename;
  END LOOP;
END $$;

COMMIT;

-- After running this, tables still have RLS ENABLED but NO policies
-- This means NO ACCESS unless you:
-- 1. Run disable_all_rls_for_development.sql to disable RLS entirely, OR
-- 2. Create new policies using organization_staff table

-- Recommendation for development: Run disable_all_rls_for_development.sql next
