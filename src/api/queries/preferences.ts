/**
 * @fileoverview Preferences Query Functions
 *
 * Query functions for fetching organization and league preferences.
 * Used by TanStack Query hooks for caching and state management.
 */

import { supabase } from '@/supabaseClient';
import type { OrganizationPreferences, LeaguePreferences } from '@/types/preferences';
import { logger } from '@/utils/logger';

/**
 * Fetch organization preferences by operator ID
 *
 * @param operatorId - League operator ID
 * @returns Organization preferences record
 * @throws Error if query fails or preferences not found
 */
export async function getOrganizationPreferences(
  operatorId: string
): Promise<OrganizationPreferences> {
  const { data, error } = await supabase
    .from('preferences')
    .select('*')
    .eq('entity_type', 'organization')
    .eq('entity_id', operatorId)
    .single();

  if (error) {
    logger.error('Error fetching organization preferences', { error: error.message });
    throw new Error(`Failed to fetch organization preferences: ${error.message}`);
  }

  if (!data) {
    throw new Error('Organization preferences not found');
  }

  return data as OrganizationPreferences;
}

/**
 * Fetch league preferences by league ID
 *
 * @param leagueId - League ID
 * @returns League preferences record
 * @throws Error if query fails or preferences not found
 */
export async function getLeaguePreferences(
  leagueId: string
): Promise<LeaguePreferences> {
  const { data, error } = await supabase
    .from('preferences')
    .select('*')
    .eq('entity_type', 'league')
    .eq('entity_id', leagueId)
    .single();

  if (error) {
    logger.error('Error fetching league preferences', { error: error.message });
    throw new Error(`Failed to fetch league preferences: ${error.message}`);
  }

  if (!data) {
    throw new Error('League preferences not found');
  }

  return data as LeaguePreferences;
}
