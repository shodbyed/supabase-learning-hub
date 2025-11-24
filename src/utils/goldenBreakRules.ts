/**
 * @fileoverview Golden Break Rules Utility
 *
 * Determines whether a golden break counts as a win based on:
 * 1. League/Organization preference override (if set)
 * 2. BCA Standard rules (based on game type)
 *
 * BCA Standard Rules:
 * - 9-Ball: Golden break DOES count as win
 * - 8-Ball: Golden break does NOT count as win
 * - 10-Ball: Golden break does NOT count as win
 */

import type { GameType } from '@/types/league';

/**
 * Determine if golden break counts as win
 *
 * Preference cascade:
 * 1. If preference is explicitly set (true/false), use that
 * 2. If preference is null, use BCA Standard rules based on game type
 *
 * @param gameType - The game type (eight_ball, nine_ball, ten_ball)
 * @param goldenBreakPreference - League/org preference (true/false/null)
 * @returns Whether golden break counts as win
 *
 * @example
 * // 9-ball with no preference (uses BCA standard)
 * shouldGoldenBreakCount('nine_ball', null) // returns true
 *
 * // 8-ball with no preference (uses BCA standard)
 * shouldGoldenBreakCount('eight_ball', null) // returns false
 *
 * // Any game with explicit override
 * shouldGoldenBreakCount('eight_ball', true) // returns true (override)
 * shouldGoldenBreakCount('nine_ball', false) // returns false (override)
 */
export function shouldGoldenBreakCount(
  gameType: GameType,
  goldenBreakPreference: boolean | null | undefined
): boolean {
  // If preference is explicitly set, use it
  if (goldenBreakPreference !== null && goldenBreakPreference !== undefined) {
    return goldenBreakPreference;
  }

  // Otherwise use BCA Standard rules based on game type
  switch (gameType) {
    case 'nine_ball':
      return true; // BCA Standard: 9-ball golden break counts as win
    case 'eight_ball':
    case 'ten_ball':
      return false; // BCA Standard: 8-ball and 10-ball golden break does NOT count
    default:
      return false; // Safe default
  }
}
