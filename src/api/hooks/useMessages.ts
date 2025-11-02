/**
 * @fileoverview Message Hooks (TanStack Query - Read-Only)
 *
 * React hooks for fetching message data with automatic caching.
 * Phase 1: Read-only operations only.
 *
 * Benefits:
 * - Automatic caching (30 second stale time for conversations/messages)
 * - Background refetching
 * - Request deduplication
 * - Loading and error states
 * - Works alongside real-time subscriptions
 *
 * @example
 * const { data: conversations, isLoading } = useConversations(memberId);
 * const { data: messages } = useConversationMessages(conversationId);
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import {
  getUserConversations,
  getConversationMessages,
  getBlockedUsers,
  getBlockedUsersDetails,
  getUnreadMessageCount,
  getConversationParticipants,
} from '../queries/messages';
import { STALE_TIME } from '../client';

/**
 * Hook to fetch all conversations for a user
 *
 * Returns conversations with:
 * - Conversation metadata and last message preview
 * - Unread counts
 * - Display names for DMs
 * - Excludes blocked users
 *
 * Sorted by most recent message first.
 * Short stale time (30s) to keep conversations fresh.
 *
 * @param userId - The member ID to fetch conversations for
 * @returns TanStack Query result with conversations data
 *
 * @example
 * const { data: conversations, isLoading, error } = useConversations(memberId);
 *
 * if (isLoading) return <div>Loading conversations...</div>;
 * if (error) return <div>Error loading conversations</div>;
 *
 * conversations?.forEach(conv => {
 *   console.log(conv.title, conv.unreadCount);
 * });
 */
export function useConversations(userId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.messages.conversations(userId || ''),
    queryFn: () => getUserConversations(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME.MESSAGES, // 30 seconds - conversations change frequently
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
}

/**
 * Hook to fetch messages in a conversation
 *
 * Returns messages with sender info, sorted chronologically.
 * Only includes non-deleted messages.
 *
 * Short stale time (30s) but will be updated via real-time subscriptions.
 *
 * @param conversationId - The conversation ID to fetch messages for
 * @returns TanStack Query result with messages data
 *
 * @example
 * const { data: messages, isLoading } = useConversationMessages(conversationId);
 *
 * messages?.forEach(msg => {
 *   console.log(msg.sender.first_name, msg.content);
 * });
 */
export function useConversationMessages(conversationId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.messages.byConversation(conversationId || ''),
    queryFn: () => getConversationMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: STALE_TIME.MESSAGES, // 30 seconds
    refetchOnWindowFocus: false, // Real-time will handle updates
  });
}

/**
 * Hook to fetch blocked users for the current user
 *
 * Returns array of blocked user IDs.
 * Used to filter conversations and participants.
 *
 * @param userId - The member ID to fetch blocked users for
 * @returns TanStack Query result with blocked user IDs
 *
 * @example
 * const { data: blockedUserIds = [] } = useBlockedUsers(memberId);
 *
 * const isBlocked = blockedUserIds.includes(otherUserId);
 */
export function useBlockedUsers(userId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.messages.all, 'blocked', userId || ''] as const,
    queryFn: () => getBlockedUsers(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME.MESSAGES, // 30 seconds
  });
}

/**
 * Hook to get full details of blocked users
 *
 * Used in settings/management UI where we need to display user names and unblock options.
 * Caches for 30 seconds.
 *
 * @param userId - The member ID to fetch blocked users for
 * @returns Query result with array of blocked user details (with names, numbers, etc.)
 *
 * @example
 * const { data: blockedUsers = [], isLoading } = useBlockedUsersDetails(memberId);
 * {blockedUsers.map(user => <BlockedUserItem key={user.blocked_id} user={user} />)}
 */
export function useBlockedUsersDetails(userId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.messages.all, 'blockedDetails', userId],
    queryFn: () => getBlockedUsersDetails(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME.MESSAGES, // 30 seconds
    refetchOnWindowFocus: true, // Refetch when returning to settings
  });
}

/**
 * Hook to fetch total unread message count
 *
 * Returns sum of unread counts across all conversations.
 * Useful for badge indicators.
 *
 * @param userId - The member ID to fetch unread count for
 * @returns TanStack Query result with total unread count
 *
 * @example
 * const { data: unreadCount = 0 } = useUnreadMessageCount(memberId);
 *
 * if (unreadCount > 0) {
 *   showBadge(unreadCount);
 * }
 */
export function useUnreadMessageCount(userId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.messages.unreadCount(userId || ''),
    queryFn: () => getUnreadMessageCount(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME.MESSAGES, // 30 seconds
    refetchOnWindowFocus: true, // Show accurate count when returning to app
  });
}

/**
 * Hook to fetch participants in a conversation
 *
 * Returns participant list with member details.
 * Only includes active (not left) participants.
 *
 * @param conversationId - The conversation ID to fetch participants for
 * @returns TanStack Query result with participants data
 *
 * @example
 * const { data: participants = [] } = useConversationParticipants(conversationId);
 *
 * participants.forEach(p => {
 *   console.log(p.members.first_name);
 * });
 */
export function useConversationParticipants(conversationId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.messages.participants(conversationId || ''),
    queryFn: () => getConversationParticipants(conversationId!),
    enabled: !!conversationId,
    staleTime: STALE_TIME.MESSAGES, // 30 seconds
  });
}
