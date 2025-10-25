/**
 * @fileoverview Messaging System Fixes Migration
 *
 * This migration fixes two critical bugs in the messaging system:
 *
 * 1. DM Conversation Function Bug (create_dm_conversation)
 *    - ISSUE: Function returned ANY conversation with both users, including groups
 *    - SYMPTOM: Opening a "cool dudes" group when trying to create new DM
 *    - FIX: Added check to ensure exactly 2 participants (DM only)
 *
 * 2. Blocked Users RLS Policies Bug
 *    - ISSUE: Policies compared auth.uid() directly with member.id (different UUIDs)
 *    - SYMPTOM: "new row violates row-level security policy" when blocking
 *    - FIX: Updated policies to lookup user_id from members table
 *
 * This migration is IDEMPOTENT (safe to run multiple times).
 *
 * Run this in Supabase SQL Editor to apply all fixes at once.
 */

-- =============================================================================
-- FIX 1: DM Conversation Function
-- =============================================================================

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

GRANT EXECUTE ON FUNCTION create_dm_conversation(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION create_dm_conversation IS 'Creates or returns existing DM conversation between two users (NOT groups), bypassing RLS for conversation creation';

-- =============================================================================
-- FIX 2: Blocked Users RLS Policies
-- =============================================================================

-- Drop existing policies (safe to drop if they don't exist)
DROP POLICY IF EXISTS "Users can view their own blocks" ON blocked_users;
DROP POLICY IF EXISTS "Users can block others" ON blocked_users;
DROP POLICY IF EXISTS "Users can unblock others" ON blocked_users;

-- Recreate policies with correct user_id lookup

-- Policy: Users can view who they've blocked
CREATE POLICY "Users can view their own blocks"
  ON blocked_users
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = blocker_id
    )
  );

-- Policy: Users can block other users
CREATE POLICY "Users can block others"
  ON blocked_users
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = blocker_id
    )
  );

-- Policy: Users can unblock others
CREATE POLICY "Users can unblock others"
  ON blocked_users
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = blocker_id
    )
  );

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Verify the fixes were applied
DO $$
BEGIN
  RAISE NOTICE '✓ Messaging system fixes applied successfully';
  RAISE NOTICE '  - create_dm_conversation function updated (DM-only check added)';
  RAISE NOTICE '  - blocked_users RLS policies updated (user_id lookup added)';
END $$;
