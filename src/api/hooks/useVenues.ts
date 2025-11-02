/**
 * @fileoverview Venue Query Hooks (TanStack Query)
 *
 * React hooks for fetching venue data with automatic caching.
 * Wraps pure query functions with TanStack Query for state management.
 *
 * Benefits:
 * - Automatic caching (fetch once, reuse everywhere)
 * - No duplicate requests (deduplication across components)
 * - Background refetching keeps data fresh
 * - Built-in loading/error states
 *
 * @see api/queries/venues.ts - Pure query functions
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import {
  getVenuesByOperator,
  getVenueById,
  getLeagueVenues,
  getLeagueVenuesWithDetails,
} from '../queries/venues';
import { STALE_TIME } from '../client';

/**
 * Hook to fetch all active venues for an operator
 *
 * Gets venues created by the operator that are currently active.
 * Ordered alphabetically by name.
 * Cached for 15 minutes (venues don't change frequently).
 *
 * @param operatorId - Operator's primary key ID
 * @returns TanStack Query result with array of venues
 *
 * @example
 * const { data: venues = [], isLoading } = useVenuesByOperator(operatorId);
 * return venues.map(venue => <VenueCard key={venue.id} venue={venue} />);
 */
export function useVenuesByOperator(operatorId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.venues.byOperator(operatorId || ''),
    queryFn: () => getVenuesByOperator(operatorId!),
    enabled: !!operatorId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch venue by ID
 *
 * Gets complete venue record.
 * Cached for 15 minutes.
 *
 * @param venueId - Venue's primary key ID
 * @returns TanStack Query result with venue data
 *
 * @example
 * const { data: venue, isLoading, error } = useVenueById(venueId);
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 * return <h1>{venue.name}</h1>;
 */
export function useVenueById(venueId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.venues.detail(venueId || ''),
    queryFn: () => getVenueById(venueId!),
    enabled: !!venueId,
    staleTime: STALE_TIME.LEAGUES, // 15 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch league venue assignments
 *
 * Gets all venue assignments (with table limits) for a league.
 * Cached for 10 minutes.
 *
 * @param leagueId - League's primary key ID
 * @returns TanStack Query result with array of league venues
 *
 * @example
 * const { data: leagueVenues = [], isLoading } = useLeagueVenues(leagueId);
 * return leagueVenues.map(lv => (
 *   <div key={lv.id}>{lv.available_regulation_tables} tables</div>
 * ));
 */
export function useLeagueVenues(leagueId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.leagues.detail(leagueId || ''), 'venues'],
    queryFn: () => getLeagueVenues(leagueId!),
    enabled: !!leagueId,
    staleTime: STALE_TIME.SCHEDULES, // 10 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch league venues with full venue details
 *
 * Gets league venue assignments with expanded venue information.
 * Cached for 10 minutes.
 *
 * @param leagueId - League's primary key ID
 * @returns TanStack Query result with league venues + venue details
 *
 * @example
 * const { data: leagueVenues = [], isLoading } = useLeagueVenuesWithDetails(leagueId);
 * return leagueVenues.map(lv => (
 *   <div key={lv.id}>
 *     {lv.venue.name}: {lv.available_regulation_tables} tables
 *   </div>
 * ));
 */
export function useLeagueVenuesWithDetails(leagueId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.leagues.detail(leagueId || ''), 'venuesWithDetails'],
    queryFn: () => getLeagueVenuesWithDetails(leagueId!),
    enabled: !!leagueId,
    staleTime: STALE_TIME.SCHEDULES, // 10 minutes
    retry: 1,
  });
}
