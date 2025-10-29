/**
 * @fileoverview Add handicap variants to leagues table
 *
 * PLAYER HANDICAP VARIANT:
 * Determines what player handicap values are allowed:
 * - 'standard': -2, -1, 0, 1, 2 (full range)
 * - 'reduced': -1, 0, 1 (limited range)
 * - 'none': All handicaps are 0 (no handicapping)
 *
 * TEAM HANDICAP VARIANT:
 * Determines team bonus handicap based on standings position (home team only):
 * - 'standard': +1 handicap for every 2 wins ahead in standings
 * - 'reduced': +1 handicap for every 3 wins ahead in standings
 * - 'none': No team handicap bonus
 *
 * Formula: Team handicap = (home_wins - away_wins) / threshold
 * Then divide by threshold (2 for standard, 3 for reduced) and round down
 *
 * Examples for standard (every 2 wins ahead):
 * - Home 8 wins vs Away 7 wins: (8 - 7) = 1 → 1/2 = 0 bonus
 * - Home 8 wins vs Away 6 wins: (8 - 6) = 2 → 2/2 = +1 bonus
 * - Home 8 wins vs Away 3 wins: (8 - 3) = 5 → 5/2 = +2 bonus
 * - Home 6 wins vs Away 10 wins: (6 - 10) = -4 → -4/2 = -2 penalty
 *
 * These are league-level settings that should remain constant across all seasons.
 * Changing either variant would effectively be a different league.
 *
 * Usage:
 * - Set during league creation wizard
 * - Cannot be changed after league is created
 * - All seasons in the league inherit these variants
 * - UI elements (handicap dropdowns, calculations) respect these settings
 *
 * Note: The match_lineups table does NOT need changes - it stores handicap values
 * as numbers regardless of variant. The variants are enforced at the calculation level.
 */

-- Add handicap_variant column to leagues table
ALTER TABLE leagues
ADD COLUMN IF NOT EXISTS handicap_variant TEXT DEFAULT 'standard' NOT NULL
CHECK (handicap_variant IN ('standard', 'reduced', 'none'));

-- Add team_handicap_variant column to leagues table
ALTER TABLE leagues
ADD COLUMN IF NOT EXISTS team_handicap_variant TEXT DEFAULT 'standard' NOT NULL
CHECK (team_handicap_variant IN ('standard', 'reduced', 'none'));

-- Add comments for documentation
COMMENT ON COLUMN leagues.handicap_variant IS
  'Determines player handicap range: standard (-2 to +2), reduced (-1 to +1), or none (all 0)';

COMMENT ON COLUMN leagues.team_handicap_variant IS
  'Determines team bonus handicap: standard (every 2 ahead), reduced (every 3 ahead), or none (no bonus)';
