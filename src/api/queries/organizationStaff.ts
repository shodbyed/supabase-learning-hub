/**
 * @fileoverview Organization Staff Query Functions
 *
 * Pure data fetching functions for organization staff members.
 * Used by TanStack Query hooks for caching and state management.
 */

import { supabase } from '@/supabaseClient';

export interface OrganizationStaffMember {
  id: string;
  member_id: string;
  organization_id: string;
  position: 'owner' | 'admin' | 'league_rep';
  added_at: string;
  member: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

/**
 * Fetch all staff members for an organization
 *
 * Gets all organization_staff records with member details.
 * Ordered by position (owner first) then by added date.
 *
 * @param organizationId - Organization's primary key ID
 * @returns Array of staff members with member details
 * @throws Error if database query fails
 *
 * @example
 * const staff = await getOrganizationStaff('org-uuid');
 * console.log(`Organization has ${staff.length} staff members`);
 */
export async function getOrganizationStaff(
  organizationId: string
): Promise<OrganizationStaffMember[]> {
  const { data, error } = await supabase
    .from('organization_staff')
    .select(`
      id,
      member_id,
      organization_id,
      position,
      added_at,
      member:members!organization_staff_member_id_fkey(
        id,
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .eq('organization_id', organizationId)
    .order('added_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch organization staff: ${error.message}`);
  }

  // Sort by position (owner first, then admin, then league_rep), then by added_at
  const positionOrder: Record<string, number> = { owner: 1, admin: 2, league_rep: 3 };
  const sorted = (data as unknown as OrganizationStaffMember[]).sort((a, b) => {
    const positionDiff = positionOrder[a.position] - positionOrder[b.position];
    if (positionDiff !== 0) return positionDiff;
    return new Date(a.added_at).getTime() - new Date(b.added_at).getTime();
  });

  return sorted;
}
