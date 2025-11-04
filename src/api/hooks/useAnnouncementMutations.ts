/**
 * @fileoverview Announcement Mutation Hooks (TanStack Query)
 *
 * React hooks for announcement mutations (league, organization) with automatic cache invalidation.
 *
 * @see api/mutations/announcements.ts - Pure mutation functions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createLeagueAnnouncement,
  createOrganizationAnnouncement,
} from '../mutations/announcements';
import { queryKeys } from '../queryKeys';

/**
 * Hook to create a league announcement
 *
 * Creates or opens the league's announcement conversation and sends a message.
 * All players in the league's active season receive the announcement.
 * Automatically invalidates conversations cache on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const createAnnouncementMutation = useCreateLeagueAnnouncement();
 *
 * const handleSendAnnouncement = async () => {
 *   const result = await createAnnouncementMutation.mutateAsync({
 *     leagueId: 'league-123',
 *     senderId: currentUserId,
 *     message: 'Next week is playoffs!',
 *   });
 *   console.log('Announcement sent to:', result.conversationId);
 * };
 */
export function useCreateLeagueAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLeagueAnnouncement,
    onSuccess: () => {
      // Invalidate all conversations (announcement could affect many users)
      // More targeted invalidation would require fetching all league members
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.all,
      });
    },
  });
}

/**
 * Hook to create an organization announcement
 *
 * Creates or opens the organization's announcement conversation and sends a message.
 * All players in any active season operated by this operator receive the announcement.
 * Automatically invalidates conversations cache on success.
 *
 * @returns TanStack Query mutation result
 *
 * @example
 * const createAnnouncementMutation = useCreateOrganizationAnnouncement();
 *
 * const handleSendAnnouncement = async () => {
 *   const result = await createAnnouncementMutation.mutateAsync({
 *     operatorId: 'operator-123',
 *     senderId: currentUserId,
 *     message: 'All leagues: Registration opens next Monday!',
 *   });
 *   console.log('Announcement sent to:', result.conversationId);
 * };
 */
export function useCreateOrganizationAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganizationAnnouncement,
    onSuccess: () => {
      // Invalidate all conversations (announcement could affect many users)
      // More targeted invalidation would require fetching all organization members
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.all,
      });
    },
  });
}
