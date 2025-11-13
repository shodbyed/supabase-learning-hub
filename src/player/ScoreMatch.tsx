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
//import { watchMatchAndGames } from '@/realtime/useMatchAndGamesRealtime';

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrentMember } from '@/api/hooks';
// getAllGames no longer needed - all game data comes from database
import { getCompletedGamesCount } from '@/types/match';
import { useMatchScoring } from '@/hooks/useMatchScoring';
import { useMatchScoringMutations } from '@/hooks/useMatchScoringMutations';
import { ScoringDialog } from '@/components/scoring/ScoringDialog';
import { ConfirmationDialog } from '@/components/scoring/ConfirmationDialog';
import { EditGameDialog } from '@/components/scoring/EditGameDialog';
import { MatchScoreboard } from '@/components/scoring/MatchScoreboard';
import { GamesList } from '@/components/scoring/GamesList';
import { queryKeys } from '@/api/queryKeys';

export function ScoreMatch() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: member } = useCurrentMember();
  const memberId = member?.id;

  // Auto-confirm setting (bypass confirmation modal)
  const [autoConfirm, setAutoConfirm] = useState(false);

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);

  // Ref to store mutations for use in real-time subscription
  const mutationsRef = useRef<any>(null);

  // Wait time for match preparation (give home team time to prepare)
  const [waitingForPreparation, setWaitingForPreparation] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 10; // Wait up to 10 seconds

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
    autoConfirm,
    confirmOpponentScore: async (gameNumber, isVacateRequest) => {
      // This will be called by real-time subscription when autoConfirm is enabled
      if (mutationsRef.current) {
        await mutationsRef.current.confirmOpponentScore(
          gameNumber,
          isVacateRequest
        );
      }
    },
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

  // Process confirmation queue when modal closes or queue changes
  useEffect(() => {
    // Only process queue when modal is closed
    if (!confirmationGame && confirmationQueue.length > 0) {
      // console.log(
      //   'Modal closed, processing queue. Queue length:',
      //   confirmationQueue.length
      // );
      const nextConfirmation = confirmationQueue[0];
      //console.log('Showing game', nextConfirmation.gameNumber, 'from queue');

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

  // Detect when all games are complete (works for any format: 3, 18, 25, etc.)
  // Total games = count of games in database
  const totalGames = gameResults.size;
  const completedGames = getCompletedGamesCount(gameResults);
  const allGamesComplete = completedGames === totalGames;

  // Debug: Log team identification and verification status
  // useEffect(() => {
  //   console.log('Match data updated with verification columns:', {
  //     matchId: match?.id,
  //     homeVerifiedBy: (match as any)?.home_team_verified_by,
  //     awayVerifiedBy: (match as any)?.away_team_verified_by,
  //   });
  // }, [match]);

  // Track previous allGamesComplete state to detect changes
  const prevAllGamesCompleteRef = useRef(allGamesComplete);

  // Save thresholds and handle verification when match completes/uncompletes
  useEffect(() => {
    const wasComplete = prevAllGamesCompleteRef.current;
    const isComplete = allGamesComplete;

    // If changed from incomplete to complete, save thresholds to database
    if (!wasComplete && isComplete && matchId && homeThresholds && awayThresholds) {
      console.log('Match just completed - saving thresholds to database', {
        homeThresholds,
        awayThresholds
      });
      supabase
        .from('matches')
        .update({
          home_games_to_win: homeThresholds.games_to_win,
          home_games_to_tie: homeThresholds.games_to_tie,
          away_games_to_win: awayThresholds.games_to_win,
          away_games_to_tie: awayThresholds.games_to_tie,
        })
        .eq('id', matchId)
        .then(({ error }) => {
          if (error) {
            console.error('Error saving thresholds:', error);
          } else {
            console.log('Thresholds saved successfully');
          }
        });
    }

    // If changed from complete to incomplete, clear verification
    if (wasComplete && !isComplete && matchId) {
      console.log(
        'Game vacated after completion - clearing verification status'
      );
      supabase
        .from('matches')
        .update({
          home_team_verified_by: null,
          away_team_verified_by: null,
        })
        .eq('id', matchId)
        .then(({ error }) => {
          if (error) {
            console.error('Error clearing verification status:', error);
          }
        });
    }

    // Update ref for next comparison
    prevAllGamesCompleteRef.current = isComplete;
  }, [allGamesComplete, matchId, homeThresholds, awayThresholds]);

  /**
   * Handle verify button click
   * Updates the appropriate verification column based on user's team
   * Uses optimistic update and refetch to update UI immediately
   */
  const handleVerify = async () => {
    if (!matchId || !memberId || isHomeTeam === null) {
      return;
    }

    setIsVerifying(true);

    try {
      const updateField = isHomeTeam
        ? 'home_team_verified_by'
        : 'away_team_verified_by';

      // Optimistically update the UI immediately
      const queryKey = [...queryKeys.matches.detail(matchId), 'leagueSettings'];

      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          [updateField]: memberId,
        };
      });

      // Update database
      const { error } = await supabase
        .from('matches')
        .update({ [updateField]: memberId })
        .eq('id', matchId);

      if (error) throw error;

      // Don't refetch - realtime subscription will handle it for all users
      // This prevents race condition where refetch gets stale data
    } catch (err: any) {
      console.error('Error verifying scores:', err);
      alert(`Failed to verify scores: ${err.message}`);
      // Rollback optimistic update on error
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.matches.detail(matchId), 'leagueSettings'],
      });
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Get display name for a player (nickname or first name)
   * Uses function from useMatchScoring hook
   */
  const getPlayerDisplayName = getPlayerDisplayNameFromHook;

  /**
   * Add to confirmation queue (from useMatchScoring hook)
   */
  const addToConfirmationQueue = addToConfirmationQueueFromHook;

  // Use mutations hook for all database operations
  const mutations = useMatchScoringMutations({
    match,
    gameResults,
    homeLineup,
    awayLineup,
    userTeamId,
    gameType,
    autoConfirm,
    addToConfirmationQueue,
    getPlayerDisplayName,
  });

  // Store mutations in ref for use in real-time subscription callback
  mutationsRef.current = mutations;

  /**
   * Handle player button click to score a game
   * Delegates to mutations hook
   */
  const handlePlayerClick = (
    gameNumber: number,
    playerId: string,
    playerName: string,
    teamId: string
  ) => {
    mutations.handlePlayerClick(
      gameNumber,
      playerId,
      playerName,
      teamId,
      (game) => {
        setScoringGame(game);
        setBreakAndRun(false);
        setGoldenBreak(false);
      },
      (gameNumber) => mutations.confirmOpponentScore(gameNumber)
    );
  };

  // Auto-retry mechanism: Wait for match preparation to complete
  // MUST be before any early returns to comply with Rules of Hooks
  useEffect(() => {
    const dataReady = match && homeLineup && awayLineup && homeThresholds && awayThresholds;

    if (!dataReady && waitingForPreparation && retryCount < MAX_RETRIES) {
      const timer = setTimeout(() => {
        console.log(`Retrying data fetch (${retryCount + 1}/${MAX_RETRIES})...`);
        setRetryCount(prev => prev + 1);
        // Invalidate queries to force refetch
        queryClient.invalidateQueries({ queryKey: ['match', matchId] });
      }, 1000); // Wait 1 second between retries

      return () => clearTimeout(timer);
    }

    if (dataReady && waitingForPreparation) {
      setWaitingForPreparation(false);
    }

    if (retryCount >= MAX_RETRIES) {
      setWaitingForPreparation(false);
    }
  }, [match, homeLineup, awayLineup, homeThresholds, awayThresholds, retryCount, waitingForPreparation, matchId, queryClient, MAX_RETRIES]);

  // Early returns for loading/error states
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

  // Show loading screen while waiting for preparation
  if (waitingForPreparation && retryCount < MAX_RETRIES) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700 mb-4">
            Preparing Match...
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Setting up handicap thresholds and game order
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div className="text-xs text-gray-500 mt-4">
            Attempt {retryCount + 1} of {MAX_RETRIES}
          </div>
        </div>
      </div>
    );
  }

  // After retries exhausted, show error if data still missing
  if (
    !match ||
    !homeLineup ||
    !awayLineup ||
    !homeThresholds ||
    !awayThresholds
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600 mb-2">
                Match Preparation Failed
              </div>
              <div className="text-gray-600 mb-4">
                The match could not be prepared after {MAX_RETRIES} attempts.
              </div>
              <div className="text-sm text-gray-500 mb-4">
                {!match && <div>• Match data not loaded</div>}
                {!homeLineup && <div>• Home lineup not available</div>}
                {!awayLineup && <div>• Away lineup not available</div>}
                {!homeThresholds && <div>• Home thresholds not set</div>}
                {!awayThresholds && <div>• Away thresholds not set</div>}
              </div>
              <div className="text-xs text-gray-500 mb-4">
                This usually means the home team's lineup lock failed to prepare the match.
                Both teams should go back to lineup and try again.
              </div>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/match/${matchId}/lineup`)}
                className="ml-2"
              >
                Back to Lineup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Scoreboard - Fixed at top */}
      <MatchScoreboard
        match={{
          ...match,
          home_team_verified_by: (match as any).home_team_verified_by ?? null,
          away_team_verified_by: (match as any).away_team_verified_by ?? null,
        }}
        homeLineup={homeLineup}
        awayLineup={awayLineup}
        gameResults={gameResults}
        homeTeamHandicap={homeTeamHandicap}
        homeThresholds={homeThresholds}
        awayThresholds={awayThresholds}
        showingHomeTeam={showingHomeTeam}
        onToggleTeam={setShowingHomeTeam}
        autoConfirm={autoConfirm}
        onAutoConfirmChange={setAutoConfirm}
        getPlayerDisplayName={getPlayerDisplayName}
        allGamesComplete={allGamesComplete}
        isHomeTeam={isHomeTeam ?? false}
        onVerify={handleVerify}
        isVerifying={isVerifying}
      />

      {/* Game list section - ALL data from database */}
      <GamesList
        gameResults={gameResults}
        getPlayerDisplayName={getPlayerDisplayName}
        onGameClick={handlePlayerClick}
        onVacateClick={(gameNumber, winnerName) => {
          setEditingGame({
            gameNumber,
            currentWinnerName: winnerName,
          });
        }}
        homeTeamId={match.home_team_id}
        awayTeamId={match.away_team_id}
        totalGames={18}
      />

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
        onConfirm={() => {
          if (scoringGame) {
            mutations.handleConfirmScore(
              scoringGame,
              breakAndRun,
              goldenBreak,
              () => {
                setScoringGame(null);
                setBreakAndRun(false);
                setGoldenBreak(false);
              }
            );
          }
        }}
      />

      {/* Opponent Confirmation Modal */}
      <ConfirmationDialog
        open={confirmationGame !== null}
        game={confirmationGame}
        gameType={gameType}
        onConfirm={(gameNumber, isResetRequest) => {
          mutations.confirmOpponentScore(gameNumber, isResetRequest);
        }}
        onDeny={(gameNumber, isResetRequest) => {
          mutations.denyOpponentScore(gameNumber, isResetRequest);
        }}
        onClose={() => setConfirmationGame(null)}
      />

      {/* Vacate Winner Modal */}
      <EditGameDialog
        open={editingGame !== null}
        game={
          editingGame
            ? {
                gameNumber: editingGame.gameNumber,
                winnerPlayerName: editingGame.currentWinnerName,
                gameId: gameResults.get(editingGame.gameNumber)?.id || '',
              }
            : null
        }
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
