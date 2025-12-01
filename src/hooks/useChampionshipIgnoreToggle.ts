/**
 * @fileoverview Hook for toggling the "ignore" preference on championship dates.
 * When enabled, championship dates won't be flagged as scheduling conflicts.
 * Works with any championship type (BCA, APA, etc.).
 */

import { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { logger } from '@/utils/logger';

interface UseChampionshipIgnoreToggleReturn {
  /**
   * Toggles the ignore preference for a championship.
   * Switches between 'ignore' and 'blackout' preference actions.
   */
  toggleIgnore: () => Promise<void>;

  /**
   * Whether the toggle operation is in progress
   */
  isToggling: boolean;
}

/**
 * Hook to toggle the "ignore" preference for a championship.
 *
 * @param preferenceId - The ID of the operator_blackout_preferences record
 * @param currentAction - The current preference_action value ('ignore' or 'blackout')
 * @param onToggleSuccess - Callback to refetch preferences after successful toggle
 *
 * @returns Object with toggleIgnore function and isToggling state
 *
 * @example
 * const { toggleIgnore, isToggling } = useChampionshipIgnoreToggle(
 *   bcaPreference?.preference?.id,
 *   bcaPreference?.preference?.preference_action,
 *   refetchPreferences
 * );
 */
export function useChampionshipIgnoreToggle(
  preferenceId: string | null | undefined,
  currentAction: string | null | undefined,
  onToggleSuccess: () => Promise<void>
): UseChampionshipIgnoreToggleReturn {
  const [isToggling, setIsToggling] = useState(false);

  const toggleIgnore = async () => {
    if (!preferenceId || !currentAction) {
      logger.warn('Cannot toggle championship ignore', {
        hasPreferenceId: !!preferenceId,
        hasCurrentAction: !!currentAction
      });
      return;
    }

    setIsToggling(true);

    // Toggle between 'ignore' and 'blackout'
    const newAction = currentAction === 'ignore' ? 'blackout' : 'ignore';

    try {
      const { error } = await supabase
        .from('operator_blackout_preferences')
        .update({ preference_action: newAction })
        .eq('id', preferenceId);

      if (error) throw error;

      // Refetch preferences to update UI
      await onToggleSuccess();
    } catch (err) {
      logger.error('Failed to toggle championship ignore preference', {
        error: err instanceof Error ? err.message : String(err),
        preferenceId,
        currentAction,
        newAction
      });
    } finally {
      setIsToggling(false);
    }
  };

  return {
    toggleIgnore,
    isToggling,
  };
}
