/**
 * @fileoverview Championship Date Mutation Hooks (TanStack Query)
 *
 * React hooks for championship date mutations with automatic cache invalidation.
 * Wraps pure mutation functions with TanStack Query for state management.
 *
 * Benefits:
 * - Automatic loading/error states
 * - Optimistic updates support
 * - Automatic cache invalidation
 * - Success/error callbacks
 *
 * @see api/mutations/championshipDates.ts - Pure mutation functions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createChampionshipDate,
  updateChampionshipDate,
  deleteChampionshipDate,
} from '../mutations/championshipDates';

/**
 * Hook to create a new championship date option
 *
 * Automatically invalidates championship date queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const createChampionshipDateMutation = useCreateChampionshipDate();
 *
 * const handleSubmit = async () => {
 *   try {
 *     const championship = await createChampionshipDateMutation.mutateAsync({
 *       organization: 'BCA',
 *       year: 2025,
 *       start_date: '2025-07-15',
 *       end_date: '2025-07-20'
 *     });
 *     console.log('Created championship date:', championship);
 *   } catch (error) {
 *     console.error('Failed to create championship date:', error);
 *   }
 * };
 */
export function useCreateChampionshipDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChampionshipDate,
    onSuccess: () => {
      // Invalidate all championship date queries
      queryClient.invalidateQueries({
        queryKey: ['championship_date_options'],
      });
    },
  });
}

/**
 * Hook to update an existing championship date option
 *
 * Automatically invalidates championship date queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const updateChampionshipDateMutation = useUpdateChampionshipDate();
 *
 * const handleSave = async () => {
 *   try {
 *     const updated = await updateChampionshipDateMutation.mutateAsync({
 *       championshipDateId: 'champ-123',
 *       start_date: '2025-07-16',
 *       end_date: '2025-07-21',
 *       dev_verified: true
 *     });
 *     console.log('Updated championship date:', updated);
 *   } catch (error) {
 *     console.error('Failed to update championship date:', error);
 *   }
 * };
 */
export function useUpdateChampionshipDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateChampionshipDate,
    onSuccess: () => {
      // Invalidate all championship date queries
      queryClient.invalidateQueries({
        queryKey: ['championship_date_options'],
      });
    },
  });
}

/**
 * Hook to delete a championship date option
 *
 * Automatically invalidates championship date queries on success.
 *
 * WARNING: This will also set championship_id to NULL in any
 * operator_blackout_preferences that reference this championship.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const deleteChampionshipDateMutation = useDeleteChampionshipDate();
 *
 * const handleDelete = async (championshipDateId: string) => {
 *   const confirmed = window.confirm('Delete this championship date?');
 *   if (!confirmed) return;
 *
 *   try {
 *     await deleteChampionshipDateMutation.mutateAsync({ championshipDateId });
 *     console.log('Championship date deleted');
 *   } catch (error) {
 *     console.error('Failed to delete championship date:', error);
 *   }
 * };
 */
export function useDeleteChampionshipDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteChampionshipDate,
    onSuccess: () => {
      // Invalidate all championship date queries
      queryClient.invalidateQueries({
        queryKey: ['championship_date_options'],
      });
      // Also invalidate operator blackout preferences since they reference championship dates
      queryClient.invalidateQueries({
        queryKey: ['operator_blackout_preferences'],
      });
    },
  });
}
