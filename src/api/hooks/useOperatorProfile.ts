/**
 * @fileoverview Operator Profile Hook (TanStack Query)
 *
 * React hook for fetching operator profile with automatic caching.
 * Uses TanStack Query for state management and caching.
 *
 * Benefits:
 * - Automatic caching (fetch once, reuse everywhere)
 * - No duplicate requests
 * - Built-in loading/error states
 * - Automatic refetching on stale data
 */

import { useQuery } from '@tanstack/react-query';
import { getOperatorProfileByMemberId } from '../queries/operators';
import { STALE_TIME } from '../client';

/**
 * Hook to fetch operator profile for current member
 *
 * Fetches league operator record by member ID.
 * Cached for 15 minutes.
 * Returns null if member is not an operator.
 *
 * @param memberId - Member's primary key ID
 * @returns TanStack Query result with operator profile
 *
 * @example
 * const { data: operatorProfile, isLoading, error } = useOperatorProfile(memberId);
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (!operatorProfile) return <div>Not an operator</div>;
 *
 * return <div>{operatorProfile.organization_name}</div>;
 */
export function useOperatorProfile(memberId: string | null | undefined) {
  return useQuery({
    queryKey: ['operator', 'profile', memberId],
    queryFn: () => getOperatorProfileByMemberId(memberId!),
    enabled: !!memberId,
    staleTime: STALE_TIME.MEMBER, // 15 minutes
    retry: 1,
  });
}
