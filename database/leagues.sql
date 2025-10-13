-- leagues table
-- Represents the ongoing league concept (e.g., "Tuesday 8-Ball League")
-- This is the container - mostly static information
-- Seasons are where the actual action happens

CREATE TABLE IF NOT EXISTS leagues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID NOT NULL REFERENCES league_operators(id) ON DELETE CASCADE,

  -- League identity (store components, derive display names)
  game_type VARCHAR(20) NOT NULL CHECK (game_type IN ('eight_ball', 'nine_ball', 'ten_ball')),
  day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  division VARCHAR(50), -- Optional: "Advanced", "Beginners", "East Division", etc.

  -- Format configuration
  -- team_format determines the scoring/handicap system
  -- 5_man uses custom_5man handicap, 8_man uses bca_standard
  -- Future formats like 3_man_bca would be new entries with their own scoring logic
  team_format VARCHAR(20) NOT NULL CHECK (team_format IN ('5_man', '8_man')),

  -- Dates
  league_start_date DATE NOT NULL, -- First match date ever (historical reference)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leagues_operator_id ON leagues(operator_id);
CREATE INDEX IF NOT EXISTS idx_leagues_status ON leagues(status);
CREATE INDEX IF NOT EXISTS idx_leagues_day_of_week ON leagues(day_of_week);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_leagues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leagues_updated_at_trigger
  BEFORE UPDATE ON leagues
  FOR EACH ROW
  EXECUTE FUNCTION update_leagues_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

-- Operators can view their own leagues
CREATE POLICY "Operators can view own leagues"
  ON leagues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members ON members.id = league_operators.member_id
      WHERE league_operators.id = operator_id
      AND members.user_id = auth.uid()
    )
  );

-- Operators can insert their own leagues
-- Checks that the operator_id being inserted matches an operator record for the authenticated user
CREATE POLICY "Operators can create own leagues"
  ON leagues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members ON members.id = league_operators.member_id
      WHERE league_operators.id = operator_id
      AND members.user_id = auth.uid()
    )
  );

-- Operators can update their own leagues
CREATE POLICY "Operators can update own leagues"
  ON leagues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members ON members.id = league_operators.member_id
      WHERE league_operators.id = operator_id
      AND members.user_id = auth.uid()
    )
  );

-- Operators can delete their own leagues
CREATE POLICY "Operators can delete own leagues"
  ON leagues FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members ON members.id = league_operators.member_id
      WHERE league_operators.id = operator_id
      AND members.user_id = auth.uid()
    )
  );

-- Public read access for players to see available leagues
-- (May want to restrict this later - for now allowing public view)
CREATE POLICY "Public can view active leagues"
  ON leagues FOR SELECT
  USING (status = 'active');
