-- Migration: Enhanced Placeholder Player Search
-- Purpose: Expand search_placeholder_matches to support additional verification fields
--          for the /register-existing page confidence-based matching
--
-- New fields supported:
-- - Operator info (first_name, last_name, player_number)
-- - Captain info (first_name, last_name, player_number)
-- - User's system info (first_name, last_name, player_number, nickname)
-- - Team/Location (team_name, play_night/day_of_week, city, state)
-- - Security: last opponent name OR "hasn't played yet" flag
--
-- Grading system:
-- - Grade A (6+ matches): High confidence - auto-merge allowed
-- - Grade B (4-5 matches): Medium confidence - LO review required
-- - Grade C (<4 matches): Low confidence - no match found

-- ============================================================================
-- DROP OLD FUNCTION (will be replaced)
-- ============================================================================
DROP FUNCTION IF EXISTS search_placeholder_matches(TEXT, TEXT, TEXT, TEXT, INT, NUMERIC);

-- ============================================================================
-- NEW FUNCTION: search_placeholder_matches_v2
-- ============================================================================
-- Enhanced version with all verification fields for confidence scoring
-- Each matching field adds 1 point to the score

CREATE OR REPLACE FUNCTION search_placeholder_matches_v2(
  -- League Operator info (optional)
  p_operator_first_name TEXT DEFAULT NULL,
  p_operator_last_name TEXT DEFAULT NULL,
  p_operator_player_number INT DEFAULT NULL,

  -- Captain info (optional)
  p_captain_first_name TEXT DEFAULT NULL,
  p_captain_last_name TEXT DEFAULT NULL,
  p_captain_player_number INT DEFAULT NULL,

  -- User's system info (optional)
  p_system_first_name TEXT DEFAULT NULL,
  p_system_last_name TEXT DEFAULT NULL,
  p_system_player_number INT DEFAULT NULL,
  p_system_nickname TEXT DEFAULT NULL,

  -- Team/Location info (optional)
  p_team_name TEXT DEFAULT NULL,
  p_play_night TEXT DEFAULT NULL,  -- Day of week (Monday, Tuesday, etc.)
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,

  -- Last opponent (security verification)
  p_last_opponent_first_name TEXT DEFAULT NULL,
  p_last_opponent_last_name TEXT DEFAULT NULL,
  p_has_not_played_yet BOOLEAN DEFAULT NULL,

  -- Search parameters
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  member_id UUID,
  first_name TEXT,
  last_name TEXT,
  nickname TEXT,
  city TEXT,
  state TEXT,
  system_player_number INT,
  team_name TEXT,
  captain_name TEXT,
  operator_name TEXT,
  total_score INT,
  matched_fields TEXT[],
  grade CHAR(1)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  min_fields_provided INT := 0;
BEGIN
  -- Count how many search fields were provided
  -- We need at least some fields to search
  IF p_operator_first_name IS NOT NULL THEN min_fields_provided := min_fields_provided + 1; END IF;
  IF p_operator_last_name IS NOT NULL THEN min_fields_provided := min_fields_provided + 1; END IF;
  IF p_operator_player_number IS NOT NULL THEN min_fields_provided := min_fields_provided + 1; END IF;
  IF p_captain_first_name IS NOT NULL THEN min_fields_provided := min_fields_provided + 1; END IF;
  IF p_captain_last_name IS NOT NULL THEN min_fields_provided := min_fields_provided + 1; END IF;
  IF p_captain_player_number IS NOT NULL THEN min_fields_provided := min_fields_provided + 1; END IF;
  IF p_system_first_name IS NOT NULL THEN min_fields_provided := min_fields_provided + 1; END IF;
  IF p_system_last_name IS NOT NULL THEN min_fields_provided := min_fields_provided + 1; END IF;
  IF p_system_player_number IS NOT NULL THEN min_fields_provided := min_fields_provided + 1; END IF;
  IF p_system_nickname IS NOT NULL THEN min_fields_provided := min_fields_provided + 1; END IF;
  IF p_team_name IS NOT NULL THEN min_fields_provided := min_fields_provided + 1; END IF;
  IF p_play_night IS NOT NULL THEN min_fields_provided := min_fields_provided + 1; END IF;
  IF p_city IS NOT NULL THEN min_fields_provided := min_fields_provided + 1; END IF;
  IF p_state IS NOT NULL THEN min_fields_provided := min_fields_provided + 1; END IF;
  IF p_last_opponent_first_name IS NOT NULL THEN min_fields_provided := min_fields_provided + 1; END IF;
  IF p_last_opponent_last_name IS NOT NULL THEN min_fields_provided := min_fields_provided + 1; END IF;
  IF p_has_not_played_yet = TRUE THEN min_fields_provided := min_fields_provided + 1; END IF;

  -- Require at least 4 fields
  IF min_fields_provided < 4 THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH
  -- Get team context for each placeholder player
  pp_teams AS (
    SELECT
      tp.member_id,
      t.team_name,
      t.captain_id,
      l.day_of_week,
      l.organization_id
    FROM team_players tp
    JOIN teams t ON t.id = tp.team_id
    JOIN seasons s ON s.id = t.season_id
    JOIN leagues l ON l.id = s.league_id
    WHERE tp.member_id IN (SELECT id FROM members WHERE user_id IS NULL)
  ),

  -- Get captain names
  captains AS (
    SELECT
      pt.member_id AS pp_member_id,
      m.first_name AS captain_first_name,
      m.last_name AS captain_last_name,
      m.system_player_number AS captain_player_number
    FROM pp_teams pt
    JOIN members m ON m.id = pt.captain_id
  ),

  -- Get operator names (organization staff)
  operators AS (
    SELECT DISTINCT ON (pt.member_id)
      pt.member_id AS pp_member_id,
      m.first_name AS operator_first_name,
      m.last_name AS operator_last_name,
      m.system_player_number AS operator_player_number
    FROM pp_teams pt
    JOIN organization_staff os ON os.organization_id = pt.organization_id
    JOIN members m ON m.id = os.member_id
    WHERE os.position IN ('owner', 'admin')
    ORDER BY pt.member_id, os.position  -- Prefer owner over admin
  ),

  -- Get last opponent for each PP (most recent game)
  last_opponents AS (
    SELECT DISTINCT ON (pp_id)
      pp_id,
      opponent_first_name,
      opponent_last_name,
      has_played
    FROM (
      -- Games where PP was home player
      SELECT
        mg.home_player_id AS pp_id,
        opp.first_name AS opponent_first_name,
        opp.last_name AS opponent_last_name,
        TRUE AS has_played,
        mg.created_at
      FROM match_games mg
      JOIN members opp ON opp.id = mg.away_player_id
      WHERE mg.home_player_id IN (SELECT id FROM members WHERE user_id IS NULL)
        AND mg.away_player_id IS NOT NULL

      UNION ALL

      -- Games where PP was away player
      SELECT
        mg.away_player_id AS pp_id,
        opp.first_name AS opponent_first_name,
        opp.last_name AS opponent_last_name,
        TRUE AS has_played,
        mg.created_at
      FROM match_games mg
      JOIN members opp ON opp.id = mg.home_player_id
      WHERE mg.away_player_id IN (SELECT id FROM members WHERE user_id IS NULL)
        AND mg.home_player_id IS NOT NULL
    ) games
    ORDER BY pp_id, created_at DESC
  ),

  -- Calculate scores for each PP
  -- Using soundex difference() for name matching: 4=exact, 3=close, 2=maybe, 1=weak, 0=no match
  -- We require difference >= 3 for a "match" on names (catches typos, Mike/Michael, etc.)
  scored_pps AS (
    SELECT
      m.id,
      m.first_name::TEXT AS pp_first_name,
      m.last_name::TEXT AS pp_last_name,
      m.nickname::TEXT AS pp_nickname,
      m.city::TEXT AS pp_city,
      m.state::TEXT AS pp_state,
      m.system_player_number AS pp_system_player_number,
      pt.team_name::TEXT AS pp_team_name,
      COALESCE(c.captain_first_name || ' ' || c.captain_last_name, '')::TEXT AS pp_captain_name,
      COALESCE(op.operator_first_name || ' ' || op.operator_last_name, '')::TEXT AS pp_operator_name,

      -- Track if user's own name matches (fuzzy) - REQUIRED for Grade A
      (p_system_first_name IS NOT NULL AND difference(m.first_name, p_system_first_name) >= 3) AS pp_first_name_matches,
      (p_system_last_name IS NOT NULL AND difference(m.last_name, p_system_last_name) >= 3) AS pp_last_name_matches,

      -- Calculate score (1 point per matching field)
      -- All name fields use fuzzy matching (soundex difference >= 3)
      (
        -- System info matches (user's own info - most important)
        CASE WHEN p_system_first_name IS NOT NULL AND difference(m.first_name, p_system_first_name) >= 3 THEN 1 ELSE 0 END +
        CASE WHEN p_system_last_name IS NOT NULL AND difference(m.last_name, p_system_last_name) >= 3 THEN 1 ELSE 0 END +
        CASE WHEN p_system_player_number IS NOT NULL AND m.system_player_number = p_system_player_number THEN 1 ELSE 0 END +
        CASE WHEN p_system_nickname IS NOT NULL AND difference(m.nickname, p_system_nickname) >= 3 THEN 1 ELSE 0 END +

        -- Location matches (exact for city/state - common values)
        CASE WHEN p_city IS NOT NULL AND LOWER(m.city) = LOWER(p_city) THEN 1 ELSE 0 END +
        CASE WHEN p_state IS NOT NULL AND UPPER(m.state) = UPPER(p_state) THEN 1 ELSE 0 END +

        -- Team matches (exact for team name, fuzzy might cause false positives)
        CASE WHEN p_team_name IS NOT NULL AND LOWER(pt.team_name) = LOWER(p_team_name) THEN 1 ELSE 0 END +
        CASE WHEN p_play_night IS NOT NULL AND LOWER(pt.day_of_week) = LOWER(p_play_night) THEN 1 ELSE 0 END +

        -- Captain matches (fuzzy for names)
        CASE WHEN p_captain_first_name IS NOT NULL AND difference(c.captain_first_name, p_captain_first_name) >= 3 THEN 1 ELSE 0 END +
        CASE WHEN p_captain_last_name IS NOT NULL AND difference(c.captain_last_name, p_captain_last_name) >= 3 THEN 1 ELSE 0 END +
        CASE WHEN p_captain_player_number IS NOT NULL AND c.captain_player_number = p_captain_player_number THEN 1 ELSE 0 END +

        -- Operator matches (fuzzy for names)
        CASE WHEN p_operator_first_name IS NOT NULL AND difference(op.operator_first_name, p_operator_first_name) >= 3 THEN 1 ELSE 0 END +
        CASE WHEN p_operator_last_name IS NOT NULL AND difference(op.operator_last_name, p_operator_last_name) >= 3 THEN 1 ELSE 0 END +
        CASE WHEN p_operator_player_number IS NOT NULL AND op.operator_player_number = p_operator_player_number THEN 1 ELSE 0 END +

        -- Last opponent matches (fuzzy for names)
        CASE WHEN p_has_not_played_yet = TRUE AND lo.has_played IS NULL THEN 1 ELSE 0 END +
        CASE WHEN p_last_opponent_first_name IS NOT NULL AND difference(lo.opponent_first_name, p_last_opponent_first_name) >= 3 THEN 1 ELSE 0 END +
        CASE WHEN p_last_opponent_last_name IS NOT NULL AND difference(lo.opponent_last_name, p_last_opponent_last_name) >= 3 THEN 1 ELSE 0 END
      ) AS pp_total_score,

      -- Build array of matched fields for display (using same fuzzy logic)
      ARRAY_REMOVE(ARRAY[
        CASE WHEN p_system_first_name IS NOT NULL AND difference(m.first_name, p_system_first_name) >= 3 THEN 'firstName' END,
        CASE WHEN p_system_last_name IS NOT NULL AND difference(m.last_name, p_system_last_name) >= 3 THEN 'lastName' END,
        CASE WHEN p_system_player_number IS NOT NULL AND m.system_player_number = p_system_player_number THEN 'playerNumber' END,
        CASE WHEN p_system_nickname IS NOT NULL AND difference(m.nickname, p_system_nickname) >= 3 THEN 'nickname' END,
        CASE WHEN p_city IS NOT NULL AND LOWER(m.city) = LOWER(p_city) THEN 'city' END,
        CASE WHEN p_state IS NOT NULL AND UPPER(m.state) = UPPER(p_state) THEN 'state' END,
        CASE WHEN p_team_name IS NOT NULL AND LOWER(pt.team_name) = LOWER(p_team_name) THEN 'teamName' END,
        CASE WHEN p_play_night IS NOT NULL AND LOWER(pt.day_of_week) = LOWER(p_play_night) THEN 'playNight' END,
        CASE WHEN p_captain_first_name IS NOT NULL AND difference(c.captain_first_name, p_captain_first_name) >= 3 THEN 'captainFirstName' END,
        CASE WHEN p_captain_last_name IS NOT NULL AND difference(c.captain_last_name, p_captain_last_name) >= 3 THEN 'captainLastName' END,
        CASE WHEN p_captain_player_number IS NOT NULL AND c.captain_player_number = p_captain_player_number THEN 'captainPlayerNumber' END,
        CASE WHEN p_operator_first_name IS NOT NULL AND difference(op.operator_first_name, p_operator_first_name) >= 3 THEN 'operatorFirstName' END,
        CASE WHEN p_operator_last_name IS NOT NULL AND difference(op.operator_last_name, p_operator_last_name) >= 3 THEN 'operatorLastName' END,
        CASE WHEN p_operator_player_number IS NOT NULL AND op.operator_player_number = p_operator_player_number THEN 'operatorPlayerNumber' END,
        CASE WHEN p_has_not_played_yet = TRUE AND lo.has_played IS NULL THEN 'hasNotPlayedYet' END,
        CASE WHEN p_last_opponent_first_name IS NOT NULL AND difference(lo.opponent_first_name, p_last_opponent_first_name) >= 3 THEN 'opponentFirstName' END,
        CASE WHEN p_last_opponent_last_name IS NOT NULL AND difference(lo.opponent_last_name, p_last_opponent_last_name) >= 3 THEN 'opponentLastName' END
      ], NULL) AS pp_matched_fields

    FROM members m
    LEFT JOIN pp_teams pt ON pt.member_id = m.id
    LEFT JOIN captains c ON c.pp_member_id = m.id
    LEFT JOIN operators op ON op.pp_member_id = m.id
    LEFT JOIN last_opponents lo ON lo.pp_id = m.id
    WHERE m.user_id IS NULL  -- Only placeholder players
  ),

  -- Deduplicate by member_id, keeping the row with highest score
  -- (A player on multiple teams would otherwise appear multiple times)
  deduplicated AS (
    SELECT DISTINCT ON (id)
      id,
      pp_first_name,
      pp_last_name,
      pp_nickname,
      pp_city,
      pp_state,
      pp_system_player_number,
      pp_team_name,
      pp_captain_name,
      pp_operator_name,
      pp_first_name_matches,
      pp_last_name_matches,
      pp_total_score,
      pp_matched_fields
    FROM scored_pps
    WHERE pp_total_score > 0  -- Only candidates with at least some match
    ORDER BY id, pp_total_score DESC
  )

  SELECT
    dd.id AS member_id,
    dd.pp_first_name AS first_name,
    dd.pp_last_name AS last_name,
    dd.pp_nickname AS nickname,
    dd.pp_city AS city,
    dd.pp_state AS state,
    dd.pp_system_player_number AS system_player_number,
    dd.pp_team_name AS team_name,
    dd.pp_captain_name AS captain_name,
    dd.pp_operator_name AS operator_name,
    dd.pp_total_score AS total_score,
    dd.pp_matched_fields AS matched_fields,
    -- Grade based on score AND name match requirement
    -- Grade A REQUIRES both first AND last name to match (fuzzy)
    -- If names provided but don't match, cap at Grade B regardless of other matches
    CASE
      WHEN dd.pp_total_score >= 6
           AND (p_system_first_name IS NULL OR dd.pp_first_name_matches)
           AND (p_system_last_name IS NULL OR dd.pp_last_name_matches)
      THEN 'A'
      WHEN dd.pp_total_score >= 4 THEN 'B'
      ELSE 'C'
    END::CHAR(1) AS grade
  FROM deduplicated dd
  ORDER BY dd.pp_total_score DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION search_placeholder_matches_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION search_placeholder_matches_v2 TO anon;

-- ============================================================================
-- BACKWARD COMPATIBILITY: Recreate original function
-- ============================================================================
-- Recreate the original simpler function for any code that uses it

CREATE OR REPLACE FUNCTION search_placeholder_matches(
  p_first_name TEXT,
  p_last_name TEXT,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_limit INT DEFAULT 5,
  p_min_score NUMERIC DEFAULT 5.0
)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  nickname TEXT,
  city TEXT,
  state TEXT,
  system_player_number INT,
  first_name_score INT,
  last_name_score INT,
  city_score NUMERIC,
  state_match BOOLEAN,
  total_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.first_name,
    m.last_name,
    m.nickname,
    m.city,
    m.state,
    m.system_player_number,
    difference(m.first_name, p_first_name) AS first_name_score,
    difference(m.last_name, p_last_name) AS last_name_score,
    CASE
      WHEN p_city IS NOT NULL AND m.city IS NOT NULL
      THEN similarity(LOWER(m.city), LOWER(p_city)) * 2
      ELSE 0
    END AS city_score,
    CASE
      WHEN p_state IS NOT NULL AND UPPER(m.state) = UPPER(p_state)
      THEN TRUE
      ELSE FALSE
    END AS state_match,
    (
      difference(m.first_name, p_first_name) +
      difference(m.last_name, p_last_name) +
      CASE
        WHEN p_city IS NOT NULL AND m.city IS NOT NULL
        THEN similarity(LOWER(m.city), LOWER(p_city)) * 2
        ELSE 0
      END +
      CASE
        WHEN p_state IS NOT NULL AND UPPER(m.state) = UPPER(p_state)
        THEN 2
        ELSE 0
      END
    )::NUMERIC AS total_score
  FROM members m
  WHERE
    m.user_id IS NULL
    AND (
      difference(m.first_name, p_first_name) >= 2
      OR difference(m.last_name, p_last_name) >= 2
    )
  HAVING
    (
      difference(m.first_name, p_first_name) +
      difference(m.last_name, p_last_name) +
      CASE
        WHEN p_city IS NOT NULL AND m.city IS NOT NULL
        THEN similarity(LOWER(m.city), LOWER(p_city)) * 2
        ELSE 0
      END +
      CASE
        WHEN p_state IS NOT NULL AND UPPER(m.state) = UPPER(p_state)
        THEN 2
        ELSE 0
      END
    ) >= p_min_score
  ORDER BY total_score DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION search_placeholder_matches TO authenticated;
GRANT EXECUTE ON FUNCTION search_placeholder_matches TO anon;

-- ============================================================================
-- FUNCTION: get_team_verification_options
-- ============================================================================
-- Returns team names for a Grade B verification challenge.
-- Given a member_id, returns their actual teams plus random decoy teams.
-- Used to verify the user knows which team(s) they're on.

CREATE OR REPLACE FUNCTION get_team_verification_options(
  p_member_id UUID,
  p_decoy_count INT DEFAULT 3
)
RETURNS TABLE (
  team_name TEXT,
  is_correct BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  correct_teams TEXT[];
BEGIN
  -- First get the member's actual team names (deduplicated)
  SELECT array_agg(DISTINCT t.team_name::TEXT)
  INTO correct_teams
  FROM team_players tp
  JOIN teams t ON t.id = tp.team_id
  WHERE tp.member_id = p_member_id;

  -- Return correct teams (one entry per unique team name)
  RETURN QUERY
  SELECT
    unnest(correct_teams) AS team_name,
    TRUE AS is_correct;

  -- Return random decoy teams (names not in correct_teams)
  RETURN QUERY
  SELECT DISTINCT ON (t.team_name)
    t.team_name::TEXT AS team_name,
    FALSE AS is_correct
  FROM teams t
  WHERE t.team_name::TEXT != ALL(COALESCE(correct_teams, ARRAY[]::TEXT[]))
  ORDER BY t.team_name, random()
  LIMIT p_decoy_count;
END;
$$;

GRANT EXECUTE ON FUNCTION get_team_verification_options TO authenticated;
GRANT EXECUTE ON FUNCTION get_team_verification_options TO anon;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION search_placeholder_matches_v2 IS
'Enhanced placeholder player search with full verification fields.
Supports matching on: operator info, captain info, user system info,
team/location, and last opponent. Returns candidates with grade (A/B/C)
based on confidence score.';

COMMENT ON FUNCTION get_team_verification_options IS
'Returns team options for Grade B verification challenge.
Shows the member''s actual teams plus random decoy teams.
User must identify their correct team to pass verification.';
