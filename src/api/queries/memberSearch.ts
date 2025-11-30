/**
 * @fileoverview Member Search Query Functions
 *
 * Server-side search for members with filtering and limits.
 * Prevents loading all members into memory for large datasets.
 */

import { supabase } from '@/supabaseClient';
import type { PartialMember } from '@/types/member';

export type MemberSearchFilter = 'all' | 'my_org' | 'state' | 'staff';

/**
 * Search for members with server-side filtering
 *
 * Returns top 50 matches based on search query and filter.
 * Searches by name (first/last) and player number.
 *
 * @param searchQuery - Text to search (name or player number)
 * @param filter - Which subset of members to search
 * @param organizationId - Current user's organization (for 'my_org' filter)
 * @param userState - Current user's state (for 'state' filter)
 * @param limit - Max results to return (default 50)
 * @returns Array of members matching search criteria
 * @throws Error if database query fails
 *
 * @example
 * const members = await searchMembers('john', 'state', null, 'CA');
 * // Returns up to 50 members named John in California
 */
export async function searchMembers(
  searchQuery: string,
  filter: MemberSearchFilter,
  organizationId: string | null,
  userState: string | null,
  limit: number = 50
): Promise<PartialMember[]> {
  // Handle 'my_org' filter separately since it requires a subquery
  if (filter === 'my_org' && organizationId) {
    // Get members who are on teams in my organization's leagues
    const { data: teamPlayers, error: teamPlayersError } = await supabase
      .from('team_players')
      .select('member_id, teams!inner(season_id, seasons!inner(league_id, leagues!inner(organization_id)))')
      .eq('teams.seasons.leagues.organization_id', organizationId);

    if (teamPlayersError) {
      throw new Error(`Failed to search org members: ${teamPlayersError.message}`);
    }

    // Extract unique member IDs
    const memberIds = [...new Set(teamPlayers?.map(tp => tp.member_id) || [])];

    if (memberIds.length === 0) {
      return []; // No members in this org
    }

    // Now query members table with these IDs
    let query = supabase
      .from('members')
      .select('id, first_name, last_name, system_player_number, bca_member_number, state')
      .in('id', memberIds)
      .limit(limit);

    // Apply search if query provided
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      if (/^\d+$/.test(trimmedQuery)) {
        query = query.eq('system_player_number', parseInt(trimmedQuery, 10));
      } else {
        query = query.or(
          `first_name.ilike.%${trimmedQuery}%,last_name.ilike.%${trimmedQuery}%`
        );
      }
    }

    query = query.order('last_name', { ascending: true }).order('first_name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to search members: ${error.message}`);
    }

    return data as PartialMember[];
  }

  // Standard filters (state, staff, all)
  let query = supabase
    .from('members')
    .select('id, first_name, last_name, system_player_number, bca_member_number, state')
    .limit(limit);

  if (filter === 'state' && userState) {
    query = query.eq('state', userState);
  } else if (filter === 'staff') {
    query = query.eq('role', 'league_operator');
  }
  // 'all' filter has no additional conditions

  // Apply search if query provided
  const trimmedQuery = searchQuery.trim();
  if (trimmedQuery) {
    // Check if query is all digits (player number search)
    if (/^\d+$/.test(trimmedQuery)) {
      query = query.eq('system_player_number', parseInt(trimmedQuery, 10));
    } else {
      // Search by name (case-insensitive partial match)
      query = query.or(
        `first_name.ilike.%${trimmedQuery}%,last_name.ilike.%${trimmedQuery}%`
      );
    }
  }
  // If no search query, just return first 50 ordered by name

  // Order by last name, first name
  query = query.order('last_name', { ascending: true }).order('first_name', { ascending: true });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to search members: ${error.message}`);
  }

  return data as PartialMember[];
}
