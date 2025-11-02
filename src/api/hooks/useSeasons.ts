/**
 * @fileoverview Season Query Hooks (TanStack Query)
 *
 * React hooks for fetching season data with automatic caching.
 * Wraps pure query functions with TanStack Query for state management.
 *
 * Benefits:
 * - Automatic caching (fetch once, reuse everywhere)
 * - No duplicate requests (deduplication across components)
 * - Background refetching keeps data fresh
 * - Built-in loading/error states
 *
 * @see api/queries/seasons.ts - Pure query functions
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import {
  getSeasonsByLeague,
  getSeasonById,
  getMostRecentSeason,
  getActiveSeason,
  getSeasonCount,
} from '../queries/seasons';
import { STALE_TIME } from '../client';

/**
 * Hook to fetch all seasons for a league
 *
 * Gets all seasons ordered by creation date (newest first).
 * Cached for 5 minutes.
 *
 * @param leagueId - League's primary key ID
 * @returns TanStack Query result with array of seasons
 *
 * @example
 * const { data: seasons = [], isLoading } = useSeasonsByLeague(leagueId);
 * return seasons.map(season => (
 *   <SeasonCard key={season.id} season={season} />
 * ));
 */
export function useSeasonsByLeague(leagueId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.seasons.byLeague(leagueId || ''),
    queryFn: () => getSeasonsByLeague(leagueId!),
    enabled: !!leagueId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch season by ID
 *
 * Gets complete season record.
 * Cached for 5 minutes.
 *
 * @param seasonId - Season's primary key ID
 * @returns TanStack Query result with season data
 *
 * @example
 * const { data: season, isLoading, error } = useSeasonById(seasonId);
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 * return <h1>Season {season.season_number}</h1>;
 */
export function useSeasonById(seasonId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.seasons.detail(seasonId || ''),
    queryFn: () => getSeasonById(seasonId!),
    enabled: !!seasonId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch most recent season for a league
 *
 * Gets the latest season (by creation date) regardless of status.
 * Could be upcoming, active, or completed.
 * Returns null if league has no seasons yet.
 *
 * Cached for 5 minutes.
 *
 * @param leagueId - League's primary key ID
 * @returns TanStack Query result with season data or null
 *
 * @example
 * const { data: currentSeason } = useMostRecentSeason(leagueId);
 * if (currentSeason) {
 *   return <SeasonStatus season={currentSeason} />;
 * }
 * return <p>No seasons created yet</p>;
 */
export function useMostRecentSeason(leagueId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.seasons.byLeague(leagueId || ''), 'mostRecent'],
    queryFn: () => getMostRecentSeason(leagueId!),
    enabled: !!leagueId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch active season for a league
 *
 * Gets the season with status='active'.
 * Returns null if no active season exists.
 *
 * Cached for 2 minutes (shorter since season status changes during play).
 *
 * @param leagueId - League's primary key ID
 * @returns TanStack Query result with active season or null
 *
 * @example
 * const { data: activeSeason } = useActiveSeason(leagueId);
 * if (activeSeason) {
 *   return <ActiveSeasonDashboard season={activeSeason} />;
 * }
 * return <p>League is between seasons</p>;
 */
export function useActiveSeason(leagueId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.seasons.byLeague(leagueId || ''), 'active'],
    queryFn: () => getActiveSeason(leagueId!),
    enabled: !!leagueId,
    staleTime: STALE_TIME.SCHEDULES, // 10 minutes (active status changes)
    retry: 1,
    refetchOnWindowFocus: true, // Refetch when returning to page
  });
}

/**
 * Hook to fetch count of seasons for a league
 *
 * Efficient count-only query for league progress calculations.
 * Cached for 5 minutes.
 *
 * @param leagueId - League's primary key ID
 * @returns TanStack Query result with season count number
 *
 * @example
 * const { data: seasonCount = 0 } = useSeasonCount(leagueId);
 * return <p>This league has run {seasonCount} seasons</p>;
 */
export function useSeasonCount(leagueId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.seasons.byLeague(leagueId || ''), 'count'],
    queryFn: () => getSeasonCount(leagueId!),
    enabled: !!leagueId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes
    retry: 1,
  });
}
