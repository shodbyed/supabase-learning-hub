/**
 * @fileoverview Match Lineup Mutation Hooks (TanStack Query)
 *
 * React hooks for match lineup mutations with automatic cache invalidation.
 * Wraps pure mutation functions with TanStack Query for state management.
 *
 * @see api/mutations/matchLineups.ts - Pure mutation functions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import {
  saveMatchLineup,
  lockMatchLineup,
  unlockMatchLineup,
} from '../mutations/matchLineups';

/**
 * Hook to save/update a match lineup
 *
 * Automatically invalidates lineup queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const saveLineupMutation = useSaveMatchLineup();
 *
 * const handleSave = async () => {
 *   try {
 *     const lineup = await saveLineupMutation.mutateAsync({
 *       matchId: 'match-123',
 *       teamId: 'team-456',
 *       memberId: 'member-789',
 *       players: [
 *         { position: 1, playerId: 'player-1', handicap: 5 },
 *         { position: 2, playerId: 'player-2', handicap: 6 },
 *         { position: 3, playerId: 'player-3', handicap: 4 }
 *       ],
 *       existingLineupId: 'lineup-111' // Optional, for updates
 *     });
 *     console.log('Lineup saved:', lineup);
 *   } catch (error) {
 *     console.error('Failed to save lineup:', error);
 *   }
 * };
 */
export function useSaveMatchLineup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveMatchLineup,
    onSuccess: (_, variables) => {
      // Invalidate lineup for this match
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.lineup(variables.matchId),
      });

      // Invalidate match details (lineup affects match state)
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.detail(variables.matchId),
      });
    },
  });
}

/**
 * Hook to lock a match lineup
 *
 * Automatically invalidates lineup queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const lockLineupMutation = useLockMatchLineup();
 *
 * const handleLock = async () => {
 *   try {
 *     await lockLineupMutation.mutateAsync({
 *       lineupId: 'lineup-123',
 *       teamId: 'team-456',
 *       memberId: 'member-789'
 *     });
 *     console.log('Lineup locked');
 *   } catch (error) {
 *     console.error('Failed to lock lineup:', error);
 *   }
 * };
 */
export function useLockMatchLineup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: lockMatchLineup,
    onSuccess: (lockedLineup) => {
      // Invalidate lineup for this match
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.lineup(lockedLineup.match_id),
      });

      // Invalidate match details
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.detail(lockedLineup.match_id),
      });
    },
  });
}

/**
 * Hook to unlock a match lineup
 *
 * Automatically invalidates lineup queries on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const unlockLineupMutation = useUnlockMatchLineup();
 *
 * const handleUnlock = async () => {
 *   try {
 *     await unlockLineupMutation.mutateAsync({
 *       lineupId: 'lineup-123',
 *       teamId: 'team-456',
 *       memberId: 'member-789'
 *     });
 *     console.log('Lineup unlocked');
 *   } catch (error) {
 *     console.error('Failed to unlock lineup:', error);
 *   }
 * };
 */
export function useUnlockMatchLineup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlockMatchLineup,
    onSuccess: (unlockedLineup) => {
      // Invalidate lineup for this match
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.lineup(unlockedLineup.match_id),
      });

      // Invalidate match details
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.detail(unlockedLineup.match_id),
      });
    },
  });
}
