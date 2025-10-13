-- Teams Table
-- Represents a team competing in a specific season
-- Teams are season-specific: each season has its own teams (even if same players/name)

CREATE TABLE IF NOT EXISTS teams (
  -- Primary identification
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Relationships
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE, -- Denormalized for query performance
  captain_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT, -- Can't delete captain while team exists
  home_venue_id UUID REFERENCES venues(id) ON DELETE SET NULL, -- Captain chooses from league's authorized venues

  -- Team identity
  team_name VARCHAR(100) NOT NULL, -- Captain can edit
  roster_size INT NOT NULL CHECK (roster_size IN (5, 8)), -- Based on league format (5-man or 8-man)

  -- Standing stats (updated as matches are played)
  wins INT DEFAULT 0 CHECK (wins >= 0),
  losses INT DEFAULT 0 CHECK (losses >= 0),
  ties INT DEFAULT 0 CHECK (ties >= 0),
  points INT DEFAULT 0 CHECK (points >= 0),
  games_won INT DEFAULT 0 CHECK (games_won >= 0),
  games_lost INT DEFAULT 0 CHECK (games_lost >= 0),

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'forfeited')),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_season ON teams(season_id);
CREATE INDEX IF NOT EXISTS idx_teams_league ON teams(league_id);
CREATE INDEX IF NOT EXISTS idx_teams_captain ON teams(captain_id);
CREATE INDEX IF NOT EXISTS idx_teams_venue ON teams(home_venue_id);
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_teams_updated_at();

-- Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Policy: Operators can view teams in their leagues
CREATE POLICY "Operators can view own league teams"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Operators can create teams in their leagues
CREATE POLICY "Operators can create teams in own leagues"
  ON teams FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Operators can update teams in their leagues
CREATE POLICY "Operators can update own league teams"
  ON teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Captains can update their own team (name and venue only)
CREATE POLICY "Captains can update their team"
  ON teams FOR UPDATE
  USING (
    captain_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Policy: Operators can delete teams from their leagues
CREATE POLICY "Operators can delete own league teams"
  ON teams FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Public can view teams in active leagues (for discovery)
CREATE POLICY "Public can view active league teams"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = league_id
      AND leagues.status = 'active'
    )
  );

-- Comments for documentation
COMMENT ON TABLE teams IS 'Teams competing in specific seasons. Season-specific: each season gets new team records.';
COMMENT ON COLUMN teams.season_id IS 'Which season this team is competing in';
COMMENT ON COLUMN teams.league_id IS 'Denormalized league reference for fast queries without joining seasons';
COMMENT ON COLUMN teams.captain_id IS 'Team captain who can edit team name, venue, and manage roster';
COMMENT ON COLUMN teams.home_venue_id IS 'Where team plays home games. Captain chooses from league authorized venues.';
COMMENT ON COLUMN teams.roster_size IS 'Max players: 5 for 5-man format, 8 for 8-man format';
COMMENT ON COLUMN teams.status IS 'Team status: active (playing), withdrawn (left league), forfeited (disqualified)';
