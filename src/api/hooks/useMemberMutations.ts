/**
 * @fileoverview Member Mutation Hooks (TanStack Query)
 *
 * React hooks for member write operations with automatic cache invalidation.
 * Wraps mutation functions with TanStack Query for optimistic updates.
 *
 * Benefits:
 * - Automatic cache invalidation after successful mutations
 * - Built-in loading/error states
 * - Optimistic updates for better UX
 * - Automatic retries on failure
 *
 * @see api/mutations/members.ts - Pure mutation functions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { updateProfanityFilter, updateMemberNickname, updateMemberProfile } from '../mutations/members';

/**
 * Hook to update member's profile information
 *
 * General-purpose hook for updating any member profile fields.
 * Automatically invalidates member cache after successful update.
 *
 * @returns TanStack Mutation object with mutate/mutateAsync functions
 *
 * @example
 * const updateProfile = useUpdateMemberProfile();
 *
 * await updateProfile.mutateAsync({
 *   memberId: 'member-123',
 *   updates: {
 *     first_name: 'John',
 *     email: 'john@example.com'
 *   }
 * });
 */
export function useUpdateMemberProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMemberProfile,
    onSuccess: () => {
      // Invalidate all member queries to refresh profile everywhere
      queryClient.invalidateQueries({
        queryKey: queryKeys.members.all,
      });
    },
  });
}

/**
 * Hook to update member's nickname
 *
 * Automatically invalidates member cache after successful update.
 *
 * @returns TanStack Mutation object with mutate/mutateAsync functions
 *
 * @example
 * const updateNickname = useUpdateMemberNickname();
 *
 * await updateNickname.mutateAsync({
 *   memberId: 'member-123',
 *   nickname: 'John D'
 * });
 */
export function useUpdateMemberNickname() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMemberNickname,
    onSuccess: () => {
      // Invalidate all member queries to refresh nickname everywhere
      queryClient.invalidateQueries({
        queryKey: queryKeys.members.all,
      });
    },
  });
}

/**
 * Hook to update member's profanity filter preference
 *
 * Only works for users 18+. Automatically invalidates profanity settings cache
 * after successful update so the UI reflects the new state.
 *
 * @returns TanStack Mutation object with mutate/mutateAsync functions
 *
 * @example
 * const updateFilter = useUpdateProfanityFilter();
 *
 * const handleToggle = async () => {
 *   try {
 *     await updateFilter.mutateAsync({
 *       userId: user.id,
 *       enabled: !currentState
 *     });
 *     toast.success('Filter preference updated');
 *   } catch (error) {
 *     toast.error(error.message);
 *   }
 * };
 */
export function useUpdateProfanityFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfanityFilter,
    onSuccess: (_, variables) => {
      // Invalidate profanity settings cache for this user
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.members.byUser(variables.userId), 'profanitySettings'],
      });
    },
  });
}
