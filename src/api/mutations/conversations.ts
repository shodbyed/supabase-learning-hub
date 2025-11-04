/**
 * @fileoverview Conversation Mutation Functions
 *
 * Write operations for conversations (create DM, create group, leave).
 * These functions are used by TanStack Query useMutation hooks.
 *
 * @see api/hooks/useConversationMutations.ts - React hooks wrapper
 */

import { supabase } from '@/supabaseClient';

/**
 * Parameters for creating or opening a DM conversation
 */
export interface CreateOrOpenConversationParams {
  userId1: string;
  userId2: string;
}

/**
 * Parameters for creating a group conversation
 */
export interface CreateGroupConversationParams {
  creatorId: string;
  groupName: string;
  memberIds: string[];
}

/**
 * Parameters for leaving a conversation
 */
export interface LeaveConversationParams {
  conversationId: string;
  userId: string;
}

/**
 * Result returned from conversation creation
 */
export interface ConversationResult {
  conversationId: string;
}

/**
 * Create a new direct message conversation or open existing one
 *
 * Checks if a DM conversation already exists between two users.
 * If it exists, returns the existing conversation.
 * If not, creates a new conversation and adds both participants.
 *
 * Uses database function with SECURITY DEFINER to bypass RLS policies.
 *
 * @param params - User IDs for the DM
 * @returns Promise resolving to conversation ID
 * @throws Error if database operation fails
 *
 * @example
 * const result = await createOrOpenConversation({
 *   userId1: 'member-123',
 *   userId2: 'member-456',
 * });
 * console.log('Conversation ID:', result.conversationId);
 */
export async function createOrOpenConversation(
  params: CreateOrOpenConversationParams
): Promise<ConversationResult> {
  const { userId1, userId2 } = params;

  // Call the database function that handles conversation creation with SECURITY DEFINER
  // This bypasses RLS policies while still maintaining security
  const { data, error } = await supabase.rpc('create_dm_conversation', {
    user1_id: userId1,
    user2_id: userId2,
  });

  if (error) {
    console.error('Error creating/opening conversation:', error);
    throw new Error(`Failed to create/open conversation: ${error.message}`);
  }

  return { conversationId: data };
}

/**
 * Create a new group conversation
 *
 * Creates a group conversation with a title and adds all specified members.
 * Uses a database function with SECURITY DEFINER to bypass RLS policies.
 *
 * @param params - Creator ID, group name, and member IDs
 * @returns Promise resolving to conversation ID
 * @throws Error if database operation fails or validation fails
 *
 * @example
 * const result = await createGroupConversation({
 *   creatorId: 'member-123',
 *   groupName: 'Team Captains',
 *   memberIds: ['member-123', 'member-456', 'member-789'],
 * });
 */
export async function createGroupConversation(
  params: CreateGroupConversationParams
): Promise<ConversationResult> {
  const { creatorId, groupName, memberIds } = params;

  // Validate group name
  if (!groupName || groupName.trim().length === 0) {
    throw new Error('Group name is required');
  }

  // Validate member count (minimum 2 participants)
  if (!memberIds || memberIds.length < 2) {
    throw new Error('Group conversation requires at least 2 members');
  }

  // Call the database function that handles group creation with SECURITY DEFINER
  // This bypasses RLS policies while still maintaining security
  const { data, error } = await supabase.rpc('create_group_conversation', {
    creator_id: creatorId,
    group_name: groupName.trim(),
    member_ids: memberIds,
  });

  if (error) {
    console.error('Error creating group conversation:', error);
    throw new Error(`Failed to create group conversation: ${error.message}`);
  }

  return { conversationId: data };
}

/**
 * Leave a conversation
 *
 * Sets the left_at timestamp for the user in this conversation.
 * The conversation will no longer appear in their list, but messages remain in the database.
 * User can rejoin by starting a new conversation with the same person(s).
 *
 * @param params - Conversation ID and user ID
 * @returns Promise resolving when operation completes
 * @throws Error if database operation fails
 *
 * @example
 * await leaveConversation({
 *   conversationId: 'conv-123',
 *   userId: 'member-456',
 * });
 */
export async function leaveConversation(
  params: LeaveConversationParams
): Promise<void> {
  const { conversationId, userId } = params;

  const { error } = await supabase
    .from('conversation_participants')
    .update({ left_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error leaving conversation:', error);
    throw new Error(`Failed to leave conversation: ${error.message}`);
  }
}
