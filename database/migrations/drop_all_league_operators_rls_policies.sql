-- Migration: Drop all RLS policies that reference league_operators table
-- This removes broken RLS policies after league_operators table was dropped
-- Run this to fix RLS blocking caused by references to deleted table

BEGIN;

-- Get all RLS policies that reference league_operators in their definition
-- We'll drop them manually since we know which tables had these policies

-- =====================================================
-- OPERATOR_BLACKOUT_PREFERENCES
-- =====================================================
DROP POLICY IF EXISTS "Operators can view their own preferences" ON operator_blackout_preferences;
DROP POLICY IF EXISTS "Operators can insert their own preferences" ON operator_blackout_preferences;
DROP POLICY IF EXISTS "Operators can update their own preferences" ON operator_blackout_preferences;
DROP POLICY IF EXISTS "Operators can delete their own preferences" ON operator_blackout_preferences;

-- =====================================================
-- SEASON_WEEKS
-- =====================================================
DROP POLICY IF EXISTS "Operators can view own league season weeks" ON season_weeks;
DROP POLICY IF EXISTS "Operators can create season weeks for own leagues" ON season_weeks;
DROP POLICY IF EXISTS "Operators can update own league season weeks" ON season_weeks;
DROP POLICY IF EXISTS "Operators can delete own league season weeks" ON season_weeks;

-- =====================================================
-- SEASONS
-- =====================================================
DROP POLICY IF EXISTS "Operators can view own league seasons" ON seasons;
DROP POLICY IF EXISTS "Operators can create seasons for own leagues" ON seasons;
DROP POLICY IF EXISTS "Operators can update own league seasons" ON seasons;
DROP POLICY IF EXISTS "Operators can delete own league seasons" ON seasons;

-- =====================================================
-- LEAGUES
-- =====================================================
DROP POLICY IF EXISTS "Operators can view their own leagues" ON leagues;
DROP POLICY IF EXISTS "Operators can create leagues" ON leagues;
DROP POLICY IF EXISTS "Operators can update their own leagues" ON leagues;
DROP POLICY IF EXISTS "Operators can delete their own leagues" ON leagues;

-- =====================================================
-- VENUES
-- =====================================================
DROP POLICY IF EXISTS "Operators can view their own venues" ON venues;
DROP POLICY IF EXISTS "Operators can create venues" ON venues;
DROP POLICY IF EXISTS "Operators can update their own venues" ON venues;
DROP POLICY IF EXISTS "Operators can delete their own venues" ON venues;

-- =====================================================
-- TEAMS
-- =====================================================
DROP POLICY IF EXISTS "Operators can view teams in their leagues" ON teams;
DROP POLICY IF EXISTS "Operators can create teams in their leagues" ON teams;
DROP POLICY IF EXISTS "Operators can update teams in their leagues" ON teams;
DROP POLICY IF EXISTS "Operators can delete teams in their leagues" ON teams;

-- Note: Skipping team_rosters, matches, match_lineups, match_games, user_reports
-- These tables may not exist or may not have had league_operators policies

COMMIT;

-- Note: After running this, tables will have RLS ENABLED but no policies
-- This means authenticated users will have NO ACCESS unless:
-- 1. You disable RLS entirely for development, OR
-- 2. You create new policies using organization_staff table
