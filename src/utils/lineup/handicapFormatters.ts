/**
 * @fileoverview Handicap Formatting Utilities
 *
 * Pure functions for formatting and displaying handicap values.
 * Supports both 3v3 (integer) and 5v5 (percentage) formats.
 */

/**
 * Format handicap display
 * Shows whole number if .0, otherwise shows 1 decimal place
 *
 * @param handicap - The handicap value to format
 * @param showPercentage - If true, appends '%' to the value (for 5v5)
 * @returns Formatted string (e.g., "5" or "5.5" or "75%")
 *
 * @example
 * formatHandicap(5.0)         // "5"
 * formatHandicap(5.5)         // "5.5"
 * formatHandicap(75, true)    // "75%"
 * formatHandicap(82.5, true)  // "82.5%"
 */
export function formatHandicap(handicap: number, showPercentage: boolean = false): string {
  const formatted = handicap % 1 === 0 ? handicap.toString() : handicap.toFixed(1);
  return showPercentage ? `${formatted}%` : formatted;
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
