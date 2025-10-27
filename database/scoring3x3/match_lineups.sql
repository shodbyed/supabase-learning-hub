/**
 * @fileoverview Match Lineups Table
 *
 * Stores the 3-player lineup selections for each team in a match.
 * Supports one anonymous substitute per team (NULL player_id with manually entered handicap).
 * Lineups must be locked before proceeding to scoring.
 *
 * Usage:
 * - Each match can have up to 2 lineup entries (home team and away team)
 * - At most one player per team can be a substitute (player_id IS NULL)
 * - Handicaps are captured for all players (regular players from member record, subs manually entered)
 * - locked=true prevents further lineup changes and signals readiness to score
 *
 * Real-time usage:
 * - Subscribe to this table filtered by match_id to watch opponent's lineup status
 * - When both teams have locked=true, both can proceed to scoring page
 */

CREATE TABLE IF NOT EXISTS match_lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,

  -- Player 1 (NULL if substitute)
  player1_id UUID REFERENCES members(id) ON DELETE SET NULL,
  player1_handicap DECIMAL(3,1) NOT NULL,

  -- Player 2 (NULL if substitute)
  player2_id UUID REFERENCES members(id) ON DELETE SET NULL,
  player2_handicap DECIMAL(3,1) NOT NULL,

  -- Player 3 (NULL if substitute)
  player3_id UUID REFERENCES members(id) ON DELETE SET NULL,
  player3_handicap DECIMAL(3,1) NOT NULL,

  -- Lock status
  locked BOOLEAN DEFAULT false NOT NULL,
  locked_at TIMESTAMPTZ,

  -- Audit timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Constraints
  UNIQUE(match_id, team_id),  -- One lineup per team per match

  -- At most one substitute per team (at most one NULL player_id)
  CHECK (
    (CASE WHEN player1_id IS NULL THEN 1 ELSE 0 END +
     CASE WHEN player2_id IS NULL THEN 1 ELSE 0 END +
     CASE WHEN player3_id IS NULL THEN 1 ELSE 0 END) <= 1
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_match_lineups_match_id ON match_lineups(match_id);
CREATE INDEX IF NOT EXISTS idx_match_lineups_team_id ON match_lineups(team_id);
CREATE INDEX IF NOT EXISTS idx_match_lineups_locked ON match_lineups(locked);

-- Enable Row Level Security
ALTER TABLE match_lineups ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Players can view lineups for their own team's matches
CREATE POLICY "Players can view lineups for their matches"
  ON match_lineups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      JOIN team_players tp ON tp.team_id IN (m.home_team_id, m.away_team_id)
      WHERE m.id = match_lineups.match_id
        AND tp.member_id = auth.uid()
    )
  );

-- Team members can insert/update lineups for their own team (before locking)
CREATE POLICY "Team members can manage their own lineup"
  ON match_lineups
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_players tp
      WHERE tp.team_id = match_lineups.team_id
        AND tp.member_id = auth.uid()
    )
    AND (locked = false OR locked IS NULL)  -- Can only modify unlocked lineups
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_players tp
      WHERE tp.team_id = match_lineups.team_id
        AND tp.member_id = auth.uid()
    )
  );

-- League operators can view all lineups
CREATE POLICY "League operators can view all lineups"
  ON match_lineups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.user_id = auth.uid()
        AND members.role IN ('league_operator', 'developer')
    )
  );

-- League operators can manage all lineups
CREATE POLICY "League operators can manage all lineups"
  ON match_lineups
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.user_id = auth.uid()
        AND members.role IN ('league_operator', 'developer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.user_id = auth.uid()
        AND members.role IN ('league_operator', 'developer')
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_match_lineups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.locked = true AND OLD.locked = false THEN
    NEW.locked_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_match_lineups_updated_at
  BEFORE UPDATE ON match_lineups
  FOR EACH ROW
  EXECUTE FUNCTION update_match_lineups_updated_at();

-- Enable real-time for this table (for opponent status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE match_lineups;
