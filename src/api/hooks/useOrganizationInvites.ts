/**
 * @fileoverview useOrganizationInvites Hook
 *
 * Fetches invite tokens for an organization.
 * Invites are linked to organizations via: invite_tokens -> teams -> seasons -> leagues -> organization_id
 *
 * Used by PlayerManagement to show invite counts and list pending invites
 * that operators have sent to placeholder players.
 *
 * @example
 * const { invites, pendingCount, loading } = useOrganizationInvites(orgId);
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/supabaseClient';
import { queryKeys } from '../queryKeys';
import { toast } from 'sonner';

/**
 * Invite details for display in the organization invites list
 */
export interface OrganizationInvite {
  /** Invite token ID */
  id: string;
  /** Member ID of the placeholder player */
  member_id: string;
  /** Placeholder player's first name */
  member_first_name: string;
  /** Placeholder player's last name */
  member_last_name: string;
  /** Email the invite was sent to */
  email: string;
  /** Team that sent the invite */
  team_id: string;
  /** Team name */
  team_name: string;
  /** Current invite status */
  status: 'pending' | 'claimed' | 'expired' | 'cancelled';
  /** True if the invite has expired (based on expires_at) */
  isExpired: boolean;
  /** When the invite expires */
  expires_at: string | null;
  /** When the invite was created/sent */
  created_at: string;
}

/**
 * Fetch all invites for an organization
 * Joins through teams -> seasons -> leagues to get organization context
 */
async function fetchOrganizationInvites(organizationId: string): Promise<OrganizationInvite[]> {
  // First get all league IDs for this organization
  const { data: leagues, error: leaguesError } = await supabase
    .from('leagues')
    .select('id')
    .eq('organization_id', organizationId);

  if (leaguesError) {
    console.error('Error fetching leagues for organization:', leaguesError);
    throw leaguesError;
  }

  if (!leagues || leagues.length === 0) {
    return [];
  }

  const leagueIds = leagues.map(l => l.id);

  // Get all seasons for these leagues
  const { data: seasons, error: seasonsError } = await supabase
    .from('seasons')
    .select('id')
    .in('league_id', leagueIds);

  if (seasonsError) {
    console.error('Error fetching seasons:', seasonsError);
    throw seasonsError;
  }

  if (!seasons || seasons.length === 0) {
    return [];
  }

  const seasonIds = seasons.map(s => s.id);

  // Get all teams for these seasons
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, team_name')
    .in('season_id', seasonIds);

  if (teamsError) {
    console.error('Error fetching teams:', teamsError);
    throw teamsError;
  }

  if (!teams || teams.length === 0) {
    return [];
  }

  const teamIds = teams.map(t => t.id);
  const teamMap = new Map(teams.map(t => [t.id, t.team_name]));

  // Finally, get all invites for these teams
  const { data: invites, error: invitesError } = await supabase
    .from('invite_tokens')
    .select(`
      id,
      member_id,
      email,
      team_id,
      status,
      expires_at,
      created_at,
      members!member_id (
        first_name,
        last_name
      )
    `)
    .in('team_id', teamIds)
    .order('created_at', { ascending: false });

  if (invitesError) {
    console.error('Error fetching invites:', invitesError);
    throw invitesError;
  }

  const now = new Date();

  // Transform to OrganizationInvite format
  return (invites || []).map(invite => {
    const expiresAt = invite.expires_at ? new Date(invite.expires_at) : null;
    const isExpired = invite.status === 'expired' || (expiresAt !== null && expiresAt < now);

    // Supabase returns the joined member as a single object (not array) when using !member_id
    // but TypeScript infers it as potentially being an array, so we handle both cases
    const membersData = invite.members;
    const member = Array.isArray(membersData) ? membersData[0] : membersData;

    return {
      id: invite.id,
      member_id: invite.member_id,
      member_first_name: member?.first_name || 'Unknown',
      member_last_name: member?.last_name || '',
      email: invite.email,
      team_id: invite.team_id,
      team_name: teamMap.get(invite.team_id) || 'Unknown Team',
      status: invite.status as OrganizationInvite['status'],
      isExpired,
      expires_at: invite.expires_at,
      created_at: invite.created_at,
    };
  });
}

/**
 * Cancel an invite by setting its status to 'cancelled'
 * This unlocks the email field on the PP and allows a new invite to be sent
 */
async function cancelInvite(inviteId: string): Promise<void> {
  const { error } = await supabase
    .from('invite_tokens')
    .update({ status: 'cancelled' })
    .eq('id', inviteId);

  if (error) {
    console.error('Error cancelling invite:', error);
    throw error;
  }
}

/**
 * Hook to get all invites for an organization
 *
 * @param organizationId - The organization ID to fetch invites for
 * @returns Object with invites list, counts, and loading state
 */
export function useOrganizationInvites(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.invites.byOrganization(organizationId || ''),
    queryFn: () => fetchOrganizationInvites(organizationId!),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Mutation for cancelling invites
  const cancelInviteMutation = useMutation({
    mutationFn: cancelInvite,
    onSuccess: () => {
      toast.success('Invite cancelled');
      // Invalidate organization invites
      queryClient.invalidateQueries({
        queryKey: queryKeys.invites.byOrganization(organizationId || ''),
      });
      // Also invalidate member-specific invite queries (used by InvitePlayerModal)
      queryClient.invalidateQueries({
        queryKey: ['inviteStatuses'],
      });
    },
    onError: (error) => {
      console.error('Failed to cancel invite:', error);
      toast.error('Failed to cancel invite. Please try again.');
    },
  });

  const invites = query.data || [];

  // Calculate counts by status
  const pendingInvites = invites.filter(i => i.status === 'pending' && !i.isExpired);
  const expiredInvites = invites.filter(i => i.status === 'expired' || i.isExpired);
  const claimedInvites = invites.filter(i => i.status === 'claimed');

  return {
    /** All invites for the organization */
    invites,
    /** Only pending (non-expired) invites */
    pendingInvites,
    /** Number of pending invites */
    pendingCount: pendingInvites.length,
    /** Number of expired invites */
    expiredCount: expiredInvites.length,
    /** Number of claimed invites */
    claimedCount: claimedInvites.length,
    /** Total invite count */
    totalCount: invites.length,
    /** Loading state */
    loading: query.isLoading,
    /** Error state */
    error: query.error,
    /** Refetch function */
    refetch: query.refetch,
    /** Cancel an invite by ID */
    cancelInvite: cancelInviteMutation.mutate,
    /** Whether a cancel is in progress */
    isCancelling: cancelInviteMutation.isPending,
  };
}
