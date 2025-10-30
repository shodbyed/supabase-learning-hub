/**
 * @fileoverview Enable Realtime for match_games table
 *
 * Adds the match_games table to the supabase_realtime publication
 * so that real-time subscriptions can receive INSERT/UPDATE/DELETE events.
 *
 * This is required for the two-team confirmation flow where one team
 * scores a game and the opponent immediately sees a modal asking them
 * to confirm or deny the result.
 */

-- Add match_games table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE match_games;
