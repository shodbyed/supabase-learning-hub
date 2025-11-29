/**
 * Migration: Rename league_email/league_phone to organization_email/organization_phone
 *
 * Purpose: Fix inconsistent naming in organizations table
 * - All other columns use organization_ prefix (organization_name, organization_address, etc.)
 * - Email and phone were incorrectly using league_ prefix
 *
 * This migration renames:
 * - league_email → organization_email
 * - league_phone → organization_phone
 * - email_visibility → organization_email_visibility
 * - phone_visibility → organization_phone_visibility
 */

-- Rename email column
ALTER TABLE organizations
  RENAME COLUMN league_email TO organization_email;

-- Rename phone column
ALTER TABLE organizations
  RENAME COLUMN league_phone TO organization_phone;

-- Rename email visibility column for consistency
ALTER TABLE organizations
  RENAME COLUMN email_visibility TO organization_email_visibility;

-- Rename phone visibility column for consistency
ALTER TABLE organizations
  RENAME COLUMN phone_visibility TO organization_phone_visibility;

-- Update check constraint names to match new column names
ALTER TABLE organizations
  DROP CONSTRAINT IF EXISTS organizations_email_visibility_check;

ALTER TABLE organizations
  ADD CONSTRAINT organizations_organization_email_visibility_check
  CHECK (organization_email_visibility IN ('public', 'my_organization', 'my_teams'));

ALTER TABLE organizations
  DROP CONSTRAINT IF EXISTS organizations_phone_visibility_check;

ALTER TABLE organizations
  ADD CONSTRAINT organizations_organization_phone_visibility_check
  CHECK (organization_phone_visibility IN ('public', 'my_organization', 'my_teams'));

-- Update default values to use new column names
ALTER TABLE organizations
  ALTER COLUMN organization_email_visibility SET DEFAULT 'my_teams';

ALTER TABLE organizations
  ALTER COLUMN organization_phone_visibility SET DEFAULT 'my_teams';

COMMENT ON COLUMN organizations.organization_email IS 'Contact email for the organization';
COMMENT ON COLUMN organizations.organization_phone IS 'Contact phone number for the organization';
COMMENT ON COLUMN organizations.organization_email_visibility IS 'Who can see the organization email: public, my_organization, or my_teams';
COMMENT ON COLUMN organizations.organization_phone_visibility IS 'Who can see the organization phone: public, my_organization, or my_teams';
