/**
 * @fileoverview Handicap Calculation Utilities
 *
 * Handles dynamic handicap calculations based on game history and league variant.
 * Handicaps are calculated as: (wins - losses) / weeks_played
 * where weeks_played = games_played / 6
 *
 * Supports multiple handicap variants:
 * - standard: -2, -1, 0, 1, 2
 * - reduced: -1, 0, 1
 * - none: 0
 */

import type { Lineup } from '@/types';
import { logger } from '@/utils/logger';

export type HandicapVariant = 'standard' | 'reduced' | 'none';

/**
 * Configuration for handicap calculation
 */
interface HandicapConfig {
  /** Number of recent games to include in calculation (e.g., 200) */
  gameHistoryLimit: number; // TODO: Make this adjustable at organization level
}

/**
 * Get the valid handicap range for a given variant
 */
function getHandicapRange(variant: HandicapVariant): number[] {
  switch (variant) {
    case 'standard':
      return [-2, -1, 0, 1, 2];
    case 'reduced':
      return [-1, 0, 1];
    case 'none':
      return [0];
    default:
      return [0];
  }
}

/**
 * Round handicap to nearest valid value in the variant's range
 * Currently unused but will be needed when implementing real handicap calculations
 */
function roundToValidHandicap(rawHandicap: number, variant: HandicapVariant): number {
  const range = getHandicapRange(variant);

  // For 'none' variant, always return 0
  if (variant === 'none') return 0;

  // Find the closest value in the range
  return range.reduce((prev, curr) => {
    return Math.abs(curr - rawHandicap) < Math.abs(prev - rawHandicap) ? curr : prev;
  });
}

// Suppress unused warning - this will be used when implementing real calculations
void roundToValidHandicap;

/**
 * Calculate handicap for a player based on their game history
 *
 * NOTE: This is a wrapper for backward compatibility.
 * For new code, import from '@/utils/calculatePlayerHandicap' directly.
 *
 * @param playerId - The player's member ID
 * @param variant - The league's handicap variant ('standard', 'reduced', or 'none')
 * @param config - Optional configuration overrides (currently unused)
 * @returns The calculated handicap value
 *
 * @deprecated Use calculatePlayerHandicap from '@/utils/calculatePlayerHandicap' instead
 * WARNING: This wrapper cannot provide game_type or currentSeasonId - returns 0 for safety.
 * Update calling code to use the new function directly.
 */
export async function calculatePlayerHandicap(
  playerId: string,
  variant: HandicapVariant,
  config: Partial<HandicapConfig> = {}
): Promise<number> {
  // Suppress unused variable warning
  void config;
  void playerId;
  void variant;

  // This wrapper is deprecated and cannot provide required game_type parameter
  // Return 0 to avoid errors - calling code must be updated
  logger.warn(
    'calculatePlayerHandicap wrapper is deprecated. Update to use @/utils/calculatePlayerHandicap directly with game_type parameter.'
  );
  return 0;
}

/**
 * Calculate handicaps for multiple players
 *
 * @param playerIds - Array of player member IDs
 * @param variant - The league's handicap variant
 * @param config - Optional configuration overrides
 * @returns Map of playerId to handicap value
 */
export async function calculatePlayerHandicaps(
  playerIds: string[],
  variant: HandicapVariant,
  config: Partial<HandicapConfig> = {}
): Promise<Map<string, number>> {
  const handicaps = new Map<string, number>();

  // Calculate handicaps for all players
  await Promise.all(
    playerIds.map(async (playerId) => {
      const handicap = await calculatePlayerHandicap(playerId, variant, config);
      handicaps.set(playerId, handicap);
    })
  );

  return handicaps;
}

/**
 * Get available handicap options for a substitute based on variant
 * Used in UI dropdowns for substitute handicap selection
 *
 * @param variant - The league's handicap variant
 * @returns Array of valid handicap values for display
 */
export function getSubstituteHandicapOptions(variant: HandicapVariant): number[] {
  return getHandicapRange(variant);
}

