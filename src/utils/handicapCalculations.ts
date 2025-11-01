/**
 * @fileoverview Handicap Calculation Utilities
 *
 * Handles dynamic handicap calculations based on game history and league variant.
 * Handicaps are calculated as: (wins - losses) / weeks_played
 * where weeks_played = games_played / 6
 *
 * Supports multiple handicap variants:
 * - standard: -2, -1, 0, 1, 2
 * - reduced: -1, 0, 1
 * - none: 0
 */

export type HandicapVariant = 'standard' | 'reduced' | 'none';

/**
 * Configuration for handicap calculation
 */
interface HandicapConfig {
  /** Number of recent games to include in calculation (e.g., 200) */
  gameHistoryLimit: number; // TODO: Make this adjustable at organization level
}

/**
 * Default configuration - can be overridden by organization settings
 */
const DEFAULT_CONFIG: HandicapConfig = {
  gameHistoryLimit: 200,
};

/**
 * Get the valid handicap range for a given variant
 */
function getHandicapRange(variant: HandicapVariant): number[] {
  switch (variant) {
    case 'standard':
      return [-2, -1, 0, 1, 2];
    case 'reduced':
      return [-1, 0, 1];
    case 'none':
      return [0];
    default:
      return [0];
  }
}

/**
 * Round handicap to nearest valid value in the variant's range
 * Currently unused but will be needed when implementing real handicap calculations
 */
function roundToValidHandicap(rawHandicap: number, variant: HandicapVariant): number {
  const range = getHandicapRange(variant);

  // For 'none' variant, always return 0
  if (variant === 'none') return 0;

  // Find the closest value in the range
  return range.reduce((prev, curr) => {
    return Math.abs(curr - rawHandicap) < Math.abs(prev - rawHandicap) ? curr : prev;
  });
}

// Suppress unused warning - this will be used when implementing real calculations
void roundToValidHandicap;

/**
 * Generate a random handicap for testing purposes
 */
function getRandomHandicap(variant: HandicapVariant): number {
  const range = getHandicapRange(variant);
  return range[Math.floor(Math.random() * range.length)];
}

/**
 * Calculate handicap for a player based on their game history
 *
 * @param playerId - The player's member ID
 * @param variant - The league's handicap variant ('standard', 'reduced', or 'none')
 * @param useRandom - If true, return random handicap for testing (default: false)
 * @param config - Optional configuration overrides
 * @returns The calculated handicap value
 *
 * Formula: (wins - losses) / weeks_played
 * where weeks_played = games_played / 6
 *
 * Usage:
 * - calculatePlayerHandicap(playerId, 'standard', true) → Random standard handicap (for testing)
 * - calculatePlayerHandicap(playerId, 'reduced', false) → Real reduced handicap (when implemented)
 * - calculatePlayerHandicap(playerId, 'none') → Always returns 0
 *
 * TODO: Implement the full calculation logic:
 * 1. Query the last N games for this player (N = config.gameHistoryLimit)
 * 2. Count total wins and losses from those games
 * 3. Calculate weeks_played = games_played / 6
 * 4. Calculate raw_handicap = (wins - losses) / weeks_played
 * 5. Round to nearest valid handicap in the variant's range
 * 6. Return the final handicap value
 */
export async function calculatePlayerHandicap(
  playerId: string,
  variant: HandicapVariant,
  useRandom: boolean = false,
  config: Partial<HandicapConfig> = {}
): Promise<number> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Suppress unused variable warnings - these will be used when implementing real calculations
  void playerId;
  void finalConfig;

  // For testing: return random handicap
  if (useRandom) {
    return getRandomHandicap(variant);
  }

  // TODO: Fetch game history from database
  // const gameHistory = await supabase
  //   .from('games')
  //   .select('*')
  //   .eq('player_id', playerId)
  //   .order('created_at', { ascending: false })
  //   .limit(finalConfig.gameHistoryLimit);

  // TODO: Calculate wins and losses from game history
  // let wins = 0;
  // let losses = 0;
  // for (const game of gameHistory.data) {
  //   if (game.winner_id === playerId) wins++;
  //   else losses++;
  // }

  // TODO: Calculate weeks played
  // const gamesPlayed = gameHistory.data?.length || 0;
  // const weeksPlayed = gamesPlayed / 6;

  // TODO: Calculate raw handicap
  // if (weeksPlayed === 0) return 0; // New player with no history
  // const rawHandicap = (wins - losses) / weeksPlayed;

  // TODO: Round to valid handicap for this variant
  // return roundToValidHandicap(rawHandicap, variant);

  // Placeholder: Return random handicap for testing until real implementation is ready
  return getRandomHandicap(variant);
}

