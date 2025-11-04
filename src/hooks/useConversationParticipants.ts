/**
 * @fileoverview useConversationParticipants Hook
 *
 * DEPRECATED: Use TanStack Query versions instead:
 * - useConversationTitle (from @/api/hooks)
 * - useConversationParticipantsQuery (from @/api/hooks)
 *
 * This hook is a wrapper around the TanStack Query hooks for backward compatibility.
 * It will be removed once all usages are migrated.
 */

import { useMemo } from 'react';
import { useConversationTitle, useConversationParticipantsQuery } from '@/api/hooks';

export function useConversationParticipants(conversationId: string, currentUserId: string) {
  // Fetch conversation title (for group chats/announcements)
  const { data: titleData, isLoading: titleLoading } = useConversationTitle(conversationId);

  // Fetch participants with member details
  const { data: participants = [], isLoading: participantsLoading } =
    useConversationParticipantsQuery(conversationId);

  // Calculate recipientName based on title or other participant
  const recipientName = useMemo(() => {
    // If conversation has a title, use it
    if (titleData?.title) {
      return titleData.title;
    }

    // Otherwise, find the other participant's name
    const otherParticipant = participants.find(p => p.userId !== currentUserId);
    if (otherParticipant) {
      return `${otherParticipant.firstName} ${otherParticipant.lastName}`;
    }

    return 'Conversation';
  }, [titleData, participants, currentUserId]);

  // Get recipient's last_read_at
  const recipientLastRead = useMemo(() => {
    const otherParticipant = participants.find(p => p.userId !== currentUserId);
    return otherParticipant?.lastReadAt || null;
  }, [participants, currentUserId]);

  const loading = titleLoading || participantsLoading;

  return { recipientName, recipientLastRead, loading };
}