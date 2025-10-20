/**
 * @fileoverview useConversationParticipants Hook
 *
 * Single responsibility: Fetch conversation participant data.
 * Reusable hook for getting recipient name and last_read_at timestamp.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

export function useConversationParticipants(conversationId: string, currentUserId: string) {
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientLastRead, setRecipientLastRead] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecipient() {
      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          user_id,
          last_read_at,
          members:user_id (
            id,
            first_name,
            last_name,
            system_player_number
          )
        `)
        .eq('conversation_id', conversationId)
        .is('left_at', null);

      if (error) {
        console.error('Error loading participants:', error);
        setLoading(false);
        return;
      }

      const otherParticipant = data?.find((p: any) => p.user_id !== currentUserId);
      if (otherParticipant?.members && !Array.isArray(otherParticipant.members)) {
        const member = otherParticipant.members as any;
        setRecipientName(`${member.first_name} ${member.last_name}`);
        setRecipientLastRead(otherParticipant.last_read_at);
      }

      setLoading(false);
    }

    loadRecipient();

    // Subscribe to read receipt updates
    const channel = supabase
      .channel(`participants:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_participants',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Update last_read_at if it's the other participant
          if (payload.new.user_id !== currentUserId) {
            setRecipientLastRead((payload.new as any).last_read_at);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  return { recipientName, recipientLastRead, loading };
}
