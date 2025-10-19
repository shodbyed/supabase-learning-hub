/**
 * @fileoverview RLS Policies for Messaging System
 *
 * This file adds Row Level Security policies for the messaging tables.
 * It must be run AFTER all messaging tables are created to avoid circular dependencies.
 *
 * Run order:
 * 1. conversations.sql
 * 2. conversation_participants.sql
 * 3. messages.sql
 * 4. blocked_users.sql
 * 5. user_reports.sql
 * 6. THIS FILE (messaging_rls_policies.sql)
 */

-- =====================================================
-- CONVERSATIONS POLICIES
-- =====================================================

-- Policy: Users can see conversations they are a participant in
CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  USING (
    id IN (
      SELECT conversation_id
      FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Only authenticated users can create non-auto-managed conversations
CREATE POLICY "Authenticated users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auto_managed = FALSE
  );

-- Policy: Participants can update conversation metadata (title only)
CREATE POLICY "Participants can update conversation metadata"
  ON conversations
  FOR UPDATE
  USING (
    id IN (
      SELECT conversation_id
      FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT conversation_id
      FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Auto-managed conversations cannot be deleted
CREATE POLICY "Users cannot delete auto-managed conversations"
  ON conversations
  FOR DELETE
  USING (auto_managed = FALSE);

-- =====================================================
-- POLICIES COMPLETE
-- =====================================================
