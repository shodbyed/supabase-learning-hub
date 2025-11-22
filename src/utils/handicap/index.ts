/**
 * @fileoverview Unified Handicap Chart Interface
 *
 * Central interface for getting handicap thresholds for both 3v3 and 5v5 formats.
 * All handicap lookups should use these functions instead of database queries.
 */

import { get3v3GamesNeeded } from './get3v3GamesNeeded';
import { get5v5GamesNeeded } from './get5v5GamesNeeded';

export type { HandicapThresholds } from './get3v3GamesNeeded';
export { get3v3GamesNeeded } from './get3v3GamesNeeded';
export { get5v5GamesNeeded } from './get5v5GamesNeeded';

export type TeamFormat = '5_man' | '8_man';

/**
 * Get handicap thresholds for any team format
 *
 * Unified interface that routes to the correct handicap chart based on team format.
 * Returns games needed to win/tie/lose based on handicap difference.
 *
 * @param handicapDiff - Handicap difference between teams
 * @param teamFormat - Team format ('5_man' = 3v3, '8_man' = 5v5)
 * @returns Handicap thresholds
 *
 * @example
 * // 3v3 match
 * const thresholds = getGamesNeeded(5, '5_man');
 * console.log(thresholds.games_to_win); // 12
 *
 * @example
 * // 5v5 match
 * const thresholds = getGamesNeeded(16, '8_man');
 * console.log(thresholds.games_to_win); // 14
 */
export function getGamesNeeded(
  handicapDiff: number,
  teamFormat: TeamFormat
) {
  if (teamFormat === '5_man') {
    return get3v3GamesNeeded(handicapDiff);
  } else {
    return get5v5GamesNeeded(handicapDiff);
  }
}

/**
 * Get handicap thresholds for BOTH teams in a match
 *
 * Calculates games needed for both home and away teams.
 * Useful for displaying both teams' win requirements simultaneously.
 *
 * @param homeHandicap - Home team's total handicap
 * @param awayHandicap - Away team's total handicap
 * @param teamFormat - Team format ('5_man' = 3v3, '8_man' = 5v5)
 * @returns Both teams' handicap thresholds
 *
 * @example
 * const { homeThresholds, awayThresholds } = getGamesNeededForBothTeams(8, 5, '5_man');
 * console.log(`Home needs ${homeThresholds.games_to_win} wins`); // "Home needs 11 wins"
 * console.log(`Away needs ${awayThresholds.games_to_win} wins`); // "Away needs 9 wins"
 */
export function getGamesNeededForBothTeams(
  homeHandicap: number,
  awayHandicap: number,
  teamFormat: TeamFormat
) {
  const homeDiff = homeHandicap - awayHandicap;
  const awayDiff = awayHandicap - homeHandicap;

  return {
    homeThresholds: getGamesNeeded(homeDiff, teamFormat),
    awayThresholds: getGamesNeeded(awayDiff, teamFormat),
  };
}
