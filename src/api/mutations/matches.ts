/**
 * @fileoverview Match Mutation Functions
 *
 * Generic, reusable functions for match operations.
 * These functions are wrapped by TanStack Query mutation hooks.
 *
 * Philosophy: Keep mutations generic and flexible.
 * Instead of specific functions like updateMatchLineupId(), create
 * a generic updateMatch() that can update any field(s).
 *
 * @see api/hooks/useMatchMutations.ts - Mutation hooks that wrap these functions
 */

import { supabase } from '@/supabaseClient';

/**
 * Generic match update parameters
 */
export interface UpdateMatchParams {
  matchId: string;
  updates: Record<string, any>; // Any match field(s) to update
}

/**
 * Match database record (partial - only commonly used fields)
 */
export interface Match {
  id: string;
  season_id: string;
  home_team_id: string;
  away_team_id: string;
  home_lineup_id?: string | null;
  away_lineup_id?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  status?: string;
  home_games_to_win?: number;
  away_games_to_win?: number;
  home_games_to_tie?: number;
  away_games_to_tie?: number;
  home_games_to_lose?: number;
  away_games_to_lose?: number;
  [key: string]: any; // Allow any other match fields
}

/**
 * Update any field(s) on a match
 *
 * Generic mutation that can update any match field(s).
 * Use this for all match updates instead of creating specific mutations.
 *
 * @param params - Match ID and fields to update
 * @returns The updated match
 * @throws Error if database operation fails
 *
 * @example
 * // Update lineup ID
 * await updateMatch({
 *   matchId: '123',
 *   updates: { home_lineup_id: 'lineup-456' }
 * });
 *
 * @example
 * // Update multiple fields
 * await updateMatch({
 *   matchId: '123',
 *   updates: {
 *     home_lineup_id: 'lineup-456',
 *     started_at: new Date().toISOString()
 *   }
 * });
 *
 * @example
 * // Update match thresholds
 * await updateMatch({
 *   matchId: '123',
 *   updates: {
 *     home_games_to_win: 8,
 *     away_games_to_win: 7,
 *     home_games_to_tie: 7,
 *     away_games_to_tie: 8
 *   }
 * });
 */
export async function updateMatch(params: UpdateMatchParams): Promise<Match> {
  const { matchId, updates } = params;

  // First try with SELECT to return updated data
  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', matchId)
    .select('*')
    .maybeSingle();

  // If we get data back, return it
  if (data && !error) {
    return data;
  }

  // If SELECT is blocked by RLS (406 error), try update without SELECT
  if (error?.code === 'PGRST116' || error?.message?.includes('406')) {
    const { error: updateError } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', matchId);

    if (updateError) {
      throw new Error(`Failed to update match: ${updateError.message}`);
    }

    // Return a partial match object (real-time will trigger refetch)
    return { id: matchId, ...updates } as Match;
  }

  // Other errors
  if (error) {
    throw new Error(`Failed to update match: ${error.message}`);
  }

  throw new Error(`Match ${matchId} not found or update failed`);
}
