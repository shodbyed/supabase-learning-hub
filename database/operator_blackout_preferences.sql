-- =====================================================
-- OPERATOR BLACKOUT PREFERENCES TABLE
-- =====================================================
-- Purpose: Store operator preferences for automatic blackouts and ignored conflicts
-- Supports championship dates, holidays, and custom recurring dates
-- =====================================================

-- Drop existing table and related objects if they exist
DROP TABLE IF EXISTS operator_blackout_preferences CASCADE;

-- Drop custom types only if they exist and aren't used by other tables
DO $$
BEGIN
  -- Drop preference_type enum if it exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'preference_type') THEN
    DROP TYPE preference_type CASCADE;
  END IF;

  -- Drop preference_action enum if it exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'preference_action') THEN
    DROP TYPE preference_action CASCADE;
  END IF;
END $$;

-- =====================================================
-- CREATE CUSTOM TYPES
-- =====================================================

-- Type of preference
CREATE TYPE preference_type AS ENUM ('holiday', 'championship', 'custom');

-- Action to take for this preference
CREATE TYPE preference_action AS ENUM ('blackout', 'ignore');

-- =====================================================
-- CREATE TABLE
-- =====================================================

CREATE TABLE operator_blackout_preferences (
  -- Primary identification
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Which organization owns this preference
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- What type of preference is this
  preference_type preference_type NOT NULL,

  -- What action should be taken (blackout week or ignore conflict)
  preference_action preference_action NOT NULL,

  -- For type = 'holiday'
  holiday_name TEXT,

  -- For type = 'championship'
  championship_id UUID REFERENCES championship_date_options(id) ON DELETE SET NULL,

  -- For type = 'custom'
  custom_name TEXT,
  custom_start_date DATE,
  custom_end_date DATE,

  -- Should this be automatically applied when creating new seasons
  auto_apply BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Validation constraints
  CONSTRAINT valid_holiday_preference CHECK (
    preference_type != 'holiday' OR holiday_name IS NOT NULL
  ),
  CONSTRAINT valid_championship_preference CHECK (
    preference_type != 'championship' OR championship_id IS NOT NULL
  ),
  CONSTRAINT valid_custom_preference CHECK (
    preference_type != 'custom' OR (
      custom_name IS NOT NULL AND
      custom_start_date IS NOT NULL AND
      custom_end_date IS NOT NULL AND
      custom_end_date >= custom_start_date
    )
  )
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- Index for querying by organization
CREATE INDEX idx_operator_blackout_preferences_organization_id
ON operator_blackout_preferences(organization_id);

-- Index for filtering by type and action
CREATE INDEX idx_operator_blackout_preferences_type_action
ON operator_blackout_preferences(preference_type, preference_action);

-- Index for championship lookups
CREATE INDEX idx_operator_blackout_preferences_championship_id
ON operator_blackout_preferences(championship_id)
WHERE championship_id IS NOT NULL;

-- =====================================================
-- CREATE TRIGGER FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_operator_blackout_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER operator_blackout_preferences_updated_at_trigger
  BEFORE UPDATE ON operator_blackout_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_operator_blackout_preferences_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE operator_blackout_preferences ENABLE ROW LEVEL SECURITY;

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

-- =====================================================
-- TABLE COMMENTS
-- =====================================================

COMMENT ON TABLE operator_blackout_preferences IS
'Stores operator preferences for automatic blackouts and ignored conflicts. Supports championship dates, holidays, and custom recurring dates. Used to reduce repetitive data entry and filter noise from conflict warnings.';

COMMENT ON COLUMN operator_blackout_preferences.preference_type IS
'Type of preference: holiday (e.g., Christmas), championship (BCA/APA), or custom (local tournaments)';

COMMENT ON COLUMN operator_blackout_preferences.preference_action IS
'Action to take: blackout (insert blackout week) or ignore (suppress conflict warning)';

COMMENT ON COLUMN operator_blackout_preferences.holiday_name IS
'Name of holiday (e.g., "Christmas", "Tax Day") - required when preference_type = holiday';

COMMENT ON COLUMN operator_blackout_preferences.championship_id IS
'Reference to championship_date_options - required when preference_type = championship';

COMMENT ON COLUMN operator_blackout_preferences.auto_apply IS
'If true, automatically apply this preference when creating new seasons (future feature)';
