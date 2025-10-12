-- Venues Table
-- Represents physical locations (pool halls, bars) where league matches can be played
-- Venues are created by operators and can be shared across multiple leagues

CREATE TABLE IF NOT EXISTS venues (
  -- Primary identification
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Ownership tracking (for future permission system)
  -- First operator to create venue "owns" it, future: need permission to use
  created_by_operator_id UUID NOT NULL REFERENCES league_operators(id) ON DELETE CASCADE,

  -- Future: Actual venue owner account (bar/poolhall owner login)
  venue_owner_id UUID REFERENCES venue_owners(id) ON DELETE SET NULL,

  -- REQUIRED: Essential venue information
  name VARCHAR(255) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  phone VARCHAR(20) NOT NULL,

  -- REQUIRED: Table capacity (determines how many home teams venue can support)
  bar_box_tables INT NOT NULL DEFAULT 0 CHECK (bar_box_tables >= 0), -- 7ft tables
  regulation_tables INT NOT NULL DEFAULT 0 CHECK (regulation_tables >= 0), -- 9ft tables

  -- Computed total for convenience
  total_tables INT GENERATED ALWAYS AS (bar_box_tables + regulation_tables) STORED,

  -- OPTIONAL: Additional contact information
  proprietor_name VARCHAR(255), -- Bar/hall owner name
  proprietor_phone VARCHAR(20),
  league_contact_name VARCHAR(255), -- Primary contact for league coordination
  league_contact_phone VARCHAR(20),
  league_contact_email VARCHAR(255),
  website VARCHAR(500),

  -- OPTIONAL: Operational details
  business_hours TEXT, -- Free-form text like "Mon-Fri 4pm-2am, Sat-Sun 12pm-2am"
  notes TEXT, -- Internal notes for operators

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- At least one table type must have tables
  CONSTRAINT venue_must_have_tables CHECK (total_tables > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_venues_operator ON venues(created_by_operator_id);
CREATE INDEX IF NOT EXISTS idx_venues_active ON venues(is_active);
CREATE INDEX IF NOT EXISTS idx_venues_city_state ON venues(city, state);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_venues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_venues_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Policy: Operators can view all venues (for now - MVP behavior)
-- Future: Restrict to venues they have permission to use
CREATE POLICY "Operators can view all venues"
  ON venues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members ON league_operators.member_id = members.id
      WHERE members.user_id = auth.uid()
    )
  );

-- Policy: Operators can create venues
CREATE POLICY "Operators can create venues"
  ON venues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members ON league_operators.member_id = members.id
      WHERE league_operators.id = created_by_operator_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Operators can update their own venues
-- Future: Allow venue_owner to update their venues
CREATE POLICY "Operators can update own venues"
  ON venues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members ON league_operators.member_id = members.id
      WHERE league_operators.id = created_by_operator_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Operators can delete their own venues (soft delete via is_active preferred)
CREATE POLICY "Operators can delete own venues"
  ON venues FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members ON league_operators.member_id = members.id
      WHERE league_operators.id = created_by_operator_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Public can view active venues (for player discovery)
CREATE POLICY "Public can view active venues"
  ON venues FOR SELECT
  USING (is_active = true);

-- Comments for documentation
COMMENT ON TABLE venues IS 'Physical locations (pool halls, bars) where league matches are played';
COMMENT ON COLUMN venues.created_by_operator_id IS 'Operator who first created this venue - future: owns permission rights';
COMMENT ON COLUMN venues.venue_owner_id IS 'Future: Actual bar/poolhall owner account who can approve operators';
COMMENT ON COLUMN venues.bar_box_tables IS '7ft bar-box tables available at venue';
COMMENT ON COLUMN venues.regulation_tables IS '9ft regulation tables available at venue';
COMMENT ON COLUMN venues.total_tables IS 'Computed total: bar_box + regulation tables';
COMMENT ON COLUMN venues.business_hours IS 'Free-form text describing when venue is open';
COMMENT ON COLUMN venues.notes IS 'Internal operator notes about venue';
