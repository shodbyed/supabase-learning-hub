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

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { calculateTeamHandicap, type HandicapVariant } from '@/utils/handicapCalculations';
import { getAllGames } from '@/utils/gameOrder';

interface Match {
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

interface Lineup {
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

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
}

interface HandicapThresholds {
  games_to_win: number;
  games_to_tie: number | null;
  games_to_lose: number;
}

interface MatchGame {
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

export function ScoreMatch() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { memberId, loading: memberLoading } = useCurrentMember();

  const [match, setMatch] = useState<Match | null>(null);
  const [homeLineup, setHomeLineup] = useState<Lineup | null>(null);
  const [awayLineup, setAwayLineup] = useState<Lineup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // League variants (will be used for B&R/8BB checkboxes)
  const [goldenBreakCountsAsWin, setGoldenBreakCountsAsWin] = useState(false);
  void goldenBreakCountsAsWin; // Will be used in scoring UI

  // Team handicap calculations
  const [homeTeamHandicap, setHomeTeamHandicap] = useState(0);

  // Handicap thresholds from lookup table
  const [homeThresholds, setHomeThresholds] = useState<HandicapThresholds | null>(null);
  const [awayThresholds, setAwayThresholds] = useState<HandicapThresholds | null>(null);

  // Player data (for display names)
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());

