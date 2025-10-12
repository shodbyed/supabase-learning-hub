/**
 * @fileoverview Team Management Data Hook
 *
 * Custom hook for fetching and managing team-related data.
 * Handles all data fetching for leagues, venues, teams, members, and seasons.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { fetchTeamsWithDetails } from '@/utils/teamQueries';
import type { League } from '@/types/league';
import type { Venue, LeagueVenue } from '@/types/venue';
import type { TeamWithQueryDetails } from '@/types/team';
import type { Member } from '@/types/member';

interface UseTeamManagementReturn {
  league: League | null;
  venues: Venue[];
  leagueVenues: LeagueVenue[];
  teams: TeamWithQueryDetails[];
  members: Member[];
  seasonId: string | null;
  previousSeasonId: string | null;
  loading: boolean;
  error: string | null;
  refreshTeams: () => Promise<void>;
  setLeagueVenues: React.Dispatch<React.SetStateAction<LeagueVenue[]>>;
  setTeams: React.Dispatch<React.SetStateAction<TeamWithQueryDetails[]>>;
}

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
  const [league, setLeague] = useState<League | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [leagueVenues, setLeagueVenues] = useState<LeagueVenue[]>([]);
  const [teams, setTeams] = useState<TeamWithQueryDetails[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [previousSeasonId, setPreviousSeasonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all data on mount and when dependencies change
   */
  useEffect(() => {
    if (!operatorId || !leagueId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch league
        const { data: leagueData, error: leagueError } = await supabase
          .from('leagues')
          .select('*')
          .eq('id', leagueId)
          .single();

        if (leagueError) throw leagueError;
        setLeague(leagueData);

        // Fetch operator's venues
        const { data: venuesData, error: venuesError } = await supabase
          .from('venues')
          .select('*')
          .eq('created_by_operator_id', operatorId)
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (venuesError) throw venuesError;
        setVenues(venuesData || []);

        // Fetch league's assigned venues
        const { data: leagueVenuesData, error: leagueVenuesError } = await supabase
          .from('league_venues')
          .select('*')
          .eq('league_id', leagueId);

        if (leagueVenuesError) throw leagueVenuesError;
        setLeagueVenues(leagueVenuesData || []);

        // Fetch teams with captain info, roster details, and venue
        const { data: teamsData, error: teamsError } = await fetchTeamsWithDetails(leagueId);

        if (teamsError) throw teamsError;
        setTeams(teamsData || []);

        // Fetch all members (for captain/player selection)
        // Note: Not filtering by role - anyone in the members table can be selected
        // Future: Add isPlayer boolean column to allow members to opt out
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*')
          .order('last_name', { ascending: true });

        if (membersError) throw membersError;
        setMembers(membersData || []);

        // Fetch current season for this league (upcoming or active)
        const { data: seasonData, error: seasonError } = await supabase
          .from('seasons')
          .select('id, created_at')
          .eq('league_id', leagueId)
          .in('status', ['upcoming', 'active'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (seasonError) throw seasonError;
        setSeasonId(seasonData?.id || null);

        // Fetch previous season (most recent completed season)
        if (seasonData) {
          const { data: prevSeasonData, error: prevSeasonError } = await supabase
            .from('seasons')
            .select('id')
            .eq('league_id', leagueId)
            .eq('status', 'completed')
            .lt('created_at', seasonData.created_at)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (prevSeasonError) {
            console.error('Error fetching previous season:', prevSeasonError);
          } else {
            setPreviousSeasonId(prevSeasonData?.id || null);
          }
        }

        console.log('📊 Team Management Data:', {
          leagueId: leagueId,
          leagueVenues: leagueVenuesData?.length || 0,
          teams: teamsData?.length || 0,
          members: membersData?.length || 0,
          seasonId: seasonData?.id || 'No active season',
          seasonFound: !!seasonData
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [operatorId, leagueId]);

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
    members,
    seasonId,
    previousSeasonId,
    loading,
    error,
    refreshTeams,
    setLeagueVenues,
    setTeams,
  };
}
