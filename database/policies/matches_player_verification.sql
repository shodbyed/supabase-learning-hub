-- Allow players to update verification fields on matches they're playing in
-- This allows team members to verify match scores after all games are complete

-- Drop existing policy (will error if doesn't exist - that's ok, just run the CREATE below)
-- DROP POLICY "Players can verify matches they are playing in" ON matches;

CREATE POLICY "Players can verify matches they are playing in"
  ON matches
  FOR UPDATE
  USING (
    -- User must be a player on one of the teams in this match
    EXISTS (
      SELECT 1 FROM team_players tp
      JOIN members m ON m.id = tp.member_id
      WHERE m.user_id = auth.uid()
        AND (tp.team_id = matches.home_team_id OR tp.team_id = matches.away_team_id)
    )
  )
  WITH CHECK (
    -- User must be a player on one of the teams in this match
    EXISTS (
      SELECT 1 FROM team_players tp
      JOIN members m ON m.id = tp.member_id
      WHERE m.user_id = auth.uid()
        AND (tp.team_id = matches.home_team_id OR tp.team_id = matches.away_team_id)
    )
  );

-- Verify the policy was created
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'matches'
ORDER BY policyname;
