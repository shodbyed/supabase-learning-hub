/**
 * @fileoverview User Team Info Helper
 *
 * Determines which team the current user is on for a specific match.
 * Returns team ID and whether user is on home team.
 */

/**
 * Get user's team information for a match
 *
 * Determines which team the user is on and whether they're home or away.
 * Uses the team roster data to find the user's team.
 *
 * @param memberId - Current user's member ID
 * @param homeTeamId - Match home team ID
 * @param awayTeamId - Match away team ID
 * @param teamId - User's team ID (from team details)
 * @returns Object with userTeamId and isHomeTeam boolean
 *
 * @example
 * const { userTeamId, isHomeTeam } = getUserTeamInfo(
 *   memberId,
 *   matchData.home_team_id,
 *   matchData.away_team_id,
 *   teamDetailsData.id
 * );
 */
export function getUserTeamInfo(
  _memberId: string,
  homeTeamId: string,
  _awayTeamId: string,
  teamId: string
): { userTeamId: string; isHomeTeam: boolean } {
  const userTeamId = teamId;
  const isHomeTeam = userTeamId === homeTeamId;

  return {
    userTeamId,
    isHomeTeam,
  };
}