  // Game results
  const [gameResults, setGameResults] = useState<Map<number, MatchGame>>(new Map());

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
  } | null>(null);

  // Scoreboard view toggle (true = home team, false = away team)
  const [showingHomeTeam, setShowingHomeTeam] = useState(true);

  // Determine user's team (will be used for permissions and UI)
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [isHomeTeam, setIsHomeTeam] = useState<boolean | null>(null);
  void userTeamId; // Will be used for scoring permissions
  void isHomeTeam; // Will be used for UI display

  useEffect(() => {
    async function fetchMatchData() {
      if (memberLoading) return;

      if (!matchId || !memberId) {
        setError('Missing match or member information');
        setLoading(false);
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
                golden_break_counts_as_win
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

        setGoldenBreakCountsAsWin(goldenBreakSetting);
        console.log('League variants:', { playerVariant, teamVariant, goldenBreakSetting });

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

        // Calculate team handicap (only for home team)
        const calculatedTeamHandicap = await calculateTeamHandicap(
          matchData.home_team_id,
          matchData.away_team_id,
          matchData.season_id,
          teamVariant,
          true // useRandom = true for testing
        );
        setHomeTeamHandicap(calculatedTeamHandicap);

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
        setShowingHomeTeam(isHome); // Start by showing user's own team

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

        // Calculate player handicap totals
        const homeTotal = homeLineupData.player1_handicap + homeLineupData.player2_handicap + homeLineupData.player3_handicap;
        const awayTotal = awayLineupData.player1_handicap + awayLineupData.player2_handicap + awayLineupData.player3_handicap;

        // Calculate handicap difference and lookup thresholds
        const homeTotalHandicap = homeTotal + calculatedTeamHandicap;
        const awayTotalHandicap = awayTotal;
        const handicapDiff = homeTotalHandicap - awayTotalHandicap;

        // Cap at ±12
        const cappedHomeDiff = Math.max(-12, Math.min(12, handicapDiff));
        const cappedAwayDiff = Math.max(-12, Math.min(12, -handicapDiff));

        console.log('Handicap calculations:', {
          homeTotal,
          awayTotal,
          teamHandicap: calculatedTeamHandicap,
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

        // If no games exist yet, create all 18 placeholder games
        if (gamesData.length === 0) {
          console.log('No games found, creating placeholders for all 18 games');
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
              is_tiebreaker: false
            };
          });

          const { error: insertError } = await supabase
            .from('match_games')
            .insert(gamesToInsert);

          if (insertError) {
            console.error('Error creating placeholder games:', insertError);
          } else {
            console.log('Successfully created 18 placeholder games');

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
  }, [matchId, memberId, memberLoading]);

  /**
   * Real-time subscription to match_games table
   * Listens for INSERT/UPDATE/DELETE events and refreshes game results
   * This enables both teams to see opponent's score selections immediately
   */
  useEffect(() => {
    if (!matchId) return;

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

                console.log('Checking if confirmation needed for game', updatedGame.game_number);
                console.log('userTeamId:', userTeamId);
                console.log('match:', match);
                console.log('updatedGame.winner_player_id:', updatedGame.winner_player_id);
                console.log('updatedGame.confirmed_by_home:', updatedGame.confirmed_by_home);
                console.log('updatedGame.confirmed_by_away:', updatedGame.confirmed_by_away);

                // If game has a winner and is waiting for confirmation
                if (updatedGame.winner_player_id && (!updatedGame.confirmed_by_home || !updatedGame.confirmed_by_away)) {
                  // Get match data from state (closure issue - match might be stale)
                  if (!match || !userTeamId) {
                    console.log('Match or userTeamId not available yet, skipping auto-modal');
                    return;
                  }

                  // Determine if I need to confirm this
                  const isHomeTeam = userTeamId === match.home_team_id;
                  const needsMyConfirmation = isHomeTeam ? !updatedGame.confirmed_by_home : !updatedGame.confirmed_by_away;

                  console.log('isHomeTeam:', isHomeTeam);
                  console.log('needsMyConfirmation:', needsMyConfirmation);

                  if (needsMyConfirmation) {
                    // Auto-open confirmation modal
                    // Need to get player name from the refreshed data
                    const winnerPlayer = gamesData.find(g => g.game_number === updatedGame.game_number);
                    if (winnerPlayer && winnerPlayer.winner_player_id) {
                      const winnerName = getPlayerDisplayName(winnerPlayer.winner_player_id);
                      console.log('Auto-opening confirmation modal for game', updatedGame.game_number, 'winner:', winnerName);
                      setConfirmationGame({
                        gameNumber: updatedGame.game_number,
                        winnerPlayerName: winnerName
                      });
                    }
                  }
                }
              }
            }
          }

          refreshGames();
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [matchId, match, userTeamId, players]);

  /**
   * Get display name for a player (nickname or first name, max 12 chars)
   * Special handling for substitute player IDs
   */
  const getPlayerDisplayName = (playerId: string | null): string => {
    if (!playerId) return 'Substitute';

    // Check for special substitute IDs
    if (playerId === '00000000-0000-0000-0000-000000000001') return 'Substitute';
    if (playerId === '00000000-0000-0000-0000-000000000002') return 'Substitute';

    const player = players.get(playerId);
    if (!player) return 'Unknown';
    return player.nickname || player.first_name;
  };

  /**
   * Calculate player wins/losses from game results
   */
  const getPlayerStats = (playerId: string) => {
    let wins = 0;
    let losses = 0;

    gameResults.forEach(game => {
      // Only count confirmed games
      if (!game.confirmed_by_home || !game.confirmed_by_away) return;

      // Check if this player was in the game
      const wasInGame = game.home_player_id === playerId || game.away_player_id === playerId;
      if (!wasInGame) return;

      // Count win or loss
      if (game.winner_player_id === playerId) {
        wins++;
      } else if (game.winner_player_id) {
        // Game has a winner and it's not this player
        losses++;
      }
    });

    return { wins, losses };
  };

  /**
   * Calculate team wins/losses from game results
   */
  const getTeamStats = (teamId: string) => {
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
  };

  /**
   * Count completed games (confirmed by both teams)
   */
  const getCompletedGamesCount = () => {
    let count = 0;
    gameResults.forEach(game => {
      if (game.confirmed_by_home && game.confirmed_by_away) {
        count++;
      }
    });
    return count;
  };

  /**
   * Calculate current points for a team
   * Formula: games_won - (games_to_tie ?? games_to_win)
   */
  const calculatePoints = (teamId: string, thresholds: HandicapThresholds | null) => {
    if (!thresholds) return 0;
    const { wins } = getTeamStats(teamId);
    const baseline = thresholds.games_to_tie ?? thresholds.games_to_win;
    return wins - baseline;
  };

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
    if (existingGame && existingGame.winner_player_id && (!existingGame.confirmed_by_home || !existingGame.confirmed_by_away)) {
      // Determine if this is the opponent team
      const isHomeTeam = userTeamId === match.home_team_id;
      const needsMyConfirmation = isHomeTeam ? !existingGame.confirmed_by_home : !existingGame.confirmed_by_away;

      if (needsMyConfirmation) {
        // Show confirmation modal for opponent
        setConfirmationGame({
          gameNumber,
          winnerPlayerName: getPlayerDisplayName(existingGame.winner_player_id)
        });
        return;
      }
    }

    if (existingGame && existingGame.confirmed_by_home && existingGame.confirmed_by_away) {
      // Game already confirmed by both teams, don't allow changes
      alert('This game has already been confirmed by both teams. Use the Edit button to change it.');
      return;
    }

    // Open confirmation modal to score new game
    setScoringGame({
      gameNumber,
      winnerTeamId: teamId,
      winnerPlayerId: playerId,
      winnerPlayerName: playerName
    });
    setBreakAndRun(false);
    setGoldenBreak(false);
  };

  /**
   * Confirm opponent's score
   */
  const confirmOpponentScore = async (gameNumber: number) => {
    if (!match) return;

    const existingGame = gameResults.get(gameNumber);
    if (!existingGame) return;

    try {
      const isHomeTeam = userTeamId === match.home_team_id;

      const { error } = await supabase
        .from('match_games')
        .update({
          confirmed_by_home: isHomeTeam ? true : existingGame.confirmed_by_home,
          confirmed_by_away: !isHomeTeam ? true : existingGame.confirmed_by_away,
          confirmed_at: new Date().toISOString()
        })
        .eq('id', existingGame.id);

      if (error) throw error;

      // Refresh game results
      const { data: gamesData } = await supabase
        .from('match_games')
        .select('*')
        .eq('match_id', match.id);

      const gamesMap = new Map<number, MatchGame>();
      gamesData?.forEach(game => {
        gamesMap.set(game.game_number, game as MatchGame);
      });
      setGameResults(gamesMap);
    } catch (err: any) {
      console.error('Error confirming game:', err);
      alert(`Failed to confirm game: ${err.message}`);
    }
  };

  /**
   * Deny opponent's score - reset the game back to unscored
   */
  const denyOpponentScore = async (gameNumber: number) => {
    if (!match) return;

    const existingGame = gameResults.get(gameNumber);
    if (!existingGame) return;

    try {
      // Reset the game back to unscored state
      const { error } = await supabase
        .from('match_games')
        .update({
          winner_team_id: null,
          winner_player_id: null,
          break_and_run: false,
          golden_break: false,
          confirmed_by_home: false,
          confirmed_by_away: false,
          confirmed_at: null
        })
        .eq('id', existingGame.id);

      if (error) throw error;

      // Refresh game results
      const { data: gamesData } = await supabase
        .from('match_games')
        .select('*')
        .eq('match_id', match.id);

      const gamesMap = new Map<number, MatchGame>();
      gamesData?.forEach(game => {
        gamesMap.set(game.game_number, game as MatchGame);
      });
      setGameResults(gamesMap);

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
      const gameDefinition = getAllGames().find(g => g.gameNumber === scoringGame.gameNumber);
      if (!gameDefinition) {
        alert('Invalid game number');
        return;
      }

      // Get player IDs from lineups
      const homePlayerId = homeLineup[`player${gameDefinition.homePlayerPosition}_id` as keyof Lineup] as string;
      const awayPlayerId = awayLineup[`player${gameDefinition.awayPlayerPosition}_id` as keyof Lineup] as string;

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
        confirmed_by_away: !isHomeTeamScoring
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
          confirmed_by_home: isHomeTeamScoring ? true : existingGame.confirmed_by_home,
          confirmed_by_away: !isHomeTeamScoring ? true : existingGame.confirmed_by_away
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
          console.error('No rows updated - possible RLS policy blocking update');
          alert('Failed to update game. You may not have permission to score for this team.');
          return;
        }

        console.log('Game updated successfully');
      } else {
        // Insert new game
        const { error } = await supabase
          .from('match_games')
          .insert(gameData);

        if (error) throw error;
      }

      // Refresh game results
      const { data: gamesData } = await supabase
        .from('match_games')
        .select('*')
        .eq('match_id', match.id);

      const gamesMap = new Map<number, MatchGame>();
      gamesData?.forEach(game => {
        gamesMap.set(game.game_number, game as MatchGame);
      });
      setGameResults(gamesMap);

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
          <div className="text-lg font-semibold text-gray-700">Loading match...</div>
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
              <div className="text-lg font-semibold text-red-600 mb-2">Error</div>
              <div className="text-gray-700 mb-4">{error}</div>
              <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!match || !homeLineup || !awayLineup || !homeThresholds || !awayThresholds) {
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
              variant={showingHomeTeam ? "default" : "outline"}
              onClick={() => setShowingHomeTeam(true)}
            >
              {match.home_team?.team_name}
            </Button>
            <div className="text-sm text-gray-500 font-semibold px-2">vs</div>
            <Button
              variant={!showingHomeTeam ? "default" : "outline"}
              onClick={() => setShowingHomeTeam(false)}
            >
              {match.away_team?.team_name}
            </Button>
          </div>

          {/* Team scoreboard (shows one team at a time) */}
          {showingHomeTeam ? (
            <div className="space-y-2">
              <div className="text-center font-bold text-lg mb-2">HOME</div>
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
                    <div className="text-center">{getTeamStats(match.home_team_id).wins}</div>
                    <div className="text-center">{getTeamStats(match.home_team_id).losses}</div>
                  </div>
                  {/* Player rows */}
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">{homeLineup.player1_handicap}</div>
                    <div className="truncate">{getPlayerDisplayName(homeLineup.player1_id)}</div>
                    <div className="text-center">{homeLineup.player1_id ? getPlayerStats(homeLineup.player1_id).wins : 0}</div>
                    <div className="text-center">{homeLineup.player1_id ? getPlayerStats(homeLineup.player1_id).losses : 0}</div>
                  </div>
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">{homeLineup.player2_handicap}</div>
                    <div className="truncate">{getPlayerDisplayName(homeLineup.player2_id)}</div>
                    <div className="text-center">{homeLineup.player2_id ? getPlayerStats(homeLineup.player2_id).wins : 0}</div>
                    <div className="text-center">{homeLineup.player2_id ? getPlayerStats(homeLineup.player2_id).losses : 0}</div>
                  </div>
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">{homeLineup.player3_handicap}</div>
                    <div className="truncate">{getPlayerDisplayName(homeLineup.player3_id)}</div>
                    <div className="text-center">{homeLineup.player3_id ? getPlayerStats(homeLineup.player3_id).wins : 0}</div>
                    <div className="text-center">{homeLineup.player3_id ? getPlayerStats(homeLineup.player3_id).losses : 0}</div>
                  </div>
                </div>

                {/* Match stats card */}
                <div className="border border-gray-300 rounded p-2 bg-blue-50">
                  <div className="flex justify-around text-xs mb-2">
                    <div className="text-center">
                      <div className="text-gray-500">To Win</div>
                      <div className="font-semibold text-lg">{homeThresholds.games_to_win}</div>
                    </div>
                    {homeThresholds.games_to_tie !== null && (
                      <div className="text-center">
                        <div className="text-gray-500">To Tie</div>
                        <div className="font-semibold text-lg">{homeThresholds.games_to_tie}</div>
                      </div>
                    )}
                  </div>
                  <div className="text-center text-4xl font-bold mt-4">
                    {getTeamStats(match.home_team_id).wins} / {homeThresholds.games_to_win}
                  </div>
                  <div className="text-center text-sm mt-2">
                    Points - {calculatePoints(match.home_team_id, homeThresholds)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-center font-bold text-lg mb-2">AWAY</div>
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
                    <div className="text-center">{getTeamStats(match.away_team_id).wins}</div>
                    <div className="text-center">{getTeamStats(match.away_team_id).losses}</div>
                  </div>
                  {/* Player rows */}
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">{awayLineup.player1_handicap}</div>
                    <div className="truncate">{getPlayerDisplayName(awayLineup.player1_id)}</div>
                    <div className="text-center">{awayLineup.player1_id ? getPlayerStats(awayLineup.player1_id).wins : 0}</div>
                    <div className="text-center">{awayLineup.player1_id ? getPlayerStats(awayLineup.player1_id).losses : 0}</div>
                  </div>
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">{awayLineup.player2_handicap}</div>
                    <div className="truncate">{getPlayerDisplayName(awayLineup.player2_id)}</div>
                    <div className="text-center">{awayLineup.player2_id ? getPlayerStats(awayLineup.player2_id).wins : 0}</div>
                    <div className="text-center">{awayLineup.player2_id ? getPlayerStats(awayLineup.player2_id).losses : 0}</div>
                  </div>
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">{awayLineup.player3_handicap}</div>
                    <div className="truncate">{getPlayerDisplayName(awayLineup.player3_id)}</div>
                    <div className="text-center">{awayLineup.player3_id ? getPlayerStats(awayLineup.player3_id).wins : 0}</div>
                    <div className="text-center">{awayLineup.player3_id ? getPlayerStats(awayLineup.player3_id).losses : 0}</div>
                  </div>
                </div>

                {/* Match stats card */}
                <div className="border border-gray-300 rounded p-2 bg-orange-50">
                  <div className="flex justify-around text-xs mb-2">
                    <div className="text-center">
                      <div className="text-gray-500">To Win</div>
                      <div className="font-semibold text-lg">{awayThresholds.games_to_win}</div>
                    </div>
                    {awayThresholds.games_to_tie !== null && (
                      <div className="text-center">
                        <div className="text-gray-500">To Tie</div>
                        <div className="font-semibold text-lg">{awayThresholds.games_to_tie}</div>
                      </div>
                    )}
                  </div>
                  <div className="text-center text-4xl font-bold mt-4">
                    {getTeamStats(match.away_team_id).wins} / {awayThresholds.games_to_win}
                  </div>
                  <div className="text-center text-sm mt-2">
                    Points - {calculatePoints(match.away_team_id, awayThresholds)}
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
            Games Complete - <span className="text-lg">{getCompletedGamesCount()} / 18</span>
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
            {getAllGames().map(game => {
            const homePlayerId = homeLineup[`player${game.homePlayerPosition}_id` as keyof Lineup] as string;
            const awayPlayerId = awayLineup[`player${game.awayPlayerPosition}_id` as keyof Lineup] as string;
            const homePlayerName = getPlayerDisplayName(homePlayerId);
            const awayPlayerName = getPlayerDisplayName(awayPlayerId);

            // Determine who breaks and who racks, and which team they're from
            const breakerName = game.homeAction === 'breaks' ? homePlayerName : awayPlayerName;
            const breakerPlayerId = game.homeAction === 'breaks' ? homePlayerId : awayPlayerId;
            const breakerTeamId = game.homeAction === 'breaks' ? match.home_team_id : match.away_team_id;

            const rackerName = game.homeAction === 'racks' ? homePlayerName : awayPlayerName;
            const rackerPlayerId = game.homeAction === 'racks' ? homePlayerId : awayPlayerId;
            const rackerTeamId = game.homeAction === 'racks' ? match.home_team_id : match.away_team_id;

            const breakerIsHome = game.homeAction === 'breaks';
            const rackerIsHome = game.homeAction === 'racks';

            // Check game status
            const gameResult = gameResults.get(game.gameNumber);
            const hasWinner = gameResult && gameResult.winner_player_id;
            const isConfirmed = gameResult && gameResult.confirmed_by_home && gameResult.confirmed_by_away;
            const isPending = hasWinner && !isConfirmed;

            // If game has a winner (pending or confirmed)
            if (hasWinner) {
              const breakerWon = gameResult.winner_player_id === breakerPlayerId;
              const rackerWon = gameResult.winner_player_id === rackerPlayerId;

              // Determine styling based on confirmation status
              const winnerClass = isConfirmed ? 'bg-green-200 font-semibold' : 'bg-yellow-100 font-semibold';
              const loserClass = isConfirmed ? 'bg-gray-100 text-gray-500' : 'bg-gray-50 text-gray-400';

              // If pending, allow clicking to confirm/deny
              if (isPending) {
                return (
                  <div key={game.gameNumber} className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-sm py-2 border-b">
                    <div className="font-semibold">{game.gameNumber}.</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full ${breakerWon ? winnerClass : loserClass}`}
                      onClick={() => handlePlayerClick(game.gameNumber, breakerPlayerId, breakerName, breakerTeamId)}
                    >
                      {breakerName}
                      {breakerWon && <span className="ml-1 text-xs">⏳</span>}
                    </Button>
                    <div className="text-center font-semibold text-gray-400">vs</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full ${rackerWon ? winnerClass : loserClass}`}
                      onClick={() => handlePlayerClick(game.gameNumber, rackerPlayerId, rackerName, rackerTeamId)}
                    >
                      {rackerName}
                      {rackerWon && <span className="ml-1 text-xs">⏳</span>}
                    </Button>
                  </div>
                );
              }

              // If confirmed, show as static divs with Edit button
              return (
                <div key={game.gameNumber} className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-sm py-2 border-b">
                  <div className="font-semibold">{game.gameNumber}.</div>
                  <div className={`text-center p-2 rounded ${breakerWon ? winnerClass : loserClass}`}>
                    {breakerName}
                  </div>
                  <Button variant="outline" size="sm" className="text-xs">
                    Edit
                  </Button>
                  <div className={`text-center p-2 rounded ${rackerWon ? winnerClass : loserClass}`}>
                    {rackerName}
                  </div>
                </div>
              );
            }

            return (
              <div key={game.gameNumber} className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-sm py-2 border-b">
                <div className="font-semibold">{game.gameNumber}.</div>
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full ${breakerIsHome ? 'bg-blue-100 hover:bg-blue-200' : 'bg-orange-100 hover:bg-orange-200'}`}
                    onClick={() => handlePlayerClick(game.gameNumber, breakerPlayerId, breakerName, breakerTeamId)}
                  >
                    {breakerName}
                  </Button>
                </div>
                <div className="text-center font-semibold text-gray-400">vs</div>
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full ${rackerIsHome ? 'bg-blue-100 hover:bg-blue-200' : 'bg-orange-100 hover:bg-orange-200'}`}
                    onClick={() => handlePlayerClick(game.gameNumber, rackerPlayerId, rackerName, rackerTeamId)}
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
      <Dialog open={scoringGame !== null} onOpenChange={(open) => {
        if (!open) {
          setScoringGame(null);
          setBreakAndRun(false);
          setGoldenBreak(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Game Winner</DialogTitle>
            <DialogDescription>
              Select any special achievements for this game.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Game {scoringGame?.gameNumber}</p>
              <p className="text-lg font-semibold mt-2">Winner: {scoringGame?.winnerPlayerName}</p>
            </div>

            {/* Break & Run Checkbox (always visible) */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="breakAndRun"
                checked={breakAndRun}
                onChange={(e) => {
                  setBreakAndRun(e.target.checked);
                  if (e.target.checked) setGoldenBreak(false); // Uncheck golden break if B&R is checked
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="breakAndRun" className="text-sm font-normal cursor-pointer">
                Break & Run (B&R)
              </label>
            </div>

            {/* Golden Break Checkbox (only if league allows it) */}
            {goldenBreakCountsAsWin && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="goldenBreak"
                  checked={goldenBreak}
                  onChange={(e) => {
                    setGoldenBreak(e.target.checked);
                    if (e.target.checked) setBreakAndRun(false); // Uncheck B&R if golden break is checked
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="goldenBreak" className="text-sm font-normal cursor-pointer">
                  Golden Break (8BB/9BB)
                </label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setScoringGame(null);
                setBreakAndRun(false);
                setGoldenBreak(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmScore}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Opponent Confirmation Modal */}
      <Dialog open={confirmationGame !== null} onOpenChange={(open) => {
        if (!open) {
          setConfirmationGame(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Opponent's Score</DialogTitle>
            <DialogDescription>
              Verify the game result submitted by your opponent.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-center">
              Opponent scored game <span className="font-semibold">{confirmationGame?.gameNumber}</span> for{' '}
              <span className="font-semibold">{confirmationGame?.winnerPlayerName}</span>.
            </p>
            <p className="text-center mt-4 text-gray-600">
              Do you agree with this result?
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (confirmationGame) {
                  denyOpponentScore(confirmationGame.gameNumber);
                  setConfirmationGame(null);
                }
              }}
            >
              Deny
            </Button>
            <Button onClick={() => {
              if (confirmationGame) {
                confirmOpponentScore(confirmationGame.gameNumber);
                setConfirmationGame(null);
              }
            }}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
