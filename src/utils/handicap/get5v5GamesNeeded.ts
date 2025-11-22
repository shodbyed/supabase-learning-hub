/**
 * @fileoverview 5v5 BCA Handicap Chart Lookup (Hard-coded)
 *
 * Static lookup table for 5v5 (8-man league) handicap thresholds.
 * Based on BCA Standard Handicap System.
 * 25 total games per match (single round-robin).
 *
 * Source: BCA_HANDICAP_SYSTEM.md
 */

export interface HandicapThresholds {
  games_to_win: number;
  games_to_tie: number | null;
  games_to_lose: number;
}

/**
 * BCA 5v5 Handicap Chart - Range-based lookup
 *
 * Instead of 1000+ rows, we use 7 ranges per side (14 total entries).
 * Handicap differences are percentage-based (0-500 range).
 */
const BCA_5V5_RANGES: Array<{
  minDiff: number;
  maxDiff: number;
  gamesNeeded: number;
}> = [
  // Format: [min, max, games_needed]
  { minDiff: 0, maxDiff: 14, gamesNeeded: 13 },
  { minDiff: 15, maxDiff: 40, gamesNeeded: 14 },
  { minDiff: 41, maxDiff: 66, gamesNeeded: 15 },
  { minDiff: 67, maxDiff: 92, gamesNeeded: 16 },
  { minDiff: 93, maxDiff: 118, gamesNeeded: 17 },
  { minDiff: 119, maxDiff: 144, gamesNeeded: 18 },
  { minDiff: 145, maxDiff: 999, gamesNeeded: 19 }, // 145+ capped at 19
];

/**
 * Get games needed to win/lose for 5v5 match based on handicap difference
 *
 * Uses range-based lookup from BCA chart.
 * No ties possible in 5v5 (25 games = odd number).
 *
 * @param handicapDiff - Handicap difference (percentage-based, 0-500 range)
 * @returns Handicap thresholds (games_to_win, games_to_tie=null, games_to_lose)
 *
 * @example
 * // Team A: 276%, Team B: 260% → diff = 16
 * const thresholds = get5v5GamesNeeded(16);
 * console.log(thresholds.games_to_win); // 14
 *
 * @example
 * // Lower handicap team (negative diff)
 * const thresholds = get5v5GamesNeeded(-40);
 * console.log(thresholds.games_to_win); // 12
 */
export function get5v5GamesNeeded(handicapDiff: number): HandicapThresholds {
  const absDiff = Math.abs(Math.round(handicapDiff));
  const isHigherHandicap = handicapDiff >= 0;

  // Find matching range
  const range = BCA_5V5_RANGES.find(
    (r) => absDiff >= r.minDiff && absDiff <= r.maxDiff
  );

  if (!range) {
    throw new Error(`Invalid handicap difference: ${handicapDiff}`);
  }

  // Higher handicap team needs more wins, lower needs fewer
  // Total must equal 25 games: games_to_win + games_to_lose = 25
  const gamesNeeded = range.gamesNeeded;
  const opponentGamesNeeded = 25 - gamesNeeded;

  return {
    games_to_win: isHigherHandicap ? gamesNeeded : opponentGamesNeeded,
    games_to_tie: null, // No ties in 25-game format
    games_to_lose: isHigherHandicap ? opponentGamesNeeded - 1 : gamesNeeded - 1,
  };
}
