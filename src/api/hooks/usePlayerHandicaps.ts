/**
 * @fileoverview Player Handicap Hooks (TanStack Query)
 *
 * React hooks for fetching player handicaps with automatic caching.
 * Calculates handicaps based on game history for multiple players in parallel.
 *
 * Benefits:
 * - Automatic caching (handicaps cached for 5 minutes)
 * - Parallel fetching (all players calculated simultaneously)
 * - Request deduplication
 * - Loading and error states
 *
 * @example
 * const { data: handicaps } = usePlayerHandicaps({
 *   playerIds: ['id1', 'id2', 'id3'],
 *   teamFormat: '5_man',
 *   handicapVariant: 'standard',
 *   gameType: 'nine_ball',
 *   seasonId: 'season-123'
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
  seasonId?: string;
  gameLimit?: number;
}

/**
 * Hook to fetch handicaps for multiple players in parallel
 *
 * Fetches handicaps for all players simultaneously using useQueries.
 * Returns a Map for easy lookup by player ID.
 * Caches handicaps for 5 minutes.
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
 *   seasonId: 'season-123',
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
  seasonId,
  gameLimit = 200,
}: UsePlayerHandicapsParams) {
  // Use useQueries to fetch all player handicaps in parallel
  const queries = useQueries({
    queries: playerIds.map((playerId) => ({
      queryKey: [
        ...queryKeys.players.handicap(playerId),
        teamFormat,
        handicapVariant,
        gameType,
        seasonId || 'none',
        gameLimit,
      ],
      queryFn: () =>
        calculatePlayerHandicap(
          playerId,
          teamFormat,
          handicapVariant,
          gameType,
          seasonId,
          gameLimit
        ),
      staleTime: 5 * 60 * 1000, // 5 minutes - handicaps don't change that frequently
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
