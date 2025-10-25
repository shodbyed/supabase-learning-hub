/**
 * @fileoverview Blocked Users Table Schema
 *
 * Allows users to block other users from sending them direct messages.
 * Features:
 * - One-way blocking (A blocks B, but B can still see A's messages in group chats)
 * - Prevents new DM conversations from being created
 * - Does not affect existing group chats or team conversations
 * - Optional reason field for internal tracking
 *
 * Note: Blocking only affects DMs. Users can still interact in team chats
 * and other group conversations where both are participants.
 */

CREATE TABLE IF NOT EXISTS blocked_users (
  -- Composite primary key
  blocker_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (blocker_id, blocked_id),

  -- Metadata
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT,  -- Optional reason (for user's own reference)

  -- Constraints
  CONSTRAINT cannot_block_self CHECK (blocker_id != blocked_id)
);

-- Indexes for performance
CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON blocked_users(blocked_id);

-- Function to prevent DMs with blocked users
CREATE OR REPLACE FUNCTION prevent_blocked_user_dm()
RETURNS TRIGGER AS $$
DECLARE
  participant_ids UUID[];
  is_dm BOOLEAN;
BEGIN
  -- Check if this is a DM conversation (2 participants, not auto-managed)
  SELECT
    (SELECT auto_managed FROM conversations WHERE id = NEW.conversation_id) = FALSE
    AND (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = NEW.conversation_id) = 1
  INTO is_dm;

  -- If this is a DM, check for blocks
  IF is_dm THEN
    -- Get the other participant's ID
    SELECT ARRAY_AGG(user_id)
    INTO participant_ids
    FROM conversation_participants
    WHERE conversation_id = NEW.conversation_id;

    -- Check if either user has blocked the other
    IF EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = NEW.user_id AND blocked_id = ANY(participant_ids))
         OR (blocker_id = ANY(participant_ids) AND blocked_id = NEW.user_id)
    ) THEN
      RAISE EXCEPTION 'Cannot join conversation with blocked user';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent joining DMs with blocked users
CREATE TRIGGER prevent_dm_with_blocked_user
  BEFORE INSERT ON conversation_participants
  FOR EACH ROW
  EXECUTE FUNCTION prevent_blocked_user_dm();

-- Row Level Security (RLS)
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

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

-- Comments
COMMENT ON TABLE blocked_users IS 'Tracks user blocking relationships for direct messages';
COMMENT ON COLUMN blocked_users.blocker_id IS 'User who initiated the block';
COMMENT ON COLUMN blocked_users.blocked_id IS 'User who was blocked';
COMMENT ON COLUMN blocked_users.reason IS 'Optional reason for block (user-facing, for their own reference)';
COMMENT ON COLUMN blocked_users.blocked_at IS 'When the block was created';
