-- Create Test Data for Realtime Testing
-- Run this in Supabase Studio SQL Editor
-- IMPORTANT: Replace the team UUIDs below with YOUR actual team IDs

-- First, find YOUR team IDs by running this query:
-- SELECT DISTINCT t.id, t.team_name
-- FROM teams t
-- JOIN team_players tp ON tp.team_id = t.id
-- JOIN members m ON m.id = tp.member_id
-- WHERE m.user_id = auth.uid();

-- Step 1: Delete old test data if exists
DELETE FROM public.match_games WHERE match_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM public.matches WHERE id = '11111111-1111-1111-1111-111111111111';

-- Step 2: Create a test match with a known UUID
-- ⚠️  REPLACE THESE TEAM IDs WITH YOUR ACTUAL TEAM IDs FROM THE QUERY ABOVE
INSERT INTO public.matches (
  id,
  season_id,
  season_week_id,
  home_team_id,
  away_team_id,
  match_number,
  status,
  home_team_verified_by,
  away_team_verified_by
) VALUES (
  '11111111-1111-1111-1111-111111111111',  -- Hardcoded test match ID
  (SELECT id FROM public.seasons LIMIT 1),  -- Get any season ID
  (SELECT id FROM public.season_weeks LIMIT 1),  -- Get any season week ID
  'REPLACE-WITH-YOUR-TEAM-ID-1',  -- ⚠️  PUT YOUR TEAM ID HERE
  'REPLACE-WITH-YOUR-TEAM-ID-2',  -- ⚠️  PUT YOUR TEAM ID HERE (or same as above)
  1,  -- Match number
  'in_progress',
  NULL,
  NULL
);

-- Step 2: Create 5 test games for this match
INSERT INTO public.match_games (
  match_id,
  game_number,
  home_player_id,
  away_player_id,
  winner_team_id,
  winner_player_id,
  home_action,
  away_action,
  break_and_run,
  golden_break,
  confirmed_by_home,
  confirmed_by_away,
  game_type,
  is_tiebreaker
) VALUES
  ('11111111-1111-1111-1111-111111111111', 1, NULL, NULL, NULL, NULL, 'breaks', 'racks', false, false, false, false, 'eight_ball', false),
  ('11111111-1111-1111-1111-111111111111', 2, NULL, NULL, NULL, NULL, 'breaks', 'racks', false, false, false, false, 'eight_ball', false),
  ('11111111-1111-1111-1111-111111111111', 3, NULL, NULL, NULL, NULL, 'breaks', 'racks', false, false, false, false, 'eight_ball', false),
  ('11111111-1111-1111-1111-111111111111', 4, NULL, NULL, NULL, NULL, 'breaks', 'racks', false, false, false, false, 'eight_ball', false),
  ('11111111-1111-1111-1111-111111111111', 5, NULL, NULL, NULL, NULL, 'breaks', 'racks', false, false, false, false, 'eight_ball', false)
ON CONFLICT (match_id, game_number) DO UPDATE SET
  confirmed_by_home = false,
  confirmed_by_away = false;

-- Verify the data was created
SELECT 'Match created:' as status, id, status, home_team_verified_by, away_team_verified_by
FROM public.matches
WHERE id = '11111111-1111-1111-1111-111111111111';

SELECT 'Games created:' as status, game_number, confirmed_by_home, confirmed_by_away
FROM public.match_games
WHERE match_id = '11111111-1111-1111-1111-111111111111'
ORDER BY game_number;
