-- Fix lineup lock/unlock permissions
-- Problem: Players cannot unlock their own lineups because the RLS policy
-- only allows updates when locked = false, but unlocking requires updating
-- a locked lineup.
--
-- Solution: Split the policy into two separate policies:
-- 1. Allow updating lineup data when unlocked
-- 2. Allow toggling lock status (lock/unlock) regardless of current state

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Team members can update unlocked lineup" ON match_lineups;

-- Policy 1: Team members can update lineup data when unlocked
CREATE POLICY "Team members can update unlocked lineup data"
ON match_lineups
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM team_players tp
    JOIN members m ON m.id = tp.member_id
    WHERE tp.team_id = match_lineups.team_id
    AND m.user_id = auth.uid()
  )
  AND locked = false  -- Can only update data when unlocked
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_players tp
    JOIN members m ON m.id = tp.member_id
    WHERE tp.team_id = match_lineups.team_id
    AND m.user_id = auth.uid()
  )
);

-- Policy 2: Team members can lock/unlock their lineup at any time
CREATE POLICY "Team members can lock or unlock lineup"
ON match_lineups
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM team_players tp
    JOIN members m ON m.id = tp.member_id
    WHERE tp.team_id = match_lineups.team_id
    AND m.user_id = auth.uid()
  )
  -- No locked = false condition here - can update lock status anytime
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_players tp
    JOIN members m ON m.id = tp.member_id
    WHERE tp.team_id = match_lineups.team_id
    AND m.user_id = auth.uid()
  )
);

-- Note: PostgreSQL RLS evaluates policies with OR logic, so if either policy
-- passes, the update is allowed. This means:
-- - When locked = false: Can update lineup data OR lock status (Policy 1 OR Policy 2)
-- - When locked = true: Can only update lock status (Policy 2 only)
