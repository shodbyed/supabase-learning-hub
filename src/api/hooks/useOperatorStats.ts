/**
 * @fileoverview Operator Stats Query Hooks (TanStack Query)
 *
 * React hooks for fetching operator dashboard statistics with automatic caching.
 * Wraps pure query functions with TanStack Query for state management.
 *
 * Benefits:
 * - Automatic caching (fetch once, reuse everywhere)
 * - No duplicate requests (deduplication across components)
 * - Background refetching keeps data fresh
 * - Built-in loading/error states
 *
 * @see api/queries/operatorStats.ts - Pure query functions
 */

import { useQuery } from '@tanstack/react-query';
import {
  getTeamCount,
  getPlayerCount,
  getVenueCount,
} from '../queries/operatorStats';
import { STALE_TIME } from '../client';

/**
 * Hook to fetch count of teams for an operator
 *
 * Counts teams across all operator's leagues and seasons.
 * Cached for 15 minutes.
 *
 * @param operatorId - Operator's primary key ID
 * @returns TanStack Query result with team count number
 *
 * @example
 * const { data: teamCount = 0 } = useTeamCount(operatorId);
 * return <StatCard title="Total Teams" value={teamCount} />;
 */
export function useTeamCount(operatorId: string | null | undefined) {
  return useQuery({
    queryKey: ['operator', operatorId, 'teams', 'count'],
    queryFn: () => getTeamCount(operatorId!),
    enabled: !!operatorId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch count of players for an operator
 *
 * Counts players enrolled in teams across all operator's leagues.
 * Cached for 15 minutes.
 *
 * @param operatorId - Operator's primary key ID
 * @returns TanStack Query result with player count number
 *
 * @example
 * const { data: playerCount = 0 } = usePlayerCount(operatorId);
 * return <StatCard title="Total Players" value={playerCount} />;
 */
export function usePlayerCount(operatorId: string | null | undefined) {
  return useQuery({
    queryKey: ['operator', operatorId, 'players', 'count'],
    queryFn: () => getPlayerCount(operatorId!),
    enabled: !!operatorId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch count of venues for an operator
 *
 * Counts venues created/managed by the operator.
 * Cached for 15 minutes.
 *
 * @param operatorId - Operator's primary key ID
 * @returns TanStack Query result with venue count number
 *
 * @example
 * const { data: venueCount = 0 } = useVenueCount(operatorId);
 * return <StatCard title="Total Venues" value={venueCount} />;
 */
export function useVenueCount(operatorId: string | null | undefined) {
  return useQuery({
    queryKey: ['operator', operatorId, 'venues', 'count'],
    queryFn: () => getVenueCount(operatorId!),
    enabled: !!operatorId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes
    retry: 1,
  });
}
