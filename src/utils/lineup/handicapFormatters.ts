/**
 * @fileoverview Handicap Formatting Utilities
 *
 * Pure functions for formatting and displaying handicap values.
 */

/**
 * Format handicap display
 * Shows whole number if .0, otherwise shows 1 decimal place
 *
 * @param handicap - The handicap value to format
 * @returns Formatted string (e.g., "5" or "5.5")
 *
 * @example
 * formatHandicap(5.0)  // "5"
 * formatHandicap(5.5)  // "5.5"
 * formatHandicap(5.75) // "5.8" (rounded to 1 decimal)
 */
export function formatHandicap(handicap: number): string {
  return handicap % 1 === 0 ? handicap.toString() : handicap.toFixed(1);
}

/**
 * Round handicap to 1 decimal place
 *
 * @param handicap - The handicap value to round
 * @returns Rounded value
 */
export function roundHandicap(handicap: number): number {
  return Math.round(handicap * 10) / 10;
}
