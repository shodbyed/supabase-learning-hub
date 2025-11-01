/**
 * @fileoverview Match Scoring Hook
 *
 * Central hook for managing match scoring across different formats (3v3, tiebreaker, 5v5).
 * Handles all data fetching, real-time subscriptions, game scoring logic, and confirmation flows.
 *
 * This hook extracts all business logic from the scoring pages, making them pure UI components.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/supabaseClient';
import { calculateTeamHandicap, type HandicapVariant } from '@/utils/handicapCalculations';
import { getAllGames } from '@/utils/gameOrder';

// ============================================================================
// TYPES
// ============================================================================

export interface Match {
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

export interface Lineup {
  id: string;
  team_id: string;
  player1_id: string | null;
  player1_handicap: number;
  player2_id: string | null;
  player2_handicap: number;
  player3_id: string | null;
  player3_handicap: number;
  locked: boolean;
}

export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
}

export interface HandicapThresholds {
  games_to_win: number;
  games_to_tie: number | null;
  games_to_lose: number;
}

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

export interface ScoringOptions {
  breakAndRun?: boolean;
  goldenBreak?: boolean;
}

export interface ConfirmationQueueItem {
  gameNumber: number;
  winnerPlayerName: string;
  breakAndRun: boolean;
  goldenBreak: boolean;
  isVacateRequest?: boolean;
}

export type MatchType = '3v3' | 'tiebreaker' | '5v5';

interface UseMatchScoringOptions {
  matchId: string | undefined | null;
  memberId: string | undefined | null;
  matchType: MatchType;
}

// ============================================================================
// HOOK
// ============================================================================

export function useMatchScoring({
  matchId,
  memberId,
  matchType
}: UseMatchScoringOptions) {
  // Data state
  const [match, setMatch] = useState<Match | null>(null);
  const [homeLineup, setHomeLineup] = useState<Lineup | null>(null);
  const [awayLineup, setAwayLineup] = useState<Lineup | null>(null);
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());
  const [gameResults, setGameResults] = useState<Map<number, MatchGame>>(new Map());

  // Handicap data
  const [homeTeamHandicap, setHomeTeamHandicap] = useState(0);
  const [homeThresholds, setHomeThresholds] = useState<HandicapThresholds | null>(null);
  const [awayThresholds, setAwayThresholds] = useState<HandicapThresholds | null>(null);

  // User context
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [isHomeTeam, setIsHomeTeam] = useState<boolean | null>(null);

  // League settings
  const [goldenBreakCountsAsWin, setGoldenBreakCountsAsWin] = useState(false);
  const [gameType, setGameType] = useState<string>('8-ball');

  // Confirmation queue
  const [confirmationQueue, setConfirmationQueue] = useState<ConfirmationQueueItem[]>([]);

  // Track vacate requests initiated by current user (to suppress own confirmation modal)
  const myVacateRequests = useRef<Set<number>>(new Set());

  // Loading/error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Get player display name (nickname or full name)
   */
  const getPlayerDisplayName = useCallback((playerId: string | null): string => {
    if (!playerId) return 'Unknown';
    const player = players.get(playerId);
    if (!player) return 'Unknown';
    return player.nickname || `${player.first_name} ${player.last_name}`;
  }, [players]);

  /**
   * Get team statistics (wins/losses) from confirmed games
   */
  const getTeamStats = useCallback((teamId: string) => {
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
  }, [gameResults]);

  /**
   * Get player statistics (wins/losses) from confirmed games
   */
  const getPlayerStats = useCallback((playerId: string) => {
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
  }, [gameResults]);

  /**
   * Count completed games (confirmed by both teams)
   */
  const getCompletedGamesCount = useCallback(() => {
    let count = 0;
    gameResults.forEach(game => {
      if (game.confirmed_by_home && game.confirmed_by_away) {
        count++;
      }
    });
    return count;
  }, [gameResults]);

  /**
   * Calculate current points for a team
   * Formula: games_won - (games_to_tie ?? games_to_win)
   */
  const calculatePoints = useCallback((teamId: string, thresholds: HandicapThresholds | null) => {
    if (!thresholds) return 0;
    const { wins } = getTeamStats(teamId);
    const baseline = thresholds.games_to_tie ?? thresholds.games_to_win;
    return wins - baseline;
  }, [getTeamStats]);

  /**
   * Add a confirmation to the queue
   * Prevents duplicates by checking if game is already in queue
   */
  const addToConfirmationQueue = useCallback((confirmation: ConfirmationQueueItem) => {
    console.log('addToConfirmationQueue called for game', confirmation.gameNumber, 'isVacateRequest:', confirmation.isVacateRequest);

    // If this is a vacate request and I initiated it, don't add to queue
    if (confirmation.isVacateRequest && myVacateRequests.current.has(confirmation.gameNumber)) {
      console.log('✓ Skipping queue add - I initiated this vacate request for game', confirmation.gameNumber);
      return;
    }

    // Check if this game is already in the queue
    setConfirmationQueue(prev => {
      const alreadyInQueue = prev.some(item => item.gameNumber === confirmation.gameNumber);
      if (alreadyInQueue) {
        console.log('Game', confirmation.gameNumber, 'already in queue, skipping');
        return prev;
      }

      console.log('Adding game', confirmation.gameNumber, 'to confirmation queue');
      return [...prev, confirmation];
    });
  }, []);

  /**
   * Remove a confirmation from the queue (after it's shown)
   */
  const removeFromConfirmationQueue = useCallback(() => {
    setConfirmationQueue(prev => prev.slice(1));
  }, []);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  /**
   * Fetch match data, lineups, players, and existing games
   */
  useEffect(() => {
    async function fetchMatchData() {
      if (!matchId || !memberId) {
        // Don't set error immediately - wait for data to load
        // This handles the initial render when memberId is still loading
        return;
      }

      try {
        // Fetch match details with league variants
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select(`
            id,
            season_id,
            home_team_id,
            away_team_id,
            home_team:teams!matches_home_team_id_fkey(id, team_name),
            away_team:teams!matches_away_team_id_fkey(id, team_name),
            season:seasons!matches_season_id_fkey(
              league:leagues(
                handicap_variant,
                team_handicap_variant,
                golden_break_counts_as_win,
                game_type
              )
            )
          `)
          .eq('id', matchId)
          .single();

        if (matchError) throw matchError;

        console.log('Match data received:', matchData);

        // Extract league variants
        const seasonData = Array.isArray(matchData.season)
          ? matchData.season[0]
          : matchData.season;
        const leagueData = seasonData && Array.isArray((seasonData as any).league)
          ? (seasonData as any).league[0]
          : (seasonData as any)?.league;

        const playerVariant = (leagueData?.handicap_variant || 'standard') as HandicapVariant;
        const teamVariant = (leagueData?.team_handicap_variant || 'standard') as HandicapVariant;
        const goldenBreakSetting = leagueData?.golden_break_counts_as_win ?? false;
        const gameTypeSetting = leagueData?.game_type || '8-ball';

        setGoldenBreakCountsAsWin(goldenBreakSetting);
        setGameType(gameTypeSetting);
        console.log('League variants:', { playerVariant, teamVariant, goldenBreakSetting, gameTypeSetting });

        // Transform match data
        const homeTeam = Array.isArray(matchData.home_team)
          ? matchData.home_team[0]
          : matchData.home_team;
        const awayTeam = Array.isArray(matchData.away_team)
          ? matchData.away_team[0]
          : matchData.away_team;

        const transformedMatch: Match = {
          id: matchData.id,
          season_id: matchData.season_id,
          home_team_id: matchData.home_team_id,
          away_team_id: matchData.away_team_id,
          home_team: homeTeam as any || null,
          away_team: awayTeam as any || null,
        };

        setMatch(transformedMatch);

        // Calculate team handicap (only for home team in 3v3)
        if (matchType === '3v3') {
          const calculatedTeamHandicap = await calculateTeamHandicap(
            matchData.home_team_id,
            matchData.away_team_id,
            matchData.season_id,
            teamVariant,
            true // useRandom = true for testing
          );
          setHomeTeamHandicap(calculatedTeamHandicap);
        }

        // Determine which team the user is on
        const { data: teamPlayerData, error: teamPlayerError } = await supabase
          .from('team_players')
          .select('team_id')
          .eq('member_id', memberId)
          .or(`team_id.eq.${matchData.home_team_id},team_id.eq.${matchData.away_team_id}`)
          .single();

        if (teamPlayerError) throw new Error('You are not on either team in this match');

        const userTeam = teamPlayerData.team_id;
        const isHome = userTeam === matchData.home_team_id;
        setUserTeamId(userTeam);
        setIsHomeTeam(isHome);

        // Fetch lineups for both teams
        const { data: lineupsData, error: lineupsError } = await supabase
          .from('match_lineups')
          .select('*')
          .eq('match_id', matchId)
          .in('team_id', [matchData.home_team_id, matchData.away_team_id]);

        if (lineupsError) throw lineupsError;

        console.log('Lineups data received:', lineupsData);

        // Separate home and away lineups
        const homeLineupData = lineupsData?.find(l => l.team_id === matchData.home_team_id);
        const awayLineupData = lineupsData?.find(l => l.team_id === matchData.away_team_id);

        if (!homeLineupData || !awayLineupData) {
          throw new Error('Both team lineups must be locked before scoring can begin');
        }

        if (!homeLineupData.locked || !awayLineupData.locked) {
          throw new Error('Both team lineups must be locked before scoring can begin');
        }

        setHomeLineup(homeLineupData);
        setAwayLineup(awayLineupData);

        // Calculate handicap thresholds (only for 3v3 regular match)
        if (matchType === '3v3') {
          // Calculate player handicap totals
          const homeTotal = homeLineupData.player1_handicap + homeLineupData.player2_handicap + homeLineupData.player3_handicap;
          const awayTotal = awayLineupData.player1_handicap + awayLineupData.player2_handicap + awayLineupData.player3_handicap;

          // Calculate handicap difference and lookup thresholds
          const homeTotalHandicap = homeTotal + homeTeamHandicap;
          const awayTotalHandicap = awayTotal;
          const handicapDiff = homeTotalHandicap - awayTotalHandicap;

          // Cap at ±12
          const cappedHomeDiff = Math.max(-12, Math.min(12, handicapDiff));
          const cappedAwayDiff = Math.max(-12, Math.min(12, -handicapDiff));

          console.log('Handicap calculations:', {
            homeTotal,
            awayTotal,
            teamHandicap: homeTeamHandicap,
            homeTotalHandicap,
            awayTotalHandicap,
            handicapDiff,
            cappedHomeDiff,
            cappedAwayDiff,
          });

          // Lookup thresholds from handicap_chart_3vs3 table
          const { data: homeThresholdData, error: homeThresholdError } = await supabase
            .from('handicap_chart_3vs3')
            .select('*')
            .eq('hcp_diff', cappedHomeDiff)
            .single();

          const { data: awayThresholdData, error: awayThresholdError } = await supabase
            .from('handicap_chart_3vs3')
            .select('*')
            .eq('hcp_diff', cappedAwayDiff)
            .single();

          if (homeThresholdError) throw homeThresholdError;
          if (awayThresholdError) throw awayThresholdError;

          setHomeThresholds(homeThresholdData);
          setAwayThresholds(awayThresholdData);

          console.log('Thresholds:', { home: homeThresholdData, away: awayThresholdData });
        } else if (matchType === 'tiebreaker') {
          // Tiebreaker: static best of 3
          setHomeThresholds({ games_to_win: 2, games_to_tie: null, games_to_lose: 1 });
          setAwayThresholds({ games_to_win: 2, games_to_tie: null, games_to_lose: 1 });
        }
        // TODO: Add 5v5 threshold calculation when ready

        // Fetch all player names for display
        const allPlayerIds = [
          homeLineupData.player1_id,
          homeLineupData.player2_id,
          homeLineupData.player3_id,
          awayLineupData.player1_id,
          awayLineupData.player2_id,
          awayLineupData.player3_id,
        ].filter(Boolean);

        const { data: playersData, error: playersError } = await supabase
          .from('members')
          .select('id, first_name, last_name, nickname')
          .in('id', allPlayerIds);

        if (playersError) throw playersError;

        // Create player lookup map
        const playerMap = new Map<string, Player>();
        playersData?.forEach(p => {
          playerMap.set(p.id, p);
        });
        setPlayers(playerMap);

        console.log('Players loaded:', playerMap);

        // Fetch existing game results
        const { data: gamesData, error: gamesError } = await supabase
          .from('match_games')
          .select('*')
          .eq('match_id', matchId);

        if (gamesError) throw gamesError;

        // Create game results map
        const gamesMap = new Map<number, MatchGame>();
        gamesData?.forEach(game => {
          gamesMap.set(game.game_number, game as MatchGame);
        });
        setGameResults(gamesMap);

        console.log('Game results loaded:', gamesMap);

        // If no games exist yet, create all placeholder games
        if (gamesData.length === 0) {
          console.log('No games found, creating placeholders');
          const gamesToInsert = getAllGames().map(game => {
            const homePlayerId = homeLineupData[`player${game.homePlayerPosition}_id` as keyof typeof homeLineupData] as string;
            const awayPlayerId = awayLineupData[`player${game.awayPlayerPosition}_id` as keyof typeof awayLineupData] as string;

            return {
              match_id: matchId,
              game_number: game.gameNumber,
              home_player_id: homePlayerId,
              away_player_id: awayPlayerId,
              home_action: game.homeAction,
              away_action: game.awayAction,
              winner_team_id: null,
              winner_player_id: null,
              break_and_run: false,
              golden_break: false,
              confirmed_by_home: false,
              confirmed_by_away: false,
              is_tiebreaker: matchType === 'tiebreaker'
            };
          });

          const { error: insertError } = await supabase
            .from('match_games')
            .insert(gamesToInsert);

          if (insertError) {
            console.error('Error creating placeholder games:', insertError);
          } else {
            console.log('Successfully created placeholder games');

            // Fetch the newly created games
            const { data: newGamesData } = await supabase
              .from('match_games')
              .select('*')
              .eq('match_id', matchId);

            const newGamesMap = new Map<number, MatchGame>();
            newGamesData?.forEach(game => {
              newGamesMap.set(game.game_number, game as MatchGame);
            });
            setGameResults(newGamesMap);
          }
        }

      } catch (err: any) {
        console.error('Error fetching match data:', err);
        setError(err.message || 'Failed to load match information');
      } finally {
        setLoading(false);
      }
    }

    fetchMatchData();
  }, [matchId, memberId, matchType, homeTeamHandicap]);

  // ============================================================================
  // REAL-TIME SUBSCRIPTION
  // ============================================================================

  /**
   * Real-time subscription to match_games table
   * Listens for INSERT/UPDATE/DELETE events and refreshes game results
   */
  useEffect(() => {
    if (!matchId || !match || !userTeamId) return;

    console.log('Setting up real-time subscription for match:', matchId);

    const channel = supabase
      .channel(`match_games_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'match_games',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          console.log('Real-time game update received:', payload);

          // Fetch updated game results
          async function refreshGames() {
            const { data: gamesData } = await supabase
              .from('match_games')
              .select('*')
              .eq('match_id', matchId);

            if (gamesData) {
              const gamesMap = new Map<number, MatchGame>();
              gamesData.forEach(game => {
                gamesMap.set(game.game_number, game as MatchGame);
              });
              setGameResults(gamesMap);
              console.log('Game results refreshed from real-time update');

              // Check if this update requires my confirmation
              if (payload.eventType === 'UPDATE' && payload.new) {
                const updatedGame = payload.new as MatchGame;

                // Detect if this is a vacate request:
                // Unique state: winner exists BUT both confirmations are false
                const isVacateRequest = updatedGame.winner_player_id &&
                                       !updatedGame.confirmed_by_home &&
                                       !updatedGame.confirmed_by_away;

                // If game has a winner and is waiting for confirmation
                if (updatedGame.winner_player_id && (!updatedGame.confirmed_by_home || !updatedGame.confirmed_by_away)) {
                  console.log('isVacateRequest:', isVacateRequest);

                  // For vacate requests, check if this was initiated by me
                  if (isVacateRequest) {
                    // Check if I initiated this vacate request
                    if (myVacateRequests.current.has(updatedGame.game_number)) {
                      console.log('I initiated this vacate request, suppressing my own confirmation modal');
                      myVacateRequests.current.delete(updatedGame.game_number);
                      return;
                    }

                    // This is from opponent - show the confirmation modal
                    console.log('Opponent vacate request detected. Showing confirmation modal.');
                    const winnerPlayer = gamesData.find(g => g.game_number === updatedGame.game_number);
                    if (winnerPlayer && winnerPlayer.winner_player_id) {
                      const winnerName = getPlayerDisplayName(winnerPlayer.winner_player_id);
                      addToConfirmationQueue({
                        gameNumber: updatedGame.game_number,
                        winnerPlayerName: winnerName,
                        breakAndRun: updatedGame.break_and_run,
                        goldenBreak: updatedGame.golden_break,
                        isVacateRequest: true
                      });
                    }
                    return;
                  }

                  // Normal score update - check if opponent needs to confirm
                  const isHomeTeamScorer = updatedGame.confirmed_by_home && !updatedGame.confirmed_by_away;
                  const isAwayTeamScorer = updatedGame.confirmed_by_away && !updatedGame.confirmed_by_home;

                  if (!match) return; // Safety check
                  const iAmHome = userTeamId === match.home_team_id;
                  const needMyConfirmation = (isHomeTeamScorer && !iAmHome) || (isAwayTeamScorer && iAmHome);

                  if (needMyConfirmation) {
                    console.log('Opponent scored game', updatedGame.game_number, 'adding to confirmation queue');
                    const winnerName = getPlayerDisplayName(updatedGame.winner_player_id);
                    addToConfirmationQueue({
                      gameNumber: updatedGame.game_number,
                      winnerPlayerName: winnerName,
                      breakAndRun: updatedGame.break_and_run,
                      goldenBreak: updatedGame.golden_break,
                      isVacateRequest: false
                    });
                  }
                }
              }
            }
          }

          refreshGames();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [matchId, match, userTeamId, getPlayerDisplayName, addToConfirmationQueue]);

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    // Data
    match,
    homeLineup,
    awayLineup,
    gameResults,
    players,
    homeTeamHandicap,
    homeThresholds,
    awayThresholds,

    // User context
    userTeamId,
    isHomeTeam,

    // League settings
    goldenBreakCountsAsWin,
    gameType,

    // Statistics
    getPlayerDisplayName,
    getTeamStats,
    getPlayerStats,
    getCompletedGamesCount,
    calculatePoints,

    // Confirmation queue
    confirmationQueue,
    addToConfirmationQueue,
    removeFromConfirmationQueue,
    myVacateRequests,

    // State
    loading,
    error,
  };
}
