/**
 * @fileoverview Hook for tracking unread message count
 *
 * Fetches the total unread message count for the current user
 * and subscribes to real-time updates.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { useCurrentMember } from './useCurrentMember';

export function useUnreadMessageCount() {
  const { memberId } = useCurrentMember();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!memberId) {
      setUnreadCount(0);
      return;
    }

    // Fetch initial unread count
    async function fetchUnreadCount() {
      const { data, error } = await supabase
        .from('conversation_participants')
        .select('unread_count')
        .eq('user_id', memberId)
        .is('left_at', null);

      if (error) {
        console.error('Error fetching unread count:', error);
        return;
      }

      // Sum all unread counts across conversations
      const total = (data || []).reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
      setUnreadCount(total);
    }

    fetchUnreadCount();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('unread-count-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${memberId}`,
        },
        () => {
          // Re-fetch count when any conversation participant record changes
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [memberId]);

  return unreadCount;
}
