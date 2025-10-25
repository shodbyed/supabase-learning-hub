/**
 * @fileoverview Message Query Utilities
 *
 * Queries for the messaging system including conversations, messages, and participants.
 * Handles direct messages, team chats, captain chats, and announcements.
 */

import { supabase } from '@/supabaseClient';

/**
 * Fetch all conversations for a user
 *
 * Returns conversations with:
 * - Conversation metadata (title, type, last message preview)
 * - Participant count
 * - Unread count for the current user
 * - Last message timestamp for sorting
 * - Excludes conversations with blocked users (for DM conversations)
 *
 * Conversations are sorted by most recent message first.
 *
 * @param userId - The member ID to fetch conversations for
 * @returns Promise with conversations data and any error
 */
export async function fetchUserConversations(userId: string) {
  // First, get list of blocked users
  const { data: blockedData } = await supabase
    .from('blocked_users')
    .select('blocked_id')
    .eq('blocker_id', userId);

  const blockedUserIds = (blockedData || []).map((block: any) => block.blocked_id);

  // Fetch all conversations the user is a participant in
  const { data, error } = await supabase
    .from('conversation_participants')
    .select(`
      conversation_id,
      unread_count,
      last_read_at,
      conversations!inner(
        id,
        title,
        conversation_type,
        scope_type,
        last_message_at,
        last_message_preview,
        created_at
      )
    `)
    .eq('user_id', userId)
    .is('left_at', null) // Only active conversations
    .order('conversations(last_message_at)', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Error fetching user conversations:', error);
    return { data: null, error };
  }

  // For each conversation, fetch the other participant's name for DMs and filter blocked users
  const conversationsWithNames = await Promise.all(
    (data || []).map(async (item: any) => {
      let displayName = item.conversations.title;
      let shouldHide = false;

      // If no title (DM conversation), fetch other participant's name
      if (!displayName) {
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select(`
            user_id,
            members:user_id (
              first_name,
              last_name
            )
          `)
          .eq('conversation_id', item.conversations.id)
          .is('left_at', null);

        // Find the other participant (not current user)
        const otherParticipant = participants?.find((p: any) => p.user_id !== userId);

        // Check if the other participant is blocked
        if (otherParticipant && blockedUserIds.includes(otherParticipant.user_id)) {
          shouldHide = true;
        }

        if (otherParticipant?.members && !Array.isArray(otherParticipant.members)) {
          const member = otherParticipant.members as any;
          displayName = `${member.first_name} ${member.last_name}`;
        }
      }

      // Return null for conversations that should be hidden
      if (shouldHide) {
        return null;
      }

      return {
        id: item.conversations.id,
        title: displayName || 'Direct Message',
        conversationType: item.conversations.conversation_type,
        scopeType: item.conversations.scope_type,
        lastMessageAt: item.conversations.last_message_at,
        lastMessagePreview: item.conversations.last_message_preview,
        unreadCount: item.unread_count,
        createdAt: item.conversations.created_at,
      };
    })
  );

  // Filter out null values (blocked conversations)
  const filteredConversations = conversationsWithNames.filter((conv) => conv !== null);

  return { data: filteredConversations, error: null };
}

/**
 * Fetch all messages in a conversation
 *
 * Returns messages with:
 * - Message content and metadata (created_at, edited_at)
 * - Sender information (name, member number)
 * - Edit/delete status
 *
 * Messages are sorted chronologically (oldest first) for chat display.
 * Only returns non-deleted messages.
 *
 * @param conversationId - The conversation ID to fetch messages for
 * @returns Promise with messages data and any error
 */
