/**
 * @fileoverview League Venue Mutation Hooks (TanStack Query)
 *
 * React hooks for league-venue relationship mutations with automatic cache invalidation.
 * Wraps pure mutation functions with TanStack Query for state management.
 *
 * @see api/mutations/leagueVenues.ts - Pure mutation functions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import {
  addLeagueVenue,
  updateLeagueVenue,
  removeLeagueVenue,
} from '../mutations/leagueVenues';

/**
 * Hook to add a venue to a league
 *
 * Automatically invalidates venue queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const addLeagueVenueMutation = useAddLeagueVenue();
 *
 * const handleAdd = async () => {
 *   try {
 *     const leagueVenue = await addLeagueVenueMutation.mutateAsync({
 *       leagueId: 'league-123',
 *       venueId: 'venue-456',
 *       availableBarBoxTables: 4,
 *       availableRegulationTables: 2
 *     });
 *     console.log('Venue added to league:', leagueVenue);
 *   } catch (error) {
 *     console.error('Failed to add venue:', error);
 *   }
 * };
 */
export function useAddLeagueVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addLeagueVenue,
    onSuccess: (_, variables) => {
      // Invalidate venue lists for all operators (venue might be used by multiple operators)
      queryClient.invalidateQueries({
        queryKey: queryKeys.venues.all,
      });

      // Invalidate league details (to refresh venue count)
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.detail(variables.leagueId),
      });
    },
  });
}

/**
 * Hook to update league-venue table limits
 *
 * Automatically invalidates venue queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const updateLeagueVenueMutation = useUpdateLeagueVenue();
 *
 * const handleUpdate = async () => {
 *   try {
 *     const leagueVenue = await updateLeagueVenueMutation.mutateAsync({
 *       leagueVenueId: 'lv-123',
 *       availableBarBoxTables: 6,
 *       availableRegulationTables: 3
 *     });
 *     console.log('League venue updated:', leagueVenue);
 *   } catch (error) {
 *     console.error('Failed to update league venue:', error);
 *   }
 * };
 */
export function useUpdateLeagueVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLeagueVenue,
    onSuccess: () => {
      // Invalidate all venue queries to refresh limits
      queryClient.invalidateQueries({
        queryKey: queryKeys.venues.all,
      });
    },
  });
}

/**
 * Hook to remove a venue from a league
 *
 * Automatically invalidates venue queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const removeLeagueVenueMutation = useRemoveLeagueVenue();
 *
 * const handleRemove = async (leagueVenueId: string, leagueId: string) => {
 *   const confirmed = window.confirm('Remove this venue from the league?');
 *   if (!confirmed) return;
 *
 *   try {
 *     await removeLeagueVenueMutation.mutateAsync({
 *       leagueVenueId,
 *       leagueId // Pass for cache invalidation
 *     });
 *     console.log('Venue removed from league');
 *   } catch (error) {
 *     console.error('Failed to remove venue:', error);
 *   }
 * };
 */
export function useRemoveLeagueVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeLeagueVenue,
    onSuccess: () => {
      // Invalidate all venue queries to refresh lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.venues.all,
      });
    },
  });
}
