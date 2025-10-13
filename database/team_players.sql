-- Team Players Join Table
-- Links players (members) to teams for specific seasons
-- Tracks roster membership and individual player stats

CREATE TABLE IF NOT EXISTS team_players (
  -- Primary identification
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Relationships
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE, -- Denormalized for query performance

  -- Role on team
  is_captain BOOLEAN DEFAULT FALSE, -- Redundant with teams.captain_id but useful for queries

  -- Individual player stats for this season (updated as matches are played)
  individual_wins INT DEFAULT 0 CHECK (individual_wins >= 0),
  individual_losses INT DEFAULT 0 CHECK (individual_losses >= 0),
  skill_level INT CHECK (skill_level >= 1 AND skill_level <= 9), -- BCA skill level (1-9)

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'dropped')),

  -- Metadata
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(team_id, member_id) -- Each player can only be on a team once per team
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_players_team ON team_players(team_id);
CREATE INDEX IF NOT EXISTS idx_team_players_member ON team_players(member_id);
CREATE INDEX IF NOT EXISTS idx_team_players_season ON team_players(season_id);
CREATE INDEX IF NOT EXISTS idx_team_players_captain ON team_players(team_id, is_captain);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_players_updated_at
  BEFORE UPDATE ON team_players
  FOR EACH ROW
  EXECUTE FUNCTION update_team_players_updated_at();

-- Row Level Security (RLS)
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;

-- Policy: Operators can view players in their league teams
CREATE POLICY "Operators can view own league team players"
  ON team_players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN leagues ON teams.league_id = leagues.id
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE teams.id = team_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Operators can add players to teams in their leagues
CREATE POLICY "Operators can add players to own league teams"
  ON team_players FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      JOIN leagues ON teams.league_id = leagues.id
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE teams.id = team_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Operators can update players in their league teams
CREATE POLICY "Operators can update own league team players"
  ON team_players FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN leagues ON teams.league_id = leagues.id
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE teams.id = team_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Operators can remove players from teams in their leagues
CREATE POLICY "Operators can remove players from own league teams"
  ON team_players FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN leagues ON teams.league_id = leagues.id
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE teams.id = team_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Captains can add players to their own team
CREATE POLICY "Captains can add players to their team"
  ON team_players FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      JOIN members ON teams.captain_id = members.id
      WHERE teams.id = team_id
      AND members.user_id = auth.uid()
    )
  );

-- Policy: Captains can remove players from their own team (except themselves)
CREATE POLICY "Captains can remove players from their team"
  ON team_players FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN members AS captain ON teams.captain_id = captain.id
      JOIN members AS player ON team_players.member_id = player.id
      WHERE teams.id = team_id
      AND captain.user_id = auth.uid()
      AND player.id != captain.id -- Can't remove self
    )
  );

-- Policy: Public can view players in active league teams (for discovery)
CREATE POLICY "Public can view active league team players"
  ON team_players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN leagues ON teams.league_id = leagues.id
      WHERE teams.id = team_id
      AND leagues.status = 'active'
      AND team_players.status = 'active'
    )
  );

-- Comments for documentation
COMMENT ON TABLE team_players IS 'Join table linking players to teams for specific seasons. Tracks roster membership and stats.';
COMMENT ON COLUMN team_players.team_id IS 'Which team this player is on';
COMMENT ON COLUMN team_players.member_id IS 'Which player/member';
COMMENT ON COLUMN team_players.season_id IS 'Denormalized season reference for fast queries without joining teams';
COMMENT ON COLUMN team_players.is_captain IS 'True if this player is the captain (redundant with teams.captain_id but useful)';
COMMENT ON COLUMN team_players.skill_level IS 'BCA skill level (1-9) for handicap calculations';
COMMENT ON COLUMN team_players.status IS 'Player status: active (playing), inactive (benched), dropped (removed from team)';
