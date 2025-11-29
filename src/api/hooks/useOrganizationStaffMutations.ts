/**
 * @fileoverview Organization Staff Mutation Hooks (TanStack Query)
 *
 * React hooks for adding/removing organization staff members.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addOrganizationStaff, removeOrganizationStaff } from '../mutations/organizationStaff';

/**
 * Hook to add a staff member to an organization
 *
 * Invalidates organization staff queries on success.
 *
 * @example
 * const addStaff = useAddOrganizationStaff();
 * await addStaff.mutateAsync({
 *   organizationId: 'org-id',
 *   memberId: 'member-id',
 *   position: 'admin',
 *   addedBy: 'current-user-id'
 * });
 */
export function useAddOrganizationStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      organizationId: string;
      memberId: string;
      position: 'admin' | 'league_rep';
      addedBy: string;
    }) => addOrganizationStaff(
      params.organizationId,
      params.memberId,
      params.position,
      params.addedBy
    ),
    onSuccess: (_, variables) => {
      // Invalidate staff list for this organization
      queryClient.invalidateQueries({
        queryKey: ['organizationStaff', variables.organizationId],
      });
    },
  });
}

/**
 * Hook to remove a staff member from an organization
 *
 * Invalidates organization staff queries on success.
 *
 * @example
 * const removeStaff = useRemoveOrganizationStaff();
 * await removeStaff.mutateAsync({
 *   staffId: 'staff-record-id',
 *   organizationId: 'org-id'
 * });
 */
export function useRemoveOrganizationStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { staffId: string; organizationId: string }) =>
      removeOrganizationStaff(params.staffId),
    onSuccess: (_, variables) => {
      // Invalidate staff list for this organization
      queryClient.invalidateQueries({
        queryKey: ['organizationStaff', variables.organizationId],
      });
    },
  });
}
