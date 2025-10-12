/**
 * @fileoverview Team Query Utilities
 *
 * Centralized queries for fetching teams with nested relations.
 * Provides consistent data structure across the application.
 */

import { supabase } from '@/supabaseClient';

/**
 * Fetch teams with full details including captain, roster, and venue
 *
 * Returns teams with:
 * - All team fields
 * - Captain member info (name, player numbers)
 * - Full roster with member details
 * - Venue information
 *
 * @param leagueId - The league ID to fetch teams for
 * @returns Promise with teams data and any error
 */
export async function fetchTeamsWithDetails(leagueId: string) {
  return supabase
    .from('teams')
    .select(`
      *,
      captain:members!captain_id(
        id,
        first_name,
        last_name,
        system_player_number,
        bca_member_number
      ),
      team_players(
        member_id,
        is_captain,
        members(
          id,
          first_name,
          last_name,
          system_player_number,
          bca_member_number
        )
      ),
      venue:venues(
        id,
        name
      )
    `)
    .eq('league_id', leagueId)
    .order('created_at', { ascending: false });
}
