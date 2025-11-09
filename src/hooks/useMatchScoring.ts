/**
 * @fileoverview Match Scoring Hook
 *
 * Central hook for managing match scoring across different formats (3v3, tiebreaker, 5v5).
 * Handles all data fetching, real-time subscriptions, game scoring logic, and confirmation flows.
 *
 * This hook extracts all business logic from the scoring pages, making them pure UI components.
 */
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { calculateTeamHandicap, calculate3v3HandicapDiffs } from '@/utils/handicapCalculations';
import { getPlayerNicknameById } from '@/types/member';
import { getTeamStats, getPlayerStats, getCompletedGamesCount, calculatePoints, TIEBREAKER_THRESHOLDS } from '@/types';
import { useMatchWithLeagueSettings, useMatchLineups, useMatchGames } from '@/api/hooks/useMatches';
import { useHandicapThresholds3v3 } from '@/api/hooks/useHandicaps';
import { useMembersByIds } from '@/api/hooks/useCurrentMember';
import { useUserTeamInMatch } from '@/api/hooks/useTeams';
import { useMatchGamesRealtime } from '@/realtime/useMatchGamesRealtime';
import type {
  Player,
  HandicapThresholds,
  MatchGame,
  ConfirmationQueueItem,
  MatchType,
} from '@/types';

