/**
 * @fileoverview Message View Component
 *
 * Displays message thread for selected conversation.
 * Shows message history and input box for sending new messages.
 *
 * Mobile-optimized with:
 * - Responsive padding for message area
 * - Touch-friendly message bubbles
 * - Mobile-optimized input area
 */

import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ConversationHeader } from './ConversationHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { useConversationParticipants } from '@/hooks/useConversationParticipants';
import { useConversationMessages, useSendMessage, useUpdateLastRead } from '@/api/hooks';
import { queryKeys } from '@/api/queryKeys';
import { leaveConversation, blockUser } from '@/utils/messageQueries';
import { supabase } from '@/supabaseClient';
import { LoadingState, EmptyState } from '@/components/shared';
import { MessageSquare } from 'lucide-react';

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

export function MessageView({ conversationId, currentUserId, onBack, onLeaveConversation }: MessageViewProps) {
  const queryClient = useQueryClient();
  const [conversationType, setConversationType] = useState<string | null>(null);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // TanStack Query hooks
  const { data: messagesData = [], isLoading: loading } = useConversationMessages(conversationId);
  const messages = messagesData as any as Message[];
  const sendMessageMutation = useSendMessage();
  const updateLastReadMutation = useUpdateLastRead();

  const { recipientName, recipientLastRead } = useConversationParticipants(
    conversationId,
    currentUserId
  );

  // Load conversation details (type and participants) when conversation changes
  useEffect(() => {
    async function loadConversationDetails() {
      // Fetch conversation type and auto_managed flag
      const { data: convData } = await supabase
        .from('conversations')
        .select('conversation_type, auto_managed')
        .eq('id', conversationId)
        .single();

      if (convData) {
        setConversationType(convData.conversation_type);
      }

      // For DMs: conversation_type is null and auto_managed is false
      // For auto-managed convos: conversation_type is set ('team_chat', 'captains_chat', 'announcements')
      const isDM = !convData?.auto_managed && convData?.conversation_type === null;

      if (isDM) {
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conversationId)
          .is('left_at', null);

        // DMs have exactly 2 participants
        if (participants && participants.length === 2) {
          const otherParticipant = participants?.find((p: any) => p.user_id !== currentUserId);
          if (otherParticipant) {
            setOtherUserId(otherParticipant.user_id);
          }
        }
      }
    }

    loadConversationDetails();
  }, [conversationId, currentUserId]);

  // Mark conversation as read when messages load
  useEffect(() => {
    if (messages.length > 0) {
      updateLastReadMutation.mutate({
        conversationId,
        userId: currentUserId,
      });
    }
  }, [conversationId, currentUserId, messages.length]);

  // Subscribe to new messages in this conversation - update cache
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the complete message with sender info
          const { data, error } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              created_at,
              edited_at,
              is_edited,
              sender:members!sender_id(
                id,
                first_name,
                last_name,
                system_player_number
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            // Update TanStack Query cache with new message
            queryClient.setQueryData(
              queryKeys.messages.byConversation(conversationId),
              (old: any) => [...(old || []), data]
            );

            // Update last read if we're viewing the conversation
            updateLastReadMutation.mutate({
              conversationId,
              userId: currentUserId,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, queryClient]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this conversation? You can always start a new one later.')) {
      return;
    }

    const { error } = await leaveConversation(conversationId, currentUserId);

    if (error) {
      console.error('Error leaving conversation:', error);
      alert('Failed to leave conversation. Please try again.');
      return;
    }

    // Navigate back to conversation list
    if (onLeaveConversation) {
      onLeaveConversation();
    }
  };

  const handleBlock = async () => {
    if (!otherUserId) return;

    if (!confirm(`Are you sure you want to block this user? They will no longer be able to message you, and this conversation will be removed from your list.`)) {
      return;
    }

    const { error } = await blockUser(currentUserId, otherUserId);

    if (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user. Please try again.');
      return;
    }

    // Navigate back to conversation list after blocking
    if (onLeaveConversation) {
      onLeaveConversation();
    }
  };

  // DM conversations have null conversation_type and exactly 1 other participant
  const isDM = conversationType === null && !!otherUserId;

  return (
    <div className="flex flex-col h-full">
      <ConversationHeader
        title={recipientName || 'Direct Message'}
        onBack={onBack}
        onLeave={handleLeave}
        onBlock={handleBlock}
        canLeave={true}
        canBlock={isDM}
      />

      {/* Messages - Mobile-optimized padding */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingState message="Loading messages..." />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={MessageSquare}
              title="No messages yet"
              description="Start the conversation!"
            />
          </div>
        ) : (
          messages.map((message) => {
            if (!message.sender) {
              return null;
            }

            const isCurrentUser = message.sender.id === currentUserId;
            const senderName = `${message.sender.first_name} ${message.sender.last_name}`;

            return (
              <MessageBubble
                key={message.id}
                content={message.content}
                createdAt={message.created_at}
                isEdited={message.is_edited}
                isCurrentUser={isCurrentUser}
                senderName={!isCurrentUser ? senderName : undefined}
                senderId={!isCurrentUser ? message.sender.id : undefined}
                recipientLastRead={recipientLastRead}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}
