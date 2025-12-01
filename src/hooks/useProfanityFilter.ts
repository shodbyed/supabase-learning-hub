/**
 * @fileoverview useProfanityFilter Hook (TanStack Query Wrapper)
 *
 * Calculates effective profanity filter setting for the current user.
 * Enforces age-based filtering: Users under 18 have filter forced ON.
 * Users 18+ can toggle their filter preference in settings.
 *
 * Now uses TanStack Query internally for automatic caching and state management.
 *
 * @returns {Object} Profanity filter state
 * @property {boolean} shouldFilter - Whether profanity should be filtered for this user
 * @property {boolean} canToggle - Whether user can toggle filter (false if under 18)
 * @property {boolean} isLoading - Whether data is still loading
 */

import { useMemo } from 'react';
import { useUser } from '@/context/useUser';
import { useMemberProfanitySettings } from '@/api/hooks';
import { isEighteenOrOlder } from '@/utils/formatters';
import { logger } from '@/utils/logger';

interface ProfanityFilterState {
  shouldFilter: boolean;
  canToggle: boolean;
  isLoading: boolean;
}

export function useProfanityFilter(): ProfanityFilterState {
  const { user } = useUser();
  const { data: settings, isLoading, error } = useMemberProfanitySettings(user?.id);

  return useMemo(() => {
    // Loading state
    if (isLoading) {
      return { shouldFilter: false, canToggle: true, isLoading: true };
    }

    // Error or no data
    if (error || !settings) {
      logger.error('Error fetching member profanity filter settings', {
        error: error instanceof Error ? error.message : String(error),
        userId: user?.id
      });
      return { shouldFilter: false, canToggle: true, isLoading: false };
    }

    // Check if user is 18+ using helper function
    const isAdult = isEighteenOrOlder(settings.date_of_birth);

    // Users under 18: Filter forced ON, cannot toggle
    if (!isAdult) {
      return { shouldFilter: true, canToggle: false, isLoading: false };
    }

    // Users 18+: Filter based on their preference, can toggle
    return {
      shouldFilter: settings.profanity_filter_enabled || false,
      canToggle: true,
      isLoading: false,
    };
  }, [settings, isLoading, error]);
}
