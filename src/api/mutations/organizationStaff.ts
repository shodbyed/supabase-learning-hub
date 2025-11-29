/**
 * @fileoverview Organization Staff Mutation Functions
 *
 * Functions for adding/removing organization staff members.
 */

import { supabase } from '@/supabaseClient';

/**
 * Add a staff member to an organization
 *
 * @param organizationId - Organization's primary key ID
 * @param memberId - Member to add as staff
 * @param position - Position/role ('admin' or 'league_rep')
 * @param addedBy - Member ID of person adding this staff
 * @returns Newly created staff record
 * @throws Error if database operation fails
 */
export async function addOrganizationStaff(
  organizationId: string,
  memberId: string,
  position: 'admin' | 'league_rep',
  addedBy: string
) {
  const { data, error } = await supabase
    .from('organization_staff')
    .insert({
      organization_id: organizationId,
      member_id: memberId,
      position,
      added_by: addedBy,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add staff member: ${error.message}`);
  }

  return data;
}

/**
 * Remove a staff member from an organization
 *
 * @param staffId - organization_staff record ID
 * @throws Error if database operation fails
 */
export async function removeOrganizationStaff(staffId: string) {
  const { error } = await supabase
    .from('organization_staff')
    .delete()
    .eq('id', staffId);

  if (error) {
    throw new Error(`Failed to remove staff member: ${error.message}`);
  }
}
