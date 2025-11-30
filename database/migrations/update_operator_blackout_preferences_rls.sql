-- Migration: Update operator_blackout_preferences RLS policies
-- Updates RLS policies to use organizations/organization_staff instead of league_operators
-- Run after league_operators table has been dropped

BEGIN;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Operators can view their own preferences" ON operator_blackout_preferences;
DROP POLICY IF EXISTS "Operators can insert their own preferences" ON operator_blackout_preferences;
DROP POLICY IF EXISTS "Operators can update their own preferences" ON operator_blackout_preferences;
DROP POLICY IF EXISTS "Operators can delete their own preferences" ON operator_blackout_preferences;

-- Create updated RLS policies using organization_staff table

-- Operators can view their own organization's preferences
CREATE POLICY "Operators can view their own preferences"
  ON operator_blackout_preferences FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_staff WHERE member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Operators can insert preferences for their organizations
CREATE POLICY "Operators can insert their own preferences"
  ON operator_blackout_preferences FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_staff WHERE member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Operators can update their organization's preferences
CREATE POLICY "Operators can update their own preferences"
  ON operator_blackout_preferences FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_staff WHERE member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Operators can delete their organization's preferences
CREATE POLICY "Operators can delete their own preferences"
  ON operator_blackout_preferences FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_staff WHERE member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

COMMIT;
