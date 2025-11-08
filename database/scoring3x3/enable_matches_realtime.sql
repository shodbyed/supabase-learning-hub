-- Enable Realtime Replication for matches Table
-- This allows the matches table to broadcast changes via Supabase Realtime
-- Required for match verification status updates to work across multiple users

-- Add matches table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;

-- Verify the change was successful
-- Run this separately to check that matches now appears in the list
-- SELECT schemaname, tablename
-- FROM pg_publication_tables
-- WHERE pubname = 'supabase_realtime'
-- ORDER BY tablename;
