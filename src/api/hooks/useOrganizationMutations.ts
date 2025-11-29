/**
 * @fileoverview Organization Mutation Hooks (TanStack Query)
 *
 * React hooks for updating organization settings and preferences.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrganizationProfanityFilter } from '../mutations/organizations';

/**
 * Hook to update organization's profanity filter setting
 *
 * Invalidates organization queries on success.
 *
 * @example
 * const updateFilter = useUpdateOrganizationProfanityFilter();
 * await updateFilter.mutateAsync({
 *   organizationId: 'org-id',
 *   enabled: true
 * });
 */
export function useUpdateOrganizationProfanityFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { organizationId: string; enabled: boolean }) =>
      updateOrganizationProfanityFilter(params.organizationId, params.enabled),
    onSuccess: (data) => {
      // Invalidate organization query
      queryClient.invalidateQueries({
        queryKey: ['organization', data.id],
      });
    },
  });
}
