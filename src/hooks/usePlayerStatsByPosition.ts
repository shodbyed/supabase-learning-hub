/**
 * @fileoverview Utility for Player Stats by Position
 *
 * Gets win/loss stats for a player in a specific lineup position.
 * Used in 5v5 scoreboard to show correct stats for double duty players.
 *
 * When a player appears in multiple positions (5v5 double duty),
 * this function ensures each position shows only the games played from that position.
 *
 * @example
 * // Player A is in position 2 and position 4 (double duty)
 * getPlayerStatsByPosition(playerA_id, 2, true, games) // Returns wins/losses for position 2 only
 * getPlayerStatsByPosition(playerA_id, 4, true, games) // Returns wins/losses for position 4 only
 */

import type { MatchGame } from '@/types/match';

export interface PlayerStatsByPosition {
  wins: number;
  losses: number;
}

/**
 * Get player stats filtered by lineup position
 *
 * Counts wins and losses for games where the player was in a specific position.
 * Only counts confirmed games (both teams have confirmed).
 *
 * @param playerId - Player's member ID
 * @param position - Lineup position (1-5)
 * @param isHomeTeam - Whether this player is on home team
 * @param gameResults - Map of game numbers to game results
 * @returns Object with wins and losses count for this position
 */
export function getPlayerStatsByPosition(
  playerId: string,
  position: number,
  isHomeTeam: boolean,
  gameResults: Map<number, MatchGame>
): PlayerStatsByPosition {
  let wins = 0;
  let losses = 0;

  gameResults.forEach(game => {
    // Only count confirmed games
    if (!game.confirmed_by_home || !game.confirmed_by_away) return;

    // Check if this game involves this player in this position
    const isPlayerInPosition = isHomeTeam
      ? game.home_player_id === playerId && game.home_position === position
      : game.away_player_id === playerId && game.away_position === position;

    if (!isPlayerInPosition) return;

    // Count win or loss
    if (game.winner_player_id === playerId) {
      wins++;
    } else {
      losses++;
    }
  });

  return { wins, losses };
}
