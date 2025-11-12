/**
 * @fileoverview Season utility functions
 *
 * Helper functions for working with season data, including:
 * - Finding the most recent season from a list
 * - Season data processing and transformation
 */

import type { Season } from '@/types/season';

/**
 * Get the most recent season from an array of seasons
 *
 * Assumes the array is already sorted by created_at descending (most recent first).
 * If you need to sort an unsorted array, use this function with a pre-sorted array
 * or sort it first using: seasons.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
 *
 * @param seasons - Array of seasons, should be sorted by created_at descending
 * @returns The most recent season or null if array is empty
 *
 * @example
 * const mostRecent = getMostRecentSeason(existingSeasons);
 * if (mostRecent) {
 *   console.log('Most recent season:', mostRecent.season_name);
 * }
 */
export function getMostRecentSeason(seasons: Season[]): Season | null {
  if (!seasons || seasons.length === 0) {
    return null;
  }
  return seasons[0];
}

/**
 * Check if a league has any existing seasons
 *
 * @param seasons - Array of seasons
 * @returns True if there are one or more seasons
 */
export function hasExistingSeasons(seasons: Season[]): boolean {
  return seasons && seasons.length > 0;
}
