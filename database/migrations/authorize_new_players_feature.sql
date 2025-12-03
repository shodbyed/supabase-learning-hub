-- Migration: Authorize New Players Feature
-- Created: 2025-12-02
-- Branch: authorize-new-player
--
-- Purpose: Adds infrastructure for player authorization workflow
--
-- Overview:
-- - Changes starting_handicap defaults from 0/40 to NULL
-- - NULL values indicate "unauthorized" players who need operator review
-- - Adds organization/league preference to require authorization
-- - Existing players with default values (0/40) are set to NULL
--
-- Business Context:
-- - Unauthorized Player: starting_handicap_3v3 AND starting_handicap_5v5 are both NULL
-- - Authorized Player: Has had starting handicaps explicitly set by an operator
-- - Established Player: 15+ games, can be auto-authorized with calculated handicaps
-- - When allow_unauthorized_players = FALSE: Only authorized/established players can be in lineups

-- ============================================================================
-- PART 1: Members Table - Change defaults to NULL
-- ============================================================================

-- Change starting_handicap_3v3 default from 0 to NULL
ALTER TABLE members ALTER COLUMN starting_handicap_3v3 DROP DEFAULT;
ALTER TABLE members ALTER COLUMN starting_handicap_3v3 SET DEFAULT NULL;

-- Change starting_handicap_5v5 default from 40 to NULL
ALTER TABLE members ALTER COLUMN starting_handicap_5v5 DROP DEFAULT;
ALTER TABLE members ALTER COLUMN starting_handicap_5v5 SET DEFAULT NULL;

-- Set existing players with default values to NULL (puts them in authorization queue)
-- Only affects players who still have the original default values
UPDATE members
SET starting_handicap_3v3 = NULL, starting_handicap_5v5 = NULL
WHERE starting_handicap_3v3 = 0 AND starting_handicap_5v5 = 40;

-- Add comments explaining the NULL semantics
COMMENT ON COLUMN members.starting_handicap_3v3 IS
'Starting handicap for 3v3/5-man format (-2 to +2). NULL = unauthorized (needs operator review). Used when player has < 15 games.';

COMMENT ON COLUMN members.starting_handicap_5v5 IS
'Starting handicap for 5v5/8-man format (0-100%). NULL = unauthorized (needs operator review). Used when player has < 15 games.';

-- ============================================================================
-- PART 2: Preferences Table - Add authorization control column
-- ============================================================================

-- Add column for controlling whether unauthorized players can be added to lineups
ALTER TABLE preferences
ADD COLUMN IF NOT EXISTS allow_unauthorized_players BOOLEAN;

-- Add comment explaining the column
COMMENT ON COLUMN preferences.allow_unauthorized_players IS
'Whether unauthorized players (NULL starting handicaps) can be used in lineups. NULL = system default (true). Set to false to require all players be authorized before playing.';

-- ============================================================================
-- PART 3: Update resolved_league_preferences view
-- ============================================================================

-- Recreate view to include the new column with fallback chain
CREATE OR REPLACE VIEW resolved_league_preferences AS
SELECT
  l.id as league_id,
  l.organization_id,

  -- Handicap settings with fallback chain: league → org → system default
  COALESCE(league_prefs.handicap_variant, org_prefs.handicap_variant, l.handicap_variant, 'standard') as handicap_variant,
  COALESCE(league_prefs.team_handicap_variant, org_prefs.team_handicap_variant, org_prefs.handicap_variant, l.handicap_variant, 'standard') as team_handicap_variant,
  COALESCE(league_prefs.game_history_limit, org_prefs.game_history_limit, 200) as game_history_limit,

  -- Format settings
  COALESCE(league_prefs.team_format, org_prefs.team_format, l.team_format) as team_format,

  -- Match rules
  COALESCE(league_prefs.golden_break_counts_as_win, org_prefs.golden_break_counts_as_win, l.golden_break_counts_as_win, true) as golden_break_counts_as_win,

  -- Player authorization (fallback: league → org → true)
  COALESCE(league_prefs.allow_unauthorized_players, org_prefs.allow_unauthorized_players, true) as allow_unauthorized_players

FROM leagues l
LEFT JOIN preferences org_prefs
  ON org_prefs.entity_type = 'organization'
  AND org_prefs.entity_id = l.organization_id
LEFT JOIN preferences league_prefs
  ON league_prefs.entity_type = 'league'
  AND league_prefs.entity_id = l.id;

COMMENT ON VIEW resolved_league_preferences IS 'Convenience view showing final resolved preferences for each league with full fallback chain applied.';
