-- Migration: Remove Placeholder Player from Team
-- Purpose: Allows league operators to remove a PP from a team
--          Operators have no restrictions (can remove even if PP has games)
--
-- Cleanup Logic:
--   - If PP has NO email AND is not on any other teams: DELETE member record
--   - If PP HAS email OR is on other teams: Keep member record
--
-- Parameters:
--   p_member_id: UUID of the placeholder member
--   p_team_id: UUID of the team to remove from
--   p_org_id: UUID of the operator's organization (for authorization)
--
-- Returns JSON:
--   success: boolean
--   message: string (success or error description)
--   member_deleted: boolean (whether the member record was deleted)

CREATE OR REPLACE FUNCTION remove_placeholder_from_team(
  p_member_id UUID,
  p_team_id UUID,
  p_org_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member_record RECORD;
  v_team_record RECORD;
  v_is_captain BOOLEAN;
  v_other_teams INT;
  v_member_deleted BOOLEAN := FALSE;
BEGIN
  -- Verify the member exists and is a placeholder (user_id IS NULL)
  SELECT id, first_name, last_name, email, user_id
  INTO v_member_record
  FROM members
  WHERE id = p_member_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Member not found',
      'member_deleted', FALSE
    );
  END IF;

  IF v_member_record.user_id IS NOT NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Cannot remove registered players using this function',
      'member_deleted', FALSE
    );
  END IF;

  -- Verify the team belongs to this operator's organization
  SELECT t.id, t.name
  INTO v_team_record
  FROM teams t
  JOIN seasons s ON s.id = t.season_id
  JOIN leagues l ON l.id = s.league_id
  WHERE t.id = p_team_id
    AND l.organization_id = p_org_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Team not found or not in your organization',
      'member_deleted', FALSE
    );
  END IF;

  -- Check if this PP is the captain
  SELECT tp.is_captain
  INTO v_is_captain
  FROM team_players tp
  WHERE tp.member_id = p_member_id
    AND tp.team_id = p_team_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Player is not on this team',
      'member_deleted', FALSE
    );
  END IF;

  IF v_is_captain THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Cannot remove team captain. Reassign captain first.',
      'member_deleted', FALSE
    );
  END IF;

  -- Remove from team_players
  DELETE FROM team_players
  WHERE member_id = p_member_id
    AND team_id = p_team_id;

  -- Check if PP is on any other teams
  SELECT COUNT(*)
  INTO v_other_teams
  FROM team_players
  WHERE member_id = p_member_id;

  -- Cleanup: Delete member if no email AND not on other teams
  IF v_member_record.email IS NULL AND v_other_teams = 0 THEN
    DELETE FROM members WHERE id = p_member_id;
    v_member_deleted := TRUE;
  END IF;

  RETURN json_build_object(
    'success', TRUE,
    'message', CASE
      WHEN v_member_deleted THEN 'Player removed from team and record deleted'
      ELSE 'Player removed from team'
    END,
    'member_deleted', v_member_deleted
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION remove_placeholder_from_team(UUID, UUID, UUID) TO authenticated;

COMMENT ON FUNCTION remove_placeholder_from_team IS
'Removes a placeholder player from a team. League operators only.
If the PP has no email and is not on other teams, the member record is deleted.
Returns success status and whether the member record was deleted.';
