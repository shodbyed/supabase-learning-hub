/**
 * @fileoverview Handicap Query Hooks (TanStack Query)
 *
 * React hooks for fetching handicap data with automatic caching.
 * Wraps pure query functions with TanStack Query for state management.
 */

import { useQuery } from '@tanstack/react-query';
import { getHandicapThresholds3v3 } from '../queries/handicaps';

/**
 * Hook to fetch handicap thresholds for 3v3 format
 *
 * Looks up games to win/tie/lose based on handicap difference.
 * Cached indefinitely (static reference data).
 * Used by 3v3 scoring to determine match outcome.
 *
 * @param handicapDiff - Handicap difference (should be capped at ±12)
 * @returns TanStack Query result with handicap thresholds
 *
 * @example
 * const { data: thresholds } = useHandicapThresholds3v3(5);
 * if (thresholds) {
 *   console.log(`Need ${thresholds.games_to_win} games to win`);
 * }
 */
export function useHandicapThresholds3v3(handicapDiff: number | null | undefined) {
  return useQuery({
    queryKey: ['handicaps', '3v3', handicapDiff],
    queryFn: () => getHandicapThresholds3v3(handicapDiff!),
    enabled: typeof handicapDiff === 'number',
    staleTime: Infinity, // Static reference data - never stale
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
