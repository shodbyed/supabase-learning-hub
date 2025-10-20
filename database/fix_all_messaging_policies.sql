
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

-- =====================================================
-- DROP ALL EXISTING POLICIES
-- =====================================================

-- Conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Participants can update conversation metadata" ON conversations;
DROP POLICY IF EXISTS "Users cannot delete auto-managed conversations" ON conversations;

-- Conversation Participants
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own settings" ON conversation_participants;
DROP POLICY IF EXISTS "Users can leave conversations" ON conversation_participants;

-- Messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can edit their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- =====================================================
-- RECREATE CONVERSATIONS POLICIES (CORRECTED)
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
-- RECREATE CONVERSATION_PARTICIPANTS POLICIES (CORRECTED)
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
-- RECREATE MESSAGES POLICIES (CORRECTED)
-- =====================================================

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
