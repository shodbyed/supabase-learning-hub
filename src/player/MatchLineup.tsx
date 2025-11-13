/**
 * @fileoverview Match Lineup Page
 *
 * Mobile-first lineup selection page where players choose their 3-player lineup
 * before starting a match. Shows player handicaps and calculates team total.
 *
 * Flow: Team Schedule → Score Match → Lineup Entry
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Users } from 'lucide-react';
import { useCurrentMember } from '@/api/hooks';
import { calculatePlayerHandicap } from '@/utils/calculatePlayerHandicap';
import { getTeamHandicapBonus } from '@/utils/getTeamHandicapBonus';
import { calculateTeamHandicap, calculate3v3HandicapDiffs } from '@/utils/handicapCalculations';
import type { HandicapVariant } from '@/utils/handicapCalculations';
import { MatchInfoCard } from '@/components/lineup/MatchInfoCard';
import { TestModeToggle } from '@/components/lineup/TestModeToggle';
import { PlayerRoster, type RosterPlayer } from '@/components/lineup/PlayerRoster';
import { LineupActions } from '@/components/lineup/LineupActions';
import { generateGameOrder } from '@/utils/gameOrder';
import { InfoButton } from '@/components/InfoButton';
import { generateNickname } from '@/utils/nicknameGenerator';
import { updateMemberNickname } from '@/api/mutations/members';

// Special substitute member IDs
const SUB_HOME_ID = '00000000-0000-0000-0000-000000000001';
const SUB_AWAY_ID = '00000000-0000-0000-0000-000000000002';

interface Match {
  id: string;
  scheduled_date: string;
  season_id: string;
  home_team_id: string;
  away_team_id: string;
  match_result: 'home_win' | 'away_win' | 'tie' | null;
  home_team: {
    id: string;
    team_name: string;
  } | null;
  away_team: {
    id: string;
    team_name: string;
  } | null;
  scheduled_venue: {
    id: string;
    name: string;
    city: string;
    state: string;
  } | null;
  season_week: {
    scheduled_date: string;
  } | null;
  league: {
    handicap_variant: HandicapVariant;
    team_handicap_variant: HandicapVariant;
    game_type: 'eight_ball' | 'nine_ball' | 'ten_ball';
    team_format: '5_man' | '8_man';
  };
}

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  handicap: number; // Mock for now - will calculate from game history later
}

export function MatchLineup() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { data: member, isLoading: memberLoading } = useCurrentMember();
  const memberId = member?.id;

  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Team handicap bonus (only for home team)
  const [teamHandicap, setTeamHandicap] = useState<number>(0);

  // Lineup selection (value is UUID or "SUBSTITUTE")
  const [player1Id, setPlayer1Id] = useState<string>('');
  const [player2Id, setPlayer2Id] = useState<string>('');
  const [player3Id, setPlayer3Id] = useState<string>('');
  const [lineupLocked, setLineupLocked] = useState(false);

  // Substitute handicap (only used if one player is "SUBSTITUTE")
  const [subHandicap, setSubHandicap] = useState<string>('');

  // Opponent lineup status
  const [opponentLineup, setOpponentLineup] = useState<any>(null);

  // Determine user's team
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [isHomeTeam, setIsHomeTeam] = useState<boolean | null>(null);

  // Lineup ID (for updates after initial save)
  const [lineupId, setLineupId] = useState<string | null>(null);

  // Test mode for manual handicap override
  const [testMode, setTestMode] = useState(false);
  const [testHandicaps, setTestHandicaps] = useState<Record<string, number>>({});
  const [, setTestTeamBonus] = useState<number | null>(null);

  useEffect(() => {
    async function fetchMatchAndLineup() {
      // Wait for member data to load
      if (memberLoading) return;

      if (!matchId || !memberId) {
        setError('Missing match or member information');
        setLoading(false);
        return;
      }

      try {
        // Fetch match details with league handicap variants
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select(`
            id,
            home_team_id,
            away_team_id,
            season_id,
            match_result,
            home_team:teams!matches_home_team_id_fkey(id, team_name),
            away_team:teams!matches_away_team_id_fkey(id, team_name),
            scheduled_venue:venues!matches_scheduled_venue_id_fkey(id, name, city, state),
            season_week:season_weeks(scheduled_date),
            season:seasons!matches_season_id_fkey(
              league:leagues(
                handicap_variant,
                team_handicap_variant,
                game_type,
                team_format
              )
            )
          `)
          .eq('id', matchId)
          .single();

        if (matchError) throw matchError;

        console.log('Match data received:', matchData);

        // Extract handicap variants from nested league data
        const seasonData = Array.isArray(matchData.season)
          ? matchData.season[0]
          : matchData.season;
        const leagueData = seasonData && Array.isArray((seasonData as any).league)
          ? (seasonData as any).league[0]
          : (seasonData as any)?.league;
        const playerVariant = (leagueData?.handicap_variant || 'standard') as HandicapVariant;
        const teamVariant = (leagueData?.team_handicap_variant || 'standard') as HandicapVariant;
        const gameType = (leagueData?.game_type || 'eight_ball') as 'eight_ball' | 'nine_ball' | 'ten_ball';
        const teamFormat = (leagueData?.team_format || '5_man') as '5_man' | '8_man';
        console.log('League settings:', { playerVariant, teamVariant, gameType, teamFormat });

        // Transform to include scheduled_date - handle both array and object formats
        const homeTeam = Array.isArray(matchData.home_team)
          ? matchData.home_team[0]
          : matchData.home_team;
        const awayTeam = Array.isArray(matchData.away_team)
          ? matchData.away_team[0]
          : matchData.away_team;
        const venue = Array.isArray(matchData.scheduled_venue)
          ? matchData.scheduled_venue[0]
          : matchData.scheduled_venue;
        const seasonWeek = Array.isArray(matchData.season_week)
          ? matchData.season_week[0]
          : matchData.season_week;

        const transformedMatch: Match = {
          id: matchData.id,
          scheduled_date: (seasonWeek as any)?.scheduled_date || '',
          season_id: matchData.season_id,
          home_team_id: matchData.home_team_id,
          away_team_id: matchData.away_team_id,
          match_result: matchData.match_result,
          home_team: homeTeam as any || null,
          away_team: awayTeam as any || null,
          scheduled_venue: venue as any || null,
          season_week: seasonWeek as any || null,
          league: {
            handicap_variant: playerVariant,
            team_handicap_variant: teamVariant,
            game_type: gameType,
            team_format: teamFormat,
          },
        };

        console.log('Transformed match:', transformedMatch);
        setMatch(transformedMatch);

        // Calculate team handicap (only for home team)
        // NOTE: Set to 0 for now - will be calculated from standings page when built
        const calculatedTeamHandicap = 0;
        setTeamHandicap(calculatedTeamHandicap);
        console.log('Team handicap set to:', calculatedTeamHandicap);

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
        console.log('User team determination:', {
          userTeam,
          homeTeamId: matchData.home_team_id,
          awayTeamId: matchData.away_team_id,
          isHome,
        });
        setUserTeamId(userTeam);
        setIsHomeTeam(isHome);

        // Fetch all players on user's team
        const { data: playersData, error: playersError } = await supabase
          .from('team_players')
          .select(`
            is_captain,
            members:members!team_players_member_id_fkey(
              id,
              first_name,
              last_name,
              nickname
            )
          `)
          .eq('team_id', userTeam)
          .order('is_captain', { ascending: false }); // Captain first

        if (playersError) throw playersError;

        // Calculate handicaps for all players
        // Handicaps are game-type specific (8-ball games don't count for 9-ball, etc.)
        // Use Test Mode to manually override handicaps for testing
        const transformedPlayers = await Promise.all(
          (playersData || []).map(async (p: any) => {
            const handicap = await calculatePlayerHandicap(
              p.members.id,
              teamFormat,
              playerVariant,
              gameType,
              matchData.season_id // Prioritize current season games
            );

            // Generate nickname if missing
            let nickname = p.members.nickname;
            if (!nickname) {
              nickname = generateNickname(p.members.first_name, p.members.last_name);
              // Update the member record with the generated nickname using TanStack mutation
              await updateMemberNickname({
                memberId: p.members.id,
                nickname
              });
            }

            return {
              id: p.members.id,
              first_name: p.members.first_name,
              last_name: p.members.last_name,
              nickname,
              handicap,
            };
          })
        );

        // Add the appropriate substitute member to the players list
        const substituteId = isHome ? SUB_HOME_ID : SUB_AWAY_ID;
        const { data: subData, error: subError } = await supabase
          .from('members')
          .select('id, first_name, last_name, nickname')
          .eq('id', substituteId)
          .single();

        if (!subError && subData) {
          transformedPlayers.push({
            id: subData.id,
            first_name: subData.first_name,
            last_name: subData.last_name,
            nickname: subData.nickname,
            handicap: 0, // Will be calculated based on highest unused or manual entry
          });
        }

        console.log('Players with calculated handicaps (including substitute):', transformedPlayers);
        setPlayers(transformedPlayers);

        // Calculate team handicap bonus (only applies to home team)
        if (isHome && matchData.away_team_id) {
          const bonus = await getTeamHandicapBonus(
            matchData.home_team_id,
            matchData.away_team_id,
            matchData.season_id,
            teamFormat
          );
          setTeamHandicap(bonus);
          console.log('Team handicap bonus calculated:', bonus);
        }

        // Check if lineup already exists for this team
        // If not, create an empty one so real-time subscriptions work immediately
        const { data: existingLineup, error: lineupError } = await supabase
          .from('match_lineups')
          .select('*')
          .eq('match_id', matchId)
          .eq('team_id', userTeam)
          .maybeSingle();

        let lineupRecord;
        if (!lineupError && existingLineup) {
          // Load existing lineup and use stored handicaps for consistency
          console.log('Loading existing lineup from database:', existingLineup);
          lineupRecord = existingLineup;
        } else {
          // Create empty lineup record for real-time to watch
          // Use INSERT ... ON CONFLICT DO NOTHING to handle race conditions
          console.log('Creating empty lineup record for team:', userTeam);
          const { data: newLineup, error: createError } = await supabase
            .from('match_lineups')
            .insert({
              match_id: matchId,
              team_id: userTeam,
              player1_id: null,
              player1_handicap: 0,
              player2_id: null,
              player2_handicap: 0,
              player3_id: null,
              player3_handicap: 0,
              home_team_modifier: 0,
              locked: false,
              locked_at: null,
            })
            .select()
            .single();

          if (createError) {
            // Check if it's a unique constraint violation (another team member just created it)
            if (createError.code === '23505') {
              console.log('Lineup already created by another team member, fetching...');
              // Fetch the record that was just created
              const { data: refetchedLineup } = await supabase
                .from('match_lineups')
                .select('*')
                .eq('match_id', matchId)
                .eq('team_id', userTeam)
                .single();
              lineupRecord = refetchedLineup;
            } else {
              throw createError;
            }
          } else {
            lineupRecord = newLineup;
          }
        }

        // Load lineup data into state
        if (lineupRecord) {
          setLineupId(lineupRecord.id);
          // Only use player IDs if they exist and aren't already substitutes
          // Empty strings mean "not selected yet"
          setPlayer1Id(lineupRecord.player1_id || '');
          setPlayer2Id(lineupRecord.player2_id || '');
          setPlayer3Id(lineupRecord.player3_id || '');
          setLineupLocked(lineupRecord.locked);

          // Update players array with stored handicaps to ensure consistency
          // across all team members viewing this lineup
          if (lineupRecord.player1_id || lineupRecord.player2_id || lineupRecord.player3_id) {
            const updatedPlayers = transformedPlayers.map((player) => {
              if (player.id === lineupRecord.player1_id) {
                return { ...player, handicap: parseFloat(lineupRecord.player1_handicap) };
              }
              if (player.id === lineupRecord.player2_id) {
                return { ...player, handicap: parseFloat(lineupRecord.player2_handicap) };
              }
              if (player.id === lineupRecord.player3_id) {
                return { ...player, handicap: parseFloat(lineupRecord.player3_handicap) };
              }
              return player;
            });
            setPlayers(updatedPlayers);
          }

          // If any player is a substitute, get the handicap
          if (!lineupRecord.player1_id && lineupRecord.player1_handicap) {
            setSubHandicap(lineupRecord.player1_handicap.toString());
          } else if (!lineupRecord.player2_id && lineupRecord.player2_handicap) {
            setSubHandicap(lineupRecord.player2_handicap.toString());
          } else if (!lineupRecord.player3_id && lineupRecord.player3_handicap) {
            setSubHandicap(lineupRecord.player3_handicap.toString());
          }
        }

        // Fetch opponent's lineup
        const opponentTeamId = isHome ? matchData.away_team_id : matchData.home_team_id;
        const { data: opponentLineupData } = await supabase
          .from('match_lineups')
          .select('*')
          .eq('match_id', matchId)
          .eq('team_id', opponentTeamId)
          .maybeSingle();

        if (opponentLineupData) {
          setOpponentLineup(opponentLineupData);
        }
      } catch (err: any) {
        console.error('Error fetching match/lineup:', err);
        setError(err.message || 'Failed to load match information');
      } finally {
        setLoading(false);
      }
    }

    fetchMatchAndLineup();
  }, [matchId, memberId, memberLoading]);

  // Real-time subscription for opponent lineup changes
  useEffect(() => {
    if (!matchId || !match || isHomeTeam === null) return;

    const opponentTeamId = isHomeTeam ? match.away_team_id : match.home_team_id;

    console.log('Setting up real-time subscription:', {
      matchId,
      userTeamId,
      opponentTeamId,
      isHomeTeam,
    });

    // Subscribe to opponent's lineup changes
    const channel = supabase
      .channel(`match-lineup-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_lineups',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          // Only update if it's the opponent's lineup
          if (payload.new && (payload.new as any).team_id === opponentTeamId) {
            setOpponentLineup(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, match, isHomeTeam, userTeamId]);

  // Track if we've already prepared the match (to avoid duplicate preparation)
  const matchPreparedRef = useRef(false);

  // Auto-navigate to scoring page when both lineups are locked
  // UNLESS this is a tiebreaker scenario (match_result = 'tie')
  // IMPORTANT: Only HOME team prepares the match to avoid race conditions
  useEffect(() => {
    if (lineupLocked && opponentLineup?.locked && !matchPreparedRef.current) {
      // If this is a tiebreaker (match ended in tie), don't auto-navigate
      // User will manually proceed when ready
      if (match?.match_result === 'tie') {
        console.log('Both lineups locked (tiebreaker) - waiting for manual proceed');
        return;
      }

      // Only home team prepares the match data to avoid both teams doing it simultaneously
      if (!isHomeTeam) {
        console.log('Away team detected both lineups locked - navigating directly to scoring');
        matchPreparedRef.current = true;
        navigate(`/match/${matchId}/score`);
        return;
      }

      const prepareMatchAndNavigate = async () => {
        if (!matchId || !match || !opponentLineup) return;

        console.log('Home team preparing match data...');

        try {
          matchPreparedRef.current = true;
          console.log('Both lineups locked - preparing match data before navigation');

          // Build current user's lineup object from state
          const myLineup = {
            player1_id: player1Id,
            player1_handicap: getPlayerHandicap(player1Id),
            player2_id: player2Id,
            player2_handicap: getPlayerHandicap(player2Id),
            player3_id: player3Id,
            player3_handicap: getPlayerHandicap(player3Id),
          };

          // Step 1: Calculate handicap thresholds
          const teamHandicap = await calculateTeamHandicap(
            match.home_team_id,
            match.away_team_id,
            match.season_id,
            match.league.team_handicap_variant
          );

          const { homeDiff, awayDiff } = calculate3v3HandicapDiffs(
            myLineup as any,
            opponentLineup,
            teamHandicap
          );

          console.log('Handicap differentials calculated:', { homeDiff, awayDiff });

          // Fetch threshold data from handicap chart (column name is hcp_diff, not handicap_differential)
          const { data: homeThresholds, error: homeThresholdsError } = await supabase
            .from('handicap_chart_3vs3')
            .select('*')
            .eq('hcp_diff', homeDiff)
            .single();

          if (homeThresholdsError) {
            console.error('Home thresholds lookup error:', homeThresholdsError);
            throw new Error(`Failed to fetch home handicap thresholds for diff ${homeDiff}: ${homeThresholdsError.message}`);
          }

          const { data: awayThresholds, error: awayThresholdsError } = await supabase
            .from('handicap_chart_3vs3')
            .select('*')
            .eq('hcp_diff', awayDiff)
            .single();

          if (awayThresholdsError) {
            console.error('Away thresholds lookup error:', awayThresholdsError);
            throw new Error(`Failed to fetch away handicap thresholds for diff ${awayDiff}: ${awayThresholdsError.message}`);
          }

          if (!homeThresholds || !awayThresholds) {
            throw new Error('Failed to fetch handicap thresholds - data is null');
          }

          // Step 2: Save thresholds to match table
          console.log('Saving handicap thresholds to match:', {
            home_games_to_win: homeThresholds.games_to_win,
            home_games_to_tie: homeThresholds.games_to_tie,
            home_games_to_lose: homeThresholds.games_to_lose,
            away_games_to_win: awayThresholds.games_to_win,
            away_games_to_tie: awayThresholds.games_to_tie,
            away_games_to_lose: awayThresholds.games_to_lose,
          });

          const { error: thresholdError } = await supabase
            .from('matches')
            .update({
              home_games_to_win: homeThresholds.games_to_win,
              home_games_to_tie: homeThresholds.games_to_tie,
              home_games_to_lose: homeThresholds.games_to_lose,
              away_games_to_win: awayThresholds.games_to_win,
              away_games_to_tie: awayThresholds.games_to_tie,
              away_games_to_lose: awayThresholds.games_to_lose,
            })
            .eq('id', matchId);

          if (thresholdError) {
            throw new Error(`Failed to save thresholds: ${thresholdError.message}`);
          }

          // Step 3: Create all game rows in match_games table with complete game structure
          // Determine game format and count based on league.team_format
          const teamFormat = match.league.team_format;
          const playersPerTeam = teamFormat === '8_man' ? 5 : 3;
          const useDoubleRoundRobin = playersPerTeam === 3; // 3v3 uses double round-robin (18 games), 5v5 uses single (25 games)

          // Generate game order using the algorithm
          const allGames = generateGameOrder(playersPerTeam, useDoubleRoundRobin);

          // Determine which lineup is home vs away
          const homeLineup = isHomeTeam ? myLineup : opponentLineup;
          const awayLineup = isHomeTeam ? opponentLineup : myLineup;

          // Create games with actual player IDs looked up from lineups
          const gameRows = allGames.map(game => ({
            match_id: matchId,
            game_number: game.gameNumber,
            game_type: match.league.game_type || 'eight_ball',
            // Look up actual player IDs from lineups using positions
            home_player_id: (homeLineup as any)[`player${game.homePlayerPosition}_id`],
            away_player_id: (awayLineup as any)[`player${game.awayPlayerPosition}_id`],
            home_action: game.homeAction,
            away_action: game.awayAction,
            // Winner and confirmation fields remain null until game is scored
          }));

          console.log(`Creating ${gameRows.length} game rows in match_games table`);
          const { error: gamesError } = await supabase
            .from('match_games')
            .insert(gameRows);

          if (gamesError) {
            // If games already exist (e.g., tiebreaker), that's OK - ignore duplicate key errors
            if (!gamesError.message.includes('duplicate key')) {
              throw new Error(`Failed to create games: ${gamesError.message}`);
            }
            console.log('Games already exist (likely a tiebreaker) - continuing');
          }

          console.log('Match preparation complete - navigating to scoring page');
          navigate(`/match/${matchId}/score`);
        } catch (error: any) {
          console.error('Error preparing match:', error);
          alert(`Failed to prepare match: ${error.message}`);
          matchPreparedRef.current = false; // Reset so they can try again
        }
      };

      prepareMatchAndNavigate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineupLocked, opponentLineup, matchId, navigate, match, player1Id, player2Id, player3Id]);

  /**
   * Helper: Check if any player is a substitute
   */
  const hasSub = (): boolean => {
    return player1Id === SUB_HOME_ID || player1Id === SUB_AWAY_ID ||
           player2Id === SUB_HOME_ID || player2Id === SUB_AWAY_ID ||
           player3Id === SUB_HOME_ID || player3Id === SUB_AWAY_ID;
  };

  /**
   * Helper: Get the highest handicap of players NOT in the lineup
   */
  const getHighestUnusedHandicap = (): number => {
    const usedPlayerIds = [player1Id, player2Id, player3Id].filter(
      (id) => id && id !== SUB_HOME_ID && id !== SUB_AWAY_ID
    );
    const unusedPlayers = players.filter((p) => !usedPlayerIds.includes(p.id));

    if (unusedPlayers.length === 0) return 0;

    // Use test mode overrides if available
    return Math.max(...unusedPlayers.map((p) => {
      if (testMode && testHandicaps[p.id] !== undefined) {
        return testHandicaps[p.id];
      }
      return p.handicap;
    }));
  };

  /**
   * Helper: Get handicap for a player slot
   */
  const getPlayerHandicap = (playerId: string): number => {
    // In test mode, use override handicaps if available
    if (testMode && testHandicaps[playerId] !== undefined) {
      return testHandicaps[playerId];
    }

    if (playerId === SUB_HOME_ID || playerId === SUB_AWAY_ID) {
      const highestUnused = getHighestUnusedHandicap();

      // If sub handicap is manually entered, use the HIGHER of the two
      if (subHandicap) {
        const subValue = parseFloat(subHandicap);
        return Math.max(subValue, highestUnused);
      }

      // Otherwise use highest handicap of unused players
      return highestUnused;
    }
    const player = players.find((p) => p.id === playerId);
    return player?.handicap || 0;
  };

  /**
   * Helper: Format handicap display (show whole number if .0, otherwise 1 decimal)
   */
  const formatHandicap = (handicap: number): string => {
    return handicap % 1 === 0 ? handicap.toString() : handicap.toFixed(1);
  };

  /**
   * Calculate total player handicap (sum of 3 players)
   */
  const calculatePlayerHandicapTotal = (): number => {
    const h1 = getPlayerHandicap(player1Id);
    const h2 = getPlayerHandicap(player2Id);
    const h3 = getPlayerHandicap(player3Id);

    const total = h1 + h2 + h3;
    return Math.round(total * 10) / 10; // Round to 1 decimal
  };

  /**
   * Calculate final team total (player handicaps + team bonus for home team)
   */
  const calculateFinalTeamHandicap = (): number => {
    const playerTotal = calculatePlayerHandicapTotal();

    // Team bonus set to 0 for now - will be calculated from standings page when built
    // Only home team gets team handicap bonus (currently 0)
    const bonus = isHomeTeam ? teamHandicap : 0;

    return Math.round((playerTotal + bonus) * 10) / 10; // Round to 1 decimal
  };

  /**
   * Check if lineup is complete
   */
  /**
   * Helper: Check if lineup has duplicate nicknames
   */
  const hasDuplicateNicknames = (): boolean => {
    if (!player1Id || !player2Id || !player3Id) return false;

    const player1 = players.find(p => p.id === player1Id);
    const player2 = players.find(p => p.id === player2Id);
    const player3 = players.find(p => p.id === player3Id);

    if (!player1 || !player2 || !player3) return false;

    const nickname1 = player1.nickname || '';
    const nickname2 = player2.nickname || '';
    const nickname3 = player3.nickname || '';

    // Check if any two nicknames match
    return nickname1 === nickname2 || nickname1 === nickname3 || nickname2 === nickname3;
  };

  const isLineupComplete = (): boolean => {
    const playersSelected = !!(player1Id && player2Id && player3Id);
    // If there's a sub, handicap must be selected
    if (hasSub()) {
      return playersSelected && !!subHandicap;
    }
    return playersSelected;
  };

  /**
   * Handle lock lineup - Save to database and lock
   */
  const handleLockLineup = async () => {
    if (!isLineupComplete()) {
      alert('Please select all 3 players before locking your lineup');
      return;
    }

    if (hasDuplicateNicknames()) {
      alert('Two or more players in your lineup have the same nickname. Please have at least one of them go to their profile page to change their nickname so they will be identifiable during scoring.');
      return;
    }

    if (!matchId || !userTeamId) {
      alert('Error: Missing match or team information');
      return;
    }

    try {
      // Verify user is on the team
      const { data: teamCheck, error: teamCheckError } = await supabase
        .from('team_players')
        .select('*')
        .eq('team_id', userTeamId)
        .eq('member_id', memberId)
        .single();

      if (teamCheckError || !teamCheck) {
        throw new Error('You are not a member of this team');
      }

      // Prepare lineup data (keep substitute IDs, don't convert to null)
      const lineupData = {
        match_id: matchId,
        team_id: userTeamId,
        player1_id: player1Id,
        player1_handicap: getPlayerHandicap(player1Id),
        player2_id: player2Id,
        player2_handicap: getPlayerHandicap(player2Id),
        player3_id: player3Id,
        player3_handicap: getPlayerHandicap(player3Id),
        home_team_modifier: teamHandicap, // Team modifier from standings (currently 0)
        locked: true,
        locked_at: new Date().toISOString(), // Timestamp when lineup was locked
      };

      let result;

      if (lineupId) {
        // Update existing lineup
        result = await supabase
          .from('match_lineups')
          .update(lineupData)
          .eq('id', lineupId)
          .select()
          .single();
      } else {
        // Insert new lineup
        result = await supabase
          .from('match_lineups')
          .insert(lineupData)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Database error details:', {
          code: result.error.code,
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint,
          lineupData,
        });
        throw result.error;
      }

      // Update local state
      setLineupId(result.data.id);
      setLineupLocked(true);

      // Save lineup ID to matches table
      const isHomeTeam = userTeamId === match?.home_team_id;
      const lineupField = isHomeTeam ? 'home_lineup_id' : 'away_lineup_id';

      const { error: matchUpdateError } = await supabase
        .from('matches')
        .update({ [lineupField]: result.data.id })
        .eq('id', matchId);

      if (matchUpdateError) {
        console.error('Error updating match with lineup ID:', matchUpdateError);
        // Don't throw - lineup is still locked, just log the error
      }
    } catch (err: any) {
      console.error('Error saving lineup:', err);
      alert(`Failed to save lineup: ${err.message || 'Unknown error'}`);
    }
  };

  /**
   * Handle unlock lineup - Only allowed if opponent hasn't locked yet
   */
  const handleUnlockLineup = async () => {
    if (!lineupId) {
      alert('Error: No lineup to unlock');
      return;
    }

    try {
      const result = await supabase
        .from('match_lineups')
        .update({ locked: false, locked_at: null })
        .eq('id', lineupId)
        .select()
        .single();

      if (result.error) throw result.error;

      setLineupLocked(false);
      console.log('Lineup unlocked successfully:', result.data);
    } catch (err: any) {
      console.error('Error unlocking lineup:', err);
      alert('Failed to unlock lineup. Please try again.');
    }
  };

  /**
   * Get opponent team info
   */
  const getOpponentTeam = () => {
    if (!match) return null;
    return isHomeTeam ? match.away_team : match.home_team;
  };

  if (loading || memberLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading match...</p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error || 'Match not found'}</p>
            <Link to="/my-teams">
              <Button variant="outline" className="mt-4">
                Back to My Teams
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const opponent = getOpponentTeam();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <Link
            to={`/team/${userTeamId}/schedule`}
            className="flex items-center gap-2 text-sm text-gray-600 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schedule
          </Link>
          <div className="text-4xl font-semibold text-gray-900">Lineup Entry</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Match Info Card */}
        <MatchInfoCard
          scheduledDate={match.scheduled_date}
          opponent={opponent ? { id: opponent.id, name: opponent.team_name } : null}
          isHomeTeam={isHomeTeam || false}
          venueId={match.scheduled_venue?.id || null}
        />

        {/* Lineup Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Your Lineup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Test Mode Toggle */}
            <TestModeToggle
              enabled={testMode}
              onChange={(enabled) => {
                setTestMode(enabled);
                if (!enabled) {
                  setTestHandicaps({});
                  setTestTeamBonus(null);
                }
              }}
              disabled={lineupLocked}
            />


            {/* Available Players List */}
            <PlayerRoster
              players={players
                .filter(p => p.id !== SUB_HOME_ID && p.id !== SUB_AWAY_ID) // Exclude substitute from roster
                .map((p): RosterPlayer => ({
                  id: p.id,
                  firstName: p.first_name,
                  lastName: p.last_name,
                  nickname: p.nickname,
                  handicap: p.handicap,
                }))}
              showHandicaps={true}
              testMode={testMode}
              testHandicaps={testHandicaps}
              onHandicapOverride={(playerId, handicap) => {
                setTestHandicaps(prev => ({
                  ...prev,
                  [playerId]: handicap,
                }));
              }}
              disabled={lineupLocked}
            />

            {/* Player Selection Dropdowns */}
            <div className="pt-2">
              {/* Header Row */}
              <div className="flex gap-3 items-center pb-1 border-b">
                <div className="w-12 text-center">
                  <div className="text-xs font-medium text-gray-500">Player</div>
                </div>
                <div className="w-12 text-center">
                  <div className="text-xs font-medium text-gray-500">H/C</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-500">Player Name</div>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                {/* Player 1 */}
                <div className="flex gap-3 items-center">
                  <div className="w-12 text-center">
                    <div className="text-sm font-semibold text-gray-700">1</div>
                  </div>
                  <div className="w-12 text-center">
                    <div className="text-sm font-semibold text-blue-600">
                      {player1Id ? formatHandicap(getPlayerHandicap(player1Id)) : '-'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Select
                      value={player1Id}
                      onValueChange={setPlayer1Id}
                      disabled={lineupLocked}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Player 1" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player) => (
                          <SelectItem
                            key={player.id}
                            value={player.id}
                            disabled={player.id === player2Id || player.id === player3Id}
                          >
                            {player.nickname || `${player.first_name} ${player.last_name}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(player1Id === SUB_HOME_ID || player1Id === SUB_AWAY_ID) && (
                  <div className="flex gap-3 items-center ml-12">
                    <div className="flex-1">
                      <Select
                        value={subHandicap}
                        onValueChange={setSubHandicap}
                        disabled={lineupLocked}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sub H/C" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">+2</SelectItem>
                          <SelectItem value="1">+1</SelectItem>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="-1">-1</SelectItem>
                          <SelectItem value="-2">-2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Player 2 */}
                <div className="flex gap-3 items-center">
                  <div className="w-12 text-center">
                    <div className="text-sm font-semibold text-gray-700">2</div>
                  </div>
                  <div className="w-12 text-center">
                    <div className="text-sm font-semibold text-blue-600">
                      {player2Id ? formatHandicap(getPlayerHandicap(player2Id)) : '-'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Select
                      value={player2Id}
                      onValueChange={setPlayer2Id}
                      disabled={lineupLocked}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Player 2" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player) => (
                          <SelectItem
                            key={player.id}
                            value={player.id}
                            disabled={player.id === player1Id || player.id === player3Id}
                          >
                            {player.nickname || `${player.first_name} ${player.last_name}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(player2Id === SUB_HOME_ID || player2Id === SUB_AWAY_ID) && (
                  <div className="flex gap-3 items-center ml-12">
                    <div className="flex-1">
                      <Select
                        value={subHandicap}
                        onValueChange={setSubHandicap}
                        disabled={lineupLocked}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sub H/C" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">+2</SelectItem>
                          <SelectItem value="1">+1</SelectItem>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="-1">-1</SelectItem>
                          <SelectItem value="-2">-2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Player 3 */}
                <div className="flex gap-3 items-center">
                  <div className="w-12 text-center">
                    <div className="text-sm font-semibold text-gray-700">3</div>
                  </div>
                  <div className="w-12 text-center">
                    <div className="text-sm font-semibold text-blue-600">
                      {player3Id ? formatHandicap(getPlayerHandicap(player3Id)) : '-'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Select
                      value={player3Id}
                      onValueChange={setPlayer3Id}
                      disabled={lineupLocked}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Player 3" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player) => (
                          <SelectItem
                            key={player.id}
                            value={player.id}
                            disabled={player.id === player1Id || player.id === player2Id}
                          >
                            {player.nickname || `${player.first_name} ${player.last_name}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(player3Id === SUB_HOME_ID || player3Id === SUB_AWAY_ID) && (
                  <div className="flex gap-3 items-center ml-12">
                    <div className="flex-1">
                      <Select
                        value={subHandicap}
                        onValueChange={setSubHandicap}
                        disabled={lineupLocked}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sub H/C" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">+2</SelectItem>
                          <SelectItem value="1">+1</SelectItem>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="-1">-1</SelectItem>
                          <SelectItem value="-2">-2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Team Handicap Display */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Player Handicaps:</span>
                <span className="font-semibold">{formatHandicap(calculatePlayerHandicapTotal())}</span>
              </div>

              {/* Only show team modifier if there is one (home team with non-zero modifier) */}
              {isHomeTeam && teamHandicap !== 0 && (
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>Team Modifier:</span>
                    <InfoButton title="Team Handicap Modifier">
                      <div className="space-y-2">
                        <p>
                          This modifier is based on how your team's record compares to your opponent's in the standings.
                        </p>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="font-semibold mb-1">How it works:</p>
                          <p className="text-xs">For every 2 match wins ahead = -1 modifier (advantage)</p>
                          <p className="text-xs">For every 2 match wins behind = +1 modifier (disadvantage)</p>
                          <p className="text-xs mt-1 italic">Lower handicap = fewer games needed to win</p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="font-semibold mb-1">Examples:</p>
                          <p className="text-xs">
                            5 matches ahead → <strong>-2 modifier</strong> (advantage)<br />
                            2 matches ahead → <strong>-1 modifier</strong> (advantage)<br />
                            2 matches behind → <strong>+1 modifier</strong> (disadvantage)<br />
                            4-5 matches behind → <strong>+2 modifier</strong> (disadvantage)
                          </p>
                        </div>
                        <p className="text-xs">
                          This modifier is only applied to the home team to ensure only one adjustment per match. It's added to the home team's player handicaps to help balance competition.
                        </p>
                      </div>
                    </InfoButton>
                  </div>
                  <span className="font-semibold">
                    {teamHandicap >= 0 ? '+' : ''}{formatHandicap(teamHandicap)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold text-gray-900">Team Total Handicap:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatHandicap(calculateFinalTeamHandicap())}
                </span>
              </div>

              {!isHomeTeam && (
                <p className="text-xs text-gray-500 italic">
                  Team bonus shown above applies to home team only
                </p>
              )}
            </div>

            {/* Duplicate Nickname Error */}
            {isLineupComplete() && hasDuplicateNicknames() && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-md">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Two or more players in your lineup have the same nickname.
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Have at least one of them go to their profile page to change their nickname so they will be identifiable during scoring.
                </p>
              </div>
            )}

            {/* Lock/Unlock and Status */}
            <LineupActions
              locked={lineupLocked}
              opponentLocked={opponentLineup?.locked || false}
              canLock={isLineupComplete() && !hasDuplicateNicknames()}
              canUnlock={!opponentLineup?.locked}
              onLock={handleLockLineup}
              onUnlock={handleUnlockLineup}
              onProceed={() => {
                // TODO: Before navigating to score page, insert all 18 game rows into match_games table
                navigate(`/match/${matchId}/score`);
              }}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
