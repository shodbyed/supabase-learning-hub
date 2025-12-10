/**
 * @fileoverview Playoff Configuration Mutation Functions
 *
 * TanStack Query mutations for saving playoff configurations.
 * Supports configurations at organization and league levels.
 *
 * Uses the entity_type + entity_id pattern:
 * - Organization configs: entity_type='organization', entity_id=orgId
 * - League configs: entity_type='league', entity_id=leagueId
 *
 * Organization level: Single default config per org (upsert pattern)
 * League level: Single override config per league (upsert pattern)
 *
 * The upsert approach means:
 * - If no config exists for the entity → INSERT new record
 * - If config already exists → UPDATE that record
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/supabaseClient';
import type { PlayoffConfigEntityType } from '@/api/hooks/usePlayoffConfigurations';
import type { MatchupStyle, PaymentMethod, QualificationType } from '@/hooks/playoff/usePlayoffSettingsReducer';

/**
 * Parameters for saving a playoff configuration (upsert)
 *
 * This handles both creating new configs and updating existing ones.
 * The mutation checks if a config already exists for the entity and
 * either inserts or updates accordingly.
 */
export interface SavePlayoffConfigurationParams {
  /** Entity type: 'organization' or 'league' */
  entityType: PlayoffConfigEntityType;
  /** UUID of the organization or league */
  entityId: string;
  /** Configuration name (required) */
  name: string;
  /** Configuration description (optional) */
  description?: string;
  /** How teams qualify: 'all', 'fixed', or 'percentage' */
  qualificationType: QualificationType;
  /** Fixed number of teams (when qualificationType is 'fixed') */
  fixedTeamCount?: number | null;
  /** Percentage of teams (when qualificationType is 'percentage') */
  qualifyingPercentage?: number | null;
  /** Minimum teams for percentage-based qualification */
  percentageMin?: number | null;
  /** Maximum teams for percentage-based qualification */
  percentageMax?: number | null;
  /** Number of playoff weeks */
  playoffWeeks: number;
  /** Matchup style for each week */
  weekMatchupStyles: MatchupStyle[];
  /** Number of wildcard spots */
  wildcardSpots: number;
  /** Payment method for additional weeks */
  paymentMethod: PaymentMethod;
  /** Whether to auto-generate playoff matches */
  autoGenerate?: boolean;
}

/**
 * Save a playoff configuration (upsert)
 *
 * Checks if a configuration already exists for the entity:
 * - If yes: Updates the existing record
 * - If no: Inserts a new record
 *
 * This ensures each organization/league has exactly one custom config,
 * simplifying the user experience and avoiding orphaned records.
 *
 * @param params - Configuration parameters
 * @returns Saved configuration record (created or updated)
 * @throws Error if database operation fails
 *
 * @example
 * // First save creates new config
 * const config = await savePlayoffConfiguration({
 *   entityType: 'organization',
 *   entityId: 'org-uuid',
 *   name: 'My Custom Playoffs',
 *   qualificationType: 'all',
 *   playoffWeeks: 1,
 *   weekMatchupStyles: ['seeded'],
 *   wildcardSpots: 0,
 *   paymentMethod: 'automatic',
 * });
 *
 * // Subsequent saves update the same config
 * const updated = await savePlayoffConfiguration({
 *   ...config,
 *   wildcardSpots: 2, // Modified setting
 * });
 */
export async function savePlayoffConfiguration(params: SavePlayoffConfigurationParams) {
  // First, check if a config already exists for this entity
  const { data: existingConfig } = await supabase
    .from('playoff_configurations')
    .select('id')
    .eq('entity_type', params.entityType)
    .eq('entity_id', params.entityId)
    .maybeSingle();

  // Build the config data object
  const configData = {
    entity_type: params.entityType,
    entity_id: params.entityId,
    name: params.name,
    description: params.description ?? null,
    is_default: true, // Always true for org/league configs
    qualification_type: params.qualificationType,
    fixed_team_count: params.fixedTeamCount ?? null,
    qualifying_percentage: params.qualifyingPercentage ?? null,
    percentage_min: params.percentageMin ?? null,
    percentage_max: params.percentageMax ?? null,
    playoff_weeks: params.playoffWeeks,
    week_matchup_styles: params.weekMatchupStyles,
    wildcard_spots: params.wildcardSpots,
    payment_method: params.paymentMethod,
    auto_generate: params.autoGenerate ?? false,
  };

  if (existingConfig) {
    // UPDATE existing config
    const { data, error } = await supabase
      .from('playoff_configurations')
      .update(configData)
      .eq('id', existingConfig.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update playoff configuration: ${error.message}`);
    }

    return data;
  } else {
    // INSERT new config
    const { data, error } = await supabase
      .from('playoff_configurations')
      .insert(configData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create playoff configuration: ${error.message}`);
    }

    return data;
  }
}

/**
 * Delete a playoff configuration
 *
 * Removes an organization or league's custom config, reverting them
 * to use the inherited default (org default for leagues, global for orgs).
 *
 * @param configId - Configuration ID to delete
 * @throws Error if database operation fails
 */
export async function deletePlayoffConfiguration(configId: string) {
  const { error } = await supabase
    .from('playoff_configurations')
    .delete()
    .eq('id', configId);

  if (error) {
    throw new Error(`Failed to delete playoff configuration: ${error.message}`);
  }
}

/**
 * TanStack Query mutation hook for saving playoff configurations
 *
 * Handles both creating and updating configurations automatically.
 * Invalidates the query cache on success so the UI reflects changes.
 *
 * @example
 * const { mutate, isPending } = useSavePlayoffConfiguration();
 *
 * // Works for both new configs and updates
 * mutate({
 *   entityType: 'organization',
 *   entityId: orgId,
 *   name: 'My Custom Playoffs',
 *   qualificationType: 'all',
 *   playoffWeeks: 1,
 *   weekMatchupStyles: ['seeded'],
 *   wildcardSpots: 0,
 *   paymentMethod: 'automatic',
 * }, {
 *   onSuccess: (data) => {
 *     toast.success('Configuration saved!');
 *   }
 * });
 */
export function useSavePlayoffConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: savePlayoffConfiguration,
    onSuccess: (data) => {
      // Invalidate the query for this entity's configurations
      queryClient.invalidateQueries({
        queryKey: ['playoff-configurations', data.entity_type, data.entity_id],
      });

      // Also invalidate all resolved playoff configs since they may inherit from this entity
      // This ensures league pages show updated org defaults, and org pages show updated global defaults
      queryClient.invalidateQueries({
        queryKey: ['resolved-playoff-config'],
      });
    },
  });
}

/**
 * TanStack Query mutation hook for deleting playoff configurations
 *
 * @param entityType - Entity type for cache invalidation
 * @param entityId - Entity ID for cache invalidation
 *
 * @example
 * const { mutate } = useDeletePlayoffConfiguration('organization', orgId);
 * mutate(configId);
 */
export function useDeletePlayoffConfiguration(
  entityType: PlayoffConfigEntityType,
  entityId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePlayoffConfiguration,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['playoff-configurations', entityType, entityId],
      });

      // Also invalidate all resolved playoff configs since they may inherit from this entity
      queryClient.invalidateQueries({
        queryKey: ['resolved-playoff-config'],
      });
    },
  });
}
