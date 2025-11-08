-- Enable realtime replication on match_games table
-- This allows Supabase Realtime to broadcast changes to this table

ALTER PUBLICATION supabase_realtime ADD TABLE public.match_games;

-- Verify it was added
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
