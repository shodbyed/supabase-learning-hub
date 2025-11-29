/**
 * @fileoverview Venue Mutation Hooks (TanStack Query)
 *
 * React hooks for venue mutations with automatic cache invalidation.
 * Wraps pure mutation functions with TanStack Query for state management.
 *
 * Benefits:
 * - Automatic loading/error states
 * - Optimistic updates support
 * - Automatic cache invalidation
 * - Success/error callbacks
 *
 * @see api/mutations/venues.ts - Pure mutation functions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import {
  createVenue,
  updateVenue,
  deleteVenue,
} from '../mutations/venues';

/**
 * Hook to create a new venue
 *
 * Automatically invalidates venue queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const createVenueMutation = useCreateVenue();
 *
 * const handleSubmit = async () => {
 *   try {
 *     const venue = await createVenueMutation.mutateAsync({
 *       organizationId: 'org-123',
 *       name: 'The Pool Hall',
 *       street_address: '123 Main St',
 *       city: 'Austin',
 *       state: 'TX',
 *       zip_code: '78701',
 *       phone: '512-555-1234',
 *       bar_box_tables: 4,
 *       regulation_tables: 2
 *     });
 *     console.log('Created venue:', venue);
 *   } catch (error) {
 *     console.error('Failed to create venue:', error);
 *   }
 * };
 */
export function useCreateVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVenue,
    onSuccess: (newVenue, variables) => {
      // Invalidate venues list for this organization
      queryClient.invalidateQueries({
        queryKey: queryKeys.venues.byOrganization(variables.organizationId),
      });

      // Optionally set the new venue in cache
      queryClient.setQueryData(
        queryKeys.venues.detail(newVenue.id),
        newVenue
      );
    },
  });
}

/**
 * Hook to update an existing venue
 *
 * Automatically invalidates venue queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const updateVenueMutation = useUpdateVenue();
 *
 * const handleSave = async () => {
 *   try {
 *     const venue = await updateVenueMutation.mutateAsync({
 *       venueId: 'venue-123',
 *       name: 'Updated Pool Hall',
 *       street_address: '456 Oak St',
 *       city: 'Austin',
 *       state: 'TX',
 *       zip_code: '78702',
 *       phone: '512-555-5678',
 *       bar_box_tables: 6,
 *       regulation_tables: 3
 *     });
 *     console.log('Updated venue:', venue);
 *   } catch (error) {
 *     console.error('Failed to update venue:', error);
 *   }
 * };
 */
export function useUpdateVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVenue,
    onSuccess: (updatedVenue) => {
      // Invalidate all venue queries to refresh lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.venues.all,
      });

      // Update the specific venue in cache
      queryClient.setQueryData(
        queryKeys.venues.detail(updatedVenue.id),
        updatedVenue
      );
    },
  });
}

/**
 * Hook to delete a venue (soft delete)
 *
 * Automatically invalidates venue queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const deleteVenueMutation = useDeleteVenue();
 *
 * const handleDelete = async (venueId: string) => {
 *   const confirmed = window.confirm('Delete this venue?');
 *   if (!confirmed) return;
 *
 *   try {
 *     await deleteVenueMutation.mutateAsync({ venueId });
 *     console.log('Venue deleted');
 *   } catch (error) {
 *     console.error('Failed to delete venue:', error);
 *   }
 * };
 */
export function useDeleteVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVenue,
    onSuccess: (_, variables) => {
      // Invalidate all venue queries to refresh lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.venues.all,
      });

      // Remove the deleted venue from cache
      queryClient.removeQueries({
        queryKey: queryKeys.venues.detail(variables.venueId),
      });
    },
  });
}
