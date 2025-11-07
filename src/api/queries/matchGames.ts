/**
 * @fileoverview Match Game Query Functions
 *
 * Pure data fetching functions for match_games table queries.
 * These functions return plain data and throw errors (no loading states).
 * Used by handicap calculations and game history tracking.
 */

import { supabase } from '@/supabaseClient';

/**
 * Match game record with winner information
 */
export interface MatchGame {
  id: string;
  match_id: string;
  game_number: number;
  home_player_id: string | null;
  away_player_id: string | null;
  winner_team_id: string | null;
  winner_player_id: string | null;
  home_action: 'breaks' | 'racks';
  away_action: 'breaks' | 'racks';
  break_and_run: boolean;
  golden_break: boolean;
  confirmed_by_home: boolean;
  confirmed_by_away: boolean;
  confirmed_at: string | null;
  is_tiebreaker: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch last N games for a player (for handicap calculation)
 *
 * Returns games filtered by game type and prioritized by season:
 * 1. Games from current season first (if currentSeasonId provided)
 * 2. Then games from other seasons with matching game_type
 * 3. Ordered by created_at (newest first)
 * 4. Only returns games with a winner (completed games)
 *
 * IMPORTANT: 8-ball stats don't count for 9-ball handicaps and vice versa.
 * Players need separate handicaps for each game type.
 *
 * PERFORMANCE: Uses denormalized game_type field for fast filtering without joins.
 * Composite indexes (player + game_type + created_at) enable optimal query performance.
 *
 * @param playerId - The player's member ID
 * @param gameType - Game type to filter ('eight_ball', 'nine_ball', 'ten_ball')
 * @param currentSeasonId - Optional current season ID to prioritize
 * @param limit - Maximum number of games to return (default: 200)
 * @returns Array of completed games where the player participated
 * @throws Error if query fails
 *
 * @example
 * // Get 9-ball games, prioritizing current season
 * const games = await fetchPlayerGameHistory('player-123', 'nine_ball', 'season-456', 200);
 * const wins = games.filter(g => g.winner_player_id === 'player-123').length;
 */
export async function fetchPlayerGameHistory(
  playerId: string,
  gameType: 'eight_ball' | 'nine_ball' | 'ten_ball',
  currentSeasonId?: string,
  limit: number = 200
): Promise<MatchGame[]> {
  // Fast query using denormalized game_type field - no joins needed!
  // Composite indexes make this extremely fast for handicap calculations
  const selectFields = currentSeasonId ? '*, match:matches!inner(season_id)' : '*';

  const { data, error } = await supabase
    .from('match_games')
    .select(selectFields)
    .or(`home_player_id.eq.${playerId},away_player_id.eq.${playerId}`)
    .not('winner_player_id', 'is', null) // Only completed games
    .eq('game_type', gameType) // Direct filter - much faster than joins!
    .order('created_at', { ascending: false })
    .limit(limit) as any; // TypeScript struggles with conditional selects, cast to any

  if (error) {
    throw new Error(`Failed to fetch player game history: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // If currentSeasonId provided, sort to prioritize current season games first
  if (currentSeasonId) {
    const currentSeasonGames = data.filter(
      (game: any) => game.match?.season_id === currentSeasonId
    );
    const otherSeasonGames = data.filter(
      (game: any) => game.match?.season_id !== currentSeasonId
    );

    // Return current season games first, then others (both already sorted by created_at)
    return [...currentSeasonGames, ...otherSeasonGames].slice(0, limit);
  }

  return data;
}
