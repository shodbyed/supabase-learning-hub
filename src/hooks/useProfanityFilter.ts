/**
 * @fileoverview useProfanityFilter Hook
 *
 * Calculates effective profanity filter setting for the current user.
 * Enforces age-based filtering: Users under 18 have filter forced ON.
 * Users 18+ can toggle their filter preference in settings.
 *
 * @returns {Object} Profanity filter state
 * @property {boolean} shouldFilter - Whether profanity should be filtered for this user
 * @property {boolean} canToggle - Whether user can toggle filter (false if under 18)
 * @property {boolean} isLoading - Whether data is still loading
 */

import { useState, useEffect, useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import { supabase } from '@/supabaseClient';
import { parseLocalDate } from '@/utils/formatters';

interface ProfanityFilterState {
  shouldFilter: boolean;
  canToggle: boolean;
  isLoading: boolean;
}

export function useProfanityFilter(): ProfanityFilterState {
  const userContext = useContext(UserContext);
  const [state, setState] = useState<ProfanityFilterState>({
    shouldFilter: false,
    canToggle: true,
    isLoading: true,
  });

  useEffect(() => {
    async function calculateFilterState() {
      if (!userContext?.user?.id) {
        setState({ shouldFilter: false, canToggle: true, isLoading: false });
        return;
      }

      // Fetch member data including DOB and filter preference
      const { data: member, error } = await supabase
        .from('members')
        .select('date_of_birth, profanity_filter_enabled')
        .eq('user_id', userContext.user.id)
        .single();

      if (error || !member) {
        console.error('Error fetching member profanity filter settings:', error);
        setState({ shouldFilter: false, canToggle: true, isLoading: false });
        return;
      }

      // Calculate age from date of birth
      const dob = parseLocalDate(member.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();

      // Adjust age if birthday hasn't occurred yet this year
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }

      // Users under 18: Filter forced ON, cannot toggle
      if (age < 18) {
        setState({ shouldFilter: true, canToggle: false, isLoading: false });
        return;
      }

      // Users 18+: Filter based on their preference, can toggle
      setState({
        shouldFilter: member.profanity_filter_enabled || false,
        canToggle: true,
        isLoading: false,
      });
    }

    calculateFilterState();
  }, [userContext?.user?.id]);

  return state;
}

/**
 * Toggle profanity filter for current user
 * Only works for users 18+, returns error for users under 18
 *
 * @param userId - The member's user_id
 * @param enabled - New filter state
 * @returns Promise with error if any
 */
export async function updateProfanityFilter(
  userId: string,
  enabled: boolean
): Promise<{ error: Error | null }> {
  // First check if user is 18+
  const { data: member, error: fetchError } = await supabase
    .from('members')
    .select('date_of_birth')
    .eq('user_id', userId)
    .single();

  if (fetchError || !member) {
    return { error: fetchError || new Error('Member not found') };
  }

  // Calculate age
  const dob = parseLocalDate(member.date_of_birth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  // Prevent changes for users under 18
  if (age < 18) {
    return { error: new Error('Users under 18 cannot modify profanity filter settings') };
  }

  // Update filter preference
  const { error: updateError } = await supabase
    .from('members')
    .update({ profanity_filter_enabled: enabled })
    .eq('user_id', userId);

  if (updateError) {
    return { error: updateError };
  }

  return { error: null };
}
