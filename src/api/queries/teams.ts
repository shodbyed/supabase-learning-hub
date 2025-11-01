/**
 * @fileoverview Team Query Functions (TanStack Query)
 *
 * Pure data-fetching functions for teams and players.
 * These functions are called by TanStack Query hooks, not directly by components.
 *
 * Migrated from:
 * - utils/playerQueries.ts (fetchPlayerTeams, fetchTeamDetails, fetchCaptainTeamEditData)
 * - utils/teamQueries.ts (fetchTeamsWithDetails)
 */

import { supabase } from '@/supabaseClient';

/**
 * Fetch all teams a player is on across all leagues
 *
 * Returns teams with full details:
 * - Team information (name, stats, status)
 * - League information (game type, day of week)
 * - Season information (name, dates, status)
 * - Captain details
 * - Full roster with all players
 * - Home venue information
 *
 * Only returns teams from active or upcoming seasons by default.
 *
 * @param memberId - The member ID to fetch teams for
 * @returns Promise with teams data
 * @throws Error if query fails
 */
export async function getPlayerTeams(memberId: string) {
  // Fetch all teams for the member
  // Note: Filtering and sorting by nested season status/date must be done client-side
  // as Supabase doesn't support filtering on deeply nested relations
  const { data, error } = await supabase
    .from('team_players')
    .select(`
      team_id,
      teams!inner(
        *,
        season:seasons!inner(
          id,
          season_name,
          start_date,
          end_date,
          status,
          league:leagues!inner(
            id,
            game_type,
            day_of_week,
            division
          )
        ),
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
      )
    `)
    .eq('member_id', memberId);

  if (error) throw error;

  // Filter for active/upcoming seasons and sort by start date (most recent first)
  const filteredData = data
    ?.filter((item: any) => {
      // Type guard: ensure teams and season are objects, not arrays
      const teams = item.teams;
      if (!teams || Array.isArray(teams)) return false;

      const season = teams.season;
      if (!season || Array.isArray(season)) return false;

      const status = season.status;
      return status === 'active' || status === 'upcoming';
    })
    .sort((a: any, b: any) => {
      const teamsA = a.teams;
      const teamsB = b.teams;

      if (!teamsA || Array.isArray(teamsA) || !teamsB || Array.isArray(teamsB)) return 0;

      const seasonA = teamsA.season;
      const seasonB = teamsB.season;

      if (!seasonA || Array.isArray(seasonA) || !seasonB || Array.isArray(seasonB)) return 0;

      const dateA = new Date(seasonA.start_date || 0).getTime();
      const dateB = new Date(seasonB.start_date || 0).getTime();
      return dateB - dateA; // Most recent first
    });

  return filteredData || [];
}

/**
 * Fetch a specific team with full details
 *
 * @param teamId - The team ID to fetch
 * @returns Promise with team data
 * @throws Error if query fails
 */
export async function getTeamDetails(teamId: string) {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      season:seasons(
        id,
        season_name,
        start_date,
        end_date,
        status,
        league:leagues(
          id,
          game_type,
          day_of_week,
          division,
          team_format
        )
      ),
      captain:members!captain_id(
        id,
        first_name,
        last_name,
        system_player_number,
        bca_member_number,
        email,
        phone
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
        name,
        street_address,
        city,
        state
      )
    `)
    .eq('id', teamId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch teams in a league with full details
 *
 * Returns teams with:
 * - All team fields
 * - Captain member info (name, player numbers)
 * - Full roster with member details
 * - Venue information
 *
 * @param leagueId - The league ID to fetch teams for
 * @returns Promise with teams data
 * @throws Error if query fails
 */
export async function getTeamsByLeague(leagueId: string) {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      captain:members!captain_id(
        id,
        first_name,
        last_name,
        phone,
        email,
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
        name,
        phone,
        street_address,
        city,
        state
      )
    `)
    .eq('league_id', leagueId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch teams in a season with full details
 *
 * @param seasonId - The season ID to fetch teams for
 * @returns Promise with teams data
 * @throws Error if query fails
 */
export async function getTeamsBySeason(seasonId: string) {
  const { data, error } = await supabase
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
    .eq('season_id', seasonId);

  if (error) throw error;
  return data || [];
}

/**
 * Fetch all data needed for captain to edit their team
 *
 * This includes:
 * - Team details with nested season/league info
 * - All available members (for roster selection)
 * - All venues
 * - League venue assignments
 * - All teams in the season (for duplicate validation)
 *
 * @param teamId - The team ID to fetch editing data for
 * @returns Promise with all necessary data for team editing
 * @throws Error if any query fails
 */
export async function getCaptainTeamEditData(teamId: string) {
  // Fetch team details first to get league/season info
  const team = await getTeamDetails(teamId);

  const leagueId = team.season.league.id;
  const seasonId = team.season.id;

  // Fetch all data in parallel
  const [members, venues, leagueVenues, allTeams] = await Promise.all([
    // Get all members for player selection
    supabase
      .from('members')
      .select('*')
      .order('last_name')
      .then(({ data, error }) => {
        if (error) throw error;
        return data || [];
      }),

    // Get all venues
    supabase
      .from('venues')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) throw error;
        return data || [];
      }),

    // Get league venue assignments
    supabase
      .from('league_venues')
      .select('*')
      .eq('league_id', leagueId)
      .then(({ data, error }) => {
        if (error) throw error;
        return data || [];
      }),

    // Get all teams in this season for duplicate validation
    getTeamsBySeason(seasonId),
  ]);

  return {
    team,
    members,
    venues,
    leagueVenues,
    allTeams,
    leagueId,
    seasonId,
    teamFormat: team.season.league.team_format,
  };
}
