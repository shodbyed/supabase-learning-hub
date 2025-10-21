/**
 * @fileoverview Message View Component
 *
 * Displays message thread for selected conversation.
 * Shows message history and input box for sending new messages.
 */

import { useState, useRef, useEffect } from 'react';
import { ConversationHeader } from './ConversationHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { useConversationParticipants } from '@/hooks/useConversationParticipants';
import { fetchConversationMessages, sendMessage, updateLastRead } from '@/utils/messageQueries';
import { supabase } from '@/supabaseClient';

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
}

export function MessageView({ conversationId, currentUserId }: MessageViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { recipientName, recipientLastRead } = useConversationParticipants(
    conversationId,
    currentUserId
  );

  // Load messages when conversation changes
  useEffect(() => {
    async function loadMessages() {
      setLoading(true);
      const { data, error } = await fetchConversationMessages(conversationId);

      if (error) {
        console.error('Error loading messages:', error);
        setLoading(false);
        return;
      }

      setMessages((data as any) || []);
      setLoading(false);

      await updateLastRead(conversationId, currentUserId);
    }

    loadMessages();
  }, [conversationId, currentUserId]);

  // Subscribe to new messages in this conversation
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
            setMessages((prev) => [...prev, data as any]);
            // Update last read if we're viewing the conversation
            await updateLastRead(conversationId, currentUserId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const { error } = await sendMessage(conversationId, currentUserId, content);

    if (error) {
      console.error('Error sending message:', error);
      return;
    }

    // Don't manually fetch - let realtime subscription handle it
    // The message will appear via the realtime subscription
  };

  return (
    <div className="flex flex-col h-full">
      <ConversationHeader title={recipientName || 'Direct Message'} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 border-l-[16px] border-r-[16px] border-green-300">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
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
