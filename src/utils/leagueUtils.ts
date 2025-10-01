/**
 * @fileoverview League Utility Functions
 *
 * Reusable functions for league management including season detection,
 * league name generation, and date calculations.
 * Based on reference code patterns from globalFunctions.ts and dateFunctions.ts
 */

/**
 * Determines the season based on a date
 * Spring: March, April, May (months 2-4)
 * Summer: June, July, August (months 5-7)
 * Fall: September, October, November (months 8-10)
 * Winter: December, January, February (months 11, 0, 1)
 *
 * @param date - The date to determine the season for
 * @returns The season name
 */
export const getTimeOfYear = (date: Date): string => {
  const month = date.getMonth();

  if (month >= 2 && month <= 4) {
    return 'Spring';
  } else if (month >= 5 && month <= 7) {
    return 'Summer';
  } else if (month >= 8 && month <= 10) {
    return 'Fall';
  } else {
    return 'Winter';
  }
};

/**
 * Gets the day of the week name from a date
 *
 * @param date - The date to get the day name for
 * @returns The day name (e.g., "Tuesday")
 */
export const getDayOfWeek = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

/**
 * Builds a league name from components
 * Format: "Game Day Season Year Venue/Organization"
 * Example: "9-Ball Tuesday Spring 2024 Acme Leagues"
 *
 * @param startDate - The league start date
 * @param gameType - The game type (8-ball, 9-ball, 10-ball)
 * @param organizationName - The organization name
 * @param qualifier - Optional qualifier (e.g., "West Side", "Blue")
 * @returns The formatted league name
 */
export const buildLeagueName = (
  startDate: string,
  gameType: string,
  organizationName: string,
  qualifier?: string
): string => {
  if (!startDate) {
    return 'League Name Preview';
  }

  const date = new Date(startDate);
  if (isNaN(date.getTime())) {
    return 'League Name Preview';
  }

  const parts: string[] = [];

  // Game type
  if (gameType) {
    const gameNames = {
      'eight_ball': '8-Ball',
      'nine_ball': '9-Ball',
      'ten_ball': '10-Ball'
    };
    parts.push(gameNames[gameType as keyof typeof gameNames] || gameType);
  }

  // Day of week
  parts.push(getDayOfWeek(date));

  // Season and year
  parts.push(getTimeOfYear(date));
  parts.push(date.getFullYear().toString());

  // Organization name (or venue for traveling leagues)
  if (organizationName) {
    parts.push(organizationName);
  }

  // Optional qualifier
  if (qualifier && qualifier.trim()) {
    parts.push(qualifier.trim());
  }

  return parts.length > 0 ? parts.join(' ') : 'League Name Preview';
};

/**
 * Generates all formatted league names for database storage
 *
 * @param components - The league components
 * @returns Object with all formatted name variations
 */
export const generateAllLeagueNames = (components: {
  organizationName: string;
  year: number;
  season: string;
  gameType: string;
  dayOfWeek: string;
  qualifier?: string;
}) => {
  const { organizationName, year, season, gameType, dayOfWeek, qualifier } = components;

  const gameDisplay = gameType.replace('_', '-').replace(/\b\w/g, l => l.toUpperCase());
  const qualifierPart = qualifier ? ` ${qualifier}` : '';

  return {
    // For reliable database sorting and parsing
    systematicName: `${organizationName} | ${year} | ${season} | ${gameDisplay} | ${dayOfWeek}${qualifier ? ` | ${qualifier}` : ''}`,

    // For player-friendly display
    playerFriendlyName: `${gameDisplay} ${dayOfWeek} ${season} ${year}${qualifierPart}`,

    // For operator management view
    operatorName: `${year} ${season} ${gameDisplay} ${dayOfWeek}${qualifierPart}`,

    // For mixed contexts with organization
    fullDisplayName: `${gameDisplay} ${dayOfWeek} ${season} ${year}${qualifierPart} (${organizationName})`
  };
};