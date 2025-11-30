/**
 * @fileoverview Organization Staff Mutation Functions
 *
 * Functions for adding/removing organization staff members.
 */

import { supabase } from '@/supabaseClient';

/**
 * Add a staff member to an organization
 *
 * Also updates the member's role to 'league_operator' so they can access operator pages.
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
  // First, update member's role to league_operator
  const { error: roleError } = await supabase
    .from('members')
    .update({ role: 'league_operator' })
    .eq('id', memberId);

  if (roleError) {
    throw new Error(`Failed to update member role: ${roleError.message}`);
  }

  // Then add them to organization_staff
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
 * Also checks if the member is staff anywhere else. If not, reverts their role to 'player'.
 *
 * @param staffId - organization_staff record ID
 * @param memberId - Member ID to check for other staff positions
 * @throws Error if database operation fails
 */
export async function removeOrganizationStaff(staffId: string, memberId: string) {
  // First, delete the staff record
  const { error: deleteError } = await supabase
    .from('organization_staff')
    .delete()
    .eq('id', staffId);

  if (deleteError) {
    throw new Error(`Failed to remove staff member: ${deleteError.message}`);
  }

  // Check if member is staff in any other organizations
  const { data: otherStaffPositions, error: checkError } = await supabase
    .from('organization_staff')
    .select('id')
    .eq('member_id', memberId);

  if (checkError) {
    throw new Error(`Failed to check member staff positions: ${checkError.message}`);
  }

  // If no other staff positions, revert role to 'player'
  if (!otherStaffPositions || otherStaffPositions.length === 0) {
    const { error: roleError } = await supabase
      .from('members')
      .update({ role: 'player' })
      .eq('id', memberId);

    if (roleError) {
      throw new Error(`Failed to revert member role: ${roleError.message}`);
    }
  }
}
