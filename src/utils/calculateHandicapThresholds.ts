/**
 * @fileoverview Calculate Handicap Thresholds
 *
 * Helper function to calculate and lookup handicap thresholds for a match
 * based on team lineups and league settings.
 * Supports both 3v3 and 5v5 formats with configurable team bonus.
 */

import { getHandicapThresholds } from '@/api/queries/handicaps';
import { getTeamHandicapBonus } from './getTeamHandicapBonus';
import type { Lineup } from '@/types/match';
import type { HandicapThresholds } from '@/types';

/**
 * Determine if team bonus should be used based on format
 *
 * @param teamFormat - Team format ('5_man' = 3v3, '8_man' = 5v5)
 * @returns True if team bonus should be applied
 *
 * Default behavior:
 * - 3v3 (5_man): Uses team bonus ✅
 * - 5v5 (8_man): No team bonus ❌
 *
 * Future: This can be moved to league settings for operator configuration
 */
export function shouldUseTeamBonus(teamFormat: '5_man' | '8_man'): boolean {
  return teamFormat === '5_man'; // Only 3v3 uses team bonus
}

export const calculateHandicapThresholds = async (
  homeLineup: Lineup,
  awayLineup: Lineup,
  homeTeamId: string,
  awayTeamId: string,
  seasonId: string,
  teamFormat: '5_man' | '8_man'
): Promise<{
  homeThresholds: HandicapThresholds;
  awayThresholds: HandicapThresholds;
}> => {
  // Get team handicap bonus (only applies to 3v3, only to home team)
  let teamBonus = 0;
  if (shouldUseTeamBonus(teamFormat)) {
    teamBonus = await getTeamHandicapBonus(homeTeamId, awayTeamId, seasonId, teamFormat);
  }

  // Calculate player handicap totals (sum all active players)
  const homeHandicapTotal =
    homeLineup.player1_handicap +
    homeLineup.player2_handicap +
    homeLineup.player3_handicap +
    (teamFormat === '8_man' ? (homeLineup.player4_handicap || 0) + (homeLineup.player5_handicap || 0) : 0) +
    teamBonus;

  const awayHandicapTotal =
    awayLineup.player1_handicap +
    awayLineup.player2_handicap +
    awayLineup.player3_handicap +
    (teamFormat === '8_man' ? (awayLineup.player4_handicap || 0) + (awayLineup.player5_handicap || 0) : 0);

  // Look up thresholds using unified function (supports both 3v3 and 5v5)
  const homeThresholds = getHandicapThresholds(homeHandicapTotal - awayHandicapTotal, teamFormat);
  const awayThresholds = getHandicapThresholds(awayHandicapTotal - homeHandicapTotal, teamFormat);

   return {
    homeThresholds,
    awayThresholds
   };
};
