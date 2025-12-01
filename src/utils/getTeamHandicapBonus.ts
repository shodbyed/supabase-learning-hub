/**
 * @fileoverview Team Handicap Bonus Calculator
 *
 * Self-contained helper to calculate team handicap bonus based on standings.
 * The team handicap bonus is only applied to the HOME team.
 *
 * Uses team match wins from completed matches to calculate handicap differential.
 */

import { supabase } from '@/supabaseClient';
import { logger } from '@/utils/logger';

/**
 * Team format types
 */
type TeamFormat = '5_man' | '8_man';

/**
 * Calculate team handicap bonus for the home team
 *
 * Team handicap is awarded based on the difference in match WINS between home and away teams.
 * Formula (once standings are implemented):
 * - 3v3: (home_wins - away_wins) / 2 = bonus (every 2 wins ahead = +1 handicap)
 * - 5v5: No team handicap (always returns 0)
 *
 * @param homeTeamId - The home team's ID
 * @param awayTeamId - The away team's ID
 * @param seasonId - The season ID to calculate standings from
 * @param teamFormat - '5_man' (3v3) or '8_man' (5v5)
 * @returns Team handicap bonus (can be positive, negative, or zero)
 *
 * @example
 * // 3v3 format - returns placeholder value until standings built
 * const bonus = await getTeamHandicapBonus('home-123', 'away-456', 'season-789', '5_man');
 * // Currently returns: 1 (placeholder)
 *
 * @example
 * // 5v5 format - no team handicap
 * const bonus = await getTeamHandicapBonus('home-123', 'away-456', 'season-789', '8_man');
 * // Returns: 0
 */
export async function getTeamHandicapBonus(
  homeTeamId: string,
  awayTeamId: string,
  seasonId: string,
  teamFormat: TeamFormat
): Promise<number> {
  // 5v5 (8_man) does not use team handicap
  if (teamFormat === '8_man') {
    return 0;
  }

  // 3v3 (5_man) uses team handicap based on match win differential
  // Formula: (home_wins - away_wins) / 2 (rounded down)

  try {
    // Fetch all completed matches for this season
    const { data: matches, error } = await supabase
      .from('matches')
      .select('winner_team_id')
      .eq('season_id', seasonId)
      .eq('status', 'completed');

    if (error) {
      logger.error('Error fetching matches for team handicap', { error: error.message });
      return 0; // Return 0 on error (neutral handicap)
    }

    if (!matches || matches.length === 0) {
      return 0; // No completed matches yet, no handicap
    }

    // Count wins for each team
    let homeWins = 0;
    let awayWins = 0;

    matches.forEach((match) => {
      if (match.winner_team_id === homeTeamId) {
        homeWins++;
      } else if (match.winner_team_id === awayTeamId) {
        awayWins++;
      }
    });

    // Calculate win differential and team handicap bonus
    const winDifference = homeWins - awayWins;
    const bonus = Math.floor(winDifference / 2);

    return bonus;

    // Example: Home has 8 wins, Away has 3 wins
    //   winDifference = 8 - 3 = 5
    //   bonus = floor(5 / 2) = 2
    //   Home team gets +2 team handicap bonus
    //
    // Example: Home has 3 wins, Away has 7 wins
    //   winDifference = 3 - 7 = -4
    //   bonus = floor(-4 / 2) = -2
    //   Home team gets -2 team handicap penalty
  } catch (error) {
    logger.error('Exception in getTeamHandicapBonus', { error: error instanceof Error ? error.message : String(error) });
    return 0; // Return 0 on exception (neutral handicap)
  }
}
