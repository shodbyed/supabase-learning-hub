-- Migration: Get Operator Player Stats
-- Purpose: Returns player counts for an operator's organization
--          Used in PlayerManagement page to show breakdown of players
--
-- Returns:
--   total_players: All unique members ever on teams in this org
--   active_players: Members on teams in active/upcoming seasons
--   placeholders: Members with user_id IS NULL (unregistered)
--   identified_placeholders: Placeholders with email (can be invited)

CREATE OR REPLACE FUNCTION get_operator_player_stats(p_org_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_players INT;
  v_active_players INT;
  v_placeholders INT;
  v_identified_placeholders INT;
BEGIN
  -- Total players: All unique members ever on teams in this org
  SELECT COUNT(DISTINCT tp.member_id)
  INTO v_total_players
  FROM team_players tp
  JOIN teams t ON t.id = tp.team_id
  JOIN seasons s ON s.id = t.season_id
  JOIN leagues l ON l.id = s.league_id
  WHERE l.organization_id = p_org_id;

  -- Active players: Members on teams in active/upcoming seasons
  SELECT COUNT(DISTINCT tp.member_id)
  INTO v_active_players
  FROM team_players tp
  JOIN teams t ON t.id = tp.team_id
  JOIN seasons s ON s.id = t.season_id
  JOIN leagues l ON l.id = s.league_id
  WHERE l.organization_id = p_org_id
    AND s.status IN ('active', 'upcoming');

  -- Placeholders: Members with no user_id on teams in this org
  SELECT COUNT(DISTINCT tp.member_id)
  INTO v_placeholders
  FROM team_players tp
  JOIN teams t ON t.id = tp.team_id
  JOIN seasons s ON s.id = t.season_id
  JOIN leagues l ON l.id = s.league_id
  JOIN members m ON m.id = tp.member_id
  WHERE l.organization_id = p_org_id
    AND m.user_id IS NULL;

  -- Identified placeholders: Placeholders with email
  SELECT COUNT(DISTINCT tp.member_id)
  INTO v_identified_placeholders
  FROM team_players tp
  JOIN teams t ON t.id = tp.team_id
  JOIN seasons s ON s.id = t.season_id
  JOIN leagues l ON l.id = s.league_id
  JOIN members m ON m.id = tp.member_id
  WHERE l.organization_id = p_org_id
    AND m.user_id IS NULL
    AND m.email IS NOT NULL;

  RETURN json_build_object(
    'total_players', v_total_players,
    'active_players', v_active_players,
    'placeholders', v_placeholders,
    'identified_placeholders', v_identified_placeholders
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_operator_player_stats(UUID) TO authenticated;

COMMENT ON FUNCTION get_operator_player_stats IS
'Returns player statistics for an operator''s organization.
Used in PlayerManagement page to display:
- Total players (all-time)
- Active players (current seasons)
- Placeholders (unregistered members)
- Identified placeholders (PPs with email)';
