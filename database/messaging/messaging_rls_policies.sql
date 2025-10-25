/**
 * @fileoverview RLS Policies for Messaging System
 *
 * This file adds Row Level Security policies for the messaging tables.
 * It must be run AFTER all messaging tables are created to avoid circular dependencies.
 *
 * IMPORTANT: conversation_participants.user_id is a MEMBER ID (members.id), NOT an auth user ID.
 * We use helper functions to translate between auth.uid() and member IDs.
 *
 * Run order:
 * 1. conversations.sql
 * 2. conversation_participants.sql
 * 3. messages.sql
 * 4. blocked_users.sql
 * 5. user_reports.sql
 * 6. THIS FILE (messaging_rls_policies.sql)
 * 7. create_conversation_function.sql
 */

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Helper function to get current authenticated user's member_id
CREATE OR REPLACE FUNCTION get_current_member_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1);
END;
$$;

GRANT EXECUTE ON FUNCTION get_current_member_id() TO authenticated;

-- Helper function to check if user is in conversation (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION is_conversation_participant(conv_id UUID, uid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id
      AND user_id = uid
      AND left_at IS NULL
  );
END;
$$;

GRANT EXECUTE ON FUNCTION is_conversation_participant(UUID, UUID) TO authenticated;

-- =====================================================
-- CONVERSATIONS POLICIES
-- =====================================================

CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
        AND user_id = get_current_member_id()
        AND left_at IS NULL
    )
  );

CREATE POLICY "Authenticated users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Participants can update conversation metadata"
  ON conversations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
        AND user_id = get_current_member_id()
        AND left_at IS NULL
    )
  );

CREATE POLICY "Users cannot delete auto-managed conversations"
  ON conversations
  FOR DELETE
  USING (auto_managed = FALSE);

-- =====================================================
-- CONVERSATION_PARTICIPANTS POLICIES
-- =====================================================

CREATE POLICY "Users can view participants in their conversations"
  ON conversation_participants
  FOR SELECT
  USING (
    user_id = get_current_member_id()
    OR
    is_conversation_participant(conversation_id, get_current_member_id())
  );

CREATE POLICY "Users can join conversations"
  ON conversation_participants
  FOR INSERT
  WITH CHECK (
    user_id = get_current_member_id()
  );

CREATE POLICY "Users can update their own settings"
  ON conversation_participants
  FOR UPDATE
  USING (user_id = get_current_member_id())
  WITH CHECK (user_id = get_current_member_id());

CREATE POLICY "Users can leave conversations"
  ON conversation_participants
  FOR DELETE
  USING (
    user_id = get_current_member_id()
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
        AND auto_managed = FALSE
    )
  );

-- =====================================================
-- MESSAGES POLICIES
-- =====================================================

-- NOTE: messages.sender_id is a foreign key to members.id, not auth.users.id

CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  USING (
    is_deleted = FALSE
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
        AND user_id = get_current_member_id()
        AND left_at IS NULL
    )
  );

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = get_current_member_id()
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
        AND user_id = sender_id
        AND left_at IS NULL
    )
  );

CREATE POLICY "Users can edit their own messages"
  ON messages
  FOR UPDATE
  USING (sender_id = get_current_member_id())
  WITH CHECK (sender_id = get_current_member_id());

CREATE POLICY "Users can delete their own messages"
  ON messages
  FOR DELETE
  USING (sender_id = get_current_member_id());

-- =====================================================
-- POLICIES COMPLETE
-- =====================================================
