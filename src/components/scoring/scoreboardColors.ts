/**
 * @fileoverview Scoreboard Color Constants
 *
 * Single source of truth for team colors used across scoreboard components.
 * Change these values to update colors in:
 * - TeamStatsCard (5v5 scoreboard team stats)
 * - GameButtonRow (game scoring buttons)
 * - MatchScoreboard (3v3 scoreboard) - future
 */

/**
 * Home team colors (blue theme)
 */
export const HOME_TEAM_COLORS = {
  /** Background color for cards and buttons */
  bg: 'bg-blue-100',
  /** Hover state for buttons */
  bgHover: 'hover:bg-blue-200',
  /** Border color for cards */
  border: 'border-blue-200',
  /** Darker border for inner elements */
  borderDark: 'border-blue-300',
  /** Header/title text color */
  headerText: 'text-blue-900',
  /** Threshold/accent text color */
  accentText: 'text-blue-600',
} as const;

/**
 * Away team colors (orange theme)
 */
export const AWAY_TEAM_COLORS = {
  /** Background color for cards and buttons */
  bg: 'bg-orange-100',
  /** Hover state for buttons */
  bgHover: 'hover:bg-orange-200',
  /** Border color for cards */
  border: 'border-orange-200',
  /** Darker border for inner elements */
  borderDark: 'border-orange-300',
  /** Header/title text color */
  headerText: 'text-orange-900',
  /** Threshold/accent text color */
  accentText: 'text-orange-600',
} as const;

/**
 * Helper to get team colors based on isHome flag
 */
export function getTeamColors(isHome: boolean) {
  return isHome ? HOME_TEAM_COLORS : AWAY_TEAM_COLORS;
}
