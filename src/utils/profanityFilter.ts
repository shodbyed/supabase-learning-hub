/**
 * @fileoverview Profanity Filter Utilities
 *
 * Wrapper around @2toad/profanity package providing two main use cases:
 * 1. Validation - Check if text contains profanity (for team names, reject entry)
 * 2. Display Filtering - Censor profanity in text (for messages, filter on display)
 *
 * Age-based enforcement: Users under 18 have filter forced ON
 * Operator control: Operators can enable org-wide profanity validation
 *
 * TODO: Add profanity validation to ALL locations where team names can be created or changed.
 * Currently implemented in:
 * - /src/operator/TeamEditorModal.tsx (team creation/editing)
 *
 * NEEDS IMPLEMENTATION in any other components that allow team name entry or modification.
 *
 * EASY IMPLEMENTATION - Just add these lines:
 *
 * ```typescript
 * import { useOperatorProfanityFilter } from '@/hooks/useOperatorProfanityFilter';
 * import { containsProfanity } from '@/utils/profanityFilter';
 *
 * // In your component:
 * const { shouldValidate } = useOperatorProfanityFilter(leagueId);
 *
 * // In your validation function:
 * if (shouldValidate && containsProfanity(teamName)) {
 *   return 'Team name contains inappropriate language. Please choose a different name.';
 * }
 * ```
 */

import { profanity } from '@2toad/profanity';

/**
 * Check if text contains profanity
 * Used for validation (team names, league names, etc.)
 *
 * @param text - The text to check for profanity
 * @returns true if profanity is detected, false otherwise
 *
 * @example
 * if (containsProfanity(teamName)) {
 *   throw new Error('Team name contains inappropriate language');
 * }
 */
export function containsProfanity(text: string): boolean {
  if (!text || text.trim() === '') {
    return false;
  }
  return profanity.exists(text);
}

/**
 * Censor profanity in text by replacing it with asterisks
 * Used for display-time filtering in messages
 *
 * @param text - The text to filter
 * @returns The text with profanity replaced by asterisks
 *
 * @example
 * const filtered = censorProfanity('This is a damn good game');
 * // Returns: "This is a **** good game"
 */
export function censorProfanity(text: string): string {
  if (!text || text.trim() === '') {
    return text;
  }
  return profanity.censor(text);
}

/**
 * Add custom words to the profanity filter
 * Useful for organization-specific or context-specific words
 *
 * @param words - Array of words to add to the profanity list
 *
 * @example
 * addCustomProfanity(['badword1', 'badword2']);
 */
export function addCustomProfanity(words: string[]): void {
  profanity.addWords(words);
}

/**
 * Remove words from the profanity filter
 * Useful for whitelisting words that may be flagged incorrectly
 *
 * @param words - Array of words to remove from the profanity list
 *
 * @example
 * removeCustomProfanity(['arsenal', 'scunthorpe']);
 */
export function removeCustomProfanity(words: string[]): void {
  profanity.removeWords(words);
}
