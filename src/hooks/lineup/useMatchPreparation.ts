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
        console.log('🚀 Away team waiting for home team to prepare match');
        matchPreparedRef.current = true;

        // Show loading screen
        setIsPreparingMatch?.(true);
        setPreparationMessage?.('Waiting for match setup...');

        // Wait 2 seconds for home team to create games
        setTimeout(() => {
          setIsPreparingMatch?.(false);
          navigate(`/match/${matchId}/score`);
        }, 2000);
        return;
      }

      const prepareMatchAndNavigate = async () => {
        if (!matchId || !matchData || !opponentLineup) return;

        console.log('🚀 Home team preparing and navigating');
        setIsPreparingMatch?.(true);
        setPreparationMessage?.('Preparing match...');

        try {
          matchPreparedRef.current = true;

          // Check if games already exist (tiebreaker scenario)
          const { data: existingGames, error: checkError} = await supabase
            .from('match_games')
            .select('id')
            .eq('match_id', matchId)
            .limit(1);

          if (checkError) {
            throw new Error(`Failed to check existing games: ${checkError.message}`);
          }

          const gamesAlreadyExist = existingGames && existingGames.length > 0;

          if (gamesAlreadyExist) {
            console.log('Games already exist (tiebreaker mode) - skipping game creation');
            setPreparationMessage?.('Waiting for both teams to lock lineups...');

            // Poll for both lineups to be locked before navigating
            if (refetchLineups) {
              let bothLineupsLocked = false;
              let attempts = 0;
              const maxAttempts = 20; // 10 seconds max

              while (!bothLineupsLocked && attempts < maxAttempts) {
                const { data: freshLineups } = await refetchLineups();

                if (freshLineups &&
                    freshLineups.homeLineup?.locked &&
                    freshLineups.awayLineup?.locked) {
                  bothLineupsLocked = true;
                  console.log('✅ Both tiebreaker lineups confirmed locked');
                } else {
                  attempts++;
                  console.log(`⏳ Waiting for both lineups to lock... (attempt ${attempts}/${maxAttempts})`);
                  await new Promise(resolve => setTimeout(resolve, 500));
                }
              }

              if (!bothLineupsLocked) {
                throw new Error('Timeout waiting for both lineups to be locked');
              }
            }

            setIsPreparingMatch?.(false);
            navigate(`/match/${matchId}/score`);
            return;
          }

          // Build current user's lineup object from state
          const myLineup = {
            player1_id: player1Id,
            player1_handicap: player1Handicap,
            player2_id: player2Id,
            player2_handicap: player2Handicap,
            player3_id: player3Id,
            player3_handicap: player3Handicap,
          };

          // Step 1: Calculate handicap thresholds
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

          // Step 2: Save thresholds to match table
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
          // Mutation throws on error, no need to check

          // Step 3: Create all game rows in match_games table with complete game structure
          setPreparationMessage?.('Creating games...');
          // Determine game format and count based on league.team_format
          const playersPerTeam = teamFormat === '8_man' ? 5 : 3;
          const useDoubleRoundRobin = playersPerTeam === 3; // 3v3 uses double round-robin (18 games), 5v5 uses single (25 games)

          // Generate game order using the algorithm
          const allGames = generateGameOrder(
            playersPerTeam,
            useDoubleRoundRobin
          );

          // Determine which lineup is home vs away
          const homeLineup = isHomeTeam ? myLineup : opponentLineup;
          const awayLineup = isHomeTeam ? opponentLineup : myLineup;

          // Create games with actual player IDs looked up from lineups
          const gameRows = allGames.map((game) => ({
            match_id: matchId,
            game_number: game.gameNumber,
            game_type: matchData?.league.game_type || 'eight_ball',
            // Look up actual player IDs from lineups using positions
            home_player_id: (homeLineup as any)[
              `player${game.homePlayerPosition}_id`
            ],
            away_player_id: (awayLineup as any)[
              `player${game.awayPlayerPosition}_id`
            ],
            home_action: game.homeAction,
            away_action: game.awayAction,
            // Winner and confirmation fields remain null until game is scored
          }));

          console.log(
            `Creating ${gameRows.length} game rows in match_games table`
          );
          const { error: gamesError } = await supabase
            .from('match_games')
            .insert(gameRows);

          if (gamesError) {
            // If games already exist (e.g., tiebreaker), that's OK - ignore duplicate key errors
            if (!gamesError.message.includes('duplicate key')) {
              throw new Error(`Failed to create games: ${gamesError.message}`);
            }
            console.log(
              'Games already exist (likely a tiebreaker) - continuing'
            );
          }

          console.log(
            'Match preparation complete - navigating to scoring page'
          );

          // Wait a moment before navigating to ensure all DB operations complete
          setPreparationMessage?.('Loading scoring page...');
          setTimeout(() => {
            setIsPreparingMatch?.(false);
            navigate(`/match/${matchId}/score`);
          }, 1000);
        } catch (error: any) {
          console.error('Error preparing match:', error);
          setIsPreparingMatch?.(false);
          alert(`Failed to prepare match: ${error.message}`);
          matchPreparedRef.current = false; // Reset so they can try again
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
