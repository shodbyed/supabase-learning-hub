/**
 * @fileoverview Team Management Data Hook
 *
 * Custom hook for fetching and managing team-related data.
 * Handles all data fetching for leagues, venues, teams, members, and seasons.
 */

import { useState, useEffect, useMemo } from 'react';
import { fetchTeamsWithDetails } from '@/api/hooks';
import {
  useLeagueById,
  useVenuesByOperator,
  useLeagueVenues,
  useAllMembers,
  useActiveSeason,
  usePreviousCompletedSeason,
} from '@/api/hooks';
import type { LeagueVenue } from '@/types/venue';
import type { UseTeamManagementReturn } from '@/types';
import type { TeamWithQueryDetails } from '@/types/team';

/**
 * Custom hook for managing team data
 *
 * Fetches and provides:
 * - League information
 * - Available venues
 * - League venue assignments
 * - Teams with full details
 * - Available members
 * - Current and previous season IDs
 *
 * @param operatorId - The operator's user ID
 * @param leagueId - The league ID to fetch data for
 * @returns Object containing all team management data and refresh function
 */
export function useTeamManagement(
  operatorId: string | null,
  leagueId: string | undefined
): UseTeamManagementReturn {
  // ============================================================================
  // TANSTACK QUERY HOOKS
  // ============================================================================

  // Fetch league data
  const {
    data: leagueData,
    isLoading: leagueLoading,
    error: leagueError,
  } = useLeagueById(leagueId);

  // Fetch operator's venues
  const {
    data: venuesData = [],
    isLoading: venuesLoading,
    error: venuesError,
  } = useVenuesByOperator(operatorId);

  // Fetch league's assigned venues
  const {
    data: leagueVenuesData = [],
    isLoading: leagueVenuesLoading,
    error: leagueVenuesError,
  } = useLeagueVenues(leagueId);

  // Fetch all members
  const {
    data: membersData = [],
    isLoading: membersLoading,
    error: membersError,
  } = useAllMembers();

  // Fetch active season
  const {
    data: activeSeasonData,
    isLoading: seasonLoading,
    error: seasonError,
  } = useActiveSeason(leagueId);

  // Fetch previous completed season (before active season)
  const {
    data: previousSeasonData,
    isLoading: prevSeasonLoading,
  } = usePreviousCompletedSeason(leagueId, activeSeasonData?.created_at);

  // ============================================================================
  // LOCAL STATE (for data that still needs useEffect/useState)
  // ============================================================================

  const [teams, setTeams] = useState<TeamWithQueryDetails[]>([]);
  const [leagueVenues, setLeagueVenues] = useState<LeagueVenue[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  // ============================================================================
  // DERIVED DATA
  // ============================================================================

  const league = leagueData || null;
  const venues = venuesData;
  const members = membersData;
  const seasonId = activeSeasonData?.id || null;
  const previousSeasonId = previousSeasonData?.id || null;

  // Combined loading state
  const loading = leagueLoading || venuesLoading || leagueVenuesLoading || membersLoading || seasonLoading || prevSeasonLoading || teamsLoading;

  // Combined error state
  const error = useMemo(() => {
    if (leagueError) return leagueError.message || 'Failed to load league';
    if (venuesError) return venuesError.message || 'Failed to load venues';
    if (leagueVenuesError) return leagueVenuesError.message || 'Failed to load league venues';
    if (membersError) return membersError.message || 'Failed to load members';
    if (seasonError) return seasonError.message || 'Failed to load season';
    return null;
  }, [leagueError, venuesError, leagueVenuesError, membersError, seasonError]);

  // ============================================================================
  // DATA FETCHING (for data not yet in TanStack Query)
  // ============================================================================

  /**
   * Fetch teams
   * TODO: Migrate teams to TanStack Query
   */
  useEffect(() => {
    if (!leagueId) {
      setTeamsLoading(false);
      return;
    }

    const fetchTeams = async () => {
      try {
        setTeamsLoading(true);

        // Fetch teams with captain info, roster details, and venue
        const { data: teamsData, error: teamsError } = await fetchTeamsWithDetails(leagueId);
        if (teamsError) throw teamsError;
        setTeams(teamsData || []);

        console.log('📊 Team Management Data:', {
          leagueId,
          teams: teamsData?.length || 0,
          seasonId: activeSeasonData?.id || 'No active season',
          previousSeasonId: previousSeasonData?.id || null,
        });
      } catch (err) {
        console.error('Error fetching teams:', err);
      } finally {
        setTeamsLoading(false);
      }
    };

    fetchTeams();
  }, [leagueId, activeSeasonData, previousSeasonData]);

  // Sync leagueVenues state with TanStack Query data
  // TODO: Remove this - component should use TanStack Query mutations
  useEffect(() => {
    setLeagueVenues(leagueVenuesData);
  }, [leagueVenuesData]);

  /**
   * Refresh teams list (useful after create/update/delete)
   */
  const refreshTeams = async () => {
    if (!leagueId) return;

    try {
      const { data: teamsData, error: teamsError } = await fetchTeamsWithDetails(leagueId);

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);
      console.log('✅ Teams list refreshed');
    } catch (err) {
      console.error('Error refreshing teams:', err);
    }
  };

  return {
    league,
    venues,
    leagueVenues,
    teams,
    members, // Now correctly typed as PartialMember[]
    seasonId,
    previousSeasonId,
    loading,
    error,
    refreshTeams,
    // TODO: Remove these setters - should use TanStack Query mutations/invalidations instead
    setLeagueVenues,
    setTeams,
  };
}
