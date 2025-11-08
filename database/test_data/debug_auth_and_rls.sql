-- Debug authentication and RLS for match_games
-- Run this while logged into the app to see what's happening

-- Step 1: Check your auth context
SELECT
  auth.uid() as "Your auth user_id",
  auth.email() as "Your email";

-- Step 2: Check your member record
SELECT id, first_name, last_name, email, role, user_id
FROM members
WHERE user_id = auth.uid();

-- Step 3: Check if RLS policy allows you to see games
SELECT COUNT(*) as "Games you can see"
FROM match_games
WHERE match_id = '11111111-1111-1111-1111-111111111111';

-- Step 4: Check if games actually exist (bypass RLS)
SET LOCAL ROLE postgres;
SELECT COUNT(*) as "Games that actually exist"
FROM match_games
WHERE match_id = '11111111-1111-1111-1111-111111111111';
RESET ROLE;

-- Step 5: List all RLS policies on match_games
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'match_games'
ORDER BY policyname;
