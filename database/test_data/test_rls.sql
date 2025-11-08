-- Test if RLS is allowing you to see the games

-- First check: Can you see games as postgres user? (bypasses RLS)
SET ROLE postgres;
SELECT 'As postgres (no RLS):' as check_type, COUNT(*) as count
FROM match_games
WHERE match_id = '11111111-1111-1111-1111-111111111111';

-- Second check: Reset to authenticated user
RESET ROLE;

-- Your actual role and user_id
SELECT 'Your auth:' as check_type,
       auth.uid() as user_id,
       m.role,
       m.first_name || ' ' || m.last_name as name
FROM members m
WHERE m.user_id = auth.uid();

-- Can you see games with RLS? (this is what the app sees)
SELECT 'With RLS (what app sees):' as check_type, COUNT(*) as count
FROM match_games
WHERE match_id = '11111111-1111-1111-1111-111111111111';

-- Check if the operator policy exists
SELECT 'Operator Policy:' as check_type,
       policyname,
       CASE WHEN policyname LIKE '%operator%' THEN '✅ EXISTS' ELSE 'Not found' END as status
FROM pg_policies
WHERE tablename = 'match_games'
  AND policyname LIKE '%operator%';
