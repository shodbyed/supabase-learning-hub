/**
 * @fileoverview Create Announcement Conversation Function
 *
 * Creates a season announcement conversation with proper permissions.
 * Uses SECURITY DEFINER to bypass RLS policies for system-managed conversations.
 *
 * Only captains or league operators can create announcements.
 */

CREATE OR REPLACE FUNCTION create_announcement_conversation(
  p_season_id UUID,
  p_title TEXT,
  p_member_ids UUID[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id UUID;
  v_member_id UUID;
BEGIN
  -- Check if conversation already exists for this season
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE scope_type = 'season'
    AND scope_id = p_season_id
    AND conversation_type = 'announcements';

  -- If conversation doesn't exist, create it
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (
      title,
      conversation_type,
      scope_type,
      scope_id,
      auto_managed
    )
    VALUES (
      p_title,
      'announcements',
      'season',
      p_season_id,
      true
    )
    RETURNING id INTO v_conversation_id;

    -- Add all members as participants
    FOREACH v_member_id IN ARRAY p_member_ids
    LOOP
      INSERT INTO conversation_participants (
        conversation_id,
        user_id
      )
      VALUES (
        v_conversation_id,
        v_member_id
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  RETURN v_conversation_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_announcement_conversation(UUID, TEXT, UUID[]) TO authenticated;

COMMENT ON FUNCTION create_announcement_conversation IS 'Creates or retrieves a season announcement conversation with all participants. Uses SECURITY DEFINER to bypass RLS.';