export async function fetchConversationMessages(conversationId: string) {
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
    .eq('conversation_id', conversationId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching conversation messages:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Send a new message in a conversation
 *
 * Creates a new message record and automatically:
 * - Updates conversation's last_message_at and preview
 * - Increments unread count for other participants
 *
 * @param conversationId - The conversation to send the message in
 * @param senderId - The member ID of the sender
 * @param content - The message text (max 2000 characters)
 * @returns Promise with the created message data and any error
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
) {
  // Validate content length
  if (!content || content.length === 0) {
    return { data: null, error: new Error('Message content cannot be empty') };
  }

  if (content.length > 2000) {
    return { data: null, error: new Error('Message cannot exceed 2000 characters') };
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Create a new direct message conversation or open existing one
 *
 * Checks if a DM conversation already exists between two users.
 * If it exists, returns the existing conversation.
 * If not, creates a new conversation and adds both participants.
 *
 * @param userId1 - First user's member ID
 * @param userId2 - Second user's member ID
 * @returns Promise with conversation ID and any error
 */
export async function createOrOpenConversation(userId1: string, userId2: string) {
  // Call the database function that handles conversation creation with SECURITY DEFINER
  // This bypasses RLS policies while still maintaining security
  const { data, error } = await supabase.rpc('create_dm_conversation', {
    user1_id: userId1,
    user2_id: userId2,
  });

  if (error) {
    console.error('Error creating/opening conversation:', error);
    return { data: null, error };
  }

  return { data: { conversationId: data }, error: null };
}

/**
 * Create a new group conversation
 *
 * Creates a group conversation with a title and adds all specified members.
 * Uses a database function with SECURITY DEFINER to bypass RLS policies.
 *
 * @param creatorId - The member ID of the user creating the group
 * @param groupName - The name/title for the group conversation
 * @param memberIds - Array of member IDs to add to the group (including creator)
 * @returns Promise with conversation ID and any error
 */
export async function createGroupConversation(
  creatorId: string,
  groupName: string,
  memberIds: string[]
) {
  // Call the database function that handles group creation with SECURITY DEFINER
  // This bypasses RLS policies while still maintaining security
  const { data, error } = await supabase.rpc('create_group_conversation', {
    creator_id: creatorId,
    group_name: groupName,
    member_ids: memberIds,
  });

  if (error) {
    console.error('Error creating group conversation:', error);
    return { data: null, error };
  }

  return { data: { conversationId: data }, error: null };
}

/**
 * Update the last read timestamp for the current user in a conversation
 * This marks all messages as read and resets the unread count
 *
 * @param conversationId - The conversation ID
 * @param userId - The current user's member ID
 * @returns Promise with any error
 */
export async function updateLastRead(conversationId: string, userId: string) {
  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating last read:', error);
    return { error };
  }

  return { error: null };
}

/**
 * Block a user from messaging
 *
 * Prevents the blocked user from:
 * - Creating new DM conversations with the blocker
 * - Sending messages in existing conversations
 * - Appearing in the blocker's user search
 *
 * @param blockerId - The member ID of the user blocking
 * @param blockedId - The member ID of the user being blocked
 * @param reason - Optional reason for blocking (e.g., 'spam', 'harassment')
 * @returns Promise with any error
 */
export async function blockUser(
  blockerId: string,
  blockedId: string,
  reason?: string
) {
  // Prevent blocking yourself
  if (blockerId === blockedId) {
    return { error: new Error('Cannot block yourself') };
  }

  const { error } = await supabase
    .from('blocked_users')
    .insert({
      blocker_id: blockerId,
      blocked_id: blockedId,
      reason: reason || null,
    });

  if (error) {
    console.error('Error blocking user:', error);
    return { error };
  }

  return { error: null };
}

/**
 * Unblock a previously blocked user
 *
 * Removes the block and allows normal messaging to resume.
 *
 * @param blockerId - The member ID of the user who blocked
 * @param blockedId - The member ID of the user who was blocked
 * @returns Promise with any error
 */
export async function unblockUser(blockerId: string, blockedId: string) {
  const { error } = await supabase
    .from('blocked_users')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);

  if (error) {
    console.error('Error unblocking user:', error);
    return { error };
  }

  return { error: null };
}

/**
 * Get all users blocked by the current user
 *
 * Returns a list of blocked users with their basic info and block metadata.
 *
 * @param userId - The member ID to fetch blocked users for
 * @returns Promise with array of blocked users and any error
 */
export async function getBlockedUsers(userId: string) {
  const { data, error } = await supabase
    .from('blocked_users')
    .select(`
      blocked_id,
      blocked_at,
      reason,
      blocked:members!blocked_id(
        id,
        first_name,
        last_name,
        system_player_number
      )
    `)
    .eq('blocker_id', userId)
    .order('blocked_at', { ascending: false });

  if (error) {
    console.error('Error fetching blocked users:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Check if a user is blocked by the current user
 *
 * @param userId - The current user's member ID
 * @param otherUserId - The other user's member ID to check
 * @returns Promise with boolean indicating if user is blocked and any error
 */
export async function isUserBlocked(userId: string, otherUserId: string) {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('blocker_id')
    .eq('blocker_id', userId)
    .eq('blocked_id', otherUserId)
    .maybeSingle();

  if (error) {
    console.error('Error checking if user is blocked:', error);
    return { data: false, error };
  }

  return { data: !!data, error: null };
}

/**
 * Leave a conversation
 *
 * Sets the left_at timestamp for the user in this conversation.
 * The conversation will no longer appear in their list, but messages remain in the database.
 * User can rejoin by starting a new conversation with the same person(s).
 *
 * @param conversationId - The conversation ID to leave
 * @param userId - The member ID of the user leaving
 * @returns Promise with any error
 */
export async function leaveConversation(conversationId: string, userId: string) {
  const { error } = await supabase
    .from('conversation_participants')
    .update({ left_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error leaving conversation:', error);
    return { error };
  }

  return { error: null };
}

/**
 * Create an announcement for a league
 *
 * Creates a league-scoped conversation if it doesn't exist and sends an announcement message.
 * All players in the league's active season will be added as participants.
 *
 * @param leagueId - The league ID to send the announcement to
 * @param senderId - The member ID of the captain/operator sending the announcement
 * @param message - The announcement text
 * @returns Promise with conversation ID and any error
 */
export async function createLeagueAnnouncement(
  leagueId: string,
  senderId: string,
  message: string
) {
  // Get the league's active season
  const { data: activeSeason, error: seasonError } = await supabase
    .from('seasons')
    .select('id, season_name')
    .eq('league_id', leagueId)
    .eq('status', 'active')
    .maybeSingle();

  if (seasonError) {
    console.error('Error fetching active season:', seasonError);
    return { data: null, error: seasonError };
  }

  if (!activeSeason) {
    return { data: null, error: new Error('League has no active season') };
  }

  const seasonId = activeSeason.id;

  // Get all players in the league's active season (via teams)
  const { data: teamPlayers } = await supabase
    .from('team_players')
    .select('member_id, teams!inner(league_id, season_id)')
    .eq('teams.league_id', leagueId)
    .eq('teams.season_id', seasonId);

  // Get unique member IDs
  const memberIds = [...new Set((teamPlayers || []).map((tp: any) => tp.member_id))];

  if (memberIds.length === 0) {
    return { data: null, error: new Error('No players found in league') };
  }

  // Use database function to create/get announcement conversation with SECURITY DEFINER
  const { data: conversationId, error: convError } = await supabase.rpc(
    'create_announcement_conversation',
    {
      p_season_id: seasonId,
      p_title: `${activeSeason.season_name} Announcements`,
      p_member_ids: memberIds,
    }
  );

  if (convError || !conversationId) {
    console.error('Error creating announcement conversation:', convError);
    return { data: null, error: convError };
  }

  // Send the announcement message
  const { error: messageError } = await sendMessage(
    conversationId,
    senderId,
    message
  );

  if (messageError) {
    return { data: null, error: messageError };
  }

  return { data: { conversationId }, error: null };
}

/**
 * Create an announcement for an organization
 *
 * Creates an organization-scoped conversation if it doesn't exist and sends an announcement message.
 * All members with active teams in any league operated by this league_operator will be added as participants.
 *
 * @param operatorId - The league_operators.id to send the announcement to
 * @param senderId - The member ID of the operator/dev sending the announcement
 * @param message - The announcement text
 * @returns Promise with conversation ID and any error
 */
export async function createOrganizationAnnouncement(
  operatorId: string,
  senderId: string,
  message: string
) {
  // Get operator/organization name
  const { data: operator, error: opError } = await supabase
    .from('league_operators')
    .select('id, organization_name')
    .eq('id', operatorId)
    .single();

  if (opError || !operator) {
    console.error('Error fetching operator:', opError);
    return { data: null, error: opError || new Error('Operator not found') };
  }

  // Get all members in any active season operated by this operator
  const { data: teamPlayers } = await supabase
    .from('team_players')
    .select('member_id, teams!inner(id, season_id, seasons!inner(id, status, league_id, leagues!inner(id, operator_id)))')
    .eq('teams.seasons.status', 'active')
    .eq('teams.seasons.leagues.operator_id', operatorId);

  // Get unique member IDs
  const memberIds = [...new Set((teamPlayers || []).map((tp: any) => tp.member_id))];

  if (memberIds.length === 0) {
    return { data: null, error: new Error('No active players found in organization') };
  }

  // Use database function to create/get announcement conversation with SECURITY DEFINER
  const { data: conversationId, error: convError } = await supabase.rpc(
    'create_organization_announcement_conversation',
    {
      p_organization_id: operatorId,
      p_title: `${operator.organization_name} Announcements`,
      p_member_ids: memberIds,
    }
  );

  if (convError || !conversationId) {
    console.error('Error creating organization announcement conversation:', convError);
    return { data: null, error: convError };
  }

  // Send the announcement message
  const { error: messageError } = await sendMessage(
    conversationId,
    senderId,
    message
  );

  if (messageError) {
    return { data: null, error: messageError };
  }

  return { data: { conversationId }, error: null };
}
