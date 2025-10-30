-- Lineups table for 3v3 matches
-- Stores the player lineup for each team in each match
-- Created before match starts, locked when both teams confirm

CREATE TABLE IF NOT EXISTS lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,

  -- Three players in batting order
  player1_id UUID REFERENCES members(id) ON DELETE SET NULL NOT NULL,
  player2_id UUID REFERENCES members(id) ON DELETE SET NULL NOT NULL,
  player3_id UUID REFERENCES members(id) ON DELETE SET NULL NOT NULL,

  -- Player handicaps at time of lineup (snapshot from members table)
  player1_handicap INTEGER NOT NULL,
  player2_handicap INTEGER NOT NULL,
  player3_handicap INTEGER NOT NULL,

  -- Lineup confirmation
  is_locked BOOLEAN DEFAULT false NOT NULL,
  locked_at TIMESTAMPTZ,
  locked_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Each team can only have one lineup per match
  UNIQUE(match_id, team_id),

  -- Ensure all three players are different
  CHECK (player1_id != player2_id AND player1_id != player3_id AND player2_id != player3_id)
);

-- Comments
COMMENT ON TABLE lineups IS '3v3 match lineups - stores player order and handicaps for each team';
COMMENT ON COLUMN lineups.player1_handicap IS 'Snapshot of player1 handicap at lineup creation (may differ from current handicap)';
COMMENT ON COLUMN lineups.player2_handicap IS 'Snapshot of player2 handicap at lineup creation (may differ from current handicap)';
COMMENT ON COLUMN lineups.player3_handicap IS 'Snapshot of player3 handicap at lineup creation (may differ from current handicap)';
COMMENT ON COLUMN lineups.is_locked IS 'Once locked, lineup cannot be changed (both teams must lock before match starts)';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lineups_match ON lineups(match_id);
CREATE INDEX IF NOT EXISTS idx_lineups_team ON lineups(team_id);

-- RLS Policies
ALTER TABLE lineups ENABLE ROW LEVEL SECURITY;

-- Allow players to view lineups for matches they're involved in
CREATE POLICY "Players can view lineups for their matches"
ON lineups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = lineups.match_id
    AND (
      EXISTS (SELECT 1 FROM members WHERE id = player1_id AND user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM members WHERE id = player2_id AND user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM members WHERE id = player3_id AND user_id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM members mem
        WHERE mem.team_id IN (m.home_team_id, m.away_team_id)
        AND mem.user_id = auth.uid()
      )
    )
  )
);

-- Allow team members to create lineups for their own team
CREATE POLICY "Team members can create lineups"
ON lineups FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members
    WHERE members.team_id = lineups.team_id
    AND members.user_id = auth.uid()
  )
);

-- Allow team members to update their unlocked lineups
CREATE POLICY "Team members can update unlocked lineups"
ON lineups FOR UPDATE
USING (
  is_locked = false
  AND EXISTS (
    SELECT 1 FROM members
    WHERE members.team_id = lineups.team_id
    AND members.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members
    WHERE members.team_id = lineups.team_id
    AND members.user_id = auth.uid()
  )
);

-- Allow team members to delete their unlocked lineups
CREATE POLICY "Team members can delete unlocked lineups"
ON lineups FOR DELETE
USING (
  is_locked = false
  AND EXISTS (
    SELECT 1 FROM members
    WHERE members.team_id = lineups.team_id
    AND members.user_id = auth.uid()
  )
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lineups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lineups_updated_at
BEFORE UPDATE ON lineups
FOR EACH ROW
EXECUTE FUNCTION update_lineups_updated_at();
