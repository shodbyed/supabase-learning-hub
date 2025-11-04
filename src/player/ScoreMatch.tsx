/**
 * @fileoverview Score Match Page - 3v3 Match Scoring
 *
 * Mobile-first scoring page for 3v3 pool league matches.
 * Displays compact scoreboard with swipe navigation between teams.
 * Allows players to score games, confirm results, and track match progress.
 *
 * Flow: Lineup Entry → Score Match → (Tiebreaker if needed)
 *
 * Features:
 * - Compact scoreboard (top 1/3 of screen) with swipe left/right
 * - 18-game scoring with real-time updates
 * - Confirmation flow (both teams must agree)
 * - Break & Run (B&R) and Golden Break (8BB) tracking
 * - Match end detection with winner announcement
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrentMember } from '@/api/hooks';
import { getAllGames } from '@/utils/gameOrder';
import type { Lineup } from '@/types/match';
import {
  getPlayerStats,
  getTeamStats,
  getCompletedGamesCount,
  calculatePoints,
} from '@/types/match';
import { useMatchScoring } from '@/hooks/useMatchScoring';
import { ScoringDialog } from '@/components/scoring/ScoringDialog';
import { ConfirmationDialog } from '@/components/scoring/ConfirmationDialog';
import { EditGameDialog } from '@/components/scoring/EditGameDialog';

export function ScoreMatch() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { data: member } = useCurrentMember();
  const memberId = member?.id;

  // Use central scoring hook (replaces all manual data fetching)
  const {
    match,
    homeLineup,
    awayLineup,
    gameResults,
    homeTeamHandicap,
    homeThresholds,
    awayThresholds,
    userTeamId,
    isHomeTeam,
    goldenBreakCountsAsWin,
    gameType,
    getPlayerDisplayName: getPlayerDisplayNameFromHook,
    confirmationQueue,
    addToConfirmationQueue: addToConfirmationQueueFromHook,
    removeFromConfirmationQueue,
    myVacateRequests,
    loading,
    error,
  } = useMatchScoring({
    matchId,
    memberId,
    matchType: '3v3',
  });

  // Scoring modal state
  const [scoringGame, setScoringGame] = useState<{
    gameNumber: number;
    winnerTeamId: string;
    winnerPlayerId: string;
    winnerPlayerName: string;
  } | null>(null);
  const [breakAndRun, setBreakAndRun] = useState(false);
  const [goldenBreak, setGoldenBreak] = useState(false);

  // Opponent confirmation modal state
  const [confirmationGame, setConfirmationGame] = useState<{
    gameNumber: number;
    winnerPlayerName: string;
    breakAndRun: boolean;
    goldenBreak: boolean;
    isResetRequest?: boolean; // True if this is a request to reset the game
  } | null>(null);

  // Edit game modal state
  const [editingGame, setEditingGame] = useState<{
    gameNumber: number;
    currentWinnerName: string;
  } | null>(null);

  // Scoreboard view toggle (true = home team, false = away team)
  const [showingHomeTeam, setShowingHomeTeam] = useState(true);

  // Auto-confirm setting (bypass confirmation modal)
  const [autoConfirm, setAutoConfirm] = useState(false);

  // Process confirmation queue when modal closes or queue changes
  useEffect(() => {
    // Only process queue when modal is closed
    if (!confirmationGame && confirmationQueue.length > 0) {
      console.log(
        'Modal closed, processing queue. Queue length:',
        confirmationQueue.length
      );
      const nextConfirmation = confirmationQueue[0];
      console.log('Showing game', nextConfirmation.gameNumber, 'from queue');

      // Add delay to allow Dialog component to clean up properly
      // This prevents the grey screen overlay issue
      setTimeout(() => {
        setConfirmationGame(nextConfirmation);
        removeFromConfirmationQueue(); // Remove first item from queue
      }, 1000);
    }
  }, [confirmationGame, confirmationQueue, removeFromConfirmationQueue]); // Watch both - but queue updates won't replace modal

  // Set showing home team based on user's team (from hook)
  useEffect(() => {
    if (isHomeTeam !== null) {
      setShowingHomeTeam(isHomeTeam);
    }
  }, [isHomeTeam]);


  /**
   * Get display name for a player (nickname or first name)
   * Uses function from useMatchScoring hook
   */
  const getPlayerDisplayName = getPlayerDisplayNameFromHook;

  /**
   * Add to confirmation queue (from useMatchScoring hook)
   */
  const addToConfirmationQueue = addToConfirmationQueueFromHook;

  /**
   * Handle player button click to score a game
   */
  const handlePlayerClick = (
    gameNumber: number,
    playerId: string,
    playerName: string,
    teamId: string
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
          confirmOpponentScore(gameNumber);
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
    setScoringGame({
      gameNumber,
      winnerTeamId: teamId,
      winnerPlayerId: playerId,
      winnerPlayerName: playerName,
    });
    setBreakAndRun(false);
    setGoldenBreak(false);
  };

  /**
   * Confirm opponent's score
   */
  const confirmOpponentScore = useCallback(async (
    gameNumber: number,
    isVacateRequest?: boolean
  ) => {
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
  }, [match, userTeamId]);

  // Real-time subscription is now handled by useMatchScoring hook

  /**
   * Deny opponent's score OR vacate request
   */
  const denyOpponentScore = async (
    gameNumber: number,
    isVacateRequest?: boolean
  ) => {
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
  };

  /**
   * Confirm game score and save to database
   */
  const handleConfirmScore = async () => {
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

      // Close modal
      setScoringGame(null);
      setBreakAndRun(false);
      setGoldenBreak(false);
    } catch (err: any) {
      console.error('Error saving game score:', err);
      alert(`Failed to save game score: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700">
            Loading match...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600 mb-2">
                Error
              </div>
              <div className="text-gray-700 mb-4">{error}</div>
              <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (
    !match ||
    !homeLineup ||
    !awayLineup ||
    !homeThresholds ||
    !awayThresholds
  ) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Scoreboard - Fixed at top */}
      <div className="bg-white border-b shadow-sm flex-shrink-0">
        <div className="px-4 py-2">
          {/* Team selector buttons */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-4">
            <Button
              variant={showingHomeTeam ? 'default' : 'outline'}
              onClick={() => setShowingHomeTeam(true)}
            >
              {match.home_team?.team_name}
            </Button>
            <div className="text-sm text-gray-500 font-semibold px-2">vs</div>
            <Button
              variant={!showingHomeTeam ? 'default' : 'outline'}
              onClick={() => setShowingHomeTeam(false)}
            >
              {match.away_team?.team_name}
            </Button>
          </div>

          {/* Team scoreboard (shows one team at a time) */}
          {showingHomeTeam ? (
            <div className="space-y-2">
              <div className="flex flex-col items-center mb-2">
                <div className="text-center font-bold text-lg">HOME</div>
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoConfirm}
                    onChange={(e) => setAutoConfirm(e.target.checked)}
                    className="w-3 h-3"
                  />
                  Auto-confirm opponent scores
                </label>
              </div>
              {/* Two-column layout: Player stats and match stats */}
              <div className="grid grid-cols-[55%_45%] gap-2">
                {/* Player stats table */}
                <div className="border border-gray-300 rounded bg-blue-50">
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-xs font-semibold border-b border-gray-300 p-1">
                    <div className="text-center">H/C</div>
                    <div>Name</div>
                    <div className="text-center">W</div>
                    <div className="text-center">L</div>
                  </div>
                  {/* Team row */}
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1 font-semibold border-b border-gray-300">
                    <div className="text-center">{homeTeamHandicap}</div>
                    <div className="truncate">Team</div>
                    <div className="text-center">
                      {getTeamStats(match.home_team_id, gameResults).wins}
                    </div>
                    <div className="text-center">
                      {getTeamStats(match.home_team_id, gameResults).losses}
                    </div>
                  </div>
                  {/* Player rows */}
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">
                      {homeLineup.player1_handicap}
                    </div>
                    <div className="truncate">
                      {getPlayerDisplayName(homeLineup.player1_id)}
                    </div>
                    <div className="text-center">
                      {homeLineup.player1_id
                        ? getPlayerStats(homeLineup.player1_id, gameResults).wins
                        : 0}
                    </div>
                    <div className="text-center">
                      {homeLineup.player1_id
                        ? getPlayerStats(homeLineup.player1_id, gameResults).losses
                        : 0}
                    </div>
                  </div>
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">
                      {homeLineup.player2_handicap}
                    </div>
                    <div className="truncate">
                      {getPlayerDisplayName(homeLineup.player2_id)}
                    </div>
                    <div className="text-center">
                      {homeLineup.player2_id
                        ? getPlayerStats(homeLineup.player2_id, gameResults).wins
                        : 0}
                    </div>
                    <div className="text-center">
                      {homeLineup.player2_id
                        ? getPlayerStats(homeLineup.player2_id, gameResults).losses
                        : 0}
                    </div>
                  </div>
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">
                      {homeLineup.player3_handicap}
                    </div>
                    <div className="truncate">
                      {getPlayerDisplayName(homeLineup.player3_id)}
                    </div>
                    <div className="text-center">
                      {homeLineup.player3_id
                        ? getPlayerStats(homeLineup.player3_id, gameResults).wins
                        : 0}
                    </div>
                    <div className="text-center">
                      {homeLineup.player3_id
                        ? getPlayerStats(homeLineup.player3_id, gameResults).losses
                        : 0}
                    </div>
                  </div>
                </div>

                {/* Match stats card */}
                <div className="border border-gray-300 rounded p-2 bg-blue-50">
                  <div className="flex justify-around text-xs mb-2">
                    <div className="text-center">
                      <div className="text-gray-500">To Win</div>
                      <div className="font-semibold text-lg">
                        {homeThresholds.games_to_win}
                      </div>
                    </div>
                    {homeThresholds.games_to_tie !== null && (
                      <div className="text-center">
                        <div className="text-gray-500">To Tie</div>
                        <div className="font-semibold text-lg">
                          {homeThresholds.games_to_tie}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-center text-4xl font-bold mt-4">
                    {getTeamStats(match.home_team_id, gameResults).wins} /{' '}
                    {homeThresholds.games_to_win}
                  </div>
                  <div className="text-center text-sm mt-2">
                    Points -{' '}
                    {calculatePoints(match.home_team_id, homeThresholds, gameResults)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-col items-center mb-2">
                <div className="text-center font-bold text-lg">AWAY</div>
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoConfirm}
                    onChange={(e) => setAutoConfirm(e.target.checked)}
                    className="w-3 h-3"
                  />
                  Auto-confirm opponent scores
                </label>
              </div>
              {/* Two-column layout: Player stats and match stats */}
              <div className="grid grid-cols-[55%_45%] gap-2">
                {/* Player stats table */}
                <div className="border border-gray-300 rounded bg-orange-50">
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-xs font-semibold border-b border-gray-300 p-1">
                    <div className="text-center">H/C</div>
                    <div>Name</div>
                    <div className="text-center">W</div>
                    <div className="text-center">L</div>
                  </div>
                  {/* Team row */}
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1 font-semibold border-b border-gray-300">
                    <div className="text-center">0</div>
                    <div className="truncate">Team</div>
                    <div className="text-center">
                      {getTeamStats(match.away_team_id, gameResults).wins}
                    </div>
                    <div className="text-center">
                      {getTeamStats(match.away_team_id, gameResults).losses}
                    </div>
                  </div>
                  {/* Player rows */}
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">
                      {awayLineup.player1_handicap}
                    </div>
                    <div className="truncate">
                      {getPlayerDisplayName(awayLineup.player1_id)}
                    </div>
                    <div className="text-center">
                      {awayLineup.player1_id
                        ? getPlayerStats(awayLineup.player1_id, gameResults).wins
                        : 0}
                    </div>
                    <div className="text-center">
                      {awayLineup.player1_id
                        ? getPlayerStats(awayLineup.player1_id, gameResults).losses
                        : 0}
                    </div>
                  </div>
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">
                      {awayLineup.player2_handicap}
                    </div>
                    <div className="truncate">
                      {getPlayerDisplayName(awayLineup.player2_id)}
                    </div>
                    <div className="text-center">
                      {awayLineup.player2_id
                        ? getPlayerStats(awayLineup.player2_id, gameResults).wins
                        : 0}
                    </div>
                    <div className="text-center">
                      {awayLineup.player2_id
                        ? getPlayerStats(awayLineup.player2_id, gameResults).losses
                        : 0}
                    </div>
                  </div>
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">
                      {awayLineup.player3_handicap}
                    </div>
                    <div className="truncate">
                      {getPlayerDisplayName(awayLineup.player3_id)}
                    </div>
                    <div className="text-center">
                      {awayLineup.player3_id
                        ? getPlayerStats(awayLineup.player3_id, gameResults).wins
                        : 0}
                    </div>
                    <div className="text-center">
                      {awayLineup.player3_id
                        ? getPlayerStats(awayLineup.player3_id, gameResults).losses
                        : 0}
                    </div>
                  </div>
                </div>

                {/* Match stats card */}
                <div className="border border-gray-300 rounded p-2 bg-orange-50">
                  <div className="flex justify-around text-xs mb-2">
                    <div className="text-center">
                      <div className="text-gray-500">To Win</div>
                      <div className="font-semibold text-lg">
                        {awayThresholds.games_to_win}
                      </div>
                    </div>
                    {awayThresholds.games_to_tie !== null && (
                      <div className="text-center">
                        <div className="text-gray-500">To Tie</div>
                        <div className="font-semibold text-lg">
                          {awayThresholds.games_to_tie}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-center text-4xl font-bold mt-4">
                    {getTeamStats(match.away_team_id, gameResults).wins} /{' '}
                    {awayThresholds.games_to_win}
                  </div>
                  <div className="text-center text-sm mt-2">
                    Points -{' '}
                    {calculatePoints(match.away_team_id, awayThresholds, gameResults)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game list section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed header */}
        <div className="flex-shrink-0 px-4 pt-4 pb-2 bg-gray-50">
          <div className="text-sm font-semibold mb-4">
            Games Complete -{' '}
            <span className="text-lg">{getCompletedGamesCount(gameResults)} / 18</span>
          </div>
          {/* Column headers */}
          <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-xs text-gray-500 pb-2">
            <div></div>
            <div className="text-center">Break</div>
            <div className="text-center font-semibold">vs</div>
            <div className="text-center">Rack</div>
          </div>
        </div>

        {/* Scrollable game list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            {getAllGames().map((game) => {
              const homePlayerId = homeLineup[
                `player${game.homePlayerPosition}_id` as keyof Lineup
              ] as string;
              const awayPlayerId = awayLineup[
                `player${game.awayPlayerPosition}_id` as keyof Lineup
              ] as string;
              const homePlayerName = getPlayerDisplayName(homePlayerId);
              const awayPlayerName = getPlayerDisplayName(awayPlayerId);

              // Determine who breaks and who racks, and which team they're from
              const breakerName =
                game.homeAction === 'breaks' ? homePlayerName : awayPlayerName;
              const breakerPlayerId =
                game.homeAction === 'breaks' ? homePlayerId : awayPlayerId;
              const breakerTeamId =
                game.homeAction === 'breaks'
                  ? match.home_team_id
                  : match.away_team_id;

              const rackerName =
                game.homeAction === 'racks' ? homePlayerName : awayPlayerName;
              const rackerPlayerId =
                game.homeAction === 'racks' ? homePlayerId : awayPlayerId;
              const rackerTeamId =
                game.homeAction === 'racks'
                  ? match.home_team_id
                  : match.away_team_id;

              const breakerIsHome = game.homeAction === 'breaks';
              const rackerIsHome = game.homeAction === 'racks';

              // Check game status
              const gameResult = gameResults.get(game.gameNumber);
              const hasWinner = gameResult && gameResult.winner_player_id;
              const isConfirmed =
                gameResult &&
                gameResult.confirmed_by_home &&
                gameResult.confirmed_by_away;
              const isPending = hasWinner && !isConfirmed;

              // If game has a winner (pending or confirmed)
              if (hasWinner) {
                const breakerWon =
                  gameResult.winner_player_id === breakerPlayerId;
                const rackerWon =
                  gameResult.winner_player_id === rackerPlayerId;

                // Determine styling based on confirmation status
                const winnerClass = isConfirmed
                  ? 'bg-green-200 font-semibold'
                  : 'bg-yellow-100 font-semibold';
                const loserClass = 'bg-white text-gray-500';

                // If pending, show buttons with NO trophy, NO Edit button - just colored backgrounds
                if (isPending) {
                  return (
                    <div
                      key={game.gameNumber}
                      className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-sm py-2 border-b"
                    >
                      <div className="font-semibold">{game.gameNumber}.</div>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`w-full ${
                          breakerWon ? winnerClass : loserClass
                        }`}
                        onClick={() =>
                          handlePlayerClick(
                            game.gameNumber,
                            breakerPlayerId,
                            breakerName,
                            breakerTeamId
                          )
                        }
                      >
                        {breakerName}
                      </Button>
                      <div className="text-center font-semibold text-gray-400">
                        vs
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`w-full ${
                          rackerWon ? winnerClass : loserClass
                        }`}
                        onClick={() =>
                          handlePlayerClick(
                            game.gameNumber,
                            rackerPlayerId,
                            rackerName,
                            rackerTeamId
                          )
                        }
                      >
                        {rackerName}
                      </Button>
                    </div>
                  );
                }

                // If confirmed, show divs with trophy on winner and Edit button in middle
                return (
                  <div
                    key={game.gameNumber}
                    className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-sm py-2 border-b"
                  >
                    <div className="font-semibold">{game.gameNumber}.</div>
                    <div
                      className={`text-center p-2 rounded ${
                        breakerWon ? winnerClass : loserClass
                      }`}
                    >
                      {breakerWon && <span className="mr-1">🏆</span>}
                      {breakerName}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-1"
                      onClick={() => {
                        setEditingGame({
                          gameNumber: game.gameNumber,
                          currentWinnerName: breakerWon
                            ? breakerName
                            : rackerName,
                        });
                      }}
                    >
                      Vacate
                    </Button>
                    <div
                      className={`text-center p-2 rounded ${
                        rackerWon ? winnerClass : loserClass
                      }`}
                    >
                      {rackerWon && <span className="mr-1">🏆</span>}
                      {rackerName}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={game.gameNumber}
                  className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-sm py-2 border-b"
                >
                  <div className="font-semibold">{game.gameNumber}.</div>
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full ${
                        breakerIsHome
                          ? 'bg-blue-100 hover:bg-blue-200'
                          : 'bg-orange-100 hover:bg-orange-200'
                      }`}
                      onClick={() =>
                        handlePlayerClick(
                          game.gameNumber,
                          breakerPlayerId,
                          breakerName,
                          breakerTeamId
                        )
                      }
                    >
                      {breakerName}
                    </Button>
                  </div>
                  <div className="text-center font-semibold text-gray-400">
                    vs
                  </div>
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full ${
                        rackerIsHome
                          ? 'bg-blue-100 hover:bg-blue-200'
                          : 'bg-orange-100 hover:bg-orange-200'
                      }`}
                      onClick={() =>
                        handlePlayerClick(
                          game.gameNumber,
                          rackerPlayerId,
                          rackerName,
                          rackerTeamId
                        )
                      }
                    >
                      {rackerName}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Win Confirmation Modal */}
      <ScoringDialog
        open={scoringGame !== null}
        game={scoringGame}
        breakAndRun={breakAndRun}
        goldenBreak={goldenBreak}
        goldenBreakCountsAsWin={goldenBreakCountsAsWin}
        gameType={gameType}
        onBreakAndRunChange={(checked) => {
          setBreakAndRun(checked);
          if (checked) setGoldenBreak(false);
        }}
        onGoldenBreakChange={(checked) => {
          setGoldenBreak(checked);
          if (checked) setBreakAndRun(false);
        }}
        onCancel={() => {
          setScoringGame(null);
          setBreakAndRun(false);
          setGoldenBreak(false);
        }}
        onConfirm={handleConfirmScore}
      />

      {/* Opponent Confirmation Modal */}
      <ConfirmationDialog
        open={confirmationGame !== null}
        game={confirmationGame}
        gameType={gameType}
        onConfirm={(gameNumber, isResetRequest) => {
          confirmOpponentScore(gameNumber, isResetRequest);
        }}
        onDeny={(gameNumber, isResetRequest) => {
          denyOpponentScore(gameNumber, isResetRequest);
        }}
        onClose={() => setConfirmationGame(null)}
      />

      {/* Vacate Winner Modal */}
      <EditGameDialog
        open={editingGame !== null}
        game={editingGame ? {
          gameNumber: editingGame.gameNumber,
          winnerPlayerName: editingGame.currentWinnerName,
          gameId: gameResults.get(editingGame.gameNumber)?.id || '',
        } : null}
        myVacateRequests={myVacateRequests.current}
        onVacate={async (gameNumber, gameId) => {
          try {
            // Track that I initiated this vacate request (to suppress my own confirmation modal)
            myVacateRequests.current.add(gameNumber);
            console.log(
              'Added game',
              gameNumber,
              'to myVacateRequests. Set now contains:',
              Array.from(myVacateRequests.current)
            );

            // Vacate request: Keep winner but clear BOTH confirmations
            // This creates a unique state: winner exists but both confirmations are false
            // Opponent will see this as a vacate request, not a normal score
            const { error } = await supabase
              .from('match_games')
              .update({
                confirmed_by_home: false,
                confirmed_by_away: false,
              })
              .eq('id', gameId);

            if (error) throw error;
          } catch (err: any) {
            console.error('Error requesting reset:', err);
            alert(`Failed to request reset: ${err.message}`);
          }
        }}
        onClose={() => setEditingGame(null)}
      />
    </div>
  );
}
