/**
 * @fileoverview Table Assignment Utilities
 *
 * Functions for calculating which table a match should be assigned to.
 * Tables are assigned based on match order at each venue - the first match
 * at a venue gets the first table in the available_table_numbers array,
 * the second match gets the second table, etc.
 *
 * This is calculated on-the-fly rather than stored, so if venues change
 * or table configurations change, the assignments automatically update.
 */

/**
 * Minimal match data needed for table assignment
 */
interface MatchForTableAssignment {
  scheduled_venue_id: string | null;
  match_number: number;
  season_week_id: string;
}

/**
 * League venue data needed for table assignment
 */
interface LeagueVenueForTableAssignment {
  venue_id: string;
  available_table_numbers: number[];
}

/**
 * Get the assigned table number for a specific match
 *
 * Tables are assigned based on match order at each venue:
 * - All matches at a venue for a given week are sorted by match_number
 * - The first match gets available_table_numbers[0]
 * - The second match gets available_table_numbers[1]
 * - etc.
 *
 * @param match - The match to get the table for
 * @param allWeekMatches - All matches in the same season week
 * @param leagueVenues - League venues with their available_table_numbers arrays
 * @returns The assigned table number, or null if:
 *   - Match has no scheduled venue
 *   - Venue not found in leagueVenues
 *   - Not enough tables available at the venue
 *
 * @example
 * // Week 1 has 4 matches: 1 & 3 at Venue A, 2 & 4 at Venue B
 * // Venue A has available_table_numbers: [5, 2, 8]
 * // Match 1 at Venue A -> position 0 -> Table 5
 * // Match 3 at Venue A -> position 1 -> Table 2
 */
export function getAssignedTableForMatch(
  match: MatchForTableAssignment,
  allWeekMatches: MatchForTableAssignment[],
  leagueVenues: LeagueVenueForTableAssignment[]
): number | null {
  // No venue assigned to match
  if (!match.scheduled_venue_id) {
    return null;
  }

  // Get all matches at this venue for this week, sorted by match_number
  const matchesAtVenue = allWeekMatches
    .filter(m => m.scheduled_venue_id === match.scheduled_venue_id)
    .sort((a, b) => a.match_number - b.match_number);

  // Find this match's position in the venue lineup (0-indexed)
  const position = matchesAtVenue.findIndex(m => m.match_number === match.match_number);
  if (position === -1) {
    return null;
  }

  // Get available tables for this venue from league_venues
  const leagueVenue = leagueVenues.find(lv => lv.venue_id === match.scheduled_venue_id);
  if (!leagueVenue || !leagueVenue.available_table_numbers) {
    return null;
  }

  // Return the table at this position (or null if not enough tables)
  return leagueVenue.available_table_numbers[position] ?? null;
}

/**
 * Get table assignments for all matches in a week
 *
 * Returns a map of match_number to assigned table number.
 * Useful for displaying all assignments at once.
 *
 * @param allWeekMatches - All matches in the season week
 * @param leagueVenues - League venues with their available_table_numbers arrays
 * @returns Map of match_number to table number (or null if unassigned)
 */
export function getTableAssignmentsForWeek(
  allWeekMatches: MatchForTableAssignment[],
  leagueVenues: LeagueVenueForTableAssignment[]
): Map<number, number | null> {
  const assignments = new Map<number, number | null>();

  for (const match of allWeekMatches) {
    const table = getAssignedTableForMatch(match, allWeekMatches, leagueVenues);
    assignments.set(match.match_number, table);
  }

  return assignments;
}

/**
 * Check if a venue has enough tables for all matches scheduled there
 *
 * @param venueId - The venue to check
 * @param allWeekMatches - All matches in the season week
 * @param leagueVenues - League venues with their available_table_numbers arrays
 * @returns Object with hasEnoughTables boolean and details
 */
export function checkVenueTableCapacity(
  venueId: string,
  allWeekMatches: MatchForTableAssignment[],
  leagueVenues: LeagueVenueForTableAssignment[]
): {
  hasEnoughTables: boolean;
  matchesAtVenue: number;
  availableTables: number;
  shortfall: number;
} {
  const matchesAtVenue = allWeekMatches.filter(m => m.scheduled_venue_id === venueId).length;
  const leagueVenue = leagueVenues.find(lv => lv.venue_id === venueId);
  const availableTables = leagueVenue?.available_table_numbers?.length ?? 0;

  return {
    hasEnoughTables: availableTables >= matchesAtVenue,
    matchesAtVenue,
    availableTables,
    shortfall: Math.max(0, matchesAtVenue - availableTables),
  };
}
