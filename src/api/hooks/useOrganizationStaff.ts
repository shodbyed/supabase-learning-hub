/**
 * @fileoverview Organization Staff Query Hooks (TanStack Query)
 *
 * React hooks for fetching organization staff data with automatic caching.
 * Wraps pure query functions with TanStack Query for state management.
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { getOrganizationStaff } from '../queries/organizationStaff';
import { STALE_TIME } from '../client';

/**
 * Hook to fetch all staff members for an organization
 *
 * Gets all organization_staff records with member details.
 * Cached for 15 minutes.
 *
 * @param organizationId - Organization's primary key ID
 * @returns TanStack Query result with array of staff members
 *
 * @example
 * const { data: staff = [], isLoading } = useOrganizationStaff(orgId);
 * return staff.map(member => (
 *   <StaffMemberCard key={member.id} member={member} />
 * ));
 */
export function useOrganizationStaff(organizationId: string | null | undefined) {
  return useQuery({
    queryKey: ['organizationStaff', organizationId || ''],
    queryFn: () => getOrganizationStaff(organizationId!),
    enabled: !!organizationId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes
    retry: 1,
  });
}
