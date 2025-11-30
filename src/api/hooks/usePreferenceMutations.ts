/**
 * @fileoverview Preference Mutation Hooks (TanStack Query)
 *
 * React hooks for preference mutations with automatic cache invalidation.
 * Wraps pure mutation functions with TanStack Query for state management.
 *
 * Benefits:
 * - Automatic loading/error states
 * - Optimistic updates support
 * - Automatic cache invalidation
 * - Success/error callbacks
 *
 * @see api/mutations/preferences.ts - Pure mutation functions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPreference,
  updatePreference,
  deletePreference,
} from '../mutations/preferences';

/**
 * Hook to create a new preference
 *
 * Automatically invalidates preference queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const createPreferenceMutation = useCreatePreference();
 *
 * const handleSubmit = async () => {
 *   try {
 *     const preference = await createPreferenceMutation.mutateAsync({
 *       entity_type: 'organization',
 *       entity_id: 'org-123',
 *       handicap_variant: 'standard',
 *       team_format: '5_man',
 *       game_history_limit: 200
 *     });
 *     console.log('Created preference:', preference);
 *   } catch (error) {
 *     console.error('Failed to create preference:', error);
 *   }
 * };
 */
export function useCreatePreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPreference,
    onSuccess: () => {
      // Invalidate all preference queries
      queryClient.invalidateQueries({
        queryKey: ['preferences'],
      });
      // Also invalidate resolved preferences view
      queryClient.invalidateQueries({
        queryKey: ['resolved_league_preferences'],
      });
    },
  });
}

/**
 * Hook to update an existing preference
 *
 * Automatically invalidates preference queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const updatePreferenceMutation = useUpdatePreference();
 *
 * const handleSave = async () => {
 *   try {
 *     const updated = await updatePreferenceMutation.mutateAsync({
 *       preferenceId: 'pref-123',
 *       handicap_variant: 'reduced',
 *       game_history_limit: 150
 *     });
 *     console.log('Updated preference:', updated);
 *   } catch (error) {
 *     console.error('Failed to update preference:', error);
 *   }
 * };
 */
export function useUpdatePreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePreference,
    onSuccess: () => {
      // Invalidate all preference queries
      queryClient.invalidateQueries({
        queryKey: ['preferences'],
      });
      // Also invalidate resolved preferences view
      queryClient.invalidateQueries({
        queryKey: ['resolved_league_preferences'],
      });
    },
  });
}

/**
 * Hook to delete a preference
 *
 * Automatically invalidates preference queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const deletePreferenceMutation = useDeletePreference();
 *
 * const handleDelete = async (preferenceId: string) => {
 *   const confirmed = window.confirm('Delete this preference?');
 *   if (!confirmed) return;
 *
 *   try {
 *     await deletePreferenceMutation.mutateAsync({ preferenceId });
 *     console.log('Preference deleted');
 *   } catch (error) {
 *     console.error('Failed to delete preference:', error);
 *   }
 * };
 */
export function useDeletePreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePreference,
    onSuccess: () => {
      // Invalidate all preference queries
      queryClient.invalidateQueries({
        queryKey: ['preferences'],
      });
      // Also invalidate resolved preferences view
      queryClient.invalidateQueries({
        queryKey: ['resolved_league_preferences'],
      });
    },
  });
}
