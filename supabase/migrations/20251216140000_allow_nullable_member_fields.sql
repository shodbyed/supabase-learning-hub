-- Migration: Allow Nullable Member Fields
-- Purpose: Enable short registration form by making optional fields nullable.
--          This supports both placeholder players (created by LO/captain) and
--          new users who register with minimal info.
--
-- Fields being made nullable:
-- - phone: Not required for initial registration
-- - address: Not required for initial registration
-- - zip_code: Not required for initial registration
-- - date_of_birth: Not required for initial registration
--
-- Fields that remain required:
-- - first_name, last_name: Identity
-- - city, state: For fuzzy matching during PP merge detection
-- - email: For contact (null for placeholder players only)
-- - role: System requirement
-- - nickname: Auto-generated if not provided

-- ============================================================================
-- ALTER COLUMNS TO ALLOW NULL
-- ============================================================================

ALTER TABLE members
  ALTER COLUMN phone DROP NOT NULL;

ALTER TABLE members
  ALTER COLUMN address DROP NOT NULL;

ALTER TABLE members
  ALTER COLUMN zip_code DROP NOT NULL;

ALTER TABLE members
  ALTER COLUMN date_of_birth DROP NOT NULL;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN members.phone IS
'Contact phone number. Optional - can be added later in profile settings.';

COMMENT ON COLUMN members.address IS
'Street address. Optional - can be added later in profile settings.';

COMMENT ON COLUMN members.zip_code IS
'ZIP/postal code. Optional - can be added later in profile settings.';

COMMENT ON COLUMN members.date_of_birth IS
'Date of birth. Optional - may be needed for age-restricted leagues.';
