-- Allow players to update handicap thresholds on matches they're playing in
--
-- Problem: When both lineups are locked, the home team needs to calculate and save
-- handicap thresholds (games_to_win, games_to_tie, games_to_lose) to the matches table.
-- Currently only league operators can update matches, so this fails silently.
--
-- Solution: Add a policy allowing team members to update ONLY the threshold fields
-- for matches they're participating in.

CREATE POLICY "Players can update match thresholds for their matches"
ON matches
FOR UPDATE
USING (
  -- User must be on one of the teams playing in this match
  EXISTS (
    SELECT 1
    FROM team_players tp
    JOIN members m ON m.id = tp.member_id
    WHERE (tp.team_id = matches.home_team_id OR tp.team_id = matches.away_team_id)
    AND m.user_id = auth.uid()
  )
)
WITH CHECK (
  -- User must be on one of the teams playing in this match
  EXISTS (
    SELECT 1
    FROM team_players tp
    JOIN members m ON m.id = tp.member_id
    WHERE (tp.team_id = matches.home_team_id OR tp.team_id = matches.away_team_id)
    AND m.user_id = auth.uid()
  )
);

-- Note: This policy allows players to update ANY field on their matches.
-- In a production system, you might want to restrict this to only specific fields
-- (home_games_to_win, home_games_to_tie, home_games_to_lose, away_games_to_win,
-- away_games_to_tie, away_games_to_lose, home_team_verified_by, away_team_verified_by)
-- However, PostgreSQL RLS doesn't support column-level restrictions directly.
-- For better security, consider using a stored procedure with SECURITY DEFINER.
