-- Migration: Drop league_operators table and update foreign keys (Version 2 - Idempotent)
-- WARNING: Run this AFTER all application code has been migrated to use organizations table
-- Date: 2025-11-29
-- This version handles cases where migration was partially run

BEGIN;

-- Step 1: Drop old foreign key constraints (if they exist)
ALTER TABLE leagues DROP CONSTRAINT IF EXISTS leagues_operator_id_fkey;
ALTER TABLE operator_blackout_preferences DROP CONSTRAINT IF EXISTS operator_blackout_preferences_operator_id_fkey;
ALTER TABLE user_reports DROP CONSTRAINT IF EXISTS user_reports_assigned_operator_id_fkey;
ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_created_by_operator_id_fkey;

-- Step 2: Rename columns for clarity (operator_id -> organization_id)
-- Only rename if the old column still exists

-- Leagues: operator_id -> organization_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leagues' AND column_name = 'operator_id'
  ) THEN
    ALTER TABLE leagues RENAME COLUMN operator_id TO organization_id;
    RAISE NOTICE 'Renamed leagues.operator_id to organization_id';
  ELSE
    RAISE NOTICE 'leagues.organization_id already exists, skipping rename';
  END IF;
END
$$;

-- Operator blackout preferences: operator_id -> organization_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'operator_blackout_preferences' AND column_name = 'operator_id'
  ) THEN
    ALTER TABLE operator_blackout_preferences RENAME COLUMN operator_id TO organization_id;
    RAISE NOTICE 'Renamed operator_blackout_preferences.operator_id to organization_id';
  ELSE
    RAISE NOTICE 'operator_blackout_preferences.organization_id already exists, skipping rename';
  END IF;
END
$$;

-- User reports: assigned_operator_id -> assigned_organization_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_reports' AND column_name = 'assigned_operator_id'
  ) THEN
    ALTER TABLE user_reports RENAME COLUMN assigned_operator_id TO assigned_organization_id;
    RAISE NOTICE 'Renamed user_reports.assigned_operator_id to assigned_organization_id';
  ELSE
    RAISE NOTICE 'user_reports.assigned_organization_id already exists, skipping rename';
  END IF;
END
$$;

-- Venues: created_by_operator_id -> created_by_organization_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'created_by_operator_id'
  ) THEN
    ALTER TABLE venues RENAME COLUMN created_by_operator_id TO created_by_organization_id;
    RAISE NOTICE 'Renamed venues.created_by_operator_id to created_by_organization_id';
  ELSE
    RAISE NOTICE 'venues.created_by_organization_id already exists, skipping rename';
  END IF;
END
$$;

-- Step 3: Drop new foreign key constraints (if they exist) before recreating
ALTER TABLE leagues DROP CONSTRAINT IF EXISTS leagues_organization_id_fkey;
ALTER TABLE operator_blackout_preferences DROP CONSTRAINT IF EXISTS operator_blackout_preferences_organization_id_fkey;
ALTER TABLE user_reports DROP CONSTRAINT IF EXISTS user_reports_assigned_organization_id_fkey;
ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_created_by_organization_id_fkey;

-- Step 4: Add new foreign key constraints pointing to organizations table
-- Use DO blocks to check which column name exists before creating constraint

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leagues' AND column_name = 'organization_id') THEN
    ALTER TABLE leagues ADD CONSTRAINT leagues_organization_id_fkey
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'operator_blackout_preferences' AND column_name = 'organization_id') THEN
    ALTER TABLE operator_blackout_preferences ADD CONSTRAINT operator_blackout_preferences_organization_id_fkey
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reports' AND column_name = 'assigned_organization_id') THEN
    ALTER TABLE user_reports ADD CONSTRAINT user_reports_assigned_organization_id_fkey
      FOREIGN KEY (assigned_organization_id) REFERENCES organizations(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'created_by_organization_id') THEN
    ALTER TABLE venues ADD CONSTRAINT venues_created_by_organization_id_fkey
      FOREIGN KEY (created_by_organization_id) REFERENCES organizations(id) ON DELETE SET NULL;
  END IF;
END $$;

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

-- Verification queries (uncomment and run these AFTER the migration):
-- SELECT COUNT(*) FROM leagues WHERE organization_id IS NULL; -- Should be 0
-- SELECT COUNT(*) FROM operator_blackout_preferences WHERE organization_id IS NULL; -- Should be 0
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'leagues' AND column_name LIKE '%organization%';
