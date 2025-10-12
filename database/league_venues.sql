-- League Venues Join Table
-- Tracks which venues are available for a specific league
-- Allows operators to limit table availability per league (venue may have 8 tables but only authorize 3 for this league)

CREATE TABLE IF NOT EXISTS league_venues (
  -- Primary identification
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Relationships
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,

  -- Operational limits: How many tables operator can use for THIS league
  -- Owner may authorize fewer tables than physically exist
  -- Example: Venue has 8 tables, but owner only allows league to use 3
  available_bar_box_tables INT NOT NULL DEFAULT 0 CHECK (available_bar_box_tables >= 0),
  available_regulation_tables INT NOT NULL DEFAULT 0 CHECK (available_regulation_tables >= 0),

  -- Computed total for convenience
  available_total_tables INT GENERATED ALWAYS AS (available_bar_box_tables + available_regulation_tables) STORED,

  -- Metadata
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(league_id, venue_id), -- Each venue can only be added once per league

  -- Must authorize at least one table
  CONSTRAINT league_venue_must_have_tables CHECK (available_total_tables > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_league_venues_league ON league_venues(league_id);
CREATE INDEX IF NOT EXISTS idx_league_venues_venue ON league_venues(venue_id);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_league_venues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER league_venues_updated_at
  BEFORE UPDATE ON league_venues
  FOR EACH ROW
  EXECUTE FUNCTION update_league_venues_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE league_venues ENABLE ROW LEVEL SECURITY;

-- Policy: Operators can view their own league venues
CREATE POLICY "Operators can view own league venues"
  ON league_venues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Operators can add venues to their own leagues
CREATE POLICY "Operators can add venues to own leagues"
  ON league_venues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Operators can update their own league venues
CREATE POLICY "Operators can update own league venues"
  ON league_venues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Operators can remove venues from their own leagues
CREATE POLICY "Operators can remove venues from own leagues"
  ON league_venues FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Public can view venues for active leagues (for player discovery)
CREATE POLICY "Public can view active league venues"
  ON league_venues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = league_id
      AND leagues.status = 'active'
    )
  );

-- Comments for documentation
COMMENT ON TABLE league_venues IS 'Join table: which venues are available for each league, with table availability limits';
COMMENT ON COLUMN league_venues.available_bar_box_tables IS 'How many 7ft tables authorized for this league (may be less than venue total)';
COMMENT ON COLUMN league_venues.available_regulation_tables IS 'How many 9ft tables authorized for this league (may be less than venue total)';
COMMENT ON COLUMN league_venues.available_total_tables IS 'Computed total: available_bar_box + available_regulation tables';
