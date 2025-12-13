/**
 * @fileoverview Player Handicap Hooks (TanStack Query)
 *
 * React hooks for fetching player handicaps with automatic caching.
 * Calculates handicaps based on game history for multiple players in parallel.
 *
 * Benefits:
 * - Per-match caching - each match gets its own cached handicaps
 * - Infinite stale time - handicaps stay fresh for entire match session
 * - Fresh calculations for new matches - changing matchId triggers recalculation
 * - Parallel fetching (all players calculated simultaneously)
 * - Request deduplication
 * - Loading and error states
 *
 * Caching Strategy:
 * Handicaps are cached per-match using the matchId in the query key.
 * - Same match: Handicaps calculated once on lineup page, cached forever
 * - Different match: Fresh handicaps calculated (different query key)
 * - Page refresh: Handicaps recalculated (cache cleared)
 *
 * This prevents mid-match handicap changes while ensuring each new match
 * gets fresh calculations based on the latest game history.
 *
 * @example
 * const { data: handicaps } = usePlayerHandicaps({
 *   playerIds: ['id1', 'id2', 'id3'],
 *   teamFormat: '5_man',
 *   handicapVariant: 'standard',
 *   gameType: 'nine_ball',
 *   leagueId: 'league-123',
 *   matchId: 'match-456' // Scopes cache to this match
 * });
 * // Returns: Map of playerId -> handicap number
 */

import { useQueries } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { calculatePlayerHandicap } from '@/utils/calculatePlayerHandicap';
import type { TeamFormat, HandicapVariant, GameType } from '@/types/league';

interface UsePlayerHandicapsParams {
  playerIds: string[];
  teamFormat: TeamFormat;
  handicapVariant: HandicapVariant;
  gameType: GameType;
  leagueId?: string;
  gameLimit?: number;
  /** Optional match ID to scope caching per-match. When provided, handicaps are cached
   * separately for each match, ensuring fresh calculations for new matches while
   * maintaining stable handicaps throughout a single match session. */
  matchId?: string;
}

// Infinity - handicaps stay fresh for entire browser session
// They're calculated once on lineup page and never refetched during the match
// A page refresh or new session will recalculate fresh handicaps
const HANDICAP_STALE_TIME = Infinity;

/**
 * Hook to fetch handicaps for multiple players in parallel
 *
 * Fetches handicaps for all players simultaneously using useQueries.
 * Returns a Map for easy lookup by player ID.
 * Caches handicaps for 2 hours (entire match session).
 *
 * @param params - Parameters for handicap calculation
 * @returns Object with handicaps Map, loading state, and any errors
 *
 * @example
 * const { handicaps, isLoading } = usePlayerHandicaps({
 *   playerIds: ['player1', 'player2', 'player3'],
 *   teamFormat: '5_man',
 *   handicapVariant: 'standard',
 *   gameType: 'nine_ball',
 *   leagueId: 'league-123',
 *   gameLimit: 200 // optional, defaults to 200
 * });
 *
 * if (isLoading) return <div>Calculating handicaps...</div>;
 *
 * const player1Handicap = handicaps.get('player1');
 */
export function usePlayerHandicaps({
  playerIds,
  teamFormat,
  handicapVariant,
  gameType,
  leagueId,
  gameLimit = 200,
  matchId,
}: UsePlayerHandicapsParams) {
  // Use useQueries to fetch all player handicaps in parallel
  const queries = useQueries({
    queries: playerIds.map((playerId) => ({
      // Include matchId in query key to scope caching per-match
      // This ensures each match gets fresh handicap calculations, but handicaps
      // stay stable throughout a single match session
      queryKey: [
        ...queryKeys.players.handicap(playerId),
        teamFormat,
        handicapVariant,
        gameType,
        leagueId || 'none',
        gameLimit,
        matchId || 'no-match', // Per-match scoping
      ],
      queryFn: () =>
        calculatePlayerHandicap(
          playerId,
          teamFormat,
          handicapVariant,
          gameType,
          leagueId,
          gameLimit
        ),
      staleTime: HANDICAP_STALE_TIME, // 2 hours - handicaps don't change during a match
      retry: 1,
      refetchOnWindowFocus: false,
    })),
  });

  // Convert array of queries to a Map for easy lookup
  const handicaps = new Map<string, number>();
  queries.forEach((query, index) => {
    if (query.data !== undefined) {
      handicaps.set(playerIds[index], query.data);
    }
  });

  // Check if any queries are still loading
  const isLoading = queries.some((query) => query.isLoading);

  // Collect any errors
  const errors = queries
    .filter((query) => query.error)
    .map((query) => query.error);

  return {
    handicaps,
    isLoading,
    errors: errors.length > 0 ? errors : null,
  };
}
