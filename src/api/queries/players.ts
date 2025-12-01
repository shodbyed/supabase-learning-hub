/**
 * @fileoverview Player Query Functions
 *
 * Pure data fetching functions for player-specific queries.
 * Used by operator tools for player management and statistics.
 */

import { supabase } from '@/supabaseClient';
import { fetchPlayerGameHistory } from './matchGames';
import { calculatePlayerHandicap } from '@/utils/calculatePlayerHandicap';
import { logger } from '@/utils/logger';

/**
 * Fetch count of all players in operator's leagues
 *
 * Returns total count of unique players who are on teams in any of the operator's leagues.
 * If activeOnly is true, only counts players on teams in active or upcoming seasons.
 *
 * @param operatorId - The operator ID to fetch player count for
 * @param activeOnly - Whether to filter for only active players (default: false)
 * @returns Promise with player count
 */
export async function fetchOperatorPlayerCount(
  operatorId: string,
  activeOnly: boolean = false
): Promise<number> {
  // Get all teams from organization's leagues
  let teamsQuery = supabase
    .from('teams')
    .select('id, league:leagues!inner(organization_id), season:seasons!inner(status)')
    .eq('league.organization_id', operatorId);

  // Filter by active/upcoming seasons if activeOnly
  if (activeOnly) {
    teamsQuery = teamsQuery.in('season.status', ['active', 'upcoming']);
  }

  const { data: teams, error: teamsError } = await teamsQuery;

  if (teamsError || !teams) {
    logger.error('Error fetching operator teams', { error: teamsError?.message || 'Unknown error' });
    return 0;
  }

  const teamIds = teams.map((t: any) => t.id);

  if (teamIds.length === 0) {
    return 0;
  }

  // Count unique players in those teams
  let playersQuery = supabase
    .from('team_players')
    .select('member_id', { count: 'exact', head: true })
    .in('team_id', teamIds);

  // Filter by active status if activeOnly
  if (activeOnly) {
    playersQuery = playersQuery.eq('status', 'active');
  }

  const { count, error } = await playersQuery;

  if (error) {
    logger.error('Error fetching operator player count', { error: error.message });
    return 0;
  }

  return count || 0;
}

/**
 * Fetch all players in operator's leagues (for dropdown selection)
 *
 * Returns list of unique players with basic info (id, name, player number).
 * If activeOnly is true, only includes players on teams in active or upcoming seasons.
 *
 * @param operatorId - The operator ID to fetch players for
 * @param activeOnly - Whether to filter for only active players (default: false)
 * @returns Promise with array of players
 */
export async function fetchOperatorPlayers(
  operatorId: string,
  activeOnly: boolean = false
) {
  // Get all unique member IDs from teams in organization's leagues
  let teamPlayersQuery = supabase
    .from('team_players')
    .select(`
      member_id,
      status,
      team:teams!inner(
        league:leagues!inner(
          organization_id
        ),
        season:seasons!inner(
          status
        )
      )
    `)
    .eq('team.league.organization_id', operatorId);

  // Filter by active status if activeOnly
  if (activeOnly) {
    teamPlayersQuery = teamPlayersQuery
      .eq('status', 'active')
      .in('team.season.status', ['active', 'upcoming']);
  }

  const { data: teamPlayers, error: teamPlayersError } = await teamPlayersQuery;

  if (teamPlayersError) {
    return { data: null, error: teamPlayersError };
  }

  // Extract unique member IDs
  const uniqueMemberIds = [...new Set(teamPlayers.map((tp: any) => tp.member_id))];

  if (uniqueMemberIds.length === 0) {
    return { data: [], error: null };
  }

  // Fetch member details
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('id, first_name, last_name, system_player_number, bca_member_number')
    .in('id', uniqueMemberIds)
    .order('last_name');

  if (membersError) {
    return { data: null, error: membersError };
  }

  return { data: members, error: null };
}

/**
 * Player details for management page
 */
export interface PlayerDetails {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  system_player_number: number;
  bca_member_number: string | null;
  role: string;
  phone: string;
  email: string;
  membership_paid_date: string | null;
  starting_handicap_3v3: number;
  starting_handicap_5v5: number;
  teams: Array<{
    id: string;
    team_name: string;
    season_name: string;
    status: string;
    league_name: string;
    game_type: string;
    team_format: '5_man' | '8_man';
  }>;
  gameCounts: {
    total: number;
    eight_ball: number;
    nine_ball: number;
    ten_ball: number;
  };
  handicaps: {
    eight_ball_3v3: number;
    eight_ball_5v5: number;
    nine_ball_3v3: number;
    nine_ball_5v5: number;
    ten_ball_3v3: number;
    ten_ball_5v5: number;
  };
}

/**
 * Fetch detailed player information for operator management
 *
 * Returns comprehensive player data including:
 * - Basic player info
 * - Current starting handicaps
 * - All leagues player is in (from operator's leagues)
 * - All teams player is on
 * - Game counts by game type
 *
 * @param playerId - The player's member ID
 * @param operatorId - The operator ID (to filter leagues/teams)
 * @returns Promise with player details
 */
