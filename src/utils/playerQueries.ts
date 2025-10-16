/**
 * @fileoverview Player Query Utilities
 *
 * Queries for fetching player-specific data including their teams, leagues, and seasons.
 * Used for player-facing views and team management.
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
 * @returns Promise with teams data and any error
 */
export async function fetchPlayerTeams(memberId: string) {
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

  if (error) {
    return { data: null, error };
  }

  // Filter for active/upcoming seasons and sort by start date (most recent first)
  const filteredData = data
    ?.filter((item) => {
      const status = item.teams?.season?.status;
      return status === 'active' || status === 'upcoming';
    })
    .sort((a, b) => {
      const dateA = new Date(a.teams?.season?.start_date || 0).getTime();
      const dateB = new Date(b.teams?.season?.start_date || 0).getTime();
      return dateB - dateA; // Most recent first
    });

  return { data: filteredData, error: null };
}

/**
 * Fetch a specific team with full details for team management
 *
 * @param teamId - The team ID to fetch
 * @returns Promise with team data and any error
 */
export async function fetchTeamDetails(teamId: string) {
  return supabase
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
 */
export async function fetchCaptainTeamEditData(teamId: string) {
  // Fetch team details first to get league/season info
  const { data: team, error: teamError } = await fetchTeamDetails(teamId);

  if (teamError || !team) {
    return { data: null, error: teamError };
  }

  const leagueId = team.season.league.id;
  const seasonId = team.season.id;

  // Fetch all data in parallel
  const [
    { data: members, error: membersError },
    { data: venues, error: venuesError },
    { data: leagueVenues, error: leagueVenuesError },
    { data: allTeams, error: teamsError }
  ] = await Promise.all([
    // Get all members for player selection
    supabase
      .from('members')
      .select('*')
      .order('last_name'),

    // Get all venues
    supabase
      .from('venues')
      .select('*')
      .order('name'),

    // Get league venue assignments
    supabase
      .from('league_venues')
      .select('*')
      .eq('league_id', leagueId),

    // Get all teams in this season for duplicate validation
    supabase
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
      .eq('season_id', seasonId)
  ]);

  if (membersError || venuesError || leagueVenuesError || teamsError) {
    return {
      data: null,
      error: membersError || venuesError || leagueVenuesError || teamsError
    };
  }

  return {
    data: {
      team,
      members: members || [],
      venues: venues || [],
      leagueVenues: leagueVenues || [],
      allTeams: allTeams || [],
      leagueId,
      seasonId,
      teamFormat: team.season.league.team_format
    },
    error: null
  };
}
