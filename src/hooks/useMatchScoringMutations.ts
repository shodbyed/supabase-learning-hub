/**
 * @fileoverview Match Scoring Mutations Hook
 *
 * Centralized mutations for match scoring operations.
 * Handles all database updates for scoring, confirming, and denying game results.
 *
 * Mutations included:
 * - handlePlayerClick: Logic for clicking a player to score
 * - confirmOpponentScore: Confirm or accept vacate request
 * - denyOpponentScore: Deny score or vacate request
 * - handleConfirmScore: Save new game score to database
 */

import { useCallback } from 'react';
import { supabase } from '@/supabaseClient';
import { getAllGames } from '@/utils/gameOrder';
import type { Lineup } from '@/types/match';

interface UseMatchScoringMutationsParams {
  /** Current match data */
  match: {
    id: string;
    home_team_id: string;
    away_team_id: string;
  } | null;
  /** Map of game results by game number */
  gameResults: Map<
    number,
    {
      id: string;
      winner_player_id: string | null;
      winner_team_id: string | null;
      confirmed_by_home: boolean;
      confirmed_by_away: boolean;
      break_and_run: boolean;
      golden_break: boolean;
    }
  >;
  /** Home team lineup */
  homeLineup: Lineup | null;
  /** Away team lineup */
  awayLineup: Lineup | null;
  /** Current user's team ID */
  userTeamId: string | null;
  /** Auto-confirm setting (skip confirmation modal) */
  autoConfirm: boolean;
  /** Add confirmation to queue */
  addToConfirmationQueue: (confirmation: {
    gameNumber: number;
    winnerPlayerName: string;
    breakAndRun: boolean;
    goldenBreak: boolean;
  }) => void;
  /** Get player display name by ID */
  getPlayerDisplayName: (playerId: string) => string;
}

/**
 * Custom hook for match scoring mutations
 *
 * Returns mutation functions for scoring operations.
 * All functions handle database updates and error handling.
 * Real-time subscription automatically refreshes data after mutations.
 */
