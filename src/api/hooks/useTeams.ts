/**
 * @fileoverview Team Hooks (TanStack Query)
 *
 * React hooks for fetching team data with automatic caching.
 * Replaces old utils/playerQueries.ts and utils/teamQueries.ts patterns.
 *
 * Benefits:
 * - Automatic caching (10 minute stale time)
 * - Background refetching
 * - Request deduplication
 * - Loading and error states
 *
 * @example
 * const { data: teams, isLoading } = usePlayerTeams(memberId);
 * const { data: team } = useTeamDetails(teamId);
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import {
  getPlayerTeams,
  getTeamDetails,
  getTeamsByLeague,
  getTeamsBySeason,
  getCaptainTeamEditData,
} from '../queries/teams';
import { STALE_TIME } from '../client';

/**
 * Hook to fetch all teams a player is on
 *
 * Returns teams with full details including season, league, roster, and venue.
 * Only includes teams from active or upcoming seasons.
 *
 * @param memberId - The member ID to fetch teams for
 * @returns TanStack Query result with teams data
 *
 * @example
 * const { data: teams, isLoading, error } = usePlayerTeams(memberId);
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error loading teams</div>;
 *
 * teams.forEach(team => {
 *   console.log(team.teams.team_name);
 * });
 */
export function usePlayerTeams(memberId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.byMember(memberId || ''),
    queryFn: () => getPlayerTeams(memberId!),
    enabled: !!memberId,
    staleTime: STALE_TIME.TEAMS,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch a specific team with full details
 *
 * Includes season, league, captain, roster, and venue information.
 *
 * @param teamId - The team ID to fetch
 * @returns TanStack Query result with team data
 *
 * @example
 * const { data: team, isLoading } = useTeamDetails(teamId);
 *
 * if (team) {
 *   console.log(team.team_name);
 *   console.log(team.captain.first_name);
 *   console.log(team.season.league.game_type);
 * }
 */
export function useTeamDetails(teamId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.detail(teamId || ''),
    queryFn: () => getTeamDetails(teamId!),
    enabled: !!teamId,
    staleTime: STALE_TIME.TEAMS,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch all teams in a league
 *
 * @param leagueId - The league ID to fetch teams for
 * @returns TanStack Query result with teams data
 *
 * @example
 * const { data: teams } = useTeamsByLeague(leagueId);
 */
export function useTeamsByLeague(leagueId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.byLeague(leagueId || ''),
    queryFn: () => getTeamsByLeague(leagueId!),
    enabled: !!leagueId,
    staleTime: STALE_TIME.TEAMS,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch all teams in a season
 *
 * @param seasonId - The season ID to fetch teams for
 * @returns TanStack Query result with teams data
 *
 * @example
 * const { data: teams } = useTeamsBySeason(seasonId);
 */
export function useTeamsBySeason(seasonId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.bySeason(seasonId || ''),
    queryFn: () => getTeamsBySeason(seasonId!),
    enabled: !!seasonId,
    staleTime: STALE_TIME.TEAMS,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch all data needed for captain to edit their team
 *
 * Returns:
 * - Team details
 * - All available members
 * - All venues
 * - League venue assignments
 * - All teams in the season
 *
 * @param teamId - The team ID to fetch editing data for
 * @returns TanStack Query result with complete edit data
 *
 * @example
 * const { data: editData, isLoading } = useCaptainTeamEditData(teamId);
 *
 * if (editData) {
 *   const { team, members, venues, leagueVenues, allTeams } = editData;
 * }
 */
export function useCaptainTeamEditData(teamId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.teams.detail(teamId || ''), 'edit'] as const,
    queryFn: () => getCaptainTeamEditData(teamId!),
    enabled: !!teamId,
    staleTime: STALE_TIME.TEAMS,
    refetchOnWindowFocus: false,
  });
}
