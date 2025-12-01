/**
 * @fileoverview useSeasonSchedule Hook
 *
 * Wrapper hook for TanStack Query season schedule.
 * Maintains backward compatibility with existing components.
 */

import { useSeasonSchedule as useTanStackSeasonSchedule, useSeasonById } from '@/api/hooks';
import type { WeekSchedule } from '@/api/queries/matches';

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
 * Now uses TanStack Query for automatic caching and state management.
 * Backward compatible with previous implementation.
 *
 * @param seasonId - Season ID to fetch schedule for
 * @param leagueId - League ID (kept for backward compatibility, not used)
 * @returns Schedule data, loading state, error state, and refetch function
 *
 * @example
 * const { schedule, loading, error, refetch } = useSeasonSchedule(seasonId, leagueId);
 */
export function useSeasonSchedule(
  seasonId: string | undefined,
  _leagueId: string | undefined // Kept for backward compatibility
): UseSeasonScheduleResult {
  // Fetch schedule and season info using TanStack Query
  const { data: schedule = [], isLoading: scheduleLoading, error: scheduleError, refetch } = useTanStackSeasonSchedule(seasonId);
  const { data: season, isLoading: seasonLoading } = useSeasonById(seasonId);

  const loading = scheduleLoading || seasonLoading;
  const error = scheduleError ? 'Failed to load schedule' : null;
  const seasonName = season?.season_name || `Season ${season?.season_length || 0} Weeks`;

  return { schedule, seasonName, loading, error, refetch };
}
