-- Check if test data actually exists in the database

-- 1. Check if test match exists
SELECT 'Test Match:' as check_type,
       id, home_team_id, away_team_id, status
FROM matches
WHERE id = '11111111-1111-1111-1111-111111111111';

-- 2. Check if test games exist
SELECT 'Test Games:' as check_type,
       COUNT(*) as game_count
FROM match_games
WHERE match_id = '11111111-1111-1111-1111-111111111111';

-- 3. List all test games
SELECT 'Game Details:' as check_type,
       game_number, confirmed_by_home, confirmed_by_away, game_type
FROM match_games
WHERE match_id = '11111111-1111-1111-1111-111111111111'
ORDER BY game_number;

-- 4. Check your role
SELECT 'Your Role:' as check_type,
       first_name, last_name, role
FROM members
WHERE user_id = auth.uid();

-- 5. Check RLS policies on match_games
SELECT 'RLS Policies:' as check_type,
       policyname, cmd
FROM pg_policies
WHERE tablename = 'match_games';
