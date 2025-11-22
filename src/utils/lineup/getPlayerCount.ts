/**
 * @fileoverview Player Count Utility
 *
 * Determines the number of players in a lineup based on team format.
 * - 5_man teams → 3 players (3v3)
 * - 8_man teams → 5 players (5v5)
 */

export type TeamFormat = '5_man' | '8_man';

/**
 * Get the number of players in a lineup for a given team format
 *
 * @param teamFormat - The team format ('5_man' or '8_man')
 * @returns Number of players (3 for 3v3, 5 for 5v5)
 *
 * @example
 * getPlayerCount('5_man') // returns 3
 * getPlayerCount('8_man') // returns 5
 */
export function getPlayerCount(teamFormat: TeamFormat): 3 | 5 {
  return teamFormat === '5_man' ? 3 : 5;
}

/**
 * Get the total number of regular games for a given team format
 *
 * - 3v3: 18 games (double round-robin)
 * - 5v5: 25 games (single round-robin)
 *
 * @param teamFormat - The team format ('5_man' or '8_man')
 * @returns Number of regular games
 */
export function getRegularGameCount(teamFormat: TeamFormat): number {
  const playerCount = getPlayerCount(teamFormat);
  // 3v3: 3 players × 3 opponents × 2 rounds = 18
  // 5v5: 5 players × 5 opponents × 1 round = 25
  return playerCount === 3 ? 18 : 25;
}

/**
 * Check if a team format supports tiebreakers
 *
 * - 3v3: Yes (even number of games can tie)
 * - 5v5: No (odd number of games, no ties possible)
 *
 * @param teamFormat - The team format ('5_man' or '8_man')
 * @returns True if tiebreakers are possible
 */
export function supportsTiebreaker(teamFormat: TeamFormat): boolean {
  return teamFormat === '5_man'; // Only 3v3 has tiebreakers
}