export async function fetchPlayerDetails(
  playerId: string,
  operatorId: string
): Promise<{ data: PlayerDetails | null; error: any }> {
  // Fetch player basic info and starting handicaps
  const { data: player, error: playerError } = await supabase
    .from('members')
    .select('id, first_name, last_name, nickname, system_player_number, bca_member_number, role, phone, email, membership_paid_date, starting_handicap_3v3, starting_handicap_5v5')
    .eq('id', playerId)
    .single();

  if (playerError) {
    return { data: null, error: playerError };
  }

  // Fetch all leagues player is in (from organization's leagues)
  const { data: teamPlayers, error: teamPlayersError } = await supabase
    .from('team_players')
    .select(`
      team:teams!inner(
        id,
        team_name,
        league:leagues!inner(
          id,
          game_type,
          day_of_week,
          division,
          team_format,
          organization_id
        ),
        season:seasons!inner(
          id,
          season_name,
          status
        )
      )
    `)
    .eq('member_id', playerId)
    .eq('team.league.organization_id', operatorId);

  if (teamPlayersError) {
    return { data: null, error: teamPlayersError };
  }

  // Extract teams with league/season info
  const teamsArray: any[] = [];

  teamPlayers?.forEach((tp: any) => {
    const team = tp.team;
    if (!team || Array.isArray(team)) return;

    const league = team.league;
    const season = team.season;

    if (!league || Array.isArray(league) || !season || Array.isArray(season)) return;

    // Add to teams array with league and season info
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = typeof league.day_of_week === 'number' ? dayNames[league.day_of_week] : '';
    const gameTypeFormatted = league.game_type ? league.game_type.replace('_', '-').charAt(0).toUpperCase() + league.game_type.replace('_', '-').slice(1) : '';
    const division = league.division || '';

    teamsArray.push({
      id: team.id,
      team_name: team.team_name,
      season_name: season.season_name,
      status: season.status,
      league_name: `${dayName} ${gameTypeFormatted}${division ? ' - ' + division : ''}`,
      game_type: league.game_type,
      team_format: league.team_format,
    });
  });

  // Fetch game counts by game type using existing fetchPlayerGameHistory
  // This uses the same logic as handicap calculations
  const eightBallGames = await fetchPlayerGameHistory(playerId, 'eight_ball', undefined, 10000);
  const nineBallGames = await fetchPlayerGameHistory(playerId, 'nine_ball', undefined, 10000);
  const tenBallGames = await fetchPlayerGameHistory(playerId, 'ten_ball', undefined, 10000);

  const gameCounts = {
    eight_ball: eightBallGames.length,
    nine_ball: nineBallGames.length,
    ten_ball: tenBallGames.length,
    total: eightBallGames.length + nineBallGames.length + tenBallGames.length,
  };

  // Calculate handicaps for both formats (3v3 and 5v5) and all game types
  const handicaps = {
    eight_ball_3v3: await calculatePlayerHandicap(playerId, '5_man', 'standard', 'eight_ball'),
    eight_ball_5v5: await calculatePlayerHandicap(playerId, '8_man', 'standard', 'eight_ball'),
    nine_ball_3v3: await calculatePlayerHandicap(playerId, '5_man', 'standard', 'nine_ball'),
    nine_ball_5v5: await calculatePlayerHandicap(playerId, '8_man', 'standard', 'nine_ball'),
    ten_ball_3v3: await calculatePlayerHandicap(playerId, '5_man', 'standard', 'ten_ball'),
    ten_ball_5v5: await calculatePlayerHandicap(playerId, '8_man', 'standard', 'ten_ball'),
  };

  return {
    data: {
      ...player,
      teams: teamsArray,
      gameCounts,
      handicaps,
    },
    error: null,
  };
}

/**
 * Update player's starting handicaps
 *
 * @param playerId - The player's member ID
 * @param startingHandicap3v3 - Starting handicap for 3v3 format
 * @param startingHandicap5v5 - Starting handicap for 5v5 format
 * @returns Promise with update result
 */
export async function updatePlayerStartingHandicaps(
  playerId: string,
  startingHandicap3v3: number,
  startingHandicap5v5: number
) {
  return supabase
    .from('members')
    .update({
      starting_handicap_3v3: startingHandicap3v3,
      starting_handicap_5v5: startingHandicap5v5,
    })
    .eq('id', playerId);
}

/**
 * Mark player's membership as paid with a specific date
 *
 * @param playerId - The player's member ID
 * @param date - The date to set (YYYY-MM-DD format), or null to clear
 * @returns Promise with update result
 */
export async function updateMembershipPaidDate(playerId: string, date: string | null) {
  return supabase
    .from('members')
    .update({
      membership_paid_date: date,
    })
    .eq('id', playerId);
}

/**
 * Mark player's membership as paid with today's date
 *
 * @param playerId - The player's member ID
 * @returns Promise with update result
 */
export async function markMembershipPaid(playerId: string) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  return updateMembershipPaidDate(playerId, today);
}
