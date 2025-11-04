/**
 * @fileoverview useUserProfile Hook (TanStack Query Version)
 *
 * Replaces the old useUserProfile hook with TanStack Query for automatic caching.
 * Fetches complete member profile with all fields and provides role-checking utilities.
 *
 * Benefits over old version:
 * - Automatic caching (30 minute stale time)
 * - No manual refresh trigger needed (use invalidateQueries instead)
 * - Background refetching
 * - Better error handling
 * - Shares cache with other profile queries
 *
 * @example
 * const { data: member, isLoading, hasRole, canAccessOperatorFeatures } = useUserProfile();
 *
 * if (canAccessOperatorFeatures()) {
 *   // Show operator nav
 * }
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/context/useUser';
import { queryKeys } from '../queryKeys';
import { getMemberProfile } from '../queries/members';
import { STALE_TIME } from '../client';
import type { Member, UserRole } from '@/types';

/**
 * Result type for useUserProfile hook
 * Extends TanStack Query result with utility functions
 */
interface UseUserProfileResult {
  /** Complete member record (null if not found) */
  member: Member | null;
  /** True while fetching */
  loading: boolean;
  /** Error message if fetch fails */
  error: string | null;
  /** True if member not found (user needs to complete application) */
  needsApplication: boolean;
  /** Check if member has specific role */
  hasRole: (role: UserRole) => boolean;
  /** Check if member can access league operator features */
  canAccessLeagueOperatorFeatures: () => boolean;
  /** Check if member can access developer features */
  canAccessDeveloperFeatures: () => boolean;
  /** Check if member record exists */
  hasMemberRecord: () => boolean;
  /** Check if user needs to complete application */
  needsToCompleteApplication: () => boolean;
  /** Manually refresh profile data from database */
  refreshProfile: () => Promise<void>;
}

/**
 * Hook to get complete user profile with role utilities
 *
 * This hook:
 * - Fetches complete member record
 * - Handles case where member doesn't exist (PGRST116 error)
 * - Provides role-checking utilities
 * - Caches for 30 minutes
 *
 * @returns Extended hook result with member data and utilities
 */
export function useUserProfile(): UseUserProfileResult {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.members.byUser(user?.id || ''),
    queryFn: () => getMemberProfile(user!.id),
    enabled: !!user?.id,
    staleTime: STALE_TIME.MEMBER,
    retry: (failureCount, error: any) => {
      // Don't retry if member not found (PGRST116 = no rows)
      // This is expected for new users who haven't completed application
      if (error?.code === 'PGRST116') return false;

      // Retry once for other errors
      return failureCount < 1;
    },
    refetchOnWindowFocus: false,
  });

  const member = query.data || null;
  const needsApplication = query.error?.code === 'PGRST116';

  // Utility functions for role and permission checking
  const hasRole = (role: UserRole) => member?.role === role;

  const canAccessLeagueOperatorFeatures = () =>
    member?.role === 'league_operator' || member?.role === 'developer';

  const canAccessDeveloperFeatures = () => member?.role === 'developer';

  const hasMemberRecord = () => member !== null;

  const needsToCompleteApplication = () => needsApplication;

  /**
   * Manually refresh profile data from database
   * Invalidates the cache and refetches from Supabase
   */
  const refreshProfile = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.members.byUser(user?.id || ''),
    });
  };

  return {
    member,
    loading: query.isLoading,
    error: query.error ? String(query.error) : null,
    needsApplication,
    hasRole,
    canAccessLeagueOperatorFeatures,
    canAccessDeveloperFeatures,
    hasMemberRecord,
    needsToCompleteApplication,
    refreshProfile,
  };
}

/**
 * Hook to check if current user is a league operator
 *
 * Convenience hook for route protection and conditional rendering.
 *
 * @returns True if user is operator or developer
 *
 * @example
 * const isOperator = useIsOperator();
 * if (!isOperator) return <Navigate to="/" />;
 */
export function useIsOperator(): boolean {
  const { canAccessLeagueOperatorFeatures } = useUserProfile();
  return canAccessLeagueOperatorFeatures();
}

/**
 * Hook to check if current user is a developer
 *
 * @returns True if user has developer role
 */
export function useIsDeveloper(): boolean {
  const { canAccessDeveloperFeatures } = useUserProfile();
  return canAccessDeveloperFeatures();
}

/**
 * Hook to get member's role
 *
 * @returns User's role or null if no member record
 *
 * @example
 * const role = useMemberRole();
 * if (role === 'player') { ... }
 */
export function useMemberRole(): UserRole | null {
  const { member } = useUserProfile();
  return member?.role || null;
}
