/**
 * @fileoverview Player Handicap Calculator
 *
 * Self-contained helper to calculate a player's handicap based on their game history.
 * Works independently without parent dependencies.
 *
 * Supports both 3v3 and 5v5 formats with different handicap systems:
 * - 3v3: Returns integer handicap (-2 to +2 standard, -1 to +1 reduced, or 0)
 * - 5v5: Returns percentage handicap (0-100% standard, 0-50% reduced, or 40%)
 *
 * Formulas:
 * - 3v3: (wins - losses) / weeks_played, where weeks_played = games_played / 6
 * - 5v5: win percentage (wins / games_played * 100)
 *
 * Minimum games requirement:
 * - 3v3: 18 games required (returns 0 if < 18 games)
 * - 5v5: No minimum (returns 40% if 0 games, calculates immediately with 1+ games)
 */

import { fetchPlayerGameHistory } from '@/api/queries/matchGames';

/**
 * Team format types
 */
type TeamFormat = '5_man' | '8_man';

/**
 * Handicap variant/strength levels
 */
type HandicapVariant = 'standard' | 'reduced' | 'none';

/**
 * Calculate a player's handicap based on their game history
 *
 * IMPORTANT: Handicaps are game-type specific. 8-ball games don't count for 9-ball handicaps.
 * Games from the current season are prioritized first, then other games of the same type.
 *
 * @param playerId - The player's member ID
 * @param teamFormat - '5_man' (3v3) or '8_man' (5v5)
 * @param handicapVariant - 'standard', 'reduced', or 'none'
 * @param gameType - Game type to filter ('eight_ball', 'nine_ball', 'ten_ball')
 * @param currentSeasonId - Optional current season ID to prioritize those games first
 * @param gameLimit - Number of recent games to consider (default: 200). Higher = more stable, lower = more volatile
 * @returns Handicap value (integer for 3v3, percentage for 5v5)
 *
 * @example
 * // 3v3 format, 9-ball, prioritizing current season, last 200 games (default)
 * const handicap = await calculatePlayerHandicap(
 *   'player-123',
 *   '5_man',
 *   'standard',
 *   'nine_ball',
 *   'season-456'
 * );
 * // Returns: -2, -1, 0, 1, or 2
 *
 * @example
 * // More volatile handicap - only last 50 games
 * const handicap = await calculatePlayerHandicap(
 *   'player-456',
 *   '8_man',
 *   'standard',
 *   'eight_ball',
 *   undefined,
 *   50
 * );
 * // Returns: 0-100 (percentage)
 */
export async function calculatePlayerHandicap(
  playerId: string,
  teamFormat: TeamFormat,
  handicapVariant: HandicapVariant,
  gameType: 'eight_ball' | 'nine_ball' | 'ten_ball',
  currentSeasonId?: string,
  gameLimit: number = 200
): Promise<number> {
  // Handle 'none' variant - return defaults
  if (handicapVariant === 'none') {
    return teamFormat === '5_man' ? 0 : 40;
  }

  // Query last N games for this player (filtered by game type, prioritizing current season)
  try {
    const games = await fetchPlayerGameHistory(playerId, gameType, currentSeasonId, gameLimit);

    // Handle different minimum game requirements by format
    if (!games || games.length === 0) {
      // No games played - return defaults
      return teamFormat === '5_man' ? 0 : 40;
    }

    // 3v3: Requires minimum 18 games before calculating handicap
    if (teamFormat === '5_man' && games.length < 18) {
      return 0;
    }

    // 5v5: Calculate handicap immediately with ANY games (no minimum)
    // Count wins and losses
    const wins = games.filter((game) => game.winner_player_id === playerId).length;
    const losses = games.length - wins;
    const gamesPlayed = games.length;

    // Return based on format
    if (teamFormat === '5_man') {
      // 3v3: Use (wins - losses) / weeks_played formula
      const weeksPlayed = gamesPlayed / 6;
      const rawHandicap = (wins - losses) / weeksPlayed;
      return roundTo3v3Handicap(rawHandicap, handicapVariant);
    } else {
      // 5v5: Use straight win percentage
      const winPercentage = (wins / gamesPlayed) * 100;
      return convertTo5v5Percentage(winPercentage, handicapVariant);
    }
  } catch (error) {
    console.error('Error calculating player handicap:', error);
    return teamFormat === '5_man' ? 0 : 40;
  }
}

/**
 * Round raw handicap to valid 3v3 integer handicap
 *
 * IMPORTANT: Must be whole numbers only, capped at range limits
 * - Standard: -2, -1, 0, 1, 2 (cap at ±2)
 * - Reduced: -1, 0, 1 (cap at ±1)
 *
 * Examples:
 * - raw = 4.2, standard → 2 (capped)
 * - raw = -3.5, standard → -2 (capped)
 * - raw = 1.8, reduced → 1 (capped)
 * - raw = -1.3, reduced → -1 (capped)
 */
function roundTo3v3Handicap(raw: number, variant: HandicapVariant): number {
  // Round to whole number first
  const rounded = Math.round(raw);

  // Cap to valid range
  if (variant === 'standard') {
    // Cap between -2 and +2
    return Math.max(-2, Math.min(2, rounded));
  } else {
    // reduced: Cap between -1 and +1
    return Math.max(-1, Math.min(1, rounded));
  }
}

/**
 * Convert win percentage to 5v5 handicap percentage
 *
 * 5v5 uses straight win percentage, not the weeks-played formula.
 * - Standard: 0-100% (full range)
 * - Reduced: 0-50% (half range - divide win% by 2)
 *
 * @param winPercentage - Raw win percentage (0-100)
 * @param variant - Handicap variant
 * @returns Handicap percentage for 5v5
 */
function convertTo5v5Percentage(winPercentage: number, variant: HandicapVariant): number {
  if (variant === 'standard') {
    // Standard: Use full win percentage (0-100%)
    return Math.max(0, Math.min(100, Math.round(winPercentage)));
  } else {
    // Reduced: Half the win percentage (0-50%)
    const reducedPercentage = winPercentage / 2;
    return Math.max(0, Math.min(50, Math.round(reducedPercentage)));
  }
}
