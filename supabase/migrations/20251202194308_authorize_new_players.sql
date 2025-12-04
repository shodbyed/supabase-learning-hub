-- Migration: Authorize New Players Feature + Preferences Enhancement
-- Description: Adds support for tracking player authorization status via starting handicaps
--              and moves profanity filter to preferences table for cascading behavior
--
-- Changes:
-- 1. Members table: Change starting_handicap defaults from 0/40 to NULL
-- 2. Members table: Set existing default values to NULL (puts players in authorization queue)
-- 3. Preferences table: Add allow_unauthorized_players column
-- 4. Preferences table: Add profanity_filter_enabled column (cascading: league → org → system default)

-- =============================================================================
-- MEMBERS TABLE: Change starting handicap defaults to NULL
-- =============================================================================
-- This allows us to distinguish between:
-- - NULL = "not yet reviewed/authorized by operator"
-- - 0/40 (or any value) = "intentionally set by operator"

-- Change default for starting_handicap_3v3 from 0 to NULL
ALTER TABLE members
ALTER COLUMN starting_handicap_3v3 DROP DEFAULT;

ALTER TABLE members
ALTER COLUMN starting_handicap_3v3 SET DEFAULT NULL;

-- Change default for starting_handicap_5v5 from 40 to NULL
ALTER TABLE members
ALTER COLUMN starting_handicap_5v5 DROP DEFAULT;

ALTER TABLE members
ALTER COLUMN starting_handicap_5v5 SET DEFAULT NULL;

-- Update column comments to reflect new behavior
COMMENT ON COLUMN members.starting_handicap_3v3 IS 'Starting handicap for 3v3 (5_man) format. NULL = not yet authorized. Used when player has < 15 games. Typically ranges from -2 to +2.';

COMMENT ON COLUMN members.starting_handicap_5v5 IS 'Starting handicap for 5v5 (8_man) format. NULL = not yet authorized. Used when player has < 15 games. Typically ranges from 0-100 (percentage).';

-- =============================================================================
-- MEMBERS TABLE: Set existing players with default values to NULL
-- =============================================================================
-- This puts all players who currently have the old default values (0 and 40)
-- into the "needs authorization" queue.
--
-- NOTE: If you want to preserve existing values and NOT require re-authorization,
-- comment out this UPDATE statement.

UPDATE members
SET starting_handicap_3v3 = NULL,
    starting_handicap_5v5 = NULL
WHERE starting_handicap_3v3 = 0
  AND starting_handicap_5v5 = 40;

-- =============================================================================
-- PREFERENCES TABLE: Add allow_unauthorized_players column
-- =============================================================================
-- This setting controls whether unauthorized players can be added to lineups.
-- Cascades: league preference → organization preference → system default (true)

ALTER TABLE preferences
ADD COLUMN allow_unauthorized_players BOOLEAN DEFAULT true;

COMMENT ON COLUMN preferences.allow_unauthorized_players IS 'When false, players must have their starting handicaps set (authorized) before they can be added to match lineups. Cascades: league → organization → system default (true).';

-- =============================================================================
-- PREFERENCES TABLE: Add profanity_filter_enabled column
-- =============================================================================
-- This setting controls whether team names and content are validated for profanity.
-- Cascades: league preference → organization preference → system default (false)
-- Moved from organizations table to preferences for proper cascading behavior.

ALTER TABLE preferences
ADD COLUMN profanity_filter_enabled BOOLEAN DEFAULT NULL;

COMMENT ON COLUMN preferences.profanity_filter_enabled IS 'Whether to enforce profanity validation for team names and content. NULL = use next level default. Cascades: league → organization → system default (false).';

-- =============================================================================
-- UPDATE resolved_league_preferences VIEW
-- =============================================================================
-- Add the new preference columns to the convenience view that handles cascading.
-- This view is the single source of truth for resolved preferences.

CREATE OR REPLACE VIEW "public"."resolved_league_preferences" AS
SELECT
    l.id AS league_id,
    l.organization_id,
    COALESCE(league_prefs.handicap_variant, org_prefs.handicap_variant, l.handicap_variant, 'standard'::text) AS handicap_variant,
    COALESCE(league_prefs.team_handicap_variant, org_prefs.team_handicap_variant, org_prefs.handicap_variant, l.handicap_variant, 'standard'::text) AS team_handicap_variant,
    COALESCE(league_prefs.game_history_limit, org_prefs.game_history_limit, 200) AS game_history_limit,
    COALESCE(league_prefs.team_format, org_prefs.team_format, l.team_format::text) AS team_format,
    COALESCE(league_prefs.golden_break_counts_as_win, org_prefs.golden_break_counts_as_win, l.golden_break_counts_as_win, true) AS golden_break_counts_as_win,
    COALESCE(league_prefs.allow_unauthorized_players, org_prefs.allow_unauthorized_players, true) AS allow_unauthorized_players,
    COALESCE(league_prefs.profanity_filter_enabled, org_prefs.profanity_filter_enabled, false) AS profanity_filter_enabled
FROM leagues l
LEFT JOIN preferences org_prefs ON org_prefs.entity_type = 'organization' AND org_prefs.entity_id = l.organization_id
LEFT JOIN preferences league_prefs ON league_prefs.entity_type = 'league' AND league_prefs.entity_id = l.id;

COMMENT ON VIEW "public"."resolved_league_preferences" IS 'Convenience view showing final resolved preferences for each league with full fallback chain applied.';
