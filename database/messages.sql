/**
 * @fileoverview Messages Table Schema
 *
 * Represents individual messages within conversations. Features:
 * - Edit/delete capabilities with time limits (5 min edit, 15 min delete)
 * - Soft deletes for moderation (deleted_at timestamp)
 * - Character limit (2000 chars)
 * - Real-time updates via Supabase Realtime
 * - Message history tracking (edited_at timestamp)
 *
 * Messages automatically update conversation.last_message_at and last_message_preview.
 */

CREATE TABLE IF NOT EXISTS messages (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Message content
  content TEXT NOT NULL CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 2000),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at TIMESTAMPTZ,  -- Last time message was edited
  deleted_at TIMESTAMPTZ,  -- Soft delete timestamp

  -- Metadata
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_active ON messages(conversation_id, created_at DESC) WHERE is_deleted = FALSE;

-- Function to validate edit time limit (5 minutes)
CREATE OR REPLACE FUNCTION check_edit_time_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow edits within 5 minutes of creation
  IF OLD.created_at + INTERVAL '5 minutes' < NOW() THEN
    RAISE EXCEPTION 'Cannot edit message after 5 minutes';
  END IF;

  -- Mark as edited
  NEW.is_edited = TRUE;
  NEW.edited_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce edit time limit
CREATE TRIGGER enforce_edit_time_limit
  BEFORE UPDATE OF content ON messages
  FOR EACH ROW
  WHEN (OLD.content IS DISTINCT FROM NEW.content)
  EXECUTE FUNCTION check_edit_time_limit();

-- Function to validate delete time limit (15 minutes)
CREATE OR REPLACE FUNCTION check_delete_time_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow deletes within 15 minutes of creation
  IF OLD.created_at + INTERVAL '15 minutes' < NOW() THEN
    RAISE EXCEPTION 'Cannot delete message after 15 minutes';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce delete time limit (for soft deletes)
CREATE TRIGGER enforce_delete_time_limit
  BEFORE UPDATE OF is_deleted ON messages
  FOR EACH ROW
  WHEN (NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE)
  EXECUTE FUNCTION check_delete_time_limit();

-- Function to update conversation's last_message_at and preview
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation with new message info
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = CASE
      WHEN LENGTH(NEW.content) > 100 THEN SUBSTRING(NEW.content FROM 1 FOR 100) || '...'
      ELSE NEW.content
    END
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation when message is created
CREATE TRIGGER update_conversation_on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Function to increment unread count when new message is sent
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment unread count for all participants except the sender
  UPDATE conversation_participants
  SET unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
    AND left_at IS NULL;  -- Only for active participants

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment unread count when message is created
CREATE TRIGGER increment_unread_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_unread_count();

-- Function to update conversation preview when message is deleted
CREATE OR REPLACE FUNCTION update_conversation_on_message_delete()
RETURNS TRIGGER AS $$
DECLARE
  last_msg RECORD;
BEGIN
  -- Find the most recent non-deleted message
  SELECT created_at, content INTO last_msg
  FROM messages
  WHERE conversation_id = NEW.conversation_id
    AND is_deleted = FALSE
  ORDER BY created_at DESC
  LIMIT 1;

  -- Update conversation with most recent non-deleted message
  IF last_msg IS NOT NULL THEN
    UPDATE conversations
    SET
      last_message_at = last_msg.created_at,
      last_message_preview = CASE
        WHEN LENGTH(last_msg.content) > 100 THEN SUBSTRING(last_msg.content FROM 1 FOR 100) || '...'
        ELSE last_msg.content
      END
    WHERE id = NEW.conversation_id;
  ELSE
    -- No messages left, clear preview
    UPDATE conversations
    SET
      last_message_at = NULL,
      last_message_preview = NULL
    WHERE id = NEW.conversation_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation when message is soft-deleted
CREATE TRIGGER update_conversation_on_message_soft_delete
  AFTER UPDATE OF is_deleted ON messages
  FOR EACH ROW
  WHEN (NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE)
  EXECUTE FUNCTION update_conversation_on_message_delete();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_messages_updated_at();

-- Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages in conversations they're part of (excluding deleted)
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  USING (
    is_deleted = FALSE
    AND conversation_id IN (
      SELECT conversation_id
      FROM conversation_participants
      WHERE user_id = auth.uid()
        AND left_at IS NULL
    )
  );

-- Policy: Users can send messages to conversations they're part of
CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND conversation_id IN (
      SELECT conversation_id
      FROM conversation_participants
      WHERE user_id = auth.uid()
        AND left_at IS NULL
    )
  );

-- Policy: Users can edit their own messages (time limit enforced by trigger)
CREATE POLICY "Users can edit their own messages"
  ON messages
  FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can soft-delete their own messages (time limit enforced by trigger)
CREATE POLICY "Users can delete their own messages"
  ON messages
  FOR DELETE
  USING (auth.uid() = sender_id);

-- Comments
COMMENT ON TABLE messages IS 'Individual messages within conversations, supporting edit/delete with time limits';
COMMENT ON COLUMN messages.content IS 'Message text content (max 2000 characters)';
COMMENT ON COLUMN messages.edited_at IS 'Last time message was edited (NULL if never edited)';
COMMENT ON COLUMN messages.deleted_at IS 'Soft delete timestamp (NULL if not deleted)';
COMMENT ON COLUMN messages.is_edited IS 'True if message has been edited';
COMMENT ON COLUMN messages.is_deleted IS 'True if message has been soft-deleted';
