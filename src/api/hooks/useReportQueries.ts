/**
 * @fileoverview Report Query Hooks (TanStack Query)
 *
 * React hooks for fetching report data with automatic caching.
 * Wraps pure query functions with TanStack Query for state management.
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { getPendingReportsCount } from '../queries/reports';
import { STALE_TIME } from '../client';

/**
 * Hook to fetch count of pending user reports
 *
 * Gets count of reports with status 'pending' or 'under_review'.
 * Refetches on window focus and component mount to stay updated.
 * Used for notification badges in operator navigation.
 *
 * @returns TanStack Query result with pending report count
 *
 * @example
 * const { data: count = 0, isLoading } = usePendingReportsCount();
 * return <Badge>{count}</Badge>;
 */
export function usePendingReportsCount() {
  return useQuery({
    queryKey: queryKeys.reports.pending(),
    queryFn: getPendingReportsCount,
    staleTime: STALE_TIME.REPORTS, // 30 seconds
    refetchOnWindowFocus: true, // Update when user returns to tab
  });
}
