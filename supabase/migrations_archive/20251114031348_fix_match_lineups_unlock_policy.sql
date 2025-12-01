/**
 * @fileoverview Fix match_lineups UPDATE policy to allow unlocking
 *
 * PROBLEM: The current UPDATE policy has `locked = false` in the USING clause,
 * which prevents users from unlocking lineups because USING checks the CURRENT
 * state of the row (locked = true), not the desired state.
 *
 * SOLUTION: Remove the locked check from USING (which controls WHO can update)
 * and only keep it in WITH CHECK (which controls WHAT can be updated to).
 * We want team members to be able to update their lineup regardless of current
 * lock status, but we don't want to impose restrictions on what locked value
 * they can set (they need to be able to toggle it).
 */

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Team members can update unlocked lineup" ON match_lineups;

-- Create new policy that allows team members to update their lineup
-- regardless of lock status
CREATE POLICY "Team members can update their lineup"
  ON match_lineups
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_players tp
      JOIN members m ON m.id = tp.member_id
      WHERE tp.team_id = match_lineups.team_id
        AND m.user_id = auth.uid()
    )
    -- Removed: AND locked = false
    -- Team members can update their lineup whether it's locked or unlocked
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_players tp
      JOIN members m ON m.id = tp.member_id
      WHERE tp.team_id = match_lineups.team_id
        AND m.user_id = auth.uid()
    )
    -- No restrictions on what they can update to
    -- This allows toggling locked status and updating player selections
  );