interface UseMatchScoringOptions {
  matchId: string | undefined | null;
  memberId: string | undefined | null;
  matchType: MatchType;
  autoConfirm?: boolean;
  confirmOpponentScore?: (gameNumber: number, isVacateRequest?: boolean) => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useMatchScoring({
  matchId,
  memberId,
  matchType,
  autoConfirm = false,
  confirmOpponentScore
}: UseMatchScoringOptions) {
  // ============================================================================
  // TANSTACK QUERY HOOKS
  // ============================================================================

  // Fetch match with league settings
  const {
    data: matchData,
    isLoading: matchLoading,
    error: matchError,
    refetch: refetchMatch
  } = useMatchWithLeagueSettings(matchId);

  // Fetch lineups (needs team IDs from match data)
  const {
    data: lineupsData,
    isLoading: lineupsLoading,
    error: lineupsError
  } = useMatchLineups(
    matchId,
    matchData?.home_team_id,
    matchData?.away_team_id
  );

  // Fetch user's team in this match
  const {
    data: userTeamData,
    isLoading: userTeamLoading,
    error: userTeamError
  } = useUserTeamInMatch(
    memberId,
    matchData?.home_team_id,
    matchData?.away_team_id
  );

  // Fetch match games
  const {
    data: gamesData = [],
    isLoading: gamesLoading,
    refetch: refetchGames,
  } = useMatchGames(matchId);

  // Fetch player IDs from lineups for member lookup
  const playerIds = lineupsData ? [
    lineupsData.homeLineup.player1_id,
    lineupsData.homeLineup.player2_id,
    lineupsData.homeLineup.player3_id,
    lineupsData.awayLineup.player1_id,
    lineupsData.awayLineup.player2_id,
    lineupsData.awayLineup.player3_id,
  ].filter(Boolean) as string[] : null;

  // Fetch player names
  const {
    data: playersData = [],
    isLoading: playersLoading
  } = useMembersByIds(playerIds);

  // ============================================================================
  // LOCAL STATE
  // ============================================================================

  // Handicap data (needs state because calculated async)
  const [homeTeamHandicap, setHomeTeamHandicap] = useState(0);
  const [cappedHomeDiff, setCappedHomeDiff] = useState<number | null>(null);
  const [cappedAwayDiff, setCappedAwayDiff] = useState<number | null>(null);

  // Confirmation queue
  const [confirmationQueue, setConfirmationQueue] = useState<ConfirmationQueueItem[]>([]);

  // Track vacate requests initiated by current user (to suppress own confirmation modal)
  const myVacateRequests = useRef<Set<number>>(new Set());

  // Loading/error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch handicap thresholds (only after calculating handicap diffs)
  const { data: homeThresholdsData } = useHandicapThresholds3v3(cappedHomeDiff);
  const { data: awayThresholdsData } = useHandicapThresholds3v3(cappedAwayDiff);

  // ============================================================================
  // DERIVED DATA (useMemo)
  // ============================================================================

  // Direct references to TanStack Query data (no transformation needed)
  const match = matchData || null;
  const homeLineup = lineupsData?.homeLineup || null;
  const awayLineup = lineupsData?.awayLineup || null;
  const userTeamId = userTeamData?.team_id || null;
  const isHomeTeam = userTeamData?.isHomeTeam ?? null; // Use ?? instead of || to preserve false
  const goldenBreakCountsAsWin = matchData?.league.golden_break_counts_as_win || false;
  const gameType = matchData?.league.game_type || '8-ball';

  // Transform players array to Map for O(1) lookups (needs useMemo - expensive transformation)
  const players = useMemo(() => {
    const playerMap = new Map<string, Player>();
    playersData.forEach(p => playerMap.set(p.id, p));
    return playerMap;
  }, [playersData]);

  // Transform games array to Map for O(1) lookups (needs useMemo - expensive transformation)
  const gameResults = useMemo(() => {
    const gamesMap = new Map<number, MatchGame>();
    gamesData.forEach(game => gamesMap.set(game.game_number, game as MatchGame));
    return gamesMap;
  }, [gamesData]);

  // Get handicap thresholds (needs useMemo - conditional logic)
  const homeThresholds = useMemo(() => {
    if (matchType === 'tiebreaker') return TIEBREAKER_THRESHOLDS;
    return homeThresholdsData || null;
  }, [matchType, homeThresholdsData]);

  const awayThresholds = useMemo(() => {
    if (matchType === 'tiebreaker') return TIEBREAKER_THRESHOLDS;
    return awayThresholdsData || null;
  }, [matchType, awayThresholdsData]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

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

  /**
   * Get display name for a player
   */
  const getPlayerDisplayName = useCallback((playerId: string | null) => {
    return getPlayerNicknameById(playerId, players);
  }, [players]);

  /**
   * Get team statistics
   */
  const getTeamStatsCallback = useCallback((teamId: string) => {
    return getTeamStats(teamId, gameResults);
  }, [gameResults]);

  /**
   * Get player statistics
   */
  const getPlayerStatsCallback = useCallback((playerId: string) => {
    return getPlayerStats(playerId, gameResults);
  }, [gameResults]);

  /**
   * Get count of completed games
   */
  const getCompletedGamesCountCallback = useCallback(() => {
    return getCompletedGamesCount(gameResults);
  }, [gameResults]);

  /**
   * Calculate points for a team
   */
  const calculatePointsCallback = useCallback((teamId: string, thresholds: HandicapThresholds | null) => {
    return calculatePoints(teamId, thresholds, gameResults);
  }, [gameResults]);

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================

  /**
   * Calculate handicap data (only thing that needs async processing)
   */
  useEffect(() => {
    async function calculateHandicaps() {
      if (!matchId || !memberId || !matchData || !lineupsData) {
        return;
      }

      // Only calculate for 3v3 matches
      if (matchType !== '3v3') {
        return;
      }

      try {
        // Calculate team handicap (only for home team in 3v3)
        const calculatedTeamHandicap = await calculateTeamHandicap(
          matchData.home_team_id,
          matchData.away_team_id,
          matchData.season_id,
          matchData.league.team_handicap_variant
        );
        setHomeTeamHandicap(calculatedTeamHandicap);

        // Calculate handicap differences using helper function
        const { homeDiff, awayDiff } = calculate3v3HandicapDiffs(
          lineupsData.homeLineup,
          lineupsData.awayLineup,
          calculatedTeamHandicap
        );

        console.log('Handicap calculations:', {
          teamHandicap: calculatedTeamHandicap,
          cappedHomeDiff: homeDiff,
          cappedAwayDiff: awayDiff,
        });

        // Store capped diffs to trigger TanStack Query handicap threshold fetches
        setCappedHomeDiff(homeDiff);
        setCappedAwayDiff(awayDiff);
      } catch (err: any) {
        console.error('Error calculating handicaps:', err);
      }
    }

    calculateHandicaps();
  }, [matchId, memberId, matchType, matchData, lineupsData]);

  /**
   * Update loading and error states based on TanStack Query status
   */
  useEffect(() => {
    if (!matchId || !memberId) {
      return;
    }

    // Check if any queries are loading
    const isLoading = matchLoading || lineupsLoading || userTeamLoading || gamesLoading || playersLoading;
    setLoading(isLoading);

    // Handle errors
    if (matchError) {
      setError(matchError.message || 'Failed to load match information');
    } else if (lineupsError) {
      setError(lineupsError.message || 'Failed to load lineups');
    } else if (userTeamError) {
      setError(userTeamError.message || 'Failed to determine your team');
    } else {
      setError(null);
    }
  }, [
    matchId,
    memberId,
    matchLoading,
    lineupsLoading,
    userTeamLoading,
    gamesLoading,
    playersLoading,
    matchError,
    lineupsError,
    userTeamError,
  ]);

  // ============================================================================
  // REAL-TIME SUBSCRIPTION
  // ============================================================================

  /**
   * Real-time subscription to match_games table
   * Listens for INSERT/UPDATE/DELETE events and refreshes game results
   * Handles confirmation queue logic for opponent score updates
   */
  useMatchGamesRealtime(matchId, {
    onUpdate: refetchGames,
    onMatchUpdate: refetchMatch,
    match,
    userTeamId,
    players,
    myVacateRequests,
    addToConfirmationQueue,
    autoConfirm,
    confirmOpponentScore,
  });

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

    // Statistics (memoized)
    getPlayerDisplayName,
    getTeamStats: getTeamStatsCallback,
    getPlayerStats: getPlayerStatsCallback,
    getCompletedGamesCount: getCompletedGamesCountCallback,
    calculatePoints: calculatePointsCallback,

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
