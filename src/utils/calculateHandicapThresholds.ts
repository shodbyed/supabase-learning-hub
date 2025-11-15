/**
 * @fileoverview Calculate Handicap Thresholds
 *
 * Helper function to calculate and lookup handicap thresholds for a match
 * based on team lineups and league settings.
 */

import { getHandicapThresholds3v3 } from '@/api/queries/handicaps';
import { getTeamHandicapBonus } from './getTeamHandicapBonus';
import type { Lineup } from '@/types/match';

export const calculateHandicapThresholds = async (
  homeLineup: Lineup,
  awayLineup: Lineup,
  homeTeamId: string,
  awayTeamId: string,
  seasonId: string,
  teamFormat: '5_man' | '8_man'
) => {
  // Get team handicap bonus (only applies to home team) - do this FIRST
  const teamBonus = await getTeamHandicapBonus(homeTeamId, awayTeamId, seasonId, teamFormat);

  // Calculate player handicap totals and add team bonus to home team
  const homeHandicapTotal = homeLineup.player1_handicap + homeLineup.player2_handicap + homeLineup.player3_handicap + teamBonus;
  const awayHandicapTotal = awayLineup.player1_handicap + awayLineup.player2_handicap + awayLineup.player3_handicap;

  // Look up thresholds for each team
  const homeThresholds = await getHandicapThresholds3v3(homeHandicapTotal - awayHandicapTotal);
  const awayThresholds = await getHandicapThresholds3v3(awayHandicapTotal - homeHandicapTotal); 

   return {
    homeThresholds,
    awayThresholds
   }
};