/**
 * Calculate team handicap bonus based on standings position
 *
 * Team handicap is only awarded to the HOME team and is based on the
 * difference in match WINS (not win/loss differential) between the two teams for the season.
 *
 * @param homeTeamId - The home team's ID
 * @param awayTeamId - The away team's ID
 * @param seasonId - The season ID to calculate standings from
 * @param variant - The league's team handicap variant ('standard', 'reduced', or 'none')
 * @returns The team handicap bonus (can be positive, negative, or zero)
 *
 * Formula:
 * 1. Count home team's total match wins in the season
 * 2. Count away team's total match wins in the season
 * 3. Calculate difference: home_wins - away_wins
 * 4. Divide by threshold based on variant:
 *    - standard: every 2 wins ahead = +1 handicap
 *    - reduced: every 3 wins ahead = +1 handicap
 *    - none: always returns 0
 * 5. Round down to get final team handicap
 *
 * Examples (standard variant, every 2 wins ahead):
 * - Home 8 wins vs Away 7 wins: (8 - 7) = 1 → 1/2 = 0 bonus (floor division)
 * - Home 8 wins vs Away 6 wins: (8 - 6) = 2 → 2/2 = +1 bonus
 * - Home 8 wins vs Away 3 wins: (8 - 3) = 5 → 5/2 = +2 bonus
 * - Home 6 wins vs Away 10 wins: (6 - 10) = -4 → -4/2 = -2 penalty
 */
export async function calculateTeamHandicap(
  homeTeamId: string,
  awayTeamId: string,
  seasonId: string,
  variant: HandicapVariant
): Promise<number> {
  // For 'none' variant, always return 0
  if (variant === 'none') {
    return 0;
  }

  // Import supabase dynamically to avoid circular dependency
  const { supabase } = await import('@/supabaseClient');

  // Query completed matches for home team in this season
  const { data: homeMatches, error: homeError } = await supabase
    .from('matches')
    .select('winner_team_id')
    .eq('season_id', seasonId)
    .or(`home_team_id.eq.${homeTeamId},away_team_id.eq.${homeTeamId}`)
    .eq('status', 'completed');

  if (homeError) {
    logger.error('Error fetching home team matches', { error: homeError.message });
    return 0;
  }

  // Count home team wins
  const homeWins = homeMatches?.filter(m => m.winner_team_id === homeTeamId).length || 0;

  // Query completed matches for away team in this season
  const { data: awayMatches, error: awayError } = await supabase
    .from('matches')
    .select('winner_team_id')
    .eq('season_id', seasonId)
    .or(`home_team_id.eq.${awayTeamId},away_team_id.eq.${awayTeamId}`)
    .eq('status', 'completed');

  if (awayError) {
    logger.error('Error fetching away team matches', { error: awayError.message });
    return 0;
  }

  // Count away team wins
  const awayWins = awayMatches?.filter(m => m.winner_team_id === awayTeamId).length || 0;

  // Calculate win difference
  const winDifference = homeWins - awayWins;

  // Determine threshold based on variant
  const threshold = variant === 'standard' ? 2 : 3;

  // Calculate team handicap (floor division)
  const teamHandicap = Math.floor(winDifference / threshold);

  return teamHandicap;
}

/**
 * Calculate handicap differences for a 3v3 match
 *
 * Calculates the total handicap for each team including player handicaps and team handicap bonus.
 * The home team gets a team handicap bonus based on standings, while away team does not.
 * Handicap differences are capped at ±12.
 *
 * @param homeLineup - Home team's lineup with player handicaps
 * @param awayLineup - Away team's lineup with player handicaps
 * @param teamHandicap - Team handicap bonus (applied to home team only)
 * @returns Object with homeDiff and awayDiff (both capped at ±12)
 *
 * @example
 * const { homeDiff, awayDiff } = calculate3v3HandicapDiffs(homeLineup, awayLineup, 1);
 * // homeDiff might be 5, awayDiff might be -5
 * // These are then used to look up the handicap thresholds from the chart
 */
export function calculate3v3HandicapDiffs(
  homeLineup: Lineup,
  awayLineup: Lineup,
  teamHandicap: number
): { homeDiff: number; awayDiff: number } {
  // Sum player handicaps for home team
  const homeTotal =
    homeLineup.player1_handicap +
    homeLineup.player2_handicap +
    homeLineup.player3_handicap;

  // Sum player handicaps for away team
  const awayTotal =
    awayLineup.player1_handicap +
    awayLineup.player2_handicap +
    awayLineup.player3_handicap;

  // Home team gets team handicap bonus
  const homeTotalHandicap = homeTotal + teamHandicap;
  const awayTotalHandicap = awayTotal;

  // Calculate differential for each team (their handicap - opponent's handicap)
  const homeDiff = Math.max(-12, Math.min(12, homeTotalHandicap - awayTotalHandicap));
  const awayDiff = Math.max(-12, Math.min(12, awayTotalHandicap - homeTotalHandicap));

  return { homeDiff, awayDiff };
}
