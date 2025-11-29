/**
 * Migration: Update get_operator_stats function to use organization_id
 *
 * This updates the RPC function to use organization_id instead of operator_id
 * after the column rename migration.
 *
 * Run after: rename_operator_id_to_organization_id.sql
 */

-- Drop the old function
DROP FUNCTION IF EXISTS public.get_operator_stats(uuid);

-- Recreate with updated column references
CREATE OR REPLACE FUNCTION public.get_operator_stats(operator_id_param uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  league_count INT;
  team_count INT;
  player_count INT;
  venue_count INT;
  season_count INT;
  match_count INT;
  game_count INT;
BEGIN
  -- Count all leagues (matches original query - no is_active filter)
  SELECT COUNT(*)
  INTO league_count
  FROM leagues
  WHERE organization_id = operator_id_param;

  -- Count teams across all leagues/seasons
  SELECT COUNT(*)
  INTO team_count
  FROM teams t
  INNER JOIN seasons s ON t.season_id = s.id
  INNER JOIN leagues l ON s.league_id = l.id
  WHERE l.organization_id = operator_id_param;

  -- Count players across all teams
  SELECT COUNT(*)
  INTO player_count
  FROM team_players tp
  INNER JOIN teams t ON tp.team_id = t.id
  INNER JOIN seasons s ON t.season_id = s.id
  INNER JOIN leagues l ON s.league_id = l.id
  WHERE l.organization_id = operator_id_param;

  -- Count active venues
  SELECT COUNT(*)
  INTO venue_count
  FROM venues
  WHERE created_by_organization_id = operator_id_param
    AND is_active = true;

  -- Count completed seasons
  SELECT COUNT(*)
  INTO season_count
  FROM seasons s
  INNER JOIN leagues l ON s.league_id = l.id
  WHERE l.organization_id = operator_id_param
    AND s.status = 'completed';

  -- Count completed matches
  SELECT COUNT(*)
  INTO match_count
  FROM matches m
  INNER JOIN seasons s ON m.season_id = s.id
  INNER JOIN leagues l ON s.league_id = l.id
  WHERE l.organization_id = operator_id_param
    AND m.status = 'completed';

  -- Count total games played (with winner determined)
  SELECT COUNT(*)
  INTO game_count
  FROM match_games mg
  INNER JOIN matches m ON mg.match_id = m.id
  INNER JOIN seasons s ON m.season_id = s.id
  INNER JOIN leagues l ON s.league_id = l.id
  WHERE l.organization_id = operator_id_param
    AND mg.winner_player_id IS NOT NULL;

  -- Return all counts as JSON
  RETURN json_build_object(
    'leagues', league_count,
    'teams', team_count,
    'players', player_count,
    'venues', venue_count,
    'seasons_completed', season_count,
    'matches_completed', match_count,
    'games_played', game_count
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_operator_stats(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_operator_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_operator_stats(uuid) TO service_role;
