/**
 * @fileoverview Match Query Hooks (TanStack Query)
 *
 * React hooks for fetching match data with automatic caching.
 * Wraps pure query functions with TanStack Query for state management.
 *
 * Benefits:
 * - Automatic caching (fetch once, reuse everywhere)
 * - No duplicate requests (deduplication across components)
 * - Background refetching keeps data fresh
 * - Built-in loading/error states
 *
 * @see api/queries/matches.ts - Pure query functions
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import {
  getMatchById,
  getMatchesBySeason,
  getMatchesByTeam,
  getSeasonSchedule,
  getSeasonWeeks,
} from '../queries/matches';
import { STALE_TIME } from '../client';

/**
 * Hook to fetch match by ID with all details
 *
 * Gets complete match record with team, venue, and week details.
 * Cached for 2 minutes (matches can change during scoring).
 *
 * @param matchId - Match's primary key ID
 * @returns TanStack Query result with match data
 *
 * @example
 * const { data: match, isLoading, error } = useMatchById(matchId);
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 * return <MatchCard match={match} />;
 */
export function useMatchById(matchId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.matches.detail(matchId || ''),
    queryFn: () => getMatchById(matchId!),
    enabled: !!matchId,
    staleTime: STALE_TIME.SCHEDULES, // 10 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch all matches for a season
 *
 * Gets all matches with team, venue, and week details.
 * Ordered by match number.
 * Cached for 10 minutes.
 *
 * @param seasonId - Season's primary key ID
 * @returns TanStack Query result with array of matches
 *
 * @example
 * const { data: matches = [], isLoading } = useMatchesBySeason(seasonId);
 * return matches.map(match => (
 *   <MatchRow key={match.id} match={match} />
 * ));
 */
export function useMatchesBySeason(seasonId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.matches.all, 'season', seasonId],
    queryFn: () => getMatchesBySeason(seasonId!),
    enabled: !!seasonId,
    staleTime: STALE_TIME.SCHEDULES, // 10 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch all matches for a team
 *
 * Gets all matches where team is home or away.
 * Ordered by scheduled date.
 * Cached for 10 minutes.
 *
 * @param teamId - Team's primary key ID
 * @returns TanStack Query result with array of matches
 *
 * @example
 * const { data: matches = [], isLoading } = useMatchesByTeam(teamId);
 * const upcomingMatches = matches.filter(m => m.status === 'scheduled');
 * return <TeamSchedule matches={upcomingMatches} />;
 */
export function useMatchesByTeam(teamId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.matches.all, 'team', teamId],
    queryFn: () => getMatchesByTeam(teamId!),
    enabled: !!teamId,
    staleTime: STALE_TIME.SCHEDULES, // 10 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch season schedule organized by week
 *
 * Gets all weeks and matches for a season, organized hierarchically.
 * Used for displaying full season schedule with week groupings.
 * Cached for 10 minutes.
 *
 * @param seasonId - Season's primary key ID
 * @returns TanStack Query result with week schedule data
 *
 * @example
 * const { data: schedule = [], isLoading } = useSeasonSchedule(seasonId);
 * return schedule.map(({ week, matches }) => (
 *   <WeekSection key={week.id} week={week} matches={matches} />
 * ));
 */
export function useSeasonSchedule(seasonId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.schedules.bySeason(seasonId || ''),
    queryFn: () => getSeasonSchedule(seasonId!),
    enabled: !!seasonId,
    staleTime: STALE_TIME.SCHEDULES, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: true, // Refetch when returning to schedule page
  });
}

/**
 * Hook to fetch season weeks
 *
 * Gets all week records (regular, blackout, playoffs, breaks).
 * Ordered by scheduled date.
 * Cached for 10 minutes.
 *
 * @param seasonId - Season's primary key ID
 * @returns TanStack Query result with array of weeks
 *
 * @example
 * const { data: weeks = [], isLoading } = useSeasonWeeks(seasonId);
 * const regularWeeks = weeks.filter(w => w.week_type === 'regular');
 * return <WeekSelector weeks={regularWeeks} />;
 */
export function useSeasonWeeks(seasonId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.schedules.bySeason(seasonId || ''), 'weeks'],
    queryFn: () => getSeasonWeeks(seasonId!),
    enabled: !!seasonId,
    staleTime: STALE_TIME.SCHEDULES, // 10 minutes
    retry: 1,
  });
}
