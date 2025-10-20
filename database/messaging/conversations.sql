/**
 * @fileoverview Conversations Table Schema
 *
 * Represents a conversation between 2+ users. Can be:
 * - Direct message (1-on-1)
 * - Team chat (auto-created for each team)
 * - Captain's chat (auto-created for each season)
 * - Season announcements (auto-created for each season, read-only for players)
 *
 * Auto-managed conversations are created by triggers when teams/seasons are created.
 */

CREATE TABLE IF NOT EXISTS conversations (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Metadata
  title VARCHAR(200),  -- Optional title for group chats
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,  -- Timestamp of most recent message (for sorting)
  last_message_preview TEXT,  -- Preview of last message (for conversation list)

  -- Auto-management fields
  auto_managed BOOLEAN NOT NULL DEFAULT FALSE,  -- True for system-created conversations
  conversation_type VARCHAR(50) CHECK (conversation_type IN ('direct', 'team_chat', 'captains_chat', 'announcements')),
  scope_type VARCHAR(50) CHECK (scope_type IN ('team', 'season', 'organization', 'none')),
  scope_id UUID,  -- ID of the team, season, or organization this conversation belongs to

  -- Constraints
  CONSTRAINT valid_auto_managed CHECK (
    (auto_managed = FALSE AND conversation_type IS NULL AND scope_type = 'none') OR
    (auto_managed = TRUE AND conversation_type IS NOT NULL AND scope_type IS NOT NULL AND scope_id IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_auto_managed ON conversations(auto_managed);
CREATE INDEX idx_conversations_scope ON conversations(scope_type, scope_id) WHERE auto_managed = TRUE;
CREATE INDEX idx_conversations_type ON conversations(conversation_type) WHERE conversation_type IS NOT NULL;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversations_updated_at();

-- Row Level Security (RLS) - Enable but policies added later after conversation_participants exists
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE conversations IS 'Represents conversations between 2+ users including DMs, team chats, and announcements';
COMMENT ON COLUMN conversations.auto_managed IS 'True for system-created conversations (team chat, captains chat, announcements)';
COMMENT ON COLUMN conversations.conversation_type IS 'Type of conversation: direct, team_chat, captains_chat, or announcements';
COMMENT ON COLUMN conversations.scope_type IS 'What entity this conversation is scoped to: team, season, organization, or none';
COMMENT ON COLUMN conversations.scope_id IS 'Foreign key to the team, season, or organization (stored as UUID)';
COMMENT ON COLUMN conversations.last_message_at IS 'Timestamp of most recent message, used for sorting conversation list';
COMMENT ON COLUMN conversations.last_message_preview IS 'Preview text of last message, shown in conversation list';
