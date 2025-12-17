/**
 * @fileoverview Days of week constants for form selects
 * Used in league creation and player search forms
 */

/**
 * Days of week for form select dropdowns
 * Capitalized for display (SelectField uses value as both value and label)
 */
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export type DayOfWeekDisplay = (typeof DAYS_OF_WEEK)[number];