/**
 * Calculate handicaps for multiple players
 *
 * @param playerIds - Array of player member IDs
 * @param variant - The league's handicap variant
 * @param useRandom - If true, return random handicaps for testing (default: false)
 * @param config - Optional configuration overrides
 * @returns Map of playerId to handicap value
 */
export async function calculatePlayerHandicaps(
  playerIds: string[],
  variant: HandicapVariant,
  useRandom: boolean = false,
  config: Partial<HandicapConfig> = {}
): Promise<Map<string, number>> {
  const handicaps = new Map<string, number>();

  // Calculate handicaps for all players
  await Promise.all(
    playerIds.map(async (playerId) => {
      const handicap = await calculatePlayerHandicap(playerId, variant, useRandom, config);
      handicaps.set(playerId, handicap);
    })
  );

  return handicaps;
}

/**
 * Get available handicap options for a substitute based on variant
 * Used in UI dropdowns for substitute handicap selection
 *
 * @param variant - The league's handicap variant
 * @returns Array of valid handicap values for display
 */
export function getSubstituteHandicapOptions(variant: HandicapVariant): number[] {
  return getHandicapRange(variant);
}

/**
 * Calculate team handicap bonus based on standings position
 *
 * Team handicap is only awarded to the HOME team and is based on the
 * difference in match WINS (not win/loss differential) between the two teams for the season.
 *
 * @param homeTeamId - The home team's ID
 * @param awayTeamId - The away team's ID
 * @param seasonId - The season ID to calculate standings from
 * @param variant - The league's team handicap variant ('standard', 'reduced', or 'none')
 * @param useRandom - If true, return random team handicap for testing (default: false)
 * @returns The team handicap bonus (can be positive, negative, or zero)
 *
 * Formula:
 * 1. Count home team's total match wins in the season
 * 2. Count away team's total match wins in the season
 * 3. Calculate difference: home_wins - away_wins
 * 4. Divide by threshold based on variant:
 *    - standard: every 2 wins ahead = +1 handicap
 *    - reduced: every 3 wins ahead = +1 handicap
 *    - none: always returns 0
 * 5. Round down to get final team handicap
 *
 * Examples (standard variant, every 2 wins ahead):
 * - Home 8 wins vs Away 7 wins: (8 - 7) = 1 → 1/2 = 0 bonus (floor division)
 * - Home 8 wins vs Away 6 wins: (8 - 6) = 2 → 2/2 = +1 bonus
 * - Home 8 wins vs Away 3 wins: (8 - 3) = 5 → 5/2 = +2 bonus
 * - Home 6 wins vs Away 10 wins: (6 - 10) = -4 → -4/2 = -2 penalty
 *
 * TODO: Implement the full calculation logic:
 * 1. Query matches table for all completed matches in this season for home team
 * 2. Count wins for home team (where winner_team_id = home_team_id)
 * 3. Query matches table for all completed matches in this season for away team
 * 4. Count wins for away team (where winner_team_id = away_team_id)
 * 5. Calculate win difference and apply formula
 * 6. Return the final team handicap
 */
export async function calculateTeamHandicap(
  homeTeamId: string,
  awayTeamId: string,
  seasonId: string,
  variant: HandicapVariant,
  useRandom: boolean = false
): Promise<number> {
  // Suppress unused variable warnings - these will be used when implementing real calculations
  void homeTeamId;
  void awayTeamId;
  void seasonId;

  // For 'none' variant, always return 0
  if (variant === 'none') {
    return 0;
  }

  // For testing: return random team handicap
  if (useRandom) {
    // Return a random value between -2 and +2 for testing
    return Math.floor(Math.random() * 5) - 2;
  }

  // TODO: Implement real calculation
  // const { data: homeMatches } = await supabase
  //   .from('matches')
  //   .select('winner_team_id')
  //   .eq('season_id', seasonId)
  //   .or(`home_team_id.eq.${homeTeamId},away_team_id.eq.${homeTeamId}`)
  //   .eq('status', 'completed');

  // let homeWins = 0;
  // for (const match of homeMatches.data || []) {
  //   if (match.winner_team_id === homeTeamId) homeWins++;
  // }

  // const { data: awayMatches } = await supabase
  //   .from('matches')
  //   .select('winner_team_id')
  //   .eq('season_id', seasonId)
  //   .or(`home_team_id.eq.${awayTeamId},away_team_id.eq.${awayTeamId}`)
  //   .eq('status', 'completed');

  // let awayWins = 0;
  // for (const match of awayMatches.data || []) {
  //   if (match.winner_team_id === awayTeamId) awayWins++;
  // }

  // const winDifference = homeWins - awayWins;
  // const threshold = variant === 'standard' ? 2 : 3;
  // return Math.floor(winDifference / threshold);

  // Placeholder: Return random team handicap for testing
  return Math.floor(Math.random() * 5) - 2;
}
