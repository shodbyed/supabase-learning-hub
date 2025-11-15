-- Populate missing games_to_tie and games_to_lose values in handicap_chart_3vs3
-- These values determine when a match ends in a tie or loss based on games won

-- For 3v3 format (18 total games):
-- - Win threshold + Lose threshold should equal 18
-- - Tie occurs when neither team reaches win threshold by game 18
-- - Example: If you need 10 to win, opponent needs 9 to not lose (10+9=19, but with 18 games, 9-9 is a tie)

UPDATE handicap_chart_3vs3
SET
  games_to_tie = 18 - games_to_win,  -- Tie = total games minus win threshold
  games_to_lose = games_to_win        -- Lose = opponent reaches their win threshold
WHERE games_to_tie IS NULL OR games_to_lose IS NULL;

-- Verify the update
SELECT hcp_diff, games_to_win, games_to_tie, games_to_lose
FROM handicap_chart_3vs3
ORDER BY hcp_diff;
