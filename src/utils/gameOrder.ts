/**
 * @fileoverview Game Order Utilities for 3v3 Match Scoring
 *
 * Defines the 18-game double round-robin order for 3v3 matches.
 * Each player plays each opposing player twice (once breaking, once racking).
 * Home team breaks first in the initial rotation.
 *
 * Reference: 3x3SCORING-PLAN.md Game Order Table (lines 129-150)
 */

import { logger } from '@/utils/logger';

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
  // Round 1: Home breaks (P1, P2, P3), Away racks (P1, P2, P3)
  { gameNumber: 1, homePlayerPosition: 1, awayPlayerPosition: 1, homeAction: 'breaks', awayAction: 'racks' },
  { gameNumber: 2, homePlayerPosition: 2, awayPlayerPosition: 2, homeAction: 'breaks', awayAction: 'racks' },
  { gameNumber: 3, homePlayerPosition: 3, awayPlayerPosition: 3, homeAction: 'breaks', awayAction: 'racks' },

  // Round 2: Home racks (P1, P2, P3), Away breaks (P2, P3, P1)
  { gameNumber: 4, homePlayerPosition: 1, awayPlayerPosition: 2, homeAction: 'racks', awayAction: 'breaks' },
  { gameNumber: 5, homePlayerPosition: 2, awayPlayerPosition: 3, homeAction: 'racks', awayAction: 'breaks' },
  { gameNumber: 6, homePlayerPosition: 3, awayPlayerPosition: 1, homeAction: 'racks', awayAction: 'breaks' },

  // Round 3: Home breaks (P1, P2, P3), Away racks (P3, P1, P2)
  { gameNumber: 7, homePlayerPosition: 1, awayPlayerPosition: 3, homeAction: 'breaks', awayAction: 'racks' },
  { gameNumber: 8, homePlayerPosition: 2, awayPlayerPosition: 1, homeAction: 'breaks', awayAction: 'racks' },
  { gameNumber: 9, homePlayerPosition: 3, awayPlayerPosition: 2, homeAction: 'breaks', awayAction: 'racks' },

  // Round 4: Home racks (P1, P2, P3), Away breaks (P1, P2, P3)
  { gameNumber: 10, homePlayerPosition: 1, awayPlayerPosition: 1, homeAction: 'racks', awayAction: 'breaks' },
  { gameNumber: 11, homePlayerPosition: 2, awayPlayerPosition: 2, homeAction: 'racks', awayAction: 'breaks' },
  { gameNumber: 12, homePlayerPosition: 3, awayPlayerPosition: 3, homeAction: 'racks', awayAction: 'breaks' },

  // Round 5: Home breaks (P1, P2, P3), Away racks (P2, P3, P1)
  { gameNumber: 13, homePlayerPosition: 1, awayPlayerPosition: 2, homeAction: 'breaks', awayAction: 'racks' },
  { gameNumber: 14, homePlayerPosition: 2, awayPlayerPosition: 3, homeAction: 'breaks', awayAction: 'racks' },
  { gameNumber: 15, homePlayerPosition: 3, awayPlayerPosition: 1, homeAction: 'breaks', awayAction: 'racks' },

  // Round 6: Home racks (P1, P2, P3), Away breaks (P3, P1, P2)
  { gameNumber: 16, homePlayerPosition: 1, awayPlayerPosition: 3, homeAction: 'racks', awayAction: 'breaks' },
  { gameNumber: 17, homePlayerPosition: 2, awayPlayerPosition: 1, homeAction: 'racks', awayAction: 'breaks' },
  { gameNumber: 18, homePlayerPosition: 3, awayPlayerPosition: 2, homeAction: 'racks', awayAction: 'breaks' },
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

/**
 * Generate game order algorithmically for any team size
 *
 * Pattern:
 * - Home team goes in order: 1,2,3... repeated
 * - Away team rotates: first round 1,2,3... then 2,3,1... then 3,1,2... etc
 * - Break action swaps every round (home breaks round 1, away breaks round 2, etc)
 *
 * @param playersPerTeam - Number of players per team (3 for 3v3, 5 for 5v5)
 * @param doubleRoundRobin - If true, each player plays each opponent twice. If false, only once.
 * @returns Array of game matchups
 *
 * @example
 * // 3v3 creates 18 games (3 players × 3 opponents × 2 rounds)
 * generateGameOrder(3, true)
 *
 * // 5v5 creates 25 games (5 players × 5 opponents × 1 round)
 * generateGameOrder(5, false)
 */
export function generateGameOrder(playersPerTeam: number, doubleRoundRobin: boolean = true): GameMatchup[] {
  const games: GameMatchup[] = [];
  let gameNumber = 1;

  // Total rounds = playersPerTeam * (doubleRoundRobin ? 2 : 1)
  const totalRounds = doubleRoundRobin ? playersPerTeam * 2 : playersPerTeam;

  for (let round = 0; round < totalRounds; round++) {
    // Determine who breaks this round (alternates)
    const homeBreaks = round % 2 === 0;

    // Calculate away team rotation offset
    // Rotates every round: 0, 1, 2, 0, 1, 2...
    const awayOffset = round % playersPerTeam;

    // Each round has playersPerTeam games
    for (let i = 0; i < playersPerTeam; i++) {
      const homePosition = i + 1; // 1-indexed
      // Away position rotates based on offset
      const awayPosition = ((i + awayOffset) % playersPerTeam) + 1;

      games.push({
        gameNumber: gameNumber++,
        homePlayerPosition: homePosition as any,
        awayPlayerPosition: awayPosition as any,
        homeAction: homeBreaks ? 'breaks' : 'racks',
        awayAction: homeBreaks ? 'racks' : 'breaks',
      });
    }
  }

  return games;
}

/**
 * Get game order for 5v5 matches (25 games total - single round-robin)
 */
export function getAllGames5v5(): GameMatchup[] {
  return generateGameOrder(5, false); // false = single round-robin
}

/**
 * Verify the generated game order matches the hardcoded order
 * Useful for testing the algorithm
 */
export function verifyGameOrder(): boolean {
  const generated = generateGameOrder(3);

  if (generated.length !== GAME_ORDER_3V3.length) {
    logger.error('Game order length mismatch', {
      generated: generated.length,
      expected: GAME_ORDER_3V3.length
    });
    return false;
  }

  for (let i = 0; i < generated.length; i++) {
    const gen = generated[i];
    const ref = GAME_ORDER_3V3[i];

    if (
      gen.gameNumber !== ref.gameNumber ||
      gen.homePlayerPosition !== ref.homePlayerPosition ||
      gen.awayPlayerPosition !== ref.awayPlayerPosition ||
      gen.homeAction !== ref.homeAction ||
      gen.awayAction !== ref.awayAction
    ) {
      logger.error('Game order mismatch', {
        gameNumber: i + 1,
        generated: gen,
        expected: ref
      });
      return false;
    }
  }

  return true;
}
