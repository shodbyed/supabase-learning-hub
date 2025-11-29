-- Migration: Drop league_operators table and update foreign keys
-- WARNING: Run this AFTER all application code has been migrated to use organizations table
-- Date: 2025-11-29

BEGIN;

-- Step 1: Rename columns to reflect new table structure
-- Note: The data should already reference organizations.id if migration was done correctly

-- Step 2: Drop old foreign key constraints
ALTER TABLE leagues DROP CONSTRAINT IF EXISTS leagues_operator_id_fkey;
ALTER TABLE operator_blackout_preferences DROP CONSTRAINT IF EXISTS operator_blackout_preferences_operator_id_fkey;
ALTER TABLE user_reports DROP CONSTRAINT IF EXISTS user_reports_assigned_operator_id_fkey;
ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_created_by_operator_id_fkey;

-- Step 3: Rename columns for clarity (operator_id -> organization_id)
-- These should already have organization IDs in them from previous migration

-- Leagues: operator_id -> organization_id (if not already renamed)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leagues' AND column_name = 'operator_id'
  ) THEN
    ALTER TABLE leagues RENAME COLUMN operator_id TO organization_id;
  END IF;
END
$$;

-- Operator blackout preferences: operator_id -> organization_id (if not already renamed)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'operator_blackout_preferences' AND column_name = 'operator_id'
  ) THEN
    ALTER TABLE operator_blackout_preferences RENAME COLUMN operator_id TO organization_id;
  END IF;
END
$$;

-- User reports: assigned_operator_id -> assigned_organization_id (if not already renamed)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_reports' AND column_name = 'assigned_operator_id'
  ) THEN
    ALTER TABLE user_reports RENAME COLUMN assigned_operator_id TO assigned_organization_id;
  END IF;
END
$$;

-- Venues: created_by_operator_id -> created_by_organization_id (if not already renamed)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'created_by_operator_id'
  ) THEN
    ALTER TABLE venues RENAME COLUMN created_by_operator_id TO created_by_organization_id;
  END IF;
END
$$;

-- Step 4: Add new foreign key constraints pointing to organizations table
ALTER TABLE leagues
  ADD CONSTRAINT leagues_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE operator_blackout_preferences
  ADD CONSTRAINT operator_blackout_preferences_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE user_reports
  ADD CONSTRAINT user_reports_assigned_organization_id_fkey
  FOREIGN KEY (assigned_organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

ALTER TABLE venues
  ADD CONSTRAINT venues_created_by_organization_id_fkey
  FOREIGN KEY (created_by_organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- Step 5: Drop trigger functions that reference league_operators
DROP FUNCTION IF EXISTS update_league_operators_updated_at() CASCADE;
DROP FUNCTION IF EXISTS log_report_status_change() CASCADE;

-- Recreate log_report_status_change without league_operators reference
CREATE OR REPLACE FUNCTION log_report_status_change() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO report_updates (
      report_id,
      updater_id,
      updater_role,
      old_status,
      new_status,
      update_notes
    ) VALUES (
      NEW.id,
      (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1),
      (CASE
        WHEN EXISTS (SELECT 1 FROM organization_staff WHERE member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)) THEN 'operator'
        WHEN EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role = 'developer') THEN 'developer'
        ELSE 'unknown'
      END),
      OLD.status,
      NEW.status,
      NULL
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Step 6: Finally, drop the league_operators table
DROP TABLE IF EXISTS league_operators CASCADE;

COMMIT;

-- Verification queries (run these AFTER the migration):
-- SELECT COUNT(*) FROM leagues WHERE organization_id IS NULL; -- Should be 0
-- SELECT COUNT(*) FROM operator_blackout_preferences WHERE organization_id IS NULL; -- Should be 0
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'leagues'; -- Should see organization_id
