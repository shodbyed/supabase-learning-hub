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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Users } from 'lucide-react';
import {
  useCurrentMember,
  useUpdateMatch,
  useUpdateMatchLineup,
  useCreateEmptyLineup,
  useMatchWithLeagueSettings,
  useMatchLineups,
  useUserTeamInMatch,
  useTeamDetails,
} from '@/api/hooks';
import { calculateHandicapThresholds } from '@/utils/calculateHandicapThresholds';
import type { Player } from '@/types/match';
import { MatchInfoCard } from '@/components/lineup/MatchInfoCard';
import { TestModeToggle } from '@/components/lineup/TestModeToggle';
import {
  PlayerRoster,
  type RosterPlayer,
} from '@/components/lineup/PlayerRoster';
import { LineupActions } from '@/components/lineup/LineupActions';
import { generateGameOrder } from '@/utils/gameOrder';
import { InfoButton } from '@/components/InfoButton';
import { useQueryStates } from '@/hooks/useQueryStates';

// Special substitute member IDs
const SUB_HOME_ID = '00000000-0000-0000-0000-000000000001';
const SUB_AWAY_ID = '00000000-0000-0000-0000-000000000002';

export function MatchLineup() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  // TanStack Query: Get current member data
  const memberQuery = useCurrentMember();
  const member = memberQuery.data;
  const memberId = member?.id;

  // TanStack Query: Get match data with league settings
  const matchQuery = useMatchWithLeagueSettings(matchId);
  const matchData = matchQuery.data;

  // TanStack Query: Get lineups (both home and away) - allow missing/unlocked for lineup page
  const lineupsQuery = useMatchLineups(
    matchId,
    matchData?.home_team_id,
    matchData?.away_team_id,
    false // Don't require locked lineups - this is the lineup setup page
  );
  const lineupsData = lineupsQuery.data;

  // TanStack Query: Determine which team user is on
  const userTeamQuery = useUserTeamInMatch(
    memberId,
    matchData?.home_team_id,
    matchData?.away_team_id
  );
  const userTeamData = userTeamQuery.data;

  // Derive team info early for next query
  const userTeamId = userTeamData?.team_id;

  // TanStack Query: Get team roster with member details
  const teamDetailsQuery = useTeamDetails(userTeamId);

  // Unified query state handling - consolidates loading/error checks
  const { renderState } = useQueryStates([
    { query: memberQuery, name: 'member' },
    { query: matchQuery, name: 'match' },
    { query: lineupsQuery, name: 'lineups', required: false }, // Lineups may not exist yet
    { query: userTeamQuery, name: 'user team' },
    { query: teamDetailsQuery, name: 'team details' },
  ]);

  // Mutation hooks - MUST be called before early returns
  const updateMatchMutation = useUpdateMatch();
  const updateLineupMutation = useUpdateMatchLineup();
  const createEmptyLineupMutation = useCreateEmptyLineup();

  // State hooks - MUST be called before early returns
  const [players] = useState<Player[]>([]);
  const [, setLoading] = useState(true);

  // Team handicap bonus (only for home team)
  const [teamHandicap] = useState<number>(0);

  // Lineup selection (value is UUID or "SUBSTITUTE")
  const [player1Id, setPlayer1Id] = useState<string>('');
  const [player2Id, setPlayer2Id] = useState<string>('');
  const [player3Id, setPlayer3Id] = useState<string>('');
  const [lineupLocked, setLineupLocked] = useState(false);

  // Substitute handicap (only used if one player is "SUBSTITUTE")
  const [subHandicap, setSubHandicap] = useState<string>('');

  // Opponent lineup status
  const [opponentLineup] = useState<any>(null);

  // Lineup ID (for updates after initial save)
  const [lineupId, setLineupId] = useState<string | null>(null);

  // Test mode for manual handicap override
  const [testMode, setTestMode] = useState(false);
  const [testHandicaps, setTestHandicaps] = useState<Record<string, number>>(
    {}
  );

  // Track if we've already prepared the match (to avoid duplicate preparation)
  const matchPreparedRef = useRef(false);

  // Derive values (safe to use optional chaining since hooks are called)
  const isHomeTeam = userTeamData?.isHomeTeam || false;
  const teamFormat = (matchData?.league?.team_format || '5_man') as '5_man' | '8_man';

  // Create lineup if it doesn't exist - useEffect MUST be before early returns
  useEffect(() => {
    async function ensureLineupExists() {
      if (!matchId || !userTeamId || !lineupsData) return;

      // Determine which lineup is ours based on team
      const myLineup = isHomeTeam ? lineupsData.homeLineup : lineupsData.awayLineup;

      // If lineup doesn't exist, create it
      if (!myLineup) {
        try {
          const createdLineup = await createEmptyLineupMutation.mutateAsync({
            matchId,
            teamId: userTeamId,
          });

          // Update match record with lineup ID
          const lineupField = isHomeTeam ? 'home_lineup_id' : 'away_lineup_id';
          await updateMatchMutation.mutateAsync({
            matchId,
            updates: { [lineupField]: createdLineup.id },
          });
        } catch (err: any) {
          console.error('Error creating lineup:', err);
          // Error will be handled by TanStack Query
        }
      }

      setLoading(false);
    }

    ensureLineupExists();
  }, [matchId, userTeamId, lineupsData, isHomeTeam, createEmptyLineupMutation, updateMatchMutation, setLoading]);

  // Auto-navigate to scoring page when both lineups are locked - useEffect MUST be before early returns
  // UNLESS this is a tiebreaker scenario (match_result = 'tie')
  // IMPORTANT: Only HOME team prepares the match to avoid race conditions
  useEffect(() => {
    if (lineupLocked && opponentLineup?.locked && !matchPreparedRef.current) {
      // If this is a tiebreaker (match ended in tie), don't auto-navigate
      // User will manually proceed when ready
      if (matchData?.match_result === 'tie') {
        console.log(
          'Both lineups locked (tiebreaker) - waiting for manual proceed'
        );
        return;
      }

      // Only home team prepares the match data to avoid both teams doing it simultaneously
      if (!isHomeTeam) {
        console.log('🚀 Away team navigating to scoring');
        matchPreparedRef.current = true;
        navigate(`/match/${matchId}/score`);
        return;
      }

      const prepareMatchAndNavigate = async () => {
        if (!matchId || !matchData || !opponentLineup) return;

        console.log('🚀 Home team preparing and navigating');

        try {
          matchPreparedRef.current = true;

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
  }, [
    lineupLocked,
    opponentLineup,
    matchId,
    navigate,
    matchData,
    player1Id,
    player2Id,
    player3Id,
  ]);

  // Early return for loading/error states - consolidated into single check
  if (renderState) return renderState;

  // After renderState check, all data is guaranteed to be defined
  // TypeScript doesn't infer this, so we assert non-null
  const match = matchData!;

  /**
   * Helper: Check if any player is a substitute
   */
  const hasSub = (): boolean => {
    return (
      player1Id === SUB_HOME_ID ||
      player1Id === SUB_AWAY_ID ||
      player2Id === SUB_HOME_ID ||
      player2Id === SUB_AWAY_ID ||
      player3Id === SUB_HOME_ID ||
      player3Id === SUB_AWAY_ID
    );
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
    return Math.max(
      ...unusedPlayers.map((p) => {
        if (testMode && testHandicaps[p.id] !== undefined) {
          return testHandicaps[p.id];
        }
        return p.handicap || 0;
      })
    );
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

    const player1 = players.find((p) => p.id === player1Id);
    const player2 = players.find((p) => p.id === player2Id);
    const player3 = players.find((p) => p.id === player3Id);

    if (!player1 || !player2 || !player3) return false;

    const nickname1 = player1.nickname || '';
    const nickname2 = player2.nickname || '';
    const nickname3 = player3.nickname || '';

    // Check if any two nicknames match
    return (
      nickname1 === nickname2 ||
      nickname1 === nickname3 ||
      nickname2 === nickname3
    );
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
      alert(
        'Two or more players in your lineup have the same nickname. Please have at least one of them go to their profile page to change their nickname so they will be identifiable during scoring.'
      );
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
        result = await updateLineupMutation.mutateAsync({
          lineupId,
          updates: lineupData,
          matchId,
        });
      } else {
        // Insert new lineup (still use direct Supabase for insert)
        const insertResult = await supabase
          .from('match_lineups')
          .insert(lineupData)
          .select()
          .single();

        if (insertResult.error) {
          console.error('Database error details:', {
            code: insertResult.error.code,
            message: insertResult.error.message,
            details: insertResult.error.details,
            hint: insertResult.error.hint,
            lineupData,
          });
          throw insertResult.error;
        }
        result = insertResult.data;
      }

      // Update local state
      setLineupId(result.id);
      setLineupLocked(true);

      // Save lineup ID to matches table
      const isHomeTeam = userTeamId === matchData?.home_team_id;
      const lineupField = isHomeTeam ? 'home_lineup_id' : 'away_lineup_id';

      // Check if opponent lineup is already locked
      const opponentLineupField = isHomeTeam
        ? 'away_lineup_id'
        : 'home_lineup_id';
      const opponentLineupLocked = matchData?.[opponentLineupField] != null;

      // If both lineups are now locked, set started_at timestamp
      const matchUpdateData: any = { [lineupField]: result.id };
      if (opponentLineupLocked && !matchData?.started_at) {
        matchUpdateData.started_at = new Date().toISOString();
      }

      try {
        await updateMatchMutation.mutateAsync({
          matchId,
          updates: matchUpdateData,
        });
      } catch (matchUpdateError: any) {
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
    if (!lineupId || !matchId) {
      alert('Error: No lineup to unlock');
      return;
    }

    try {
      await updateLineupMutation.mutateAsync({
        lineupId,
        updates: { locked: false, locked_at: null },
        matchId,
      });

      setLineupLocked(false);
      console.log('Lineup unlocked successfully');
    } catch (err: any) {
      console.error('Error unlocking lineup:', err);
      alert('Failed to unlock lineup. Please try again.');
    }
  };

  /**
   * Get opponent team info
   */
  const getOpponentTeam = () => {
    if (!matchData) return null;
    return isHomeTeam ? matchData.away_team : matchData.home_team;
  };

  /**
   * Calculate opponent status based on match lineup_id and locked state
   * - absent: No lineup ID in match (opponent hasn't joined)
   * - choosing: Has lineup ID but not locked (opponent selecting players)
   * - ready: Has lineup ID and is locked (opponent ready)
   */
  const getOpponentStatus = (): 'absent' | 'choosing' | 'ready' => {
    if (!matchData) return 'absent';

    const opponentLineupField = isHomeTeam
      ? 'away_lineup_id'
      : 'home_lineup_id';
    const opponentLineupId =
      matchData[opponentLineupField as keyof typeof matchData];

    // No lineup ID = opponent hasn't joined yet
    if (!opponentLineupId) return 'absent';

    // Has lineup ID, check if locked
    if (opponentLineup?.locked) return 'ready';

    // Has lineup ID but not locked = choosing lineup
    return 'choosing';
  };

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
          <div className="text-4xl font-semibold text-gray-900">
            Lineup Entry
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Match Info Card */}
        <MatchInfoCard
          scheduledDate={match.scheduled_date}
          opponent={
            opponent ? { id: opponent.id, name: opponent.team_name } : null
          }
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
                }
              }}
              disabled={lineupLocked}
            />

            {/* Available Players List */}
            <PlayerRoster
              players={players
                .filter((p) => p.id !== SUB_HOME_ID && p.id !== SUB_AWAY_ID) // Exclude substitute from roster
                .map(
                  (p): RosterPlayer => ({
                    id: p.id,
                    firstName: p.first_name,
                    lastName: p.last_name,
                    nickname: p.nickname,
                    handicap: p.handicap || 0,
                  })
                )}
              showHandicaps={true}
              testMode={testMode}
              testHandicaps={testHandicaps}
              onHandicapOverride={(playerId, handicap) => {
                setTestHandicaps((prev) => ({
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
                  <div className="text-xs font-medium text-gray-500">
                    Player
                  </div>
                </div>
                <div className="w-12 text-center">
                  <div className="text-xs font-medium text-gray-500">H/C</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-500">
                    Player Name
                  </div>
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
                      {player1Id
                        ? formatHandicap(getPlayerHandicap(player1Id))
                        : '-'}
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
                            disabled={
                              player.id === player2Id || player.id === player3Id
                            }
                          >
                            {player.nickname ||
                              `${player.first_name} ${player.last_name}`}
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
                      {player2Id
                        ? formatHandicap(getPlayerHandicap(player2Id))
                        : '-'}
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
                            disabled={
                              player.id === player1Id || player.id === player3Id
                            }
                          >
                            {player.nickname ||
                              `${player.first_name} ${player.last_name}`}
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
                      {player3Id
                        ? formatHandicap(getPlayerHandicap(player3Id))
                        : '-'}
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
                            disabled={
                              player.id === player1Id || player.id === player2Id
                            }
                          >
                            {player.nickname ||
                              `${player.first_name} ${player.last_name}`}
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
                <span className="font-semibold">
                  {formatHandicap(calculatePlayerHandicapTotal())}
                </span>
              </div>

              {/* Only show team modifier if there is one (home team with non-zero modifier) */}
              {isHomeTeam && teamHandicap !== 0 && (
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>Team Modifier:</span>
                    <InfoButton title="Team Handicap Modifier">
                      <div className="space-y-2">
                        <p>
                          This modifier is based on how your team's record
                          compares to your opponent's in the standings.
                        </p>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="font-semibold mb-1">How it works:</p>
                          <p className="text-xs">
                            For every 2 match wins ahead = -1 modifier
                            (advantage)
                          </p>
                          <p className="text-xs">
                            For every 2 match wins behind = +1 modifier
                            (disadvantage)
                          </p>
                          <p className="text-xs mt-1 italic">
                            Lower handicap = fewer games needed to win
                          </p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="font-semibold mb-1">Examples:</p>
                          <p className="text-xs">
                            5 matches ahead → <strong>-2 modifier</strong>{' '}
                            (advantage)
                            <br />2 matches ahead → <strong>
                              -1 modifier
                            </strong>{' '}
                            (advantage)
                            <br />2 matches behind →{' '}
                            <strong>+1 modifier</strong> (disadvantage)
                            <br />
                            4-5 matches behind → <strong>
                              +2 modifier
                            </strong>{' '}
                            (disadvantage)
                          </p>
                        </div>
                        <p className="text-xs">
                          This modifier is only applied to the home team to
                          ensure only one adjustment per match. It's added to
                          the home team's player handicaps to help balance
                          competition.
                        </p>
                      </div>
                    </InfoButton>
                  </div>
                  <span className="font-semibold">
                    {teamHandicap >= 0 ? '+' : ''}
                    {formatHandicap(teamHandicap)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold text-gray-900">
                  Team Total Handicap:
                </span>
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
                  Have at least one of them go to their profile page to change
                  their nickname so they will be identifiable during scoring.
                </p>
              </div>
            )}

            {/* Lock/Unlock and Status */}
            <LineupActions
              locked={lineupLocked}
              opponentStatus={getOpponentStatus()}
              canLock={isLineupComplete() && !hasDuplicateNicknames()}
              canUnlock={getOpponentStatus() !== 'ready'}
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