export function useMatchScoringMutations({
  match,
  gameResults,
  homeLineup,
  awayLineup,
  userTeamId,
  autoConfirm,
  addToConfirmationQueue,
  getPlayerDisplayName,
}: UseMatchScoringMutationsParams) {
  /**
   * Handle player button click to score a game
   *
   * Determines if game needs confirmation or can be scored directly.
   * Opens appropriate modal based on game state.
   */
  const handlePlayerClick = useCallback(
    (
      gameNumber: number,
      playerId: string,
      playerName: string,
      teamId: string,
      onOpenScoringModal: (game: {
        gameNumber: number;
        winnerTeamId: string;
        winnerPlayerId: string;
        winnerPlayerName: string;
      }) => void,
      confirmOpponentScoreFn: (gameNumber: number) => void
    ) => {
      if (!match) return;

      // Check if game already has a result
      const existingGame = gameResults.get(gameNumber);

      // If game has a winner and is waiting for opponent confirmation
      if (
        existingGame &&
        existingGame.winner_player_id &&
        (!existingGame.confirmed_by_home || !existingGame.confirmed_by_away)
      ) {
        // Determine if this is the opponent team
        const isHomeTeam = userTeamId === match.home_team_id;
        const needsMyConfirmation = isHomeTeam
          ? !existingGame.confirmed_by_home
          : !existingGame.confirmed_by_away;
        const alreadyConfirmedByMe = isHomeTeam
          ? existingGame.confirmed_by_home
          : existingGame.confirmed_by_away;

        if (needsMyConfirmation) {
          // If auto-confirm is enabled, automatically confirm without showing modal
          if (autoConfirm) {
            confirmOpponentScoreFn(gameNumber);
            return;
          }

          // Add to confirmation queue (will show immediately or queue if modal is open)
          addToConfirmationQueue({
            gameNumber,
            winnerPlayerName: getPlayerDisplayName(existingGame.winner_player_id),
            breakAndRun: existingGame.break_and_run,
            goldenBreak: existingGame.golden_break,
          });
          return;
        }

        if (alreadyConfirmedByMe) {
          // This team already confirmed, waiting for opponent - don't allow re-clicking
          console.log(
            'You already confirmed this game. Waiting for opponent to confirm.'
          );
          return;
        }
      }

      if (
        existingGame &&
        existingGame.confirmed_by_home &&
        existingGame.confirmed_by_away
      ) {
        // Game already confirmed by both teams, don't allow changes
        alert(
          'This game has already been confirmed by both teams. Use the Edit button to change it.'
        );
        return;
      }

      // Open confirmation modal to score new game
      onOpenScoringModal({
        gameNumber,
        winnerTeamId: teamId,
        winnerPlayerId: playerId,
        winnerPlayerName: playerName,
      });
    },
    [match, gameResults, userTeamId, autoConfirm, addToConfirmationQueue, getPlayerDisplayName]
  );

  /**
   * Confirm opponent's score or accept vacate request
   *
   * @param gameNumber - Game number to confirm
   * @param isVacateRequest - True if confirming a vacate request
   */
  const confirmOpponentScore = useCallback(
    async (gameNumber: number, isVacateRequest?: boolean) => {
      if (!match) return;

      const existingGame = gameResults.get(gameNumber);
      if (!existingGame) return;

      try {
        const isHomeTeam = userTeamId === match.home_team_id;

        if (isVacateRequest) {
          // For vacate requests, clear the game entirely (accept the vacate)
          const { error } = await supabase
            .from('match_games')
            .update({
              winner_team_id: null,
              winner_player_id: null,
              break_and_run: false,
              golden_break: false,
              confirmed_by_home: false,
              confirmed_by_away: false,
            })
            .eq('id', existingGame.id);

          if (error) throw error;
        } else {
          // Normal score confirmation - only update OUR confirmation, don't touch opponent's
          const updateData = isHomeTeam
            ? { confirmed_by_home: true }
            : { confirmed_by_away: true };

          const { error } = await supabase
            .from('match_games')
            .update(updateData)
            .eq('id', existingGame.id);

          if (error) throw error;
        }

        // Note: Real-time subscription will automatically refresh game results
      } catch (err: any) {
        console.error('Error confirming game:', err);
        alert(`Failed to confirm game: ${err.message}`);
      }
    },
    [match, userTeamId, gameResults]
  );

  /**
   * Deny opponent's score or vacate request
   *
   * @param gameNumber - Game number to deny
   * @param isVacateRequest - True if denying a vacate request
   */
  const denyOpponentScore = useCallback(
    async (gameNumber: number, isVacateRequest?: boolean) => {
      if (!match) return;

      const existingGame = gameResults.get(gameNumber);
      if (!existingGame) return;

      try {
        if (isVacateRequest) {
          // Deny vacate request: restore both confirmations to keep the winner locked
          const { error } = await supabase
            .from('match_games')
            .update({
              confirmed_by_home: true,
              confirmed_by_away: true,
            })
            .eq('id', existingGame.id);

          if (error) throw error;
        } else {
          // Deny normal score: reset the game back to unscored state
          const { error } = await supabase
            .from('match_games')
            .update({
              winner_team_id: null,
              winner_player_id: null,
              break_and_run: false,
              golden_break: false,
              confirmed_by_home: false,
              confirmed_by_away: false,
              confirmed_at: null,
            })
            .eq('id', existingGame.id);

          if (error) throw error;
        }

        // Game results will be automatically refreshed by real-time subscription
        console.log('Game denied and reset to unscored');
      } catch (err: any) {
        console.error('Error denying game:', err);
        alert(`Failed to deny game: ${err.message}`);
      }
    },
    [match, gameResults]
  );

  /**
   * Confirm game score and save to database
   *
   * Handles both insert (new game) and update (existing game).
   * Validates mutual exclusivity of Break & Run and Golden Break.
   */
  const handleConfirmScore = useCallback(
    async (
      scoringGame: {
        gameNumber: number;
        winnerTeamId: string;
        winnerPlayerId: string;
        winnerPlayerName: string;
      },
      breakAndRun: boolean,
      goldenBreak: boolean,
      onSuccess: () => void
    ) => {
      if (!scoringGame || !match || !homeLineup || !awayLineup) return;

      try {
        // Determine if this is home or away team confirming (based on WHO is scoring, not who won)
        const isHomeTeamScoring = userTeamId === match.home_team_id;

        // Check for mutual exclusivity of B&R and golden break
        if (breakAndRun && goldenBreak) {
          alert('A game cannot have both Break & Run and Golden Break.');
          return;
        }

        // Get game definition from game order
        const gameDefinition = getAllGames().find(
          (g) => g.gameNumber === scoringGame.gameNumber
        );
        if (!gameDefinition) {
          alert('Invalid game number');
          return;
        }

        // Get player IDs from lineups
        const homePlayerId = homeLineup[
          `player${gameDefinition.homePlayerPosition}_id` as keyof Lineup
        ] as string;
        const awayPlayerId = awayLineup[
          `player${gameDefinition.awayPlayerPosition}_id` as keyof Lineup
        ] as string;

        // Prepare game data
        const gameData = {
          match_id: match.id,
          game_number: scoringGame.gameNumber,
          home_player_id: homePlayerId,
          away_player_id: awayPlayerId,
          home_action: gameDefinition.homeAction,
          away_action: gameDefinition.awayAction,
          winner_team_id: scoringGame.winnerTeamId,
          winner_player_id: scoringGame.winnerPlayerId,
          break_and_run: breakAndRun,
          golden_break: goldenBreak,
          confirmed_by_home: isHomeTeamScoring,
          confirmed_by_away: !isHomeTeamScoring,
        };

        // Check if game already exists
        const existingGame = gameResults.get(scoringGame.gameNumber);

        console.log('Saving game score:', gameData);
        console.log('Existing game:', existingGame);

        if (existingGame) {
          // Update existing game
          const updateData = {
            winner_team_id: gameData.winner_team_id,
            winner_player_id: gameData.winner_player_id,
            break_and_run: gameData.break_and_run,
            golden_break: gameData.golden_break,
            confirmed_by_home: isHomeTeamScoring
              ? true
              : existingGame.confirmed_by_home,
            confirmed_by_away: !isHomeTeamScoring
              ? true
              : existingGame.confirmed_by_away,
          };

          console.log('Updating game with:', updateData);
          console.log('Updating game ID:', existingGame.id);

          const { data, error, count } = await supabase
            .from('match_games')
            .update(updateData)
            .eq('id', existingGame.id)
            .select();

          console.log('Update result - data:', data);
          console.log('Update result - count:', count);
          console.log('Update result - error:', error);

          if (error) {
            console.error('Update error:', error);
            throw error;
          }

          if (!data || data.length === 0) {
            console.error(
              'No rows updated - possible RLS policy blocking update'
            );
            alert(
              'Failed to update game. You may not have permission to score for this team.'
            );
            return;
          }

          console.log('Game updated successfully');
        } else {
          // Insert new game
          const { error } = await supabase.from('match_games').insert(gameData);

          if (error) throw error;
        }

        // Note: Real-time subscription will automatically refresh game results

        // Close modal and reset state
        onSuccess();
      } catch (err: any) {
        console.error('Error saving game score:', err);
        alert(`Failed to save game score: ${err.message}`);
      }
    },
    [match, homeLineup, awayLineup, userTeamId, gameResults]
  );

  return {
    handlePlayerClick,
    confirmOpponentScore,
    denyOpponentScore,
    handleConfirmScore,
  };
}
