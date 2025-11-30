/**
 * Migration: Rename operator_id to organization_id
 *
 * This migration renames all operator_id columns to organization_id
 * to reflect the new multi-operator organization structure.
 *
 * Tables affected:
 * - leagues.operator_id → organization_id
 * - venues.created_by_operator_id → created_by_organization_id
 *
 * Foreign keys are updated to reference organizations table instead of league_operators.
 * Indexes are recreated with new names.
 *
 * Run after creating organizations and organization_staff tables.
 */

-- ============================================================================
-- 1. LEAGUES TABLE
-- ============================================================================

-- Drop existing foreign key constraint
ALTER TABLE leagues
  DROP CONSTRAINT IF EXISTS leagues_operator_id_fkey;

-- Drop existing index
DROP INDEX IF EXISTS idx_leagues_operator_id;

-- Rename the column
ALTER TABLE leagues
  RENAME COLUMN operator_id TO organization_id;

-- Add new foreign key constraint referencing organizations table
ALTER TABLE leagues
  ADD CONSTRAINT leagues_organization_id_fkey
  FOREIGN KEY (organization_id)
  REFERENCES organizations(id)
  ON DELETE CASCADE;

-- Create new index with updated name
CREATE INDEX idx_leagues_organization_id ON leagues(organization_id);

-- ============================================================================
-- 2. VENUES TABLE
-- ============================================================================

-- Drop existing foreign key constraint
ALTER TABLE venues
  DROP CONSTRAINT IF EXISTS venues_created_by_operator_id_fkey;

-- Drop existing index (if it exists)
DROP INDEX IF EXISTS idx_venues_operator_id;
DROP INDEX IF EXISTS idx_venues_created_by_operator_id;

-- Rename the column
ALTER TABLE venues
  RENAME COLUMN created_by_operator_id TO created_by_organization_id;

-- Add new foreign key constraint referencing organizations table
ALTER TABLE venues
  ADD CONSTRAINT venues_created_by_organization_id_fkey
  FOREIGN KEY (created_by_organization_id)
  REFERENCES organizations(id)
  ON DELETE CASCADE;

-- Create new index with updated name
CREATE INDEX idx_venues_created_by_organization_id ON venues(created_by_organization_id);

-- ============================================================================
-- 3. OPERATOR_BLACKOUT_PREFERENCES TABLE
-- ============================================================================

-- Note: This table also needs renaming operator_id → organization_id
-- For now we'll just update the column. The table rename (operator_blackout_preferences
-- → organization_blackout_preferences) can be done in a future migration.

-- Drop existing foreign key constraint (if exists)
ALTER TABLE operator_blackout_preferences
  DROP CONSTRAINT IF EXISTS operator_blackout_preferences_operator_id_fkey;

-- Drop existing index (if exists)
DROP INDEX IF EXISTS idx_operator_blackout_preferences_operator_id;

-- Rename the column
ALTER TABLE operator_blackout_preferences
  RENAME COLUMN operator_id TO organization_id;

-- Add new foreign key constraint referencing organizations table
ALTER TABLE operator_blackout_preferences
  ADD CONSTRAINT operator_blackout_preferences_organization_id_fkey
  FOREIGN KEY (organization_id)
  REFERENCES organizations(id)
  ON DELETE CASCADE;

-- Create new index with updated name
CREATE INDEX idx_operator_blackout_preferences_organization_id
  ON operator_blackout_preferences(organization_id);

-- ============================================================================
-- VERIFICATION QUERIES (commented out - uncomment to verify)
-- ============================================================================

-- Verify leagues table
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'leagues'
-- AND column_name LIKE '%organization%';

-- Verify venues table
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'venues'
-- AND column_name LIKE '%organization%';

-- Verify foreign keys
-- SELECT
--   conname AS constraint_name,
--   conrelid::regclass AS table_name,
--   confrelid::regclass AS referenced_table
-- FROM pg_constraint
-- WHERE contype = 'f'
-- AND (conrelid::regclass::text = 'leagues' OR conrelid::regclass::text = 'venues');
