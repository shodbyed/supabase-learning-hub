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

/**
 * Calculate the handicap for a substitute player
 *
 * Rule: Sub handicap = MAX(selected sub value, highest unused player handicap)
 *
 * @param usedPlayerIds - Array of player IDs currently in the lineup (excluding subs)
 * @param allPlayers - All players on the team with their handicaps
 * @param subHandicapValue - The manually selected substitute handicap value
 * @returns The calculated handicap for the substitute
 *
 * @example
 * // Team has players with handicaps: [2, 1, 0, -1]
 * // Lineup uses players with handicaps: [2, 1]
 * // Unused players have handicaps: [0, -1]
 * // Highest unused = 0
 * // Sub value selected = -1
 * calculateSubstituteHandicap(['id1', 'id2'], allPlayers, -1)
 * // Returns: 0 (MAX(-1, 0))
 */
export function calculateSubstituteHandicap(
  usedPlayerIds: string[],
  allPlayers: Array<{ id: string; handicap?: number }>,
  subHandicapValue: number
): number {
  // Filter out substitute IDs and find unused players
  const nonSubUsedIds = usedPlayerIds.filter(id => !isSubstitute(id));
  const unusedPlayers = allPlayers.filter(p => !nonSubUsedIds.includes(p.id));

  // Find highest handicap among unused players
  const highestUnused = unusedPlayers.length > 0
    ? Math.max(...unusedPlayers.map(p => p.handicap || 0))
    : 0;

  // Return the higher of the two values
  return Math.max(subHandicapValue, highestUnused);
}
