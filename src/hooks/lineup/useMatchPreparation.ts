/**
 * @fileoverview Hook for match preparation and auto-navigation
 *
 * Handles the automatic match preparation when both lineups are locked.
 * Only the HOME team performs the preparation to avoid race conditions.
 * Creates game rows and calculates handicap thresholds.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { useUpdateMatch } from '@/api/hooks';
import { calculateHandicapThresholds } from '@/utils/calculateHandicapThresholds';
import { generateGameOrder } from '@/utils/gameOrder';

export function usePreparationStatus() {
  const [isPreparingMatch, setIsPreparingMatch] = useState(false);
  const [preparationMessage, setPreparationMessage] = useState('');
  return { isPreparingMatch, setIsPreparingMatch, preparationMessage, setPreparationMessage };
}

interface MatchPreparationParams {
  lineupLocked: boolean;
  opponentLineup: any;
  matchId: string | undefined;
  matchData: any;
  isHomeTeam: boolean;
  teamFormat: '5_man' | '8_man';
  player1Id: string;
  player2Id: string;
  player3Id: string;
  player1Handicap: number;
  player2Handicap: number;
  player3Handicap: number;
  setIsPreparingMatch?: (preparing: boolean) => void;
  setPreparationMessage?: (message: string) => void;
  refetchLineups?: () => Promise<any>;
  refetchGames?: () => Promise<any>;
}

export function useMatchPreparation(params: MatchPreparationParams) {
  const {
    lineupLocked,
    opponentLineup,
    matchId,
    matchData,
    isHomeTeam,
    teamFormat,
    player1Id,
    player2Id,
    player3Id,
    player1Handicap,
    player2Handicap,
    player3Handicap,
    setIsPreparingMatch,
    setPreparationMessage,
    refetchLineups,
    refetchGames,
  } = params;

  const navigate = useNavigate();
  const updateMatchMutation = useUpdateMatch();
  const matchPreparedRef = useRef(false);

  // Auto-navigate to scoring page when both lineups are locked - useEffect MUST be before early returns
  // IMPORTANT: Only HOME team prepares the match to avoid race conditions
  useEffect(() => {
    if (lineupLocked && opponentLineup?.locked && !matchPreparedRef.current) {
      // Only home team prepares the match data to avoid both teams doing it simultaneously
      if (!isHomeTeam) {
        const awayTeamNavigate = async () => {
          console.log('🚀 Away team preparing to navigate');
          matchPreparedRef.current = true;
          setIsPreparingMatch?.(true);

          // STEP 1: Verify both lineups are actually locked with FRESH data
          setPreparationMessage?.('Verifying lineups are locked...');
          if (!refetchLineups) {
            console.error('refetchLineups not available');
            setIsPreparingMatch?.(false);
            matchPreparedRef.current = false;
            return;
          }

          let bothLineupsLocked = false;
          let attempts = 0;
          const maxAttempts = 20; // 10 seconds max

          while (!bothLineupsLocked && attempts < maxAttempts) {
            const { data: freshLineups } = await refetchLineups();

            if (freshLineups &&
                freshLineups.homeLineup?.locked &&
                freshLineups.awayLineup?.locked) {
              bothLineupsLocked = true;
              console.log('✅ Both lineups confirmed locked with fresh data (away team)');
            } else {
              attempts++;
              console.log(`⏳ Away team waiting for both lineups to lock... (attempt ${attempts}/${maxAttempts})`);
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }

          if (!bothLineupsLocked) {
            console.error('Timeout: Both lineups not locked');
            setIsPreparingMatch?.(false);
            matchPreparedRef.current = false;
            return;
          }

          // STEP 2: Check if this is tiebreaker or regular mode with FRESH data
          setPreparationMessage?.('Checking match type...');
          let isTiebreaker = false;
          if (refetchGames) {
            const { data: existingGames } = await refetchGames();
            isTiebreaker = existingGames && existingGames.length > 0;
            console.log(`✅ Match type: ${isTiebreaker ? 'Tiebreaker' : 'Regular'}`);
          }

          // STEP 3: For regular matches, wait for home team to create games
          if (!isTiebreaker) {
            setPreparationMessage?.('Waiting for match setup...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          // STEP 4: Final verification before navigation
          setPreparationMessage?.('Final verification...');
          await new Promise(resolve => setTimeout(resolve, 500));

          setIsPreparingMatch?.(false);
          navigate(`/match/${matchId}/score`);
        };

        awayTeamNavigate();
        return;
      }

      const prepareMatchAndNavigate = async () => {
        if (!matchId || !matchData || !opponentLineup) return;

        console.log('🚀 Home team preparing and navigating');
        setIsPreparingMatch?.(true);

        try {
          matchPreparedRef.current = true;

          // STEP 1: Verify both lineups are actually locked with FRESH data
          setPreparationMessage?.('Verifying lineups are locked...');
          if (!refetchLineups) {
            console.error('refetchLineups not available');
            setIsPreparingMatch?.(false);
            matchPreparedRef.current = false;
            return;
          }

          let bothLineupsLocked = false;
          let attempts = 0;
          const maxAttempts = 20; // 10 seconds max

          while (!bothLineupsLocked && attempts < maxAttempts) {
            const { data: freshLineups } = await refetchLineups();

            if (freshLineups &&
                freshLineups.homeLineup?.locked &&
                freshLineups.awayLineup?.locked) {
              bothLineupsLocked = true;
              console.log('✅ Both lineups confirmed locked with fresh data (home team)');
            } else {
              attempts++;
              console.log(`⏳ Home team waiting for both lineups to lock... (attempt ${attempts}/${maxAttempts})`);
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }

          if (!bothLineupsLocked) {
            console.error('Timeout: Both lineups not locked');
            setIsPreparingMatch?.(false);
            matchPreparedRef.current = false;
            return;
          }

          // STEP 2: Check if this is tiebreaker or regular mode with FRESH data
          setPreparationMessage?.('Checking match type...');
          if (!refetchGames) {
            console.error('refetchGames not available');
            setIsPreparingMatch?.(false);
            matchPreparedRef.current = false;
            return;
          }

          const { data: existingGames } = await refetchGames();
          const isTiebreaker = existingGames && existingGames.length > 0;
          console.log(`✅ Match type: ${isTiebreaker ? 'Tiebreaker' : 'Regular'}`);

          // STEP 3: If tiebreaker mode, verify games exist and navigate
          if (isTiebreaker) {
            console.log('Tiebreaker mode - games already exist, navigating to score page');
            setPreparationMessage?.('Final verification...');
            await new Promise(resolve => setTimeout(resolve, 500));

            setIsPreparingMatch?.(false);
            navigate(`/match/${matchId}/score`);
            return;
          }

          // STEP 4: Regular match - create games and thresholds
          // Build current user's lineup object from state
          const myLineup = {
            player1_id: player1Id,
            player1_handicap: player1Handicap,
            player2_id: player2Id,
            player2_handicap: player2Handicap,
            player3_id: player3Id,
            player3_handicap: player3Handicap,
          };

          // Calculate handicap thresholds
          setPreparationMessage?.('Calculating handicap thresholds...');
          const { homeThresholds, awayThresholds } =
            await calculateHandicapThresholds(
              myLineup as any,
              opponentLineup,
              matchData.home_team_id,
              matchData.away_team_id,
              matchData.season_id,
              teamFormat
            );

          // Save thresholds to match table
          setPreparationMessage?.('Saving match settings...');
          await updateMatchMutation.mutateAsync({
            matchId,
            updates: {
              home_games_to_win: homeThresholds.games_to_win,
              home_games_to_tie: homeThresholds.games_to_tie,
              home_games_to_lose: homeThresholds.games_to_lose,
              away_games_to_win: awayThresholds.games_to_win,
              away_games_to_tie: awayThresholds.games_to_tie,
              away_games_to_lose: awayThresholds.games_to_lose,
            },
          });

          // Create all game rows in match_games table
          setPreparationMessage?.('Creating games...');
          const playersPerTeam = teamFormat === '8_man' ? 5 : 3;
          const useDoubleRoundRobin = playersPerTeam === 3;

          const allGames = generateGameOrder(
            playersPerTeam,
            useDoubleRoundRobin
          );

          const homeLineup = isHomeTeam ? myLineup : opponentLineup;
          const awayLineup = isHomeTeam ? opponentLineup : myLineup;

          const gameRows = allGames.map((game) => ({
            match_id: matchId,
            game_number: game.gameNumber,
            game_type: matchData?.league.game_type || 'eight_ball',
            home_player_id: (homeLineup as any)[
              `player${game.homePlayerPosition}_id`
            ],
            away_player_id: (awayLineup as any)[
              `player${game.awayPlayerPosition}_id`
            ],
            home_action: game.homeAction,
            away_action: game.awayAction,
          }));

          console.log(
            `Creating ${gameRows.length} game rows in match_games table`
          );
          const { error: gamesError } = await supabase
            .from('match_games')
            .insert(gameRows);

          if (gamesError) {
            if (!gamesError.message.includes('duplicate key')) {
              throw new Error(`Failed to create games: ${gamesError.message}`);
            }
            console.log('Games already exist - continuing');
          }

          console.log('Match preparation complete - navigating to scoring page');

          // STEP 5: Final verification and cache propagation before navigation
          setPreparationMessage?.('Final verification...');
          await new Promise(resolve => setTimeout(resolve, 500));

          setIsPreparingMatch?.(false);
          navigate(`/match/${matchId}/score`);
        } catch (error: any) {
          console.error('Error preparing match:', error);
          setIsPreparingMatch?.(false);
          alert(`Failed to prepare match: ${error.message}`);
          matchPreparedRef.current = false;
        }
      };

      prepareMatchAndNavigate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lineupLocked,
    opponentLineup,
    matchId,
  ]);
}
