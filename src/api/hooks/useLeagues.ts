/**
 * @fileoverview League Query Hooks (TanStack Query)
 *
 * React hooks for fetching league data with automatic caching.
 * Wraps pure query functions with TanStack Query for state management.
 *
 * Benefits:
 * - Automatic caching (fetch once, reuse everywhere)
 * - No duplicate requests (deduplication across components)
 * - Background refetching keeps data fresh
 * - Built-in loading/error states
 *
 * @see api/queries/leagues.ts - Pure query functions
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import {
  getLeaguesByOperator,
  getLeagueCount,
  getLeagueById,
  getLeaguesWithProgress,
  getOperatorProfanityFilter,
} from '../queries/leagues';
import { STALE_TIME } from '../client';

/**
 * Hook to fetch all leagues for an operator
 *
 * Gets basic league data without progress calculations.
 * Cached for 5 minutes - leagues don't change frequently.
 *
 * @param operatorId - Operator's primary key ID
 * @returns TanStack Query result with array of leagues
 *
 * @example
 * const { data: leagues = [], isLoading } = useLeaguesByOperator(operatorId);
 * if (isLoading) return <LoadingSpinner />;
 * return leagues.map(league => <LeagueCard key={league.id} league={league} />);
 */
export function useLeaguesByOperator(operatorId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.leagues.byOperator(operatorId || ''),
    queryFn: () => getLeaguesByOperator(operatorId!),
    enabled: !!operatorId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch count of leagues for an operator
 *
 * Efficient count-only query for dashboard stats.
 * Cached for 5 minutes.
 *
 * @param operatorId - Operator's primary key ID
 * @returns TanStack Query result with league count number
 *
 * @example
 * const { data: leagueCount = 0 } = useLeagueCount(operatorId);
 * return <StatCard title="Total Leagues" value={leagueCount} />;
 */
export function useLeagueCount(operatorId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.leagues.byOperator(operatorId || ''), 'count'],
    queryFn: () => getLeagueCount(operatorId!),
    enabled: !!operatorId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch league by ID
 *
 * Gets complete league record.
 * Cached for 5 minutes.
 *
 * @param leagueId - League's primary key ID
 * @returns TanStack Query result with league data
 *
 * @example
 * const { data: league, isLoading, error } = useLeagueById(leagueId);
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 * return <h1>{league.game_type} - {league.day_of_week}</h1>;
 */
export function useLeagueById(leagueId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.leagues.detail(leagueId || ''),
    queryFn: () => getLeagueById(leagueId!),
    enabled: !!leagueId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch leagues with progress data
 *
 * EXPENSIVE QUERY - Makes multiple database calls per league.
 * Use sparingly and only when progress data is truly needed.
 * Prefer useLeaguesByOperator for simple lists.
 *
 * Cached for 2 minutes (shorter than basic queries since progress changes more often).
 *
 * @param operatorId - Operator's primary key ID
 * @returns TanStack Query result with leagues including _progress data
 *
 * @example
 * const { data: leagues = [], isLoading } = useLeaguesWithProgress(operatorId);
 * return leagues.map(league => (
 *   <LeagueCard
 *     key={league.id}
 *     league={league}
 *     progress={league._progress}
 *   />
 * ));
 */
export function useLeaguesWithProgress(operatorId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.leagues.byOperator(operatorId || ''), 'withProgress'],
    queryFn: () => getLeaguesWithProgress(operatorId!),
    enabled: !!operatorId,
    staleTime: STALE_TIME.SCHEDULES, // 10 minutes (progress changes more frequently)
    retry: 1,
    refetchOnWindowFocus: true, // Refetch when returning to dashboard
  });
}

/**
 * Hook to fetch operator's profanity filter setting for a league
 *
 * Gets whether profanity validation should be enforced for team names
 * and organization content based on the league operator's setting.
 * Used by TeamEditorModal to validate team name input.
 *
 * Cached for 15 minutes - operator settings don't change frequently.
 *
 * @param leagueId - League's primary key ID
 * @returns TanStack Query result with boolean indicating if filter is enabled
 *
 * @example
 * const { data: shouldValidate = false, isLoading } = useOperatorProfanityFilter(leagueId);
 * if (shouldValidate && containsProfanity(teamName)) {
 *   setError('Team name contains inappropriate language');
 * }
 */
export function useOperatorProfanityFilter(leagueId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.leagues.detail(leagueId || ''), 'operatorProfanityFilter'],
    queryFn: () => getOperatorProfanityFilter(leagueId!),
    enabled: !!leagueId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes
    retry: 1,
  });
}
