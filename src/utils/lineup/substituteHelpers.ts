/**
 * @fileoverview Substitute Player Helpers
 *
 * Constants and utility functions for handling substitute players in lineups.
 * Substitutes use special UUIDs to identify home/away team subs.
 */

// Special substitute member IDs
export const SUB_HOME_ID = '00000000-0000-0000-0000-000000000001';
export const SUB_AWAY_ID = '00000000-0000-0000-0000-000000000002';

/**
 * Check if a player ID is a substitute
 */
export function isSubstitute(playerId: string): boolean {
  return playerId === SUB_HOME_ID || playerId === SUB_AWAY_ID;
}

/**
 * Get the substitute ID for a team
 */
export function getSubstituteId(isHomeTeam: boolean): string {
  return isHomeTeam ? SUB_HOME_ID : SUB_AWAY_ID;
}

/**
 * Check if any player in the lineup is a substitute
 */
export function lineupHasSubstitute(
  player1Id: string,
  player2Id: string,
  player3Id: string
): boolean {
  return (
    isSubstitute(player1Id) ||
    isSubstitute(player2Id) ||
    isSubstitute(player3Id)
  );
}
