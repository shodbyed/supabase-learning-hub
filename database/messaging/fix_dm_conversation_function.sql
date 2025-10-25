/**
 * @fileoverview Fix for create_dm_conversation function
 *
 * BUG FIX: The original function would return ANY conversation with both users,
 * including group chats. This caused "cool dudes" group to open when trying to
 * create a new DM with someone who is also in that group.
 *
 * FIX: Added check to ensure exactly 2 participants before returning existing conversation.
 * This ensures only actual DM conversations are returned, not group conversations.
 *
 * Run this SQL in your Supabase SQL editor to fix the bug.
 */

-- Drop and recreate the function with the fix
DROP FUNCTION IF EXISTS create_dm_conversation(UUID, UUID);

CREATE OR REPLACE FUNCTION create_dm_conversation(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_conversation_id UUID;
  existing_conversation_id UUID;
BEGIN
  -- First check if conversation already exists between these two users
  -- Must be exactly 2 participants (DM), not a group conversation
  SELECT cp1.conversation_id INTO existing_conversation_id
  FROM conversation_participants cp1
  INNER JOIN conversation_participants cp2
    ON cp1.conversation_id = cp2.conversation_id
  INNER JOIN conversations c
    ON c.id = cp1.conversation_id
  WHERE cp1.user_id = user1_id
    AND cp2.user_id = user2_id
    AND cp1.user_id != cp2.user_id
    AND cp1.left_at IS NULL
    AND cp2.left_at IS NULL
    AND c.auto_managed = FALSE
    -- Ensure exactly 2 participants (DM only, not groups)
    AND (
      SELECT COUNT(*)
      FROM conversation_participants cp3
      WHERE cp3.conversation_id = cp1.conversation_id
        AND cp3.left_at IS NULL
    ) = 2
  LIMIT 1;

  -- If conversation exists, return it
  IF existing_conversation_id IS NOT NULL THEN
    RETURN existing_conversation_id;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (auto_managed, conversation_type, scope_type, scope_id)
  VALUES (false, null, 'none', null)
  RETURNING id INTO new_conversation_id;

  -- Add both participants
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES
    (new_conversation_id, user1_id),
    (new_conversation_id, user2_id);

  RETURN new_conversation_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_dm_conversation(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION create_dm_conversation IS 'Creates or returns existing DM conversation between two users (NOT groups), bypassing RLS for conversation creation';
