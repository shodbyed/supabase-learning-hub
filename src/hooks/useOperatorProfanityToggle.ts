/**
 * @fileoverview Organization Profanity Filter Toggle Hook
 *
 * Manages profanity filter toggle state and database updates for organization settings.
 * Uses TanStack Query mutation for database operations.
 */

import { useState } from 'react';
import { useUpdateOrganizationProfanityFilter } from '@/api/hooks/useOrganizationMutations';
import { logger } from '@/utils/logger';

interface UseOperatorProfanityToggleReturn {
  /** Toggle profanity filter on/off */
  toggleFilter: () => Promise<void>;
  /** Is save operation in progress? */
  isSaving: boolean;
  /** Did save succeed recently? (auto-clears after 3s) */
  success: boolean;
}

/**
 * Hook to manage profanity filter toggle for an organization
 *
 * Handles:
 * - Toggling filter on/off
 * - Saving to database via TanStack Query mutation
 * - Success message display
 *
 * @param organizationId - Organization's primary key ID
 * @param currentEnabled - Current profanity filter enabled state
 * @param onToggleSuccess - Callback when toggle succeeds with new value
 * @returns Toggle function and state
 *
 * @example
 * const { toggleFilter, isSaving, success } = useOperatorProfanityToggle(
 *   organizationId,
 *   profanityFilterEnabled,
 *   (newValue) => setProfanityFilterEnabled(newValue)
 * );
 */
export function useOperatorProfanityToggle(
  organizationId: string | null,
  currentEnabled: boolean,
  onToggleSuccess: (newValue: boolean) => void
): UseOperatorProfanityToggleReturn {
  const [success, setSuccess] = useState(false);
  const updateFilterMutation = useUpdateOrganizationProfanityFilter();

  /**
   * Toggle profanity filter and save to database
   */
  const toggleFilter = async () => {
    if (!organizationId) return;

    setSuccess(false);

    const newValue = !currentEnabled;

    try {
      await updateFilterMutation.mutateAsync({
        organizationId,
        enabled: newValue,
      });

      // Update parent component state via callback
      onToggleSuccess(newValue);
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      logger.error('Failed to update profanity filter', {
        error: err instanceof Error ? err.message : String(err),
        organizationId,
        newValue
      });
      alert('Failed to update profanity filter. Please try again.');
    }
  };

  return {
    toggleFilter,
    isSaving: updateFilterMutation.isPending,
    success,
  };
}
