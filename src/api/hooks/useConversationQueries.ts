/**
 * @fileoverview Conversation Query Hooks (TanStack Query)
 *
 * React hooks for conversation queries with automatic caching.
 *
 * @see api/queries/conversations.ts - Pure query functions
 */

import { useQuery } from '@tanstack/react-query';
import {
  getConversationType,
  isUserBlocked,
  getOtherParticipantId,
} from '../queries/conversations';
import { queryKeys } from '../queryKeys';
import { STALE_TIME } from '../client';

/**
 * Hook to fetch conversation type and auto-managed status
 *
 * Gets conversation metadata to determine if it's a DM, group, or auto-managed conversation.
 * Useful for determining UI behavior (e.g., whether "Leave" button should be shown).
 *
 * @param conversationId - Conversation's primary key ID
 * @returns TanStack Query result with conversation type data
 *
 * @example
 * const { data: typeInfo, isLoading } = useConversationType(conversationId);
 *
 * if (typeInfo?.autoManaged) {
 *   // Hide "Leave" button for auto-managed conversations
 * }
 */
export function useConversationType(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.messages.conversationType(conversationId || ''),
    queryFn: () => getConversationType(conversationId!),
    enabled: !!conversationId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes - conversation type rarely changes
  });
}

/**
 * Hook to check if a user is blocked
 *
 * Determines whether the current user has blocked another user.
 * Useful for filtering search results or hiding blocked users from conversation lists.
 *
 * @param userId - Current user's member ID
 * @param otherUserId - Other user's member ID to check
 * @returns TanStack Query result with boolean indicating if user is blocked
 *
 * @example
 * const { data: isBlocked } = useIsUserBlocked(currentUserId, selectedUserId);
 *
 * if (isBlocked) {
 *   // Hide "Start Conversation" button
 * }
 */
export function useIsUserBlocked(
  userId: string | undefined,
  otherUserId: string | undefined
) {
  return useQuery({
    queryKey: queryKeys.messages.isUserBlocked(userId || '', otherUserId || ''),
    queryFn: () => isUserBlocked(userId!, otherUserId!),
    enabled: !!userId && !!otherUserId,
    staleTime: STALE_TIME.MESSAGES, // 30 seconds - block status should update quickly
  });
}

/**
 * Hook to get other participant ID in a DM conversation
 *
 * For direct message conversations, returns the ID of the other participant.
 * Useful for displaying user info or checking block status in DMs.
 *
 * @param conversationId - Conversation's primary key ID
 * @param currentUserId - Current user's member ID
 * @returns TanStack Query result with other participant's member ID
 *
 * @example
 * const { data: otherUserId } = useOtherParticipantId(conversationId, currentUserId);
 *
 * // Use with another query to get user details
 * const { data: otherUserInfo } = useUserProfile(otherUserId);
 */
export function useOtherParticipantId(
  conversationId: string | undefined,
  currentUserId: string | undefined
) {
  return useQuery({
    queryKey: queryKeys.messages.otherParticipant(conversationId || '', currentUserId || ''),
    queryFn: () => getOtherParticipantId(conversationId!, currentUserId!),
    enabled: !!conversationId && !!currentUserId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes - participants rarely change
  });
}
