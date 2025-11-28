/**
 * @fileoverview Organization TanStack Query Hooks
 *
 * React hooks for organization data using TanStack Query.
 * Provides caching, loading states, and automatic refetching.
 */

import { useQuery } from '@tanstack/react-query';
import {
  getOrganizationsByMember,
  getOrganizationById,
  getMemberPosition,
} from '@/api/queries/organizations';
import { useCurrentMember } from './useCurrentMember';

/**
 * Hook to fetch all organizations the current user is staff for
 *
 * Returns array of organizations with the user's position in each.
 * Used in dashboard to show organization selector.
 *
 * @returns TanStack Query result with organizations array
 *
 * @example
 * function Dashboard() {
 *   const { organizations, loading, error } = useOrganizations();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {organizations.map(org => (
 *         <div key={org.id}>
 *           {org.organization_name} - {org.position}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 */
export function useOrganizations(memberId?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['organizations', memberId],
    queryFn: () => getOrganizationsByMember(memberId!),
    enabled: !!memberId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    organizations: data || [],
    loading: isLoading,
    error,
  };
}

/**
 * Hook to fetch a specific organization by ID
 *
 * @param organizationId - Organization's primary key ID
 * @returns TanStack Query result with organization data
 *
 * @example
 * function OrgDetails({ orgId }) {
 *   const { organization, loading } = useOrganization(orgId);
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return <div>{organization.organization_name}</div>;
 * }
 */
export function useOrganization(organizationId: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['organization', organizationId],
    queryFn: () => getOrganizationById(organizationId!),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    organization: data,
    loading: isLoading,
    error,
  };
}

/**
 * Hook to check current user's position in an organization
 *
 * Returns 'owner', 'admin', 'league_rep', or null.
 * Used to control UI visibility (payment settings, staff management, etc.)
 *
 * @param organizationId - Organization's primary key ID
 * @returns TanStack Query result with position string
 *
 * @example
 * function PaymentSettings({ orgId }) {
 *   const { position, loading } = useOrganizationPosition(orgId);
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   if (position !== 'owner') {
 *     return <div>Only owners can access payment settings</div>;
 *   }
 *
 *   return <PaymentForm />;
 * }
 */
export function useOrganizationPosition(organizationId: string | undefined) {
  const { data: member } = useCurrentMember();

  const { data, isLoading, error } = useQuery({
    queryKey: ['organizationPosition', organizationId, member?.id],
    queryFn: () => getMemberPosition(organizationId!, member!.id),
    enabled: !!organizationId && !!member?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    position: data,
    loading: isLoading,
    error,
    isOwner: data === 'owner',
    isAdmin: data === 'admin',
    canManageStaff: data === 'owner', // Only owners can add/remove staff
    canAccessPayments: data === 'owner', // Only owners can see payment info
  };
}
