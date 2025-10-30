/**
 * @fileoverview Game Order Utilities for 3v3 Match Scoring
 *
 * Defines the 18-game double round-robin order for 3v3 matches.
 * Each player plays each opposing player twice (once breaking, once racking).
 * Home team breaks first in the initial rotation.
 *
 * Reference: 3x3SCORING-PLAN.md Game Order Table (lines 129-150)
 */

export interface GameMatchup {
  gameNumber: number;
  homePlayerPosition: 1 | 2 | 3; // P1, P2, or P3
  awayPlayerPosition: 1 | 2 | 3;
  homeAction: 'breaks' | 'racks';
  awayAction: 'breaks' | 'racks';
}

/**
 * The official 18-game order for 3v3 matches
 *
 * Format:
 * - homePlayerPosition: 1=P1, 2=P2, 3=P3 (player position in lineup)
 * - awayPlayerPosition: 1=P1, 2=P2, 3=P3 (player position in lineup)
 * - homeAction: 'breaks' or 'racks'
 * - awayAction: 'breaks' or 'racks'
 *
 * Pattern: Double round-robin where each player faces each opponent twice
 * Home team breaks first in initial rotation (games 1-3, 7-9)
 * Away team breaks first in second rotation (games 4-6, 10-12)
 * Pattern repeats for games 13-18
 */
export const GAME_ORDER_3V3: GameMatchup[] = [
  // Round 1: Home breaks first (P1 vs P1, P2 vs P2, P3 vs P3)
  { gameNumber: 1, homePlayerPosition: 1, awayPlayerPosition: 1, homeAction: 'breaks', awayAction: 'racks' },
  { gameNumber: 2, homePlayerPosition: 2, awayPlayerPosition: 2, homeAction: 'breaks', awayAction: 'racks' },
  { gameNumber: 3, homePlayerPosition: 3, awayPlayerPosition: 3, homeAction: 'breaks', awayAction: 'racks' },

  // Round 2: Away breaks first (P1 vs P2, P2 vs P3, P3 vs P1)
  { gameNumber: 4, homePlayerPosition: 1, awayPlayerPosition: 2, homeAction: 'racks', awayAction: 'breaks' },
  { gameNumber: 5, homePlayerPosition: 2, awayPlayerPosition: 3, homeAction: 'racks', awayAction: 'breaks' },
  { gameNumber: 6, homePlayerPosition: 3, awayPlayerPosition: 1, homeAction: 'racks', awayAction: 'breaks' },

  // Round 3: Home breaks first (P1 vs P3, P2 vs P1, P3 vs P2)
  { gameNumber: 7, homePlayerPosition: 1, awayPlayerPosition: 3, homeAction: 'breaks', awayAction: 'racks' },
  { gameNumber: 8, homePlayerPosition: 2, awayPlayerPosition: 1, homeAction: 'breaks', awayAction: 'racks' },
  { gameNumber: 9, homePlayerPosition: 3, awayPlayerPosition: 2, homeAction: 'breaks', awayAction: 'racks' },

  // Round 4: Away breaks first (P1 vs P1, P2 vs P2, P3 vs P3) - rematch
  { gameNumber: 10, homePlayerPosition: 1, awayPlayerPosition: 1, homeAction: 'racks', awayAction: 'breaks' },
  { gameNumber: 11, homePlayerPosition: 2, awayPlayerPosition: 2, homeAction: 'racks', awayAction: 'breaks' },
  { gameNumber: 12, homePlayerPosition: 3, awayPlayerPosition: 3, homeAction: 'racks', awayAction: 'breaks' },

  // Round 5: Home breaks first (P1 vs P3, P2 vs P1, P3 vs P2) - rematch
  { gameNumber: 13, homePlayerPosition: 1, awayPlayerPosition: 3, homeAction: 'racks', awayAction: 'breaks' },
  { gameNumber: 14, homePlayerPosition: 2, awayPlayerPosition: 1, homeAction: 'racks', awayAction: 'breaks' },
  { gameNumber: 15, homePlayerPosition: 3, awayPlayerPosition: 2, homeAction: 'racks', awayAction: 'breaks' },

  // Round 6: Away breaks first (P1 vs P2, P2 vs P3, P3 vs P1) - rematch
  { gameNumber: 16, homePlayerPosition: 1, awayPlayerPosition: 2, homeAction: 'breaks', awayAction: 'racks' },
  { gameNumber: 17, homePlayerPosition: 2, awayPlayerPosition: 3, homeAction: 'breaks', awayAction: 'racks' },
  { gameNumber: 18, homePlayerPosition: 3, awayPlayerPosition: 1, homeAction: 'breaks', awayAction: 'racks' },
];

/**
 * Get the matchup details for a specific game number
 *
 * @param gameNumber - Game number (1-18 for regular, 19-21 for tiebreaker)
 * @returns GameMatchup object or undefined if game number is invalid
 */
export function getGameMatchup(gameNumber: number): GameMatchup | undefined {
  return GAME_ORDER_3V3.find(game => game.gameNumber === gameNumber);
}

/**
 * Get all 18 games in order
 *
 * @returns Array of all 18 game matchups
 */
export function getAllGames(): GameMatchup[] {
  return GAME_ORDER_3V3;
}

/**
 * Validate that a game number is valid for regular play
 *
 * @param gameNumber - Game number to validate
 * @returns True if game number is between 1 and 18
 */
export function isValidGameNumber(gameNumber: number): boolean {
  return gameNumber >= 1 && gameNumber <= 18;
}

/**
 * Check if a game number is for a tiebreaker game
 *
 * @param gameNumber - Game number to check
 * @returns True if game number is 19, 20, or 21 (tiebreaker games)
 */
export function isTiebreakerGame(gameNumber: number): boolean {
  return gameNumber >= 19 && gameNumber <= 21;
}
