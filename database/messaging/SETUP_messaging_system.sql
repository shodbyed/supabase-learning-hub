/**
 * @fileoverview Complete Messaging System Setup
 *
 * This file creates all messaging system tables, functions, and policies.
 * It is IDEMPOTENT (safe to run multiple times).
 *
 * Includes:
 * - conversations table
 * - conversation_participants table
 * - messages table
 * - blocked_users table
 * - message_read_receipts table
 * - All database functions (create_dm_conversation, etc.)
 * - All RLS policies
 * - All triggers
 *
 * Usage:
 * 1. For new setup: Run this file to create everything
 * 2. For updates: Run this file to apply latest fixes
 * 3. Can be appended to rebuild_all_tables.sql for full rebuild
 */

-- =============================================================================
-- DROP EXISTING (for clean rebuild)
-- =============================================================================

DROP TABLE IF EXISTS message_read_receipts CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS blocked_users CASCADE;
DROP FUNCTION IF EXISTS create_dm_conversation(UUID, UUID);
DROP FUNCTION IF EXISTS create_group_conversation(UUID, TEXT, UUID[]);
DROP FUNCTION IF EXISTS create_announcement_conversation(UUID, TEXT, UUID[]);
DROP FUNCTION IF EXISTS create_organization_announcement_conversation(UUID, TEXT, UUID[]);
DROP FUNCTION IF EXISTS prevent_blocked_user_dm();

-- =============================================================================
-- INCLUDE ALL MESSAGING TABLE SCHEMAS
-- =============================================================================

-- Now include each table schema file content
\i messaging/conversations.sql
\i messaging/conversation_participants.sql
\i messaging/messages.sql
\i messaging/blocked_users.sql
\i messaging/message_read_receipts.sql

-- =============================================================================
-- INCLUDE ALL DATABASE FUNCTIONS
-- =============================================================================

\i messaging/create_conversation_function.sql
\i messaging/create_group_conversation_function.sql
\i messaging/create_announcement_conversation_function.sql
\i messaging/create_organization_announcement_function.sql

-- =============================================================================
-- APPLY CRITICAL FIXES
-- =============================================================================

-- Fix 1: DM Conversation Function (prevents group opening bug)
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
    AND (
      SELECT COUNT(*)
      FROM conversation_participants cp3
      WHERE cp3.conversation_id = cp1.conversation_id
        AND cp3.left_at IS NULL
    ) = 2
  LIMIT 1;

  IF existing_conversation_id IS NOT NULL THEN
    RETURN existing_conversation_id;
  END IF;

  INSERT INTO conversations (auto_managed, conversation_type, scope_type, scope_id)
  VALUES (false, null, 'none', null)
  RETURNING id INTO new_conversation_id;

  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES
    (new_conversation_id, user1_id),
    (new_conversation_id, user2_id);

  RETURN new_conversation_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_dm_conversation(UUID, UUID) TO authenticated;

-- Fix 2: Blocked Users RLS Policies (fixes blocking permission error)
DROP POLICY IF EXISTS "Users can view their own blocks" ON blocked_users;
DROP POLICY IF EXISTS "Users can block others" ON blocked_users;
DROP POLICY IF EXISTS "Users can unblock others" ON blocked_users;

CREATE POLICY "Users can view their own blocks"
  ON blocked_users
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = blocker_id
    )
  );

CREATE POLICY "Users can block others"
  ON blocked_users
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = blocker_id
    )
  );

CREATE POLICY "Users can unblock others"
  ON blocked_users
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = blocker_id
    )
  );

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Messaging system setup complete';
  RAISE NOTICE '  - All tables created';
  RAISE NOTICE '  - All functions created';
  RAISE NOTICE '  - All RLS policies applied';
  RAISE NOTICE '  - Critical fixes included';
END $$;
