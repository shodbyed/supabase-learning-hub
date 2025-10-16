/**
 * @fileoverview useSeasonSchedule Hook
 *
 * Custom hook for fetching and managing season schedule data.
 * Separates data fetching logic from UI components.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import type { WeekSchedule, MatchWithDetails } from '@/types/schedule';

interface UseSeasonScheduleResult {
  schedule: WeekSchedule[];
  seasonName: string;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetch and manage season schedule data
 *
 * Handles fetching season info, weeks, and matches in a single hook.
 * Automatically organizes matches by week.
 *
 * @param seasonId - Season ID to fetch schedule for
 * @param leagueId - League ID for error context
 * @returns Schedule data, loading state, error state, and refetch function
 *
 * @example
 * const { schedule, loading, error, refetch } = useSeasonSchedule(seasonId, leagueId);
 */
export function useSeasonSchedule(
  seasonId: string | undefined,
  leagueId: string | undefined
): UseSeasonScheduleResult {
  const [schedule, setSchedule] = useState<WeekSchedule[]>([]);
  const [seasonName, setSeasonName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!seasonId || !leagueId) {
        setError('Missing season or league ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch season info
        const { data: seasonData, error: seasonError } = await supabase
          .from('seasons')
          .select('id, start_date, end_date, season_length, season_name')
          .eq('id', seasonId)
          .single();

        if (seasonError) throw seasonError;

        setSeasonName(seasonData.season_name || `Season ${seasonData.season_length} Weeks`);

        // Fetch all season weeks (all types: regular, blackout, playoffs, breaks)
        const { data: weeksData, error: weeksError } = await supabase
          .from('season_weeks')
          .select('*')
          .eq('season_id', seasonId)
          .order('scheduled_date', { ascending: true });

        if (weeksError) throw weeksError;

        // Fetch all matches with team and venue details
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select(`
            *,
            home_team:teams!matches_home_team_id_fkey(id, team_name, captain_id),
            away_team:teams!matches_away_team_id_fkey(id, team_name, captain_id),
            scheduled_venue:venues!matches_scheduled_venue_id_fkey(id, name, street_address, city, state),
            season_week:season_weeks(id, scheduled_date, week_name, week_type)
          `)
          .eq('season_id', seasonId)
          .order('match_number', { ascending: true });

        if (matchesError) throw matchesError;

        // Organize matches by week
        const scheduleByWeek: WeekSchedule[] = weeksData.map((week) => ({
          week,
          matches: matchesData.filter((match) => match.season_week_id === week.id) as MatchWithDetails[],
        }));

        setSchedule(scheduleByWeek);
      } catch (err) {
        console.error('Error fetching schedule:', err);
        setError('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [seasonId, leagueId, refetchTrigger]);

  const refetch = () => setRefetchTrigger((prev) => prev + 1);

  return { schedule, seasonName, loading, error, refetch };
}
