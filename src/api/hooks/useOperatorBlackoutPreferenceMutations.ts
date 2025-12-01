/**
 * @fileoverview Operator Blackout Preference Mutation Hooks (TanStack Query)
 *
 * React hooks for operator blackout preference mutations with automatic cache invalidation.
 * Wraps pure mutation functions with TanStack Query for state management.
 *
 * Benefits:
 * - Automatic loading/error states
 * - Optimistic updates support
 * - Automatic cache invalidation
 * - Success/error callbacks
 *
 * @see api/mutations/operatorBlackoutPreferences.ts - Pure mutation functions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createOperatorBlackoutPreference,
  updateOperatorBlackoutPreference,
  deleteOperatorBlackoutPreference,
} from '../mutations/operatorBlackoutPreferences';

/**
 * Hook to create a new operator blackout preference
 *
 * Automatically invalidates operator blackout preference queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const createPreferenceMutation = useCreateOperatorBlackoutPreference();
 *
 * const handleSubmit = async () => {
 *   try {
 *     const preference = await createPreferenceMutation.mutateAsync({
 *       organization_id: 'org-123',
 *       preference_type: 'championship',
 *       preference_action: 'blackout',
 *       championship_id: 'champ-456'
 *     });
 *     console.log('Created preference:', preference);
 *   } catch (error) {
 *     console.error('Failed to create preference:', error);
 *   }
 * };
 */
export function useCreateOperatorBlackoutPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOperatorBlackoutPreference,
    onSuccess: () => {
      // Invalidate all operator blackout preference queries
      queryClient.invalidateQueries({
        queryKey: ['operator_blackout_preferences'],
      });
    },
  });
}

/**
 * Hook to update an existing operator blackout preference
 *
 * Automatically invalidates operator blackout preference queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const updatePreferenceMutation = useUpdateOperatorBlackoutPreference();
 *
 * const handleSave = async () => {
 *   try {
 *     const updated = await updatePreferenceMutation.mutateAsync({
 *       preferenceId: 'pref-123',
 *       preference_action: 'ignore',
 *       auto_apply: true
 *     });
 *     console.log('Updated preference:', updated);
 *   } catch (error) {
 *     console.error('Failed to update preference:', error);
 *   }
 * };
 */
export function useUpdateOperatorBlackoutPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOperatorBlackoutPreference,
    onSuccess: () => {
      // Invalidate all operator blackout preference queries
      queryClient.invalidateQueries({
        queryKey: ['operator_blackout_preferences'],
      });
    },
  });
}

/**
 * Hook to delete an operator blackout preference
 *
 * Automatically invalidates operator blackout preference queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const deletePreferenceMutation = useDeleteOperatorBlackoutPreference();
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
export function useDeleteOperatorBlackoutPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOperatorBlackoutPreference,
    onSuccess: () => {
      // Invalidate all operator blackout preference queries
      queryClient.invalidateQueries({
        queryKey: ['operator_blackout_preferences'],
      });
    },
  });
}
