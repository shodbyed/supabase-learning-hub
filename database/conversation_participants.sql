/**
 * @fileoverview Conversation Participants Table Schema
 *
 * Join table connecting users to conversations. Tracks:
 * - Which users are in which conversations
 * - User-specific settings (muted, notifications)
 * - Last read timestamp for unread message tracking
 * - Role in conversation (admin, participant)
 *
 * For auto-managed conversations, participants are added/removed automatically
 * based on team rosters, captain status, and season participation.
 */

CREATE TABLE IF NOT EXISTS conversation_participants (
  -- Composite primary key
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id),

  -- Role in conversation
  role VARCHAR(50) NOT NULL DEFAULT 'participant' CHECK (role IN ('admin', 'participant')),

  -- User-specific settings
  is_muted BOOLEAN NOT NULL DEFAULT FALSE,  -- User has muted this conversation
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,  -- Push notifications for this convo

  -- Read tracking
  last_read_at TIMESTAMPTZ,  -- Last time user read messages in this conversation
  unread_count INTEGER NOT NULL DEFAULT 0,  -- Number of unread messages for this user

  -- Timestamps
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,  -- NULL if user is still in conversation

  -- Constraints
  CONSTRAINT valid_participant CHECK (
    (left_at IS NULL) OR (left_at >= joined_at)
  )
);

-- Indexes for performance
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_active ON conversation_participants(user_id, conversation_id) WHERE left_at IS NULL;
CREATE INDEX idx_conversation_participants_unread ON conversation_participants(user_id, unread_count) WHERE unread_count > 0;

-- Function to reset unread count when user reads messages
CREATE OR REPLACE FUNCTION reset_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  -- When last_read_at is updated, reset unread count to 0
  IF NEW.last_read_at IS DISTINCT FROM OLD.last_read_at THEN
    NEW.unread_count = 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to reset unread count when last_read_at is updated
CREATE TRIGGER reset_unread_on_read
  BEFORE UPDATE ON conversation_participants
  FOR EACH ROW
  EXECUTE FUNCTION reset_unread_count();

-- Row Level Security (RLS) - Enable but policies added later in messaging_rls_policies.sql
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE conversation_participants IS 'Join table connecting users to conversations with per-user settings';
COMMENT ON COLUMN conversation_participants.role IS 'User role in conversation: admin (can add/remove users) or participant';
COMMENT ON COLUMN conversation_participants.is_muted IS 'User has muted notifications for this conversation';
COMMENT ON COLUMN conversation_participants.notifications_enabled IS 'User wants push notifications for this conversation';
COMMENT ON COLUMN conversation_participants.last_read_at IS 'Last time user viewed messages in this conversation (for unread tracking)';
COMMENT ON COLUMN conversation_participants.unread_count IS 'Number of unread messages for this user in this conversation';
COMMENT ON COLUMN conversation_participants.left_at IS 'When user left conversation (NULL if still participating)';
