/**
 * @fileoverview Message View Component (REFACTORED)
 *
 * Displays message thread for selected conversation.
 *
 * REFACTORING IMPROVEMENTS:
 * - Extracted useConversationDetails hook (replaces direct Supabase calls)
 * - Extracted MessageList component (message rendering + auto-scroll)
 * - Uses TanStack Query for ALL data fetching (no direct Supabase calls)
 * - Main component now only orchestrates sub-components (~100 lines vs 265)
 * - Each sub-component has single responsibility
 * - Easier to test and maintain
 */

import { useState, useEffect } from 'react';
import { ConversationHeader } from './ConversationHeader';
import { MessageInput } from './MessageInput';
import { useConversationParticipants } from '@/hooks/useConversationParticipants';
import {
  useConversationMessages,
  useSendMessage,
  useUpdateLastRead,
  useConversationMessagesRealtime,
  useLeaveConversation,
  useBlockUser,
} from '@/api/hooks';
import { ConfirmDialog } from '@/components/shared';
import { MessageList } from './messageview/MessageList';
import { useConversationDetails } from './messageview/useConversationDetails';

interface Message {
  id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  is_edited: boolean;
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    system_player_number: number;
  };
}

interface MessageViewProps {
  conversationId: string;
  currentUserId: string;
  onBack?: () => void;
  onLeaveConversation?: () => void;
}

export function MessageView({
  conversationId,
  currentUserId,
  onBack,
  onLeaveConversation,
}: MessageViewProps) {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  // TanStack Query hooks for data fetching
  const { data: messagesData = [], isLoading: loading } = useConversationMessages(conversationId);
  const messages = messagesData as any as Message[];
  const sendMessageMutation = useSendMessage();
  const updateLastReadMutation = useUpdateLastRead();
  const leaveConversationMutation = useLeaveConversation();
  const blockUserMutation = useBlockUser();

  // Get conversation details (type, isDM, otherUserId) via TanStack Query
  const { isDM, otherUserId } = useConversationDetails(conversationId, currentUserId);

  // Real-time subscriptions (auto-manages channels and cleanup)
  useConversationMessagesRealtime(conversationId, currentUserId, updateLastReadMutation);

  const { recipientName, recipientLastRead } = useConversationParticipants(
    conversationId,
    currentUserId
  );

  // Mark conversation as read when messages load
  useEffect(() => {
    if (messages.length > 0) {
      updateLastReadMutation.mutate({
        conversationId,
        userId: currentUserId,
      });
    }
  }, [conversationId, currentUserId, messages.length]);

  const handleSendMessage = async (content: string) => {
    sendMessageMutation.mutate(
      {
        conversationId,
        senderId: currentUserId,
        content,
      },
      {
        onError: (error) => {
          console.error('Error sending message:', error);
          alert('Failed to send message. Please try again.');
        },
      }
    );

    // Don't manually fetch - let realtime subscription handle it
    // The message will appear via the realtime subscription
  };

  const handleLeaveClick = () => {
    setShowLeaveConfirm(true);
  };

  const handleLeaveConfirm = async () => {
    try {
      await leaveConversationMutation.mutateAsync({
        conversationId,
        userId: currentUserId,
      });

      // Navigate back to conversation list
      if (onLeaveConversation) {
        onLeaveConversation();
      }
    } catch (error) {
      console.error('Error leaving conversation:', error);
      alert('Failed to leave conversation. Please try again.');
    }
  };

  const handleBlockClick = () => {
    if (!otherUserId) return;
    setShowBlockConfirm(true);
  };

  const handleBlockConfirm = async () => {
    if (!otherUserId) return;

    try {
      await blockUserMutation.mutateAsync({
        blockerId: currentUserId,
        blockedUserId: otherUserId,
      });

      // Navigate back to conversation list after blocking
      if (onLeaveConversation) {
        onLeaveConversation();
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ConversationHeader
        title={recipientName || 'Direct Message'}
        onBack={onBack}
        onLeave={handleLeaveClick}
        onBlock={handleBlockClick}
        canLeave={true}
        canBlock={isDM}
      />

      {/* Leave Conversation Confirmation */}
      <ConfirmDialog
        open={showLeaveConfirm}
        onOpenChange={setShowLeaveConfirm}
        title="Leave Conversation?"
        description="Are you sure you want to leave this conversation? You can always start a new one later."
        confirmLabel="Leave"
        cancelLabel="Cancel"
        onConfirm={handleLeaveConfirm}
        variant="default"
      />

      {/* Block User Confirmation */}
      <ConfirmDialog
        open={showBlockConfirm}
        onOpenChange={setShowBlockConfirm}
        title="Block User?"
        description="They will no longer be able to message you, and this conversation will be removed from your list."
        confirmLabel="Block"
        cancelLabel="Cancel"
        onConfirm={handleBlockConfirm}
        variant="destructive"
      />

      {/* Messages - Mobile-optimized padding */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 bg-gray-50">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          recipientLastRead={recipientLastRead}
          loading={loading}
        />
      </div>

      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}
