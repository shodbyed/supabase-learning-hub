-- Migration: Rename created_by_organization_id to organization_id in venues table
-- Date: 2025-11-29
-- Description: Simplifies column naming for consistency across the codebase

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE venues
  DROP CONSTRAINT IF EXISTS venues_created_by_organization_id_fkey;

-- Step 2: Drop existing indexes
DROP INDEX IF EXISTS idx_venues_created_by_organization_id;
DROP INDEX IF EXISTS idx_venues_operator;

-- Step 3: Rename the column
ALTER TABLE venues
  RENAME COLUMN created_by_organization_id TO organization_id;

-- Step 4: Add new foreign key constraint with updated column name
ALTER TABLE venues
  ADD CONSTRAINT venues_organization_id_fkey
  FOREIGN KEY (organization_id)
  REFERENCES organizations(id)
  ON DELETE CASCADE;

-- Step 5: Create index for performance
CREATE INDEX idx_venues_organization_id ON venues(organization_id);

-- Note: The foreign key constraint now uses ON DELETE CASCADE instead of SET NULL
-- This ensures venues are deleted when their organization is deleted
