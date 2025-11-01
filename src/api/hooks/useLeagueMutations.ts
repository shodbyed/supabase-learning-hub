/**
 * @fileoverview League Mutation Hooks
 *
 * TanStack Query mutation hooks for league operations.
 * Automatically invalidates relevant queries on success.
 *
 * @see api/mutations/leagues.ts - Raw mutation functions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLeagueDayOfWeek, type UpdateLeagueDayParams } from '../mutations/leagues';
import { queryKeys } from '../queryKeys';

/**
 * Hook to update league day of week
 *
 * Automatically invalidates league queries on success to refresh UI.
 *
 * @returns Mutation hook with mutate function and state
 *
 * @example
 * function LeagueEditor({ leagueId }) {
 *   const updateDay = useUpdateLeagueDayOfWeek();
 *
 *   const handleSave = () => {
 *     updateDay.mutate({
 *       leagueId,
 *       newDay: 'Wednesday'
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleSave} disabled={updateDay.isPending}>
 *       {updateDay.isPending ? 'Saving...' : 'Save'}
 *     </button>
 *   );
 * }
 */
export function useUpdateLeagueDayOfWeek() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateLeagueDayParams) => updateLeagueDayOfWeek(params),
    onSuccess: (_, variables) => {
      // Invalidate all league queries to refresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.all,
      });

      // Also invalidate seasons for this league (day change affects schedule)
      queryClient.invalidateQueries({
        queryKey: queryKeys.seasons.byLeague(variables.leagueId),
      });
    },
  });
}
