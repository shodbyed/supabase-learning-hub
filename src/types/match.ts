/**
 * @fileoverview Match and Scoring-related type definitions
 * Types for match scoring, lineups, games, and handicaps
 */

import type { HandicapVariant } from '@/utils/handicapCalculations';

/**
 * Match type - determines format and scoring rules
 */
export type MatchType = '3v3' | 'tiebreaker' | '5v5';

/**
 * Basic match information with team details (scoring context)
 * Simplified version of full Match record from schedule.ts
 * Contains only fields needed for scoring pages
 */
export interface MatchBasic {
  id: string;
  season_id: string;
  home_team_id: string;
  away_team_id: string;
  home_team: {
    id: string;
    team_name: string;
  } | null;
  away_team: {
    id: string;
    team_name: string;
  } | null;
}

/**
 * Match with league settings for scoring
 * Includes handicap variants and game rules needed for scoring
 */
export interface MatchWithLeagueSettings {
  id: string;
  season_id: string;
  home_team_id: string;
  away_team_id: string;
  home_team_verified_by?: string | null;
  away_team_verified_by?: string | null;
  home_team: {
    id: string;
    team_name: string;
  };
  away_team: {
    id: string;
    team_name: string;
  };
  league: {
    handicap_variant: HandicapVariant;
    team_handicap_variant: HandicapVariant;
    golden_break_counts_as_win: boolean;
    game_type: string;
  };
}

/**
 * Match lineup for a team
 * Supports 3v3 format with player positions and handicaps
 */
export interface Lineup {
  id: string;
  team_id: string;
  player1_id: string | null;
  player1_handicap: number;
  player2_id: string | null;
  player2_handicap: number;
  player3_id: string | null;
  player3_handicap: number;
  player4_id?: string | null; // 5v5 only
  player4_handicap?: number | null; // 5v5 only
  player5_id?: string | null; // 5v5 only
  player5_handicap?: number | null; // 5v5 only
  home_team_modifier: number; // Team standings modifier (bonus/penalty)
  locked: boolean;
  locked_at: string | null; // ISO timestamp when lineup was locked
}

/**
 * Player information for match scoring
 */
export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
}

/**
 * Handicap thresholds for determining match outcome
 * Based on handicap difference between teams
 */
export interface HandicapThresholds {
  games_to_win: number;
  games_to_tie: number | null;
  games_to_lose: number;
}

/**
 * Static thresholds for tiebreaker matches
 * Tiebreaker is always best of 3 (first to 2 games wins)
 */
export const TIEBREAKER_THRESHOLDS: HandicapThresholds = {
  games_to_win: 2,
  games_to_tie: null,
  games_to_lose: 1,
};

/**
 * Individual game result within a match
 */
export interface MatchGame {
  id: string;
  game_number: number;
  home_player_id: string | null;
  away_player_id: string | null;
  winner_team_id: string | null;
  winner_player_id: string | null;
  home_action: 'breaks' | 'racks';
  away_action: 'breaks' | 'racks';
  break_and_run: boolean;
  golden_break: boolean;
  confirmed_by_home: boolean;
  confirmed_by_away: boolean;
}

/**
 * Scoring options for a game
 */
export interface ScoringOptions {
  breakAndRun?: boolean;
  goldenBreak?: boolean;
}

/**
 * Confirmation queue item for opponent score verification
 */
export interface ConfirmationQueueItem {
  gameNumber: number;
  winnerPlayerName: string;
  breakAndRun: boolean;
  goldenBreak: boolean;
  isVacateRequest?: boolean;
}

/**
 * Team statistics result
 */
export interface TeamStats {
  wins: number;
  losses: number;
}

/**
 * Get team statistics (wins/losses) from confirmed games
 *
 * Counts only fully confirmed games (confirmed by both home and away teams).
 *
 * @param teamId - Team's ID to get stats for
 * @param gameResults - Map of game numbers to game results
 * @returns Object with wins and losses count
 *
 * @example
 * const stats = getTeamStats('team-123', gamesMap);
 * console.log(`Team has ${stats.wins} wins and ${stats.losses} losses`);
 */
export function getTeamStats(
  teamId: string,
  gameResults: Map<number, MatchGame>
): TeamStats {
  let wins = 0;
  let losses = 0;

  gameResults.forEach(game => {
    // Only count confirmed games
    if (!game.confirmed_by_home || !game.confirmed_by_away) return;

    if (game.winner_team_id === teamId) {
      wins++;
    } else if (game.winner_team_id) {
      // Game has a winner and it's not this team
      losses++;
    }
  });

  return { wins, losses };
}

/**
 * Player statistics result
 */
export interface PlayerStats {
  wins: number;
  losses: number;
}

/**
 * Get player statistics (wins/losses) from confirmed games
 *
 * Counts only fully confirmed games. Player gets a loss if they were in the game but didn't win.
 *
 * @param playerId - Player's ID to get stats for
 * @param gameResults - Map of game numbers to game results
 * @returns Object with wins and losses count
 *
 * @example
 * const stats = getPlayerStats('player-123', gamesMap);
 * console.log(`Player has ${stats.wins} wins and ${stats.losses} losses`);
 */
export function getPlayerStats(
  playerId: string,
  gameResults: Map<number, MatchGame>
): PlayerStats {
  let wins = 0;
  let losses = 0;

  gameResults.forEach(game => {
    // Only count confirmed games
    if (!game.confirmed_by_home || !game.confirmed_by_away) return;

    if (game.winner_player_id === playerId) {
      wins++;
    } else if (game.home_player_id === playerId || game.away_player_id === playerId) {
      // Player was in this game but didn't win
      losses++;
    }
  });

  return { wins, losses };
}

/**
 * Count completed games (confirmed by both teams)
 *
 * Only counts games that are fully confirmed (both home and away have confirmed).
 *
 * @param gameResults - Map of game numbers to game results
 * @returns Number of completed games
 *
 * @example
 * const completedCount = getCompletedGamesCount(gamesMap);
 * console.log(`${completedCount} games completed`);
 */
export function getCompletedGamesCount(gameResults: Map<number, MatchGame>): number {
  let count = 0;
  gameResults.forEach(game => {
    if (game.confirmed_by_home && game.confirmed_by_away) {
      count++;
    }
  });
  return count;
}

/**
 * Calculate current points for a team
 *
 * Formula: games_won - (games_to_tie ?? games_to_win)
 * Points indicate how many games above/below the threshold a team is.
 *
 * @param teamId - Team's ID to calculate points for
 * @param thresholds - Handicap thresholds (win/tie/lose game counts)
 * @param gameResults - Map of game numbers to game results
 * @returns Point differential (positive = winning, negative = losing)
 *
 * @example
 * const points = calculatePoints('team-123', { games_to_win: 5, games_to_tie: null, games_to_lose: 0 }, gamesMap);
 * console.log(`Team is ${points} points ${points >= 0 ? 'ahead' : 'behind'}`);
 */
export function calculatePoints(
  teamId: string,
  thresholds: HandicapThresholds | null,
  gameResults: Map<number, MatchGame>
): number {
  if (!thresholds) return 0;
  const { wins } = getTeamStats(teamId, gameResults);
  const baseline = thresholds.games_to_tie ?? thresholds.games_to_win;
  return wins - baseline;
}
