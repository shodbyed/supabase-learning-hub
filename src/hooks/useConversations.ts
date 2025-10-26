/**
 * @fileoverview useConversations Hook
 *
 * Hook for fetching and managing user conversations with real-time updates.
 * Handles conversation list, real-time subscriptions, and automatic refresh.
 *
 * Usage:
 * ```tsx
 * const { conversations, loading, error, refresh } = useConversations(userId);
 * ```
 *
 * Features:
 * - Fetches conversations on mount
 * - Auto-subscribes to new messages for live preview updates
 * - Auto-subscribes to participant updates for unread count changes
 * - Provides manual refresh function
 *
 * @param userId - Current user's member ID
 * @returns Conversations state and actions
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchUserConversations } from '@/utils/messageQueries';
import { useRealtime } from './useRealtime';

interface Conversation {
  id: string;
  title: string | null;
  conversationType: string | null;
  scopeType: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  createdAt: string;
}

interface UseConversationsReturn {
  /** List of user's conversations */
  conversations: Conversation[];
  /** Loading state during initial fetch */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manual refresh function */
  refresh: () => Promise<void>;
}

export function useConversations(userId: string): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations function (reusable for initial load and refreshes)
  const loadConversations = useCallback(async () => {
    const { data, error: fetchError } = await fetchUserConversations(userId);

    if (fetchError) {
      console.error('Error loading conversations:', fetchError);
      setError('Failed to load conversations');
      setLoading(false);
      return;
    }

    setConversations(data || []);
    setError(null);
    setLoading(false);
  }, [userId]);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Subscribe to new messages in any conversation (for preview updates)
  useRealtime({
    channelName: 'all-messages',
    table: 'messages',
    event: 'INSERT',
    onEvent: async () => {
      // Reload conversations to get updated preview and timestamp
      const { data } = await fetchUserConversations(userId);
      if (data) {
        setConversations(data);
      }
    },
  });

  // Subscribe to conversation participant updates (for unread counts)
  useRealtime({
    channelName: 'all-participants',
    table: 'conversation_participants',
    event: 'UPDATE',
    filter: `user_id=eq.${userId}`,
    onEvent: async () => {
      // Reload conversations to get updated unread counts
      const { data } = await fetchUserConversations(userId);
      if (data) {
        setConversations(data);
      }
    },
  });

  // Manual refresh function
  const refresh = useCallback(async () => {
    await loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loading,
    error,
    refresh,
  };
}
