-- Migration: Update season_weeks RLS policies
-- Updates RLS policies to use organization_staff instead of league_operators
-- Run after league_operators table has been dropped

BEGIN;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Operators can view own league season weeks" ON season_weeks;
DROP POLICY IF EXISTS "Operators can create season weeks for own leagues" ON season_weeks;
DROP POLICY IF EXISTS "Operators can update own league season weeks" ON season_weeks;
DROP POLICY IF EXISTS "Operators can delete own league season weeks" ON season_weeks;

-- Create updated RLS policies using organization_staff table

-- Policy: Operators can view their own league's season weeks
CREATE POLICY "Operators can view own league season weeks"
  ON season_weeks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM seasons
      JOIN leagues ON seasons.league_id = leagues.id
      JOIN organization_staff ON leagues.organization_id = organization_staff.organization_id
      JOIN members ON organization_staff.member_id = members.id
      WHERE seasons.id = season_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Operators can create season weeks for their own leagues
CREATE POLICY "Operators can create season weeks for own leagues"
  ON season_weeks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM seasons
      JOIN leagues ON seasons.league_id = leagues.id
      JOIN organization_staff ON leagues.organization_id = organization_staff.organization_id
      JOIN members ON organization_staff.member_id = members.id
      WHERE seasons.id = season_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Operators can update their own league's season weeks
CREATE POLICY "Operators can update own league season weeks"
  ON season_weeks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM seasons
      JOIN leagues ON seasons.league_id = leagues.id
      JOIN organization_staff ON leagues.organization_id = organization_staff.organization_id
      JOIN members ON organization_staff.member_id = members.id
      WHERE seasons.id = season_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Operators can delete their own league's season weeks
CREATE POLICY "Operators can delete own league season weeks"
  ON season_weeks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM seasons
      JOIN leagues ON seasons.league_id = leagues.id
      JOIN organization_staff ON leagues.organization_id = organization_staff.organization_id
      JOIN members ON organization_staff.member_id = members.id
      WHERE seasons.id = season_id
      AND members.user_id = auth.uid()
    )
  );

COMMIT;
