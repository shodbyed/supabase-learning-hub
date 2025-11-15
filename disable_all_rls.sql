-- ============================================================================
-- DISABLE ALL ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
--
-- This script disables RLS on all tables in the database and drops all
-- existing RLS policies. This is useful for development to avoid permission
-- errors while building features.
--
-- IMPORTANT: Only use this in development! Re-enable RLS before deploying
-- to production.
--
-- TO RUN: Copy/paste this entire file into Supabase Studio SQL Editor
-- ============================================================================

-- Drop all existing RLS policies first
-- (This prevents errors if policies reference tables)

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Loop through all policies and drop them
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Now disable RLS on all tables

ALTER TABLE "public"."blocked_users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."championship_date_options" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."conversation_participants" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."conversations" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."league_operators" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."league_venues" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."leagues" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."match_games" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."match_lineups" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."matches" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."members" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."messages" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."operator_blackout_preferences" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."report_actions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."report_updates" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."season_weeks" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."seasons" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."team_players" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."teams" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_reports" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."venue_owners" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."venues" DISABLE ROW LEVEL SECURITY;

-- Show confirmation message
DO $$
BEGIN
    RAISE NOTICE '✅ All RLS policies have been dropped';
    RAISE NOTICE '✅ RLS has been disabled on all 22 tables';
    RAISE NOTICE '⚠️  Remember to re-enable RLS before production deployment!';
END $$;
