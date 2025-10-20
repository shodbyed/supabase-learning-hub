/**
 * @fileoverview Enable Realtime for Messaging Tables
 *
 * Adds messaging tables to Supabase's realtime publication so that clients
 * can subscribe to INSERT/UPDATE/DELETE events on these tables.
 *
 * This enables:
 * - Real-time message delivery (messages table)
 * - Real-time read receipts (conversation_participants table)
 * - Real-time conversation updates (conversations table)
 *
 * Run this SQL in your local Supabase instance to enable realtime functionality.
 */

-- Add tables to the realtime publication
-- This allows clients to subscribe to changes on these tables

-- Enable realtime for messages table (new messages, edits, deletes)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for conversation_participants (read receipts, unread counts)
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;

-- Enable realtime for conversations (last message preview updates)
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Verify the tables are added to the publication
-- Run this query to check:
-- SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
