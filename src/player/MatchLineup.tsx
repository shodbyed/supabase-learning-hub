/**
 * @fileoverview Match Lineup Page
 *
 * Mobile-first lineup selection page where players choose their 3-player lineup
 * before starting a match. Shows player handicaps and calculates team total.
 *
 * Flow: Team Schedule → Score Match → Lineup Entry
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Users, Trash2 } from 'lucide-react';
import {
  useCurrentMember,
  useMatchWithLeagueSettings,
  useMatchLineups,
  useUserTeamInMatch,
  useTeamDetails,
  useUpdateMatchLineup,
  useMatchGames,
} from '@/api/hooks';
import { useUpdateMatchGame } from '@/api/hooks/useMatchMutations';
import { usePlayerHandicaps } from '@/api/hooks/usePlayerHandicaps';
import type { Player } from '@/types/match';
import { MatchInfoCard } from '@/components/lineup/MatchInfoCard';
import { PlayerRoster } from '@/components/PlayerRoster';
import { LineupActions } from '@/components/lineup/LineupActions';
import { HandicapSummary } from '@/components/lineup/HandicapSummary';
import { DuplicateNicknameWarning } from '@/components/lineup/DuplicateNicknameWarning';
import { useQueryStates } from '@/hooks/useQueryStates';
import {
  useLineupState,
  useHandicapCalculations,
  useLineupValidation,
  useLineupPersistence,
  useMatchPreparation,
} from '@/hooks/lineup';
import { usePreparationStatus } from '@/hooks/lineup/useMatchPreparation';
import { formatHandicap, calculateSubstituteHandicap } from '@/utils/lineup';
import { useMatchRealtime } from '@/realtime/useMatchRealtime';
import { Loader2 } from 'lucide-react';
import { getPlayerCount } from '@/utils/lineup/getPlayerCount';

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

  // TanStack Query: Get lineups (both home and away)
  // Lineups are auto-created by database trigger, so they always exist (may be unlocked)
  const lineupsQuery = useMatchLineups(
    matchId,
    matchData?.home_team_id,
    matchData?.away_team_id,
    false // requireLocked: false - lineups exist but may not be locked yet
  );

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
    { query: lineupsQuery, name: 'lineups' }, // Auto-created by DB trigger
    { query: userTeamQuery, name: 'user team' },
    { query: teamDetailsQuery, name: 'team details' },
  ]);

  // Note: Mutation hooks (useUpdateMatch, useUpdateMatchLineup) are now used inside hooks

  // Preparation status for loading screen
  const {
    isPreparingMatch,
    setIsPreparingMatch,
    preparationMessage,
    setPreparationMessage,
  } = usePreparationStatus();

  // Determine player count from team format (3 for 3v3, 5 for 5v5)
  const teamFormat = (matchData?.league?.team_format || '5_man') as '5_man' | '8_man';
  const playerCount = getPlayerCount(teamFormat);

  // Centralized lineup state management
  const lineup = useLineupState(playerCount);

  // Get update mutation for direct dropdown saves
  const updateLineupMutation = useUpdateMatchLineup();

  // Fetch all match games (for tiebreaker mode)
  const matchGamesQuery = useMatchGames(matchId);
  const allGames = matchGamesQuery.data || [];

  // Get update game mutation (for tiebreaker mode)
  const updateGameMutation = useUpdateMatchGame(matchId || '');

  // Extract players from team details query
  const playersWithoutHandicaps: Omit<Player, 'handicap'>[] =
    teamDetailsQuery.data?.team_players?.map((tp: any) => ({
      id: tp.members.id,
      nickname: tp.members.nickname,
      first_name: tp.members.first_name,
      last_name: tp.members.last_name,
    })) || [];

  // Get calculated handicaps for all roster players
  const { handicaps: playerHandicaps } = usePlayerHandicaps({
    playerIds: playersWithoutHandicaps.map(p => p.id),
    teamFormat: (matchData?.league?.team_format || '5_man') as '5_man' | '8_man',
    handicapVariant: (matchData?.league?.handicap_variant || 'standard') as 'standard' | 'reduced' | 'none',
    gameType: matchData?.league?.game_type as 'eight_ball' | 'nine_ball' | 'ten_ball',
    seasonId: matchData?.season_id,
    gameLimit: 200,
  });

  // Merge players with their calculated handicaps
  const players: Player[] = playersWithoutHandicaps.map(p => ({
    ...p,
    handicap: playerHandicaps.get(p.id) ?? 0,
  }));

  // Team handicap bonus (only for home team)
  const [teamHandicap] = useState<number>(0);

  // Derive values (safe to use optional chaining since hooks are called)
  const isHomeTeam = userTeamData?.isHomeTeam || false;

  // Get opponent lineup from query (updates in real-time)
  const opponentLineup = isHomeTeam
    ? lineupsQuery.data?.awayLineup
    : lineupsQuery.data?.homeLineup;

  // Detect tiebreaker mode
  const isTiebreakerMode = matchData?.match_result === 'tie';

  // Get tiebreaker player IDs if in tiebreaker mode
  // Note: Tiebreakers are always 3 games (best of 3), regardless of team format
  const getTiebreakerPlayerIdByPosition = (position: number): string => {
    const gameNumber = 18 + position;
    const game = allGames.find(
      (g) => g.game_number === gameNumber && g.is_tiebreaker
    );
    if (!game) return '';

    const playerField = isHomeTeam ? 'home_player_id' : 'away_player_id';
    return (game[playerField as keyof typeof game] as string) || '';
  };

  // In tiebreaker mode, use game records for validation; otherwise use lineup state
  const validationPlayer1Id = isTiebreakerMode ? getTiebreakerPlayerIdByPosition(1) : lineup.player1Id;
  const validationPlayer2Id = isTiebreakerMode ? getTiebreakerPlayerIdByPosition(2) : lineup.player2Id;
  const validationPlayer3Id = isTiebreakerMode ? getTiebreakerPlayerIdByPosition(3) : lineup.player3Id;

  // Handicap calculations
  const handicaps = useHandicapCalculations({
    player1Id: lineup.player1Id,
    player2Id: lineup.player2Id,
    player3Id: lineup.player3Id,
    player4Id: lineup.player4Id,
    player5Id: lineup.player5Id,
    playerCount,
    subHandicap: lineup.subHandicap,
    testMode: lineup.testMode,
    testHandicaps: lineup.testHandicaps,
    players,
    teamHandicap,
    isHomeTeam,
  });

  // Lineup validation
  const validation = useLineupValidation({
    player1Id: validationPlayer1Id,
    player2Id: validationPlayer2Id,
    player3Id: validationPlayer3Id,
    player4Id: lineup.player4Id,
    player5Id: lineup.player5Id,
    playerCount,
    subHandicap: lineup.subHandicap,
    players,
    isTiebreakerMode,
  });

  // Lineup persistence operations
  const { handleLockLineup, handleUnlockLineup } = useLineupPersistence({
    matchId,
    userTeamId: userTeamData?.team_id,
    memberId,
    lineupId: lineup.lineupId,
    player1Id: lineup.player1Id,
    player2Id: lineup.player2Id,
    player3Id: lineup.player3Id,
    player4Id: lineup.player4Id,
    player5Id: lineup.player5Id,
    player1Handicap: handicaps.player1Handicap,
    player2Handicap: handicaps.player2Handicap,
    player3Handicap: handicaps.player3Handicap,
    player4Handicap: handicaps.player4Handicap,
    player5Handicap: handicaps.player5Handicap,
    playerCount,
    teamHandicap,
    isComplete: validation.isComplete,
    hasDuplicates: validation.hasDuplicates,
    onLineupIdChange: lineup.setLineupId,
    onLockedChange: lineup.setLineupLocked,
    matchData,
  });

  // Note: Lineups are now auto-created by database trigger when match is inserted
  // See migration: 20251115000000_auto_create_match_lineups.sql

  // Match preparation and auto-navigation
  useMatchPreparation({
    lineupLocked: lineup.lineupLocked,
    opponentLineup,
    matchId,
    matchData,
    isHomeTeam,
    teamFormat,
    player1Id: lineup.player1Id,
    player2Id: lineup.player2Id,
    player3Id: lineup.player3Id,
    player1Handicap: handicaps.player1Handicap,
    player2Handicap: handicaps.player2Handicap,
    player3Handicap: handicaps.player3Handicap,
    setIsPreparingMatch,
    setPreparationMessage,
    refetchLineups: lineupsQuery.refetch,
    refetchGames: matchGamesQuery.refetch,
  });

  // Load lineup ID and data from database (auto-created by trigger)
  // This is critical - without the lineup ID, we can't update the lineup
  // Only loads ONCE on initial mount to avoid triggering auto-save loop
  useEffect(() => {
    if (lineupsQuery.data && userTeamData) {
      const myLineup = isHomeTeam
        ? lineupsQuery.data.homeLineup
        : lineupsQuery.data.awayLineup;

      if (myLineup) {
        // Always update lineup ID (needed for mutations)
        lineup.setLineupId(myLineup.id);

        // Only set player IDs if they exist in the database AND local state is empty
        // This prevents overwriting user's current selections with old DB data
        for (let pos = 1; pos <= playerCount; pos++) {
          const playerIdField = `player${pos}_id` as keyof typeof myLineup;
          const dbPlayerId = myLineup[playerIdField] as string | undefined;
          const currentPlayerId = lineup.getPlayerId(pos as 1 | 2 | 3 | 4 | 5);

          if (dbPlayerId && !currentPlayerId) {
            lineup.setPlayerId(pos as 1 | 2 | 3 | 4 | 5, dbPlayerId);
          }
        }

        // Always sync locked state from database (source of truth)
        lineup.setLineupLocked(!!myLineup.locked);
      }
    }
    // Only run on initial load - don't include lineup in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineupsQuery.data, userTeamData, isHomeTeam]);

  // Unified real-time subscription for match, lineups, and games
  // Watches all three tables throughout entire match flow (lineup + tiebreaker + scoring)
  useMatchRealtime(matchId, {
    onMatchUpdate: () => matchQuery.refetch(),
    onLineupUpdate: () => lineupsQuery.refetch(),
    onGamesUpdate: () => matchGamesQuery.refetch(),
  });

  // Generic player change handler - works for any position (3 or 5 players)
  const handlePlayerChange = (position: number, playerId: string) => {
    if (!lineup.lineupId || !matchId) return;

    // Update local state using generic setter
    lineup.setPlayerId(position as 1 | 2 | 3 | 4 | 5, playerId);

    // Get the NEW player's handicap (respects test mode and test handicap overrides)
    const handicap = handicaps.getPlayerHandicap(playerId);

    console.log('🎯 Calculated handicap:', handicap, 'for player:', playerId);

    const updatePayload = {
      lineupId: lineup.lineupId,
      updates: {
        [`player${position}_id`]: playerId,
        [`player${position}_handicap`]: handicap,
      },
      matchId,
    };

    console.log('💾 Sending update to database:', updatePayload);

    // Update database
    updateLineupMutation.mutate(updatePayload, {
      onSuccess: (data) => {
        console.log('✅ Database update successful:', data);
      },
      onError: (error) => {
        console.error('❌ Database update failed:', error);
      },
    });
  };

  // Clear player handler - remove player from lineup position
  const handleClearPlayer = (position: number) => {
    if (!lineup.lineupId || !matchId) return;

    // Clear local state using generic setter
    lineup.setPlayerId(position as 1 | 2 | 3 | 4 | 5, '');

    // Clear in database
    updateLineupMutation.mutate({
      lineupId: lineup.lineupId,
      updates: {
        [`player${position}_id`]: null,
        [`player${position}_handicap`]: 0,
      },
      matchId,
    });
  };

  // Helper functions to get player data by position (for mapping)
  const getPlayerIdByPosition = (position: number): string => {
    return lineup.getPlayerId(position as 1 | 2 | 3 | 4 | 5);
  };

  const getHandicapByPosition = (position: number): number => {
    switch (position) {
      case 1: return handicaps.player1Handicap;
      case 2: return handicaps.player2Handicap;
      case 3: return handicaps.player3Handicap;
      case 4: return handicaps.player4Handicap || 0;
      case 5: return handicaps.player5Handicap || 0;
      default: return 0;
    }
  };

  const getOtherPlayerIds = (position: number): string[] => {
    const allPlayers = Array.from({ length: playerCount }, (_, i) =>
      lineup.getPlayerId((i + 1) as 1 | 2 | 3 | 4 | 5)
    );
    return allPlayers.filter((_, index) => index + 1 !== position);
  };

  // Tiebreaker mode handlers - update game records instead of lineup
  // Note: Tiebreaker always uses 3 positions (best of 3)
  const handleTiebreakerPlayerChange = (
    position: number,
    playerId: string
  ) => {
    if (!matchId) return;

    // Map position to game number (1 → 19, 2 → 20, 3 → 21)
    const gameNumber = 18 + position;

    // Find the game
    const game = allGames.find(
      (g) => g.game_number === gameNumber && g.is_tiebreaker
    );
    if (!game) {
      console.error(`Tiebreaker game ${gameNumber} not found`);
      return;
    }

    // Update local state (for UI responsiveness)
    if (position === 1) lineup.setPlayer1Id(playerId);
    else if (position === 2) lineup.setPlayer2Id(playerId);
    else lineup.setPlayer3Id(playerId);

    // Determine which player field to update based on team
    const playerField = isHomeTeam ? 'home_player_id' : 'away_player_id';

    // Update the game record
    updateGameMutation.mutate({
      gameId: game.id,
      updates: {
        [playerField]: playerId,
      },
    });
  };

  const handleClearTiebreakerPlayer = (position: number) => {
    if (!matchId) return;

    // Map position to game number
    const gameNumber = 18 + position;

    // Find the game
    const game = allGames.find(
      (g) => g.game_number === gameNumber && g.is_tiebreaker
    );
    if (!game) return;

    // Clear local state
    if (position === 1) lineup.setPlayer1Id('');
    else if (position === 2) lineup.setPlayer2Id('');
    else lineup.setPlayer3Id('');

    // Determine which player field to clear
    const playerField = isHomeTeam ? 'home_player_id' : 'away_player_id';

    // Clear the game record
    updateGameMutation.mutate({
      gameId: game.id,
      updates: {
        [playerField]: null,
      },
    });
  };

  // Early return for loading/error states - consolidated into single check
  if (renderState) return renderState;

  // After renderState check, all data is guaranteed to be defined
  // TypeScript doesn't infer this, so we assert non-null
  const match = matchData!;

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
   *
   * Shows detailed player selection progress:
   * - "Players chosen: 1" when 1 player selected
   * - "Players chosen: 2" when 2 players selected
   * - "Players chosen: 3" when 3 players selected
   * - "Locked" when lineup is locked
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

  /**
   * Get detailed opponent selection status showing player count
   */
  const getOpponentSelectionStatus = (): string => {
    const status = getOpponentStatus();

    if (status === 'absent') return 'Absent';
    if (status === 'ready') return 'Locked';

    // Status is 'choosing' - count selected players
    let playerCount = 0;

    // In tiebreaker mode, count players from games 19, 20, 21
    if (isTiebreakerMode) {
      const opponentPlayerField = isHomeTeam
        ? 'away_player_id'
        : 'home_player_id';

      [19, 20, 21].forEach((gameNumber) => {
        const game = allGames.find(
          (g) => g.game_number === gameNumber && g.is_tiebreaker
        );
        if (game && game[opponentPlayerField as keyof typeof game]) {
          playerCount++;
        }
      });
    } else {
      // Normal mode - count from lineup
      if (opponentLineup?.player1_id) playerCount++;
      if (opponentLineup?.player2_id) playerCount++;
      if (opponentLineup?.player3_id) playerCount++;
    }

    if (playerCount === 0) return 'Choosing lineup';
    return `Players chosen: ${playerCount}`;
  };

  const opponent = getOpponentTeam();

  // Get my lineup (for tiebreaker mode player source)
  const myLineup = isHomeTeam
    ? lineupsQuery.data?.homeLineup
    : lineupsQuery.data?.awayLineup;

  // Helper to get player display name
  const getPlayerDisplayName = (playerId: string): string => {
    const player = players.find((p) => p.id === playerId);
    if (player) {
      return player.nickname || `${player.first_name} ${player.last_name}`;
    }
    // For substitutes
    if (playerId === SUB_HOME_ID) return 'Sub (Home)';
    if (playerId === SUB_AWAY_ID) return 'Sub (Away)';
    return 'Unknown';
  };

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
              {isTiebreakerMode
                ? 'Select Your Tiebreaker Lineup'
                : 'Select Your Lineup'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Available Players List */}
            <PlayerRoster
              playerIds={
                isTiebreakerMode && myLineup
                  ? [
                      myLineup.player1_id,
                      myLineup.player2_id,
                      myLineup.player3_id,
                    ].filter(Boolean)
                  : players.map((p) => p.id)
              }
              teamFormat={teamFormat}
              handicapVariant={
                (matchData?.league?.handicap_variant || 'standard') as
                  | 'standard'
                  | 'reduced'
                  | 'none'
              }
              gameType={
                matchData?.league?.game_type as
                  | 'eight_ball'
                  | 'nine_ball'
                  | 'ten_ball'
              }
              seasonId={matchData?.season_id}
              hidePlayerNumber
              hideHandicap={isTiebreakerMode}
              captainId={teamDetailsQuery.data?.captain_id}
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
                {/* Map over positions dynamically based on player count */}
                {Array.from({ length: playerCount }, (_, i) => i + 1).map((position) => {
                  // In tiebreaker mode, get player from game record; otherwise from lineup
                  const playerId = isTiebreakerMode
                    ? getTiebreakerPlayerIdByPosition(position)
                    : getPlayerIdByPosition(position);
                  const handicap = getHandicapByPosition(position);

                  // Get other selected player IDs (to disable them in dropdown)
                  const otherPlayerIds = isTiebreakerMode
                    ? // Tiebreaker mode: get from game records
                      [1, 2, 3]
                        .filter((p) => p !== position)
                        .map((p) =>
                          getTiebreakerPlayerIdByPosition(p as 1 | 2 | 3)
                        )
                        .filter(Boolean)
                    : // Normal mode: get from lineup state
                      getOtherPlayerIds(position);

                  // Choose appropriate handlers based on mode
                  const onPlayerChange = isTiebreakerMode
                    ? handleTiebreakerPlayerChange
                    : handlePlayerChange;
                  const onClearPlayer = isTiebreakerMode
                    ? handleClearTiebreakerPlayer
                    : handleClearPlayer;

                  return (
                    <div key={position} className="flex gap-2 items-center">
                      <div className="w-12 text-center">
                        <div className="text-sm font-semibold text-gray-700">
                          {position}
                        </div>
                      </div>
                      <div className="w-12 text-center">
                        <div className="text-sm font-semibold text-blue-600">
                          {playerId ? formatHandicap(handicap) : '-'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <Select
                          value={playerId}
                          onValueChange={(id) => onPlayerChange(position, id)}
                          disabled={lineup.lineupLocked}
                        >
                          <SelectTrigger className="min-w-[120px]">
                            <SelectValue
                              placeholder={`Select Player ${position}`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {(isTiebreakerMode && myLineup
                              ? [
                                  myLineup.player1_id,
                                  myLineup.player2_id,
                                  myLineup.player3_id,
                                ].filter(Boolean)
                              : [
                                  ...players.map((p) => p.id),
                                  isHomeTeam ? SUB_HOME_ID : SUB_AWAY_ID,
                                ]
                            ).map((playerOptionId) => (
                              <SelectItem
                                key={playerOptionId}
                                value={playerOptionId}
                                disabled={otherPlayerIds.includes(playerOptionId)}
                              >
                                {getPlayerDisplayName(playerOptionId)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Sub handicap selector (if sub player selected) - inline on same row */}
                      {!isTiebreakerMode &&
                        (playerId === SUB_HOME_ID ||
                          playerId === SUB_AWAY_ID) && (
                        <div className="w-24">
                          <Select
                            value={lineup.subHandicap}
                            onValueChange={(newSubHandicap) => {
                              if (!lineup.lineupId || !matchId) return;

                              // Update local state
                              lineup.setSubHandicap(newSubHandicap);

                              // Collect used player IDs (excluding current position)
                              const usedPlayerIds = [
                                lineup.player1Id,
                                lineup.player2Id,
                                lineup.player3Id,
                              ].filter(Boolean);

                              // Calculate substitute handicap using utility function
                              const calculatedHandicap = calculateSubstituteHandicap(
                                usedPlayerIds,
                                players,
                                parseFloat(newSubHandicap)
                              );

                              // Update database with new handicap
                              updateLineupMutation.mutate({
                                lineupId: lineup.lineupId,
                                updates: {
                                  [`player${position}_id`]: playerId,
                                  [`player${position}_handicap`]: calculatedHandicap,
                                },
                                matchId,
                              });
                            }}
                            disabled={lineup.lineupLocked}
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
                      )}
                      {playerId && !lineup.lineupLocked && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onClearPlayer(position)}
                          className="h-8 w-8 flex-shrink-0"
                          title={`Clear player ${position}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team Handicap Display */}
            <HandicapSummary
              playerTotal={handicaps.playerTotal}
              teamHandicap={teamHandicap}
              teamTotal={handicaps.teamTotal}
              isHomeTeam={isHomeTeam}
            />

            {/* Duplicate Nickname Error - Only show in normal mode, not tiebreaker */}
            {!isTiebreakerMode && (
              <DuplicateNicknameWarning
                show={validation.isComplete && validation.hasDuplicates}
              />
            )}

            {/* Lock/Unlock and Status */}
            <LineupActions
              locked={lineup.lineupLocked}
              opponentStatus={getOpponentStatus()}
              opponentStatusText={getOpponentSelectionStatus()}
              canLock={validation.canLock}
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

      {/* Loading Overlay - Show while preparing match */}
      {isPreparingMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Preparing Match</h2>
            <p className="text-gray-600">{preparationMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
