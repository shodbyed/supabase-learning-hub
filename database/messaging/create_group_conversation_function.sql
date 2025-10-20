/**
 * @fileoverview Create Group Conversation Function
 *
 * SECURITY DEFINER function to create a group conversation and add participants.
 * This bypasses RLS policies to allow conversation creation even when the user
 * is not yet a participant (chicken-egg problem).
 *
 * Similar to create_dm_conversation but for groups with multiple members.
 */

CREATE OR REPLACE FUNCTION create_group_conversation(
  creator_id UUID,
  group_name TEXT,
  member_ids UUID[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_conversation_id UUID;
  member_id UUID;
BEGIN
  -- Validate inputs
  IF group_name IS NULL OR trim(group_name) = '' THEN
    RAISE EXCEPTION 'Group name is required';
  END IF;

  IF array_length(member_ids, 1) IS NULL OR array_length(member_ids, 1) < 2 THEN
    RAISE EXCEPTION 'Group must have at least 2 members';
  END IF;

  IF array_length(member_ids, 1) > 25 THEN
    RAISE EXCEPTION 'Group cannot have more than 25 members';
  END IF;

  -- Create the conversation
  -- For manual groups: conversation_type = NULL, scope_type = 'none', auto_managed = FALSE
  INSERT INTO conversations (title, conversation_type, scope_type, auto_managed)
  VALUES (trim(group_name), NULL, 'none', FALSE)
  RETURNING id INTO new_conversation_id;

  -- Add all members as participants
  FOREACH member_id IN ARRAY member_ids
  LOOP
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (new_conversation_id, member_id)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
  END LOOP;

  RETURN new_conversation_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_group_conversation(UUID, TEXT, UUID[]) TO authenticated;

-- Comment
COMMENT ON FUNCTION create_group_conversation IS 'Create a new group conversation with multiple participants. Bypasses RLS using SECURITY DEFINER.';
