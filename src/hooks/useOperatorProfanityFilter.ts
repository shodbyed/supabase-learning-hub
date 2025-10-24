/**
 * @fileoverview useOperatorProfanityFilter Hook
 *
 * Fetches the operator's profanity filter setting for a given league.
 * Returns whether profanity validation should be enforced for team names and org content.
 *
 * @example
 * const { shouldValidate, isLoading } = useOperatorProfanityFilter(leagueId);
 * if (shouldValidate && containsProfanity(teamName)) {
 *   setError('Team name contains inappropriate language...');
 * }
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

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
  const [state, setState] = useState<OperatorProfanityFilterState>({
    shouldValidate: false,
    isLoading: true,
  });

  useEffect(() => {
    async function fetchOperatorSetting() {
      if (!leagueId) {
        setState({ shouldValidate: false, isLoading: false });
        return;
      }

      // Fetch league to get operator_id
      const { data: league, error: leagueError } = await supabase
        .from('leagues')
        .select('operator_id')
        .eq('id', leagueId)
        .single();

      if (leagueError || !league) {
        console.error('Error fetching league for profanity filter check:', leagueError);
        setState({ shouldValidate: false, isLoading: false });
        return;
      }

      // Fetch operator's profanity filter setting
      const { data: operator, error: operatorError } = await supabase
        .from('league_operators')
        .select('profanity_filter_enabled')
        .eq('id', league.operator_id)
        .single();

      if (operatorError || !operator) {
        console.error('Error fetching operator profanity filter setting:', operatorError);
        setState({ shouldValidate: false, isLoading: false });
        return;
      }

      setState({
        shouldValidate: operator.profanity_filter_enabled || false,
        isLoading: false,
      });
    }

    fetchOperatorSetting();
  }, [leagueId]);

  return state;
}
