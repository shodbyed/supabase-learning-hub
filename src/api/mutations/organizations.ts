/**
 * @fileoverview Organization Mutation Functions
 *
 * Functions for updating organization settings and preferences.
 */

import { supabase } from '@/supabaseClient';

/**
 * Update organization's profanity filter setting
 *
 * Toggles profanity filtering for team names and content within the organization.
 *
 * @param organizationId - Organization's primary key ID
 * @param enabled - Whether profanity filter should be enabled
 * @returns Updated organization record
 * @throws Error if database operation fails
 *
 * @example
 * const org = await updateOrganizationProfanityFilter('org-id', true);
 */
export async function updateOrganizationProfanityFilter(
  organizationId: string,
  enabled: boolean
) {
  const { data, error } = await supabase
    .from('organizations')
    .update({ profanity_filter_enabled: enabled })
    .eq('id', organizationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profanity filter: ${error.message}`);
  }

  return data;
}
