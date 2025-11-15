/**
 * @fileoverview Match Mutation Hooks (TanStack Query)
 *
 * React hooks for match mutations with automatic cache invalidation.
 * Wraps pure mutation functions with TanStack Query for state management.
 *
 * @see api/mutations/matches.ts - Pure mutation functions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { updateMatch } from '../mutations/matches';

/**
 * Options for controlling cache invalidation
 */
export interface MatchMutationOptions {
  /** Whether to invalidate and refetch queries after mutation (default: true) */
  invalidate?: boolean;
}

/**
 * Hook to update any field(s) on a match
 *
 * Generic mutation that can update any match field(s).
 * Optionally invalidates queries after success.
 *
 * @param options - Options to control refetching behavior
 * @returns TanStack Query mutation result
 *
 * @example
 * // Update lineup ID with automatic refetch
 * const updateMatchMutation = useUpdateMatch();
 * await updateMatchMutation.mutateAsync({
 *   matchId: 'match-123',
 *   updates: { home_lineup_id: 'lineup-456' }
 * });
 *
 * @example
 * // Update multiple fields with automatic refetch
 * const updateMatchMutation = useUpdateMatch();
 * await updateMatchMutation.mutateAsync({
 *   matchId: 'match-123',
 *   updates: {
 *     home_lineup_id: 'lineup-456',
 *     started_at: new Date().toISOString()
 *   }
 * });
 *
 * @example
 * // Update without refetch (for bulk operations)
 * const updateMatchMutation = useUpdateMatch({ invalidate: false });
 * await updateMatchMutation.mutateAsync({
 *   matchId: 'match-123',
 *   updates: { home_games_to_win: 8 }
 * });
 */
export function useUpdateMatch(options: MatchMutationOptions = {}) {
  const { invalidate = true } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMatch,
    onSuccess: (_, variables) => {
      if (!invalidate) return;

      // Invalidate match detail query
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.detail(variables.matchId),
      });

      // Invalidate match list queries (in case status changed)
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.all,
      });
    },
  });
}
