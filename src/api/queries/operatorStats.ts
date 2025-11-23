/**
 * @fileoverview Operator Stats Query Functions
 *
 * Pure data fetching functions for operator dashboard statistics.
 * These functions return plain data and throw errors (no loading states).
 * Used by TanStack Query hooks for caching and state management.
 */

import { supabase } from '@/supabaseClient';

/**
 * Fetch count of teams across all operator's leagues
 *
 * Counts teams from all seasons in all leagues managed by the operator.
 *
 * @param operatorId - Operator's primary key ID
 * @returns Number of total teams
 * @throws Error if database query fails
 *
 * @example
 * const count = await getTeamCount('operator-uuid');
 * console.log(`Managing ${count} teams`);
 */
export async function getTeamCount(operatorId: string): Promise<number> {
  const { count, error } = await supabase
    .from('teams')
    .select('*, seasons!inner(league_id, leagues!inner(operator_id))', { count: 'exact', head: true })
    .eq('seasons.leagues.operator_id', operatorId);

  if (error) {
    throw new Error(`Failed to fetch team count: ${error.message}`);
  }

  return count || 0;
}

/**
 * Fetch count of players across all operator's leagues
 *
 * Counts unique players enrolled in teams across all operator's leagues.
 *
 * @param operatorId - Operator's primary key ID
 * @returns Number of total players
 * @throws Error if database query fails
 *
 * @example
 * const count = await getPlayerCount('operator-uuid');
 * console.log(`Managing ${count} players`);
 */
export async function getPlayerCount(operatorId: string): Promise<number> {
  const { count, error } = await supabase
    .from('team_players')
    .select('*, teams!inner(season_id, seasons!inner(league_id, leagues!inner(operator_id)))', { count: 'exact', head: true })
    .eq('teams.seasons.leagues.operator_id', operatorId);

  if (error) {
    throw new Error(`Failed to fetch player count: ${error.message}`);
  }

  return count || 0;
}

/**
 * Fetch count of venues managed by operator
 *
 * Counts venues created by the operator for their leagues.
 *
 * @param operatorId - Operator's primary key ID
 * @returns Number of total venues
 * @throws Error if database query fails
 *
 * @example
 * const count = await getVenueCount('operator-uuid');
 * console.log(`Managing ${count} venues`);
 */
export async function getVenueCount(operatorId: string): Promise<number> {
  const { count, error} = await supabase
    .from('venues')
    .select('*', { count: 'exact', head: true })
    .eq('created_by_operator_id', operatorId)
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to fetch venue count: ${error.message}`);
  }

  return count || 0;
}
