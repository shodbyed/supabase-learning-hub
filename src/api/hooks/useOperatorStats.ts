/**
 * @fileoverview Operator Stats Query Hooks (TanStack Query)
 *
 * React hooks for fetching operator dashboard statistics with automatic caching.
 * Uses a single RPC function call to fetch all stats efficiently.
 *
 * Benefits:
 * - Single database call instead of 7 separate queries
 * - Automatic caching (fetch once, reuse everywhere)
 * - No duplicate requests (deduplication across components)
 * - Background refetching keeps data fresh
 * - Built-in loading/error states
 *
 * @see api/queries/operatorStats.ts - Pure query functions
 */

import { useQuery } from '@tanstack/react-query';
import { getOperatorStats } from '../queries/operatorStats';
import { STALE_TIME } from '../client';

/**
 * Hook to fetch all operator statistics in one call
 *
 * Fetches all 7 operator stats using a single Postgres RPC function:
 * - leagues: Active leagues count
 * - teams: Total teams across all leagues
 * - players: Total players across all teams
 * - venues: Active venues count
 * - seasons_completed: Completed seasons count
 * - matches_completed: Completed matches count
 * - games_played: Total games with winner determined
 *
 * Cached for 15 minutes.
 *
 * @param operatorId - Operator's primary key ID
 * @returns TanStack Query result with all operator statistics
 *
 * @example
 * const { data: stats } = useOperatorStats(operatorId);
 * if (stats) {
 *   console.log(`Managing ${stats.leagues} leagues with ${stats.teams} teams`);
 * }
 */
export function useOperatorStats(operatorId: string | null | undefined) {
  return useQuery({
    queryKey: ['operator', operatorId, 'stats'],
    queryFn: () => getOperatorStats(operatorId!),
    enabled: !!operatorId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes
    retry: 1,
  });
}
