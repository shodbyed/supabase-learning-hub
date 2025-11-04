/**
 * @fileoverview useConversationDetails Hook
 *
 * Custom hook that combines conversation type and other participant queries.
 * Determines if conversation is a DM and gets the other user's ID if so.
 */

import { useMemo } from 'react';
import { useConversationType, useOtherParticipantId } from '@/api/hooks';

export function useConversationDetails(conversationId: string, currentUserId: string) {
  // Fetch conversation type
  const { data: typeData } = useConversationType(conversationId);

  // Determine if this is a DM (not auto-managed and no conversation type)
  const isDM = useMemo(() => {
    if (!typeData) return false;
    return !typeData.autoManaged && typeData.conversationType === null;
  }, [typeData]);

  // Fetch other participant ID (only for DMs)
  // Note: Hook has built-in enabled check, but we pass undefined to skip the query when not a DM
  const { data: otherUserId } = useOtherParticipantId(
    isDM ? conversationId : undefined,
    isDM ? currentUserId : undefined
  );

  return {
    conversationType: typeData?.conversationType || null,
    isDM,
    otherUserId: isDM ? otherUserId : null,
  };
}
