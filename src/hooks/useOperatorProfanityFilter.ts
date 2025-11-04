/**
 * @fileoverview useOperatorProfanityFilter Hook (TanStack Query wrapper)
 *
 * Fetches the operator's profanity filter setting for a given league.
 * Returns whether profanity validation should be enforced for team names and org content.
 *
 * Now uses TanStack Query internally for caching and state management.
 *
 * @example
 * const { shouldValidate, isLoading } = useOperatorProfanityFilter(leagueId);
 * if (shouldValidate && containsProfanity(teamName)) {
 *   setError('Team name contains inappropriate language...');
 * }
 */

import { useOperatorProfanityFilter as useProfanityFilterQuery } from '@/api/hooks/useLeagues';

interface OperatorProfanityFilterState {
  shouldValidate: boolean;
  isLoading: boolean;
}

/**
 * Hook to check if operator has profanity filter enabled for a league
 *
 * @param leagueId - The league ID to check operator settings for
 * @returns Object with shouldValidate flag and loading state
 */
export function useOperatorProfanityFilter(leagueId: string): OperatorProfanityFilterState {
  const { data: shouldValidate = false, isLoading } = useProfanityFilterQuery(leagueId);

  return {
    shouldValidate,
    isLoading,
  };
}
