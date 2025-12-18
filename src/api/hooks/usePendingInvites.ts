/**
 * @fileoverview usePendingInvites Hook
 *
 * Fetches pending invite tokens for the current authenticated user.
 * Used to show notifications when a user logs in and has unclaimed
 * placeholder player invites waiting for them.
 *
 * Uses the get_my_pending_invites() PostgreSQL function which:
 * - Matches invites by the user's email address
 * - Returns both pending and expired invites
 * - Includes is_expired flag for UI differentiation
 *
 * @example
 * const { pendingInvites, hasPendingInvites, loading } = usePendingInvites();
 * if (hasPendingInvites) {
 *   // Show modal or notification
 * }
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/supabaseClient';
import { useUser } from '@/context/useUser';
import { queryKeys } from '../queryKeys';
import type { PendingInvite } from '@/components/modals/PendingInvitesModal';

/**
 * Fetch pending invites from the database
 * Calls the get_my_pending_invites() RPC function
 */
async function fetchPendingInvites(): Promise<PendingInvite[]> {
  const { data, error } = await supabase.rpc('get_my_pending_invites');

  if (error) {
    console.error('Error fetching pending invites:', error);
    throw error;
  }

  return (data as PendingInvite[]) || [];
}

/**
 * Hook to get pending invites for the current user
 *
 * Returns pending and expired invites for showing notifications
 * after login. Invites are matched by the user's email address.
 *
 * @returns Object with invites array and utility properties
 */
export function usePendingInvites() {
  const { user } = useUser();

  const query = useQuery({
    queryKey: queryKeys.invites.pending(),
    queryFn: fetchPendingInvites,
    enabled: !!user, // Only fetch when user is logged in
    staleTime: 1000 * 60 * 5, // 5 minutes - don't refetch too often
    refetchOnWindowFocus: false,
  });

  const invites = query.data || [];
  const validInvites = invites.filter((i) => !i.is_expired);
  const expiredInvites = invites.filter((i) => i.is_expired);

  return {
    /** All invites (pending + expired) */
    pendingInvites: invites,
    /** Only valid (non-expired) invites */
    validInvites,
    /** Only expired invites */
    expiredInvites,
    /** True if there are any invites to show */
    hasPendingInvites: invites.length > 0,
    /** True if there are valid invites that can be claimed */
    hasClaimableInvites: validInvites.length > 0,
    /** Number of claimable invites */
    claimableCount: validInvites.length,
    /** Loading state */
    loading: query.isLoading,
    /** Error state */
    error: query.error,
    /** Refetch invites */
    refetch: query.refetch,
  };
}
