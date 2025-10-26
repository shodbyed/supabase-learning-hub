/**
 * @fileoverview useMessages Hook
 *
 * Hook for fetching and managing messages in a conversation with real-time updates.
 * Handles message list, sending messages, and real-time subscriptions.
 *
 * Usage:
 * ```tsx
 * const { messages, loading, error, sendMessage } = useMessages(conversationId, currentUserId);
 * ```
 *
 * Features:
 * - Fetches messages on mount
 * - Auto-subscribes to new messages for real-time updates
 * - Automatically updates last_read timestamp
 * - Provides sendMessage function with optimistic updates
 *
 * @param conversationId - ID of the conversation
 * @param currentUserId - Current user's member ID
 * @returns Messages state and actions
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchConversationMessages, sendMessage as sendMessageAPI, updateLastRead } from '@/utils/messageQueries';
import { useRealtime } from './useRealtime';
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

interface UseMessagesReturn {
  /** List of messages in the conversation */
  messages: Message[];
  /** Loading state during initial fetch */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Function to send a new message */
  sendMessage: (content: string) => Promise<void>;
}

export function useMessages(conversationId: string, currentUserId: string): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load messages on mount or when conversation changes
  useEffect(() => {
    async function loadMessages() {
      setLoading(true);
      const { data, error: fetchError } = await fetchConversationMessages(conversationId);

      if (fetchError) {
        console.error('Error loading messages:', fetchError);
        setError('Failed to load messages');
        setLoading(false);
        return;
      }

      setMessages((data as any) || []);
      setError(null);
      setLoading(false);

      // Mark conversation as read
      await updateLastRead(conversationId, currentUserId);
    }

    loadMessages();
  }, [conversationId, currentUserId]);

  // Subscribe to new messages in this conversation
  useRealtime({
    channelName: `messages:${conversationId}`,
    table: 'messages',
    event: 'INSERT',
    filter: `conversation_id=eq.${conversationId}`,
    onEvent: async (payload) => {
      // Fetch the complete message with sender info
      const { data, error: fetchError } = await supabase
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

      if (!fetchError && data) {
        setMessages((prev) => [...prev, data as any]);
        // Update last read if we're viewing the conversation
        await updateLastRead(conversationId, currentUserId);
      }
    },
  });

  // Send message function
  const sendMessage = useCallback(
    async (content: string) => {
      const { error: sendError } = await sendMessageAPI(conversationId, currentUserId, content);

      if (sendError) {
        console.error('Error sending message:', sendError);
        throw new Error('Failed to send message');
      }

      // Don't manually add - let realtime subscription handle it
    },
    [conversationId, currentUserId]
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
}
