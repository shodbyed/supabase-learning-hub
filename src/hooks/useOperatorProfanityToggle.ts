/**
 * @fileoverview Operator Profanity Filter Toggle Hook
 *
 * Manages profanity filter toggle state and database updates for organization settings.
 * Extracts toggle logic from OrganizationSettings component.
 */

import { useState } from 'react';
import { supabase } from '@/supabaseClient';

interface UseOperatorProfanityToggleReturn {
  /** Toggle profanity filter on/off */
  toggleFilter: () => Promise<void>;
  /** Is save operation in progress? */
  isSaving: boolean;
  /** Did save succeed recently? (auto-clears after 3s) */
  success: boolean;
}

/**
 * Hook to manage profanity filter toggle for an operator
 *
 * Handles:
 * - Toggling filter on/off
 * - Saving to database
 * - Success message display
 *
 * @param operatorId - Operator's primary key ID
 * @param currentEnabled - Current profanity filter enabled state
 * @param onToggleSuccess - Callback when toggle succeeds with new value
 * @returns Toggle function and state
 *
 * @example
 * const { toggleFilter, isSaving, success } = useOperatorProfanityToggle(
 *   operatorId,
 *   profanityFilterEnabled,
 *   (newValue) => setProfanityFilterEnabled(newValue)
 * );
 */
export function useOperatorProfanityToggle(
  operatorId: string | null,
  currentEnabled: boolean,
  onToggleSuccess: (newValue: boolean) => void
): UseOperatorProfanityToggleReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  /**
   * Toggle profanity filter and save to database
   */
  const toggleFilter = async () => {
    if (!operatorId) return;

    setIsSaving(true);
    setSuccess(false);

    const newValue = !currentEnabled;

    try {
      const { error } = await supabase
        .from('league_operators')
        .update({ profanity_filter_enabled: newValue })
        .eq('id', operatorId);

      if (error) throw error;

      // Update parent component state via callback
      onToggleSuccess(newValue);
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profanity filter:', err);
      alert('Failed to update profanity filter. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    toggleFilter,
    isSaving,
    success,
  };
}
