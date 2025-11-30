-- Migration: Disable RLS for development
-- Disables RLS policies on tables that are blocking development
-- Re-enable and fix policies before production deployment

BEGIN;

-- Disable RLS on operator_blackout_preferences
ALTER TABLE operator_blackout_preferences DISABLE ROW LEVEL SECURITY;

-- Disable RLS on season_weeks
ALTER TABLE season_weeks DISABLE ROW LEVEL SECURITY;

COMMIT;
