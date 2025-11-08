-- Add RLS policy for league operators to view all match_games
-- This allows operators to see games for testing and admin purposes

-- Drop if exists, then create
DROP POLICY IF EXISTS "League operators can view all games" ON match_games;

-- Policy: League operators can view all games
CREATE POLICY "League operators can view all games"
  ON match_games
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.user_id = auth.uid()
        AND m.role IN ('league_operator', 'developer')
    )
  );

-- Verify the policy was created
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'match_games'
ORDER BY policyname;
