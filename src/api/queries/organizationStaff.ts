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
    .order('position', { ascending: true }) // owner, admin, league_rep
    .order('added_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch organization staff: ${error.message}`);
  }

  return data as OrganizationStaffMember[];
}
