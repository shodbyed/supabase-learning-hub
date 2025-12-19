-- Migration: Get Operator Placeholder Players
-- Purpose: Returns all placeholder players for an operator's organization
--          Used in PlayerManagement page to show/manage PPs
--
-- Returns array of objects:
--   member_id: UUID of the placeholder member
--   first_name, last_name: Name of the placeholder
--   email: Email if set (for ID'd placeholders)
--   team_id: Current team they're on
--   team_name: Name of the team
--   season_name: Season the team is in
--   league_name: League the team belongs to
--   is_captain: Whether they are the team captain

CREATE OR REPLACE FUNCTION get_operator_placeholders(p_org_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(
      json_build_object(
        'member_id', tp.member_id,
        'first_name', m.first_name,
        'last_name', m.last_name,
        'email', m.email,
        'team_id', t.id,
        'team_name', t.name,
        'season_id', s.id,
        'season_name', s.season_name,
        'league_id', l.id,
        'league_name', l.name,
        'is_captain', tp.is_captain
      ) ORDER BY l.name, s.season_name, t.name, m.last_name, m.first_name
    ), '[]'::json)
    FROM team_players tp
    JOIN members m ON m.id = tp.member_id
    JOIN teams t ON t.id = tp.team_id
    JOIN seasons s ON s.id = t.season_id
    JOIN leagues l ON l.id = s.league_id
    WHERE l.organization_id = p_org_id
      AND m.user_id IS NULL  -- Only placeholder players
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_operator_placeholders(UUID) TO authenticated;

COMMENT ON FUNCTION get_operator_placeholders IS
'Returns all placeholder players for an operator''s organization.
Used in PlayerManagement page to display and manage PPs.
Returns member info, team context, and email status for each PP.';
