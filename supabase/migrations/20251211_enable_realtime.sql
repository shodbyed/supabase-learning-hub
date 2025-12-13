-- Migration: Enable real-time for tables that use postgres_changes subscriptions
-- Purpose: Allow real-time subscriptions to work for match scoring and messaging
--
-- Tables requiring real-time:
-- - matches: Match status changes, verification, results
-- - match_lineups: Lineup selections, lock status, swap requests
-- - match_games: Game scoring, confirmations, vacate requests
-- - messages: Chat messages
-- - conversation_participants: Conversation membership changes
--
-- This migration is idempotent - safe to run even if tables are already in publication

-- Enable real-time for match-related tables (only if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'matches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE matches;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'match_lineups'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE match_lineups;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'match_games'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE match_games;
  END IF;
END $$;

-- Enable real-time for messaging tables (only if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
  END IF;
END $$;

-- Set REPLICA IDENTITY to FULL for tables that need UPDATE event details
-- This ensures UPDATE events include all column values (not just changed ones)
-- These are safe to run even if already set
ALTER TABLE matches REPLICA IDENTITY FULL;
ALTER TABLE match_lineups REPLICA IDENTITY FULL;
ALTER TABLE match_games REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversation_participants REPLICA IDENTITY FULL;
