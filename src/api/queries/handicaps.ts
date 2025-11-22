/**
 * @fileoverview Handicap Query Functions
 *
 * Functions for getting handicap thresholds.
 * Now uses hard-coded charts instead of database lookup for better performance.
 * Supports both 3v3 and 5v5 formats.
 */

import { getGamesNeeded, type TeamFormat } from '@/utils/handicap';
import type { HandicapThresholds } from '@/types';

/**
 * Get handicap thresholds for 3v3 match
 *
 * @deprecated Use getHandicapThresholds() with teamFormat parameter instead
 *
 * Looks up games to win/tie/lose based on handicap difference.
 * Uses hard-coded chart (no database query needed).
 *
 * @param handicapDiff - Handicap difference (will be capped at ±12)
 * @returns Handicap thresholds (games_to_win, games_to_tie, games_to_lose)
 */
export function getHandicapThresholds3v3(handicapDiff: number): HandicapThresholds {
  return getGamesNeeded(handicapDiff, '5_man');
}

/**
 * Get handicap thresholds for any team format
 *
 * Unified interface for both 3v3 and 5v5 handicap lookups.
 * Uses hard-coded charts (no database query needed).
 *
 * @param handicapDiff - Handicap difference
 * @param teamFormat - Team format ('5_man' = 3v3, '8_man' = 5v5)
 * @returns Handicap thresholds (games_to_win, games_to_tie, games_to_lose)
 *
 * @example
 * // 3v3 match
 * const thresholds = getHandicapThresholds(5, '5_man');
 *
 * @example
 * // 5v5 match
 * const thresholds = getHandicapThresholds(16, '8_man');
 */
export function getHandicapThresholds(
  handicapDiff: number,
  teamFormat: TeamFormat
): HandicapThresholds {
  return getGamesNeeded(handicapDiff, teamFormat);
}
