/**
 * @fileoverview useCurrentMember Hook (TanStack Query Version)
 *
 * Replaces the old useCurrentMember hook with TanStack Query for automatic caching.
 * Fetches the current authenticated user's member data and caches it across the app.
 *
 * Benefits over old version:
 * - Automatic caching (fetch once, reuse everywhere)
 * - No duplicate requests (deduplication across components)
 * - Background refetching keeps data fresh
 * - Built-in loading/error states
 * - Cached for 30 minutes (configured in client.ts)
 *
 * @example
 * // In any component
 * const { data: member, isLoading, error } = useCurrentMember();
 * if (isLoading) return <LoadingState />;
 * if (error) return <ErrorState error={error} />;
 * return <div>Welcome, {member.first_name}!</div>;
 */

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/context/useUser';
import { queryKeys } from '../queryKeys';
import { getCurrentMember } from '../queries/members';
import { STALE_TIME } from '../client';

/**
 * Hook to get current authenticated user's member data
 *
 * This hook:
 * - Gets auth user from UserContext
 * - Fetches member record from database
 * - Caches result for 30 minutes
 * - Only runs when user is authenticated
 * - Shares cache with all other components using this hook
 *
 * @returns TanStack Query result with member data
 * @returns {object} data - Member data { id, user_id, first_name, last_name }
 * @returns {boolean} isLoading - True while fetching
 * @returns {boolean} isError - True if fetch failed
 * @returns {Error} error - Error object if fetch failed
 * @returns {boolean} isFetching - True during background refetch
 */
export function useCurrentMember() {
  const { user } = useUser();

  return useQuery({
    // Query key for caching - uses user ID
    queryKey: queryKeys.members.byUser(user?.id || ''),

    // Query function - fetches member data
    queryFn: () => getCurrentMember(user!.id),

    // Only run query if user is authenticated
    enabled: !!user?.id,

    // Keep member data fresh for 30 minutes (very stable data)
    staleTime: STALE_TIME.MEMBER,

    // Retry once on failure
    retry: 1,

    // Don't refetch on window focus for user data (it won't change)
    refetchOnWindowFocus: false,
  });
}

/**
 * Convenience hook to get just the member ID
 *
 * Useful when you only need the ID and don't want to destructure.
 *
 * @returns Member ID or null
 *
 * @example
 * const memberId = useMemberId();
 * if (memberId) {
 *   // Fetch teams for this member
 * }
 */
export function useMemberId(): string | null {
  const { data } = useCurrentMember();
  return data?.id || null;
}

/**
 * Convenience hook to get just the member's first name
 *
 * @returns First name or empty string
 *
 * @example
 * const firstName = useMemberFirstName();
 * return <h1>Welcome, {firstName}!</h1>;
 */
export function useMemberFirstName(): string {
  const { data } = useCurrentMember();
  return data?.first_name || '';
}
