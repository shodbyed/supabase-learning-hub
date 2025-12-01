/**
 * @fileoverview Preferences Mutation Functions
 *
 * Functions for creating, updating, and deleting preferences.
 * Preferences can be set at organization level (defaults for all leagues)
 * or league level (overrides for specific league).
 *
 * NULL values cascade to next level:
 * League preference → Organization preference → System default
 *
 * Related:
 * - resolved_league_preferences view: Read-only view that resolves cascading preferences
 *
 * @see api/hooks/usePreferenceMutations.ts - TanStack Query hooks
 */

import { supabase } from '@/supabaseClient';

/**
 * Preference record structure
 */
export interface Preference {
  id: string;
  entity_type: 'organization' | 'league';
  entity_id: string;
  handicap_variant?: string | null;
  team_handicap_variant?: string | null;
  game_history_limit?: number | null;
  team_format?: string | null;
  golden_break_counts_as_win?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Parameters for creating a preference
 */
export interface CreatePreferenceParams {
  entity_type: 'organization' | 'league';
  entity_id: string;
  handicap_variant?: string | null;
  team_handicap_variant?: string | null;
  game_history_limit?: number | null;
  team_format?: string | null;
  golden_break_counts_as_win?: boolean | null;
}

/**
 * Parameters for updating a preference
 */
export interface UpdatePreferenceParams {
  preferenceId: string;
  handicap_variant?: string | null;
  team_handicap_variant?: string | null;
  game_history_limit?: number | null;
  team_format?: string | null;
  golden_break_counts_as_win?: boolean | null;
}

/**
 * Parameters for deleting a preference
 */
export interface DeletePreferenceParams {
  preferenceId: string;
}

/**
 * Create a new preference record
 *
 * Creates preferences for an organization (defaults for all leagues)
 * or for a specific league (overrides organization defaults).
 *
 * NULL values will cascade to next level when resolved.
 *
 * @param params - Preference creation parameters
 * @returns Created preference
 * @throws Error if validation fails or database operation fails
 *
 * @example
 * // Organization-level defaults
 * const orgPref = await createPreference({
 *   entity_type: 'organization',
 *   entity_id: 'org-123',
 *   handicap_variant: 'standard',
 *   team_format: '5_man',
 *   game_history_limit: 200
 * });
 *
 * @example
 * // League-level overrides
 * const leaguePref = await createPreference({
 *   entity_type: 'league',
 *   entity_id: 'league-456',
 *   handicap_variant: 'reduced', // Override org default
 *   team_format: null // Use org default
 * });
 */
export async function createPreference(
  params: CreatePreferenceParams
): Promise<Preference> {
  // Validation
  if (!params.entity_type || !['organization', 'league'].includes(params.entity_type)) {
    throw new Error('entity_type must be "organization" or "league"');
  }

  if (!params.entity_id) {
    throw new Error('entity_id is required');
  }

  // Validate handicap_variant if provided
  if (params.handicap_variant !== undefined && params.handicap_variant !== null) {
    if (!['standard', 'reduced', 'none'].includes(params.handicap_variant)) {
      throw new Error('handicap_variant must be "standard", "reduced", or "none"');
    }
  }

  // Validate team_handicap_variant if provided
  if (params.team_handicap_variant !== undefined && params.team_handicap_variant !== null) {
    if (!['standard', 'reduced', 'none'].includes(params.team_handicap_variant)) {
      throw new Error('team_handicap_variant must be "standard", "reduced", or "none"');
    }
  }

  // Validate game_history_limit if provided
  if (params.game_history_limit !== undefined && params.game_history_limit !== null) {
    if (params.game_history_limit < 50 || params.game_history_limit > 500) {
      throw new Error('game_history_limit must be between 50 and 500');
    }
  }

  // Validate team_format if provided
  if (params.team_format !== undefined && params.team_format !== null) {
    if (!['5_man', '8_man'].includes(params.team_format)) {
      throw new Error('team_format must be "5_man" or "8_man"');
    }
  }

  const { data, error } = await supabase
    .from('preferences')
    .insert([
      {
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        handicap_variant: params.handicap_variant ?? null,
        team_handicap_variant: params.team_handicap_variant ?? null,
        game_history_limit: params.game_history_limit ?? null,
        team_format: params.team_format ?? null,
        golden_break_counts_as_win: params.golden_break_counts_as_win ?? null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to create preference: ${error.message} (${error.code})`
    );
  }

  return data;
}

/**
 * Update an existing preference
 *
 * Only provided fields will be updated.
 * Setting a field to null will cause it to cascade to next level.
 *
 * @param params - Preference update parameters
 * @returns Updated preference
 * @throws Error if validation fails or database operation fails
 *
 * @example
 * const updated = await updatePreference({
 *   preferenceId: 'pref-123',
 *   handicap_variant: 'reduced',
 *   game_history_limit: 150
 * });
 */
export async function updatePreference(
  params: UpdatePreferenceParams
): Promise<Preference> {
  if (!params.preferenceId) {
    throw new Error('preferenceId is required');
  }

  // Build update object with only provided fields
  const updates: Record<string, any> = {};

  if (params.handicap_variant !== undefined) {
    if (params.handicap_variant !== null && !['standard', 'reduced', 'none'].includes(params.handicap_variant)) {
      throw new Error('handicap_variant must be "standard", "reduced", or "none"');
    }
    updates.handicap_variant = params.handicap_variant;
  }

  if (params.team_handicap_variant !== undefined) {
    if (params.team_handicap_variant !== null && !['standard', 'reduced', 'none'].includes(params.team_handicap_variant)) {
      throw new Error('team_handicap_variant must be "standard", "reduced", or "none"');
    }
    updates.team_handicap_variant = params.team_handicap_variant;
  }

  if (params.game_history_limit !== undefined) {
    if (params.game_history_limit !== null && (params.game_history_limit < 50 || params.game_history_limit > 500)) {
      throw new Error('game_history_limit must be between 50 and 500');
    }
    updates.game_history_limit = params.game_history_limit;
  }

  if (params.team_format !== undefined) {
    if (params.team_format !== null && !['5_man', '8_man'].includes(params.team_format)) {
      throw new Error('team_format must be "5_man" or "8_man"');
    }
    updates.team_format = params.team_format;
  }

  if (params.golden_break_counts_as_win !== undefined) {
    updates.golden_break_counts_as_win = params.golden_break_counts_as_win;
  }

  const { data, error } = await supabase
    .from('preferences')
    .update(updates)
    .eq('id', params.preferenceId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update preference: ${error.message} (${error.code})`
    );
  }

  return data;
}

/**
 * Delete a preference
 *
 * Removes the preference record entirely.
 * The entity will fall back to next level defaults.
 *
 * @param params - Preference deletion parameters
 * @throws Error if database operation fails
 *
 * @example
 * await deletePreference({ preferenceId: 'pref-123' });
 */
export async function deletePreference(
  params: DeletePreferenceParams
): Promise<void> {
  if (!params.preferenceId) {
    throw new Error('preferenceId is required');
  }

  const { error } = await supabase
    .from('preferences')
    .delete()
    .eq('id', params.preferenceId);

  if (error) {
    throw new Error(
      `Failed to delete preference: ${error.message} (${error.code})`
    );
  }
}
