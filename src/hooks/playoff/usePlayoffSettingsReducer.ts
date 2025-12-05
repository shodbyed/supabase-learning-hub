/**
 * @fileoverview Playoff Settings Reducer Hook
 *
 * Manages all playoff settings state using useReducer pattern.
 * This centralizes state management for the Organization Playoff Settings page
 * and will map directly to the database schema for saving/loading preferences.
 *
 * State is organized into two categories:
 * 1. Persistent settings - saved to database (qualification rules, playoff weeks, payment method)
 * 2. UI-only state - not saved (example team count, modal visibility)
 */

import { useReducer } from 'react';

/**
 * Qualification type for determining which teams qualify for playoffs
 */
export type QualificationType = 'all' | 'fixed' | 'percentage';

/**
 * Payment method for additional playoff weeks
 */
export type PaymentMethod = 'automatic' | 'manual';

/**
 * Matchup style for determining how teams are paired in each playoff week
 * - seeded: Best vs worst (1v8, 2v7, 3v6, 4v5) - rewards regular season performance
 * - ranked: Adjacent pairs (1v2, 3v4, 5v6, 7v8) - top teams face each other early
 * - random: Random pairings - all teams have equal chance
 * - bracket: Winners vs winners, losers vs losers from previous week
 */
export type MatchupStyle = 'seeded' | 'ranked' | 'random' | 'bracket';

/**
 * Playoff settings state structure
 * This mirrors what will be stored in the database
 */
export interface PlayoffSettingsState {
  // === Persistent Settings (saved to database) ===

  /** Number of playoff weeks */
  playoffWeeks: number;

  /** How teams qualify: all, fixed number, or percentage */
  qualificationType: QualificationType;

  /** Fixed number of teams that qualify (when qualificationType is 'fixed') */
  fixedTeamCount: number;

  /** Percentage of teams that qualify (when qualificationType is 'percentage') */
  qualifyingPercentage: number;

  /** Minimum teams for percentage-based qualification */
  percentageMin: number;

  /** Maximum teams for percentage-based qualification (null = no limit) */
  percentageMax: number | null;

  /** Payment method for additional playoff weeks */
  paymentMethod: PaymentMethod;

  /** Number of wildcard spots (0 = disabled, replaces last N bracket spots with random selection) */
  wildcardSpots: number;

  /**
   * Matchup style for each playoff week (indexed by week number - 1)
   * Week 1 defaults to 'seeded', subsequent weeks default to 'bracket'
   * Array length should match playoffWeeks
   */
  weekMatchupStyles: MatchupStyle[];

  // === UI-Only State (not persisted) ===

  /** Example team count for preview (not saved) */
  exampleTeamCount: number;

  /** Whether add weeks modal is open */
  showAddWeeksModal: boolean;

  /** Number of weeks to add in modal */
  weeksToAdd: number;
}

/**
 * Default initial state for playoff settings
 */
export const initialPlayoffSettingsState: PlayoffSettingsState = {
  // Persistent settings
  playoffWeeks: 1,
  qualificationType: 'all',
  fixedTeamCount: 4,
  qualifyingPercentage: 50,
  percentageMin: 4,
  percentageMax: null,
  paymentMethod: 'automatic',
  wildcardSpots: 0,
  weekMatchupStyles: ['seeded'], // Default: Week 1 is seeded

  // UI-only state
  exampleTeamCount: 4,
  showAddWeeksModal: false,
  weeksToAdd: 1,
};

/**
 * Action types for the playoff settings reducer
 */
export type PlayoffSettingsAction =
  // Persistent setting actions
  | { type: 'SET_PLAYOFF_WEEKS'; payload: number }
  | { type: 'ADD_PLAYOFF_WEEKS'; payload: number }
  | { type: 'SET_QUALIFICATION_TYPE'; payload: QualificationType }
  | { type: 'SET_FIXED_TEAM_COUNT'; payload: number }
  | { type: 'SET_QUALIFYING_PERCENTAGE'; payload: number }
  | { type: 'SET_PERCENTAGE_MIN'; payload: number }
  | { type: 'SET_PERCENTAGE_MAX'; payload: number | null }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'SET_WILDCARD_SPOTS'; payload: number }
  | { type: 'SET_WEEK_MATCHUP_STYLE'; payload: { weekIndex: number; style: MatchupStyle } }

  // UI-only actions
  | { type: 'SET_EXAMPLE_TEAM_COUNT'; payload: number }
  | { type: 'OPEN_ADD_WEEKS_MODAL' }
  | { type: 'CLOSE_ADD_WEEKS_MODAL' }
  | { type: 'SET_WEEKS_TO_ADD'; payload: number }

  // Bulk actions
  | { type: 'LOAD_SETTINGS'; payload: Partial<PlayoffSettingsState> }
  | { type: 'RESET_SETTINGS' };

/**
 * Helper to adjust weekMatchupStyles array when playoff weeks change
 * New weeks default to 'bracket' for week 2+, 'seeded' for week 1
 */
function adjustWeekMatchupStyles(
  currentStyles: MatchupStyle[],
  newWeekCount: number
): MatchupStyle[] {
  if (newWeekCount <= 0) return [];

  const newStyles = [...currentStyles];

  // Add new weeks with default styles
  while (newStyles.length < newWeekCount) {
    // Week 1 defaults to 'seeded', subsequent weeks default to 'bracket'
    newStyles.push(newStyles.length === 0 ? 'seeded' : 'bracket');
  }

  // Remove extra weeks
  if (newStyles.length > newWeekCount) {
    newStyles.length = newWeekCount;
  }

  return newStyles;
}

/**
 * Reducer function for playoff settings state
 */
function playoffSettingsReducer(
  state: PlayoffSettingsState,
  action: PlayoffSettingsAction
): PlayoffSettingsState {
  switch (action.type) {
    // === Persistent Setting Actions ===

    case 'SET_PLAYOFF_WEEKS': {
      const newWeekCount = action.payload;
      return {
        ...state,
        playoffWeeks: newWeekCount,
        weekMatchupStyles: adjustWeekMatchupStyles(state.weekMatchupStyles, newWeekCount),
      };
    }

    case 'ADD_PLAYOFF_WEEKS': {
      const newWeekCount = state.playoffWeeks + action.payload;
      return {
        ...state,
        playoffWeeks: newWeekCount,
        weekMatchupStyles: adjustWeekMatchupStyles(state.weekMatchupStyles, newWeekCount),
        showAddWeeksModal: false,
      };
    }

    case 'SET_QUALIFICATION_TYPE':
      return { ...state, qualificationType: action.payload };

    case 'SET_FIXED_TEAM_COUNT':
      return { ...state, fixedTeamCount: Math.max(2, action.payload) };

    case 'SET_QUALIFYING_PERCENTAGE':
      return { ...state, qualifyingPercentage: action.payload };

    case 'SET_PERCENTAGE_MIN':
      return { ...state, percentageMin: Math.max(2, action.payload) };

    case 'SET_PERCENTAGE_MAX':
      return {
        ...state,
        percentageMax: action.payload === null ? null : Math.max(2, action.payload),
      };

    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };

    case 'SET_WILDCARD_SPOTS':
      return { ...state, wildcardSpots: Math.max(0, action.payload) };

    case 'SET_WEEK_MATCHUP_STYLE': {
      const { weekIndex, style } = action.payload;
      // Ensure weekIndex is valid
      if (weekIndex < 0 || weekIndex >= state.playoffWeeks) {
        return state;
      }
      const newStyles = [...state.weekMatchupStyles];
      newStyles[weekIndex] = style;
      return { ...state, weekMatchupStyles: newStyles };
    }

    // === UI-Only Actions ===

    case 'SET_EXAMPLE_TEAM_COUNT':
      return { ...state, exampleTeamCount: action.payload };

    case 'OPEN_ADD_WEEKS_MODAL':
      return { ...state, showAddWeeksModal: true, weeksToAdd: 1 };

    case 'CLOSE_ADD_WEEKS_MODAL':
      return { ...state, showAddWeeksModal: false };

    case 'SET_WEEKS_TO_ADD':
      return { ...state, weeksToAdd: Math.max(1, action.payload) };

    // === Bulk Actions ===

    case 'LOAD_SETTINGS':
      return { ...state, ...action.payload };

    case 'RESET_SETTINGS':
      return initialPlayoffSettingsState;

    default:
      return state;
  }
}

/**
 * Calculate how many teams qualify based on current settings
 *
 * @param totalTeams - Total number of teams in the league
 * @param state - Current playoff settings state
 * @returns Number of qualifying teams (always even for bracket pairing)
 */
export function calculateQualifyingTeams(
  totalTeams: number,
  state: Pick<
    PlayoffSettingsState,
    'qualificationType' | 'fixedTeamCount' | 'qualifyingPercentage' | 'percentageMin' | 'percentageMax'
  >
): number {
  const { qualificationType, fixedTeamCount, qualifyingPercentage, percentageMin, percentageMax } = state;

  if (qualificationType === 'all') {
    // All teams, but must be even (drop last place if odd)
    return totalTeams % 2 === 0 ? totalTeams : totalTeams - 1;
  }

  if (qualificationType === 'fixed') {
    // Fixed number, but can't exceed total teams
    const qualifying = Math.min(fixedTeamCount, totalTeams);
    // Must be even for bracket
    return qualifying % 2 === 0 ? qualifying : qualifying - 1;
  }

  if (qualificationType === 'percentage') {
    // Calculate percentage
    let qualifying = Math.round((qualifyingPercentage / 100) * totalTeams);

    // Apply min/max constraints
    qualifying = Math.max(qualifying, percentageMin);
    if (percentageMax !== null) {
      qualifying = Math.min(qualifying, percentageMax);
    }

    // Can't exceed total teams
    qualifying = Math.min(qualifying, totalTeams);

    // Must be even for bracket
    return qualifying % 2 === 0 ? qualifying : qualifying - 1;
  }

  return totalTeams;
}

/**
 * Extract only the persistent settings that should be saved to database
 *
 * @param state - Full playoff settings state
 * @returns Object containing only the fields to persist
 */
export function extractPersistentSettings(state: PlayoffSettingsState) {
  return {
    playoffWeeks: state.playoffWeeks,
    qualificationType: state.qualificationType,
    fixedTeamCount: state.fixedTeamCount,
    qualifyingPercentage: state.qualifyingPercentage,
    percentageMin: state.percentageMin,
    percentageMax: state.percentageMax,
    paymentMethod: state.paymentMethod,
    wildcardSpots: state.wildcardSpots,
    weekMatchupStyles: state.weekMatchupStyles,
  };
}

/**
 * Generate playoff matchup pairs based on the specified style
 *
 * @param bracketSize - Number of teams in the bracket (must be even)
 * @param style - The matchup style to use
 * @returns Array of [homeSeed, awaySeed] pairs
 *
 * For 'bracket' style, this returns placeholder pairs since actual matchups
 * depend on previous week's results. Use generateBracketProgressionPairs for
 * displaying example bracket progression.
 */
export function generateMatchupPairs(
  bracketSize: number,
  style: MatchupStyle
): Array<[number, number]> {
  if (bracketSize < 2 || bracketSize % 2 !== 0) {
    return [];
  }

  const numMatches = bracketSize / 2;

  switch (style) {
    case 'seeded':
      // Best vs worst: 1v8, 2v7, 3v6, 4v5
      // Higher seed is home
      return Array.from({ length: numMatches }, (_, i) => {
        const homeSeed = i + 1;
        const awaySeed = bracketSize - i;
        return [homeSeed, awaySeed] as [number, number];
      });

    case 'ranked':
      // Adjacent pairs: 1v2, 3v4, 5v6, 7v8
      // Higher seed (lower number) is home
      return Array.from({ length: numMatches }, (_, i) => {
        const homeSeed = i * 2 + 1;
        const awaySeed = i * 2 + 2;
        return [homeSeed, awaySeed] as [number, number];
      });

    case 'random':
      // For preview purposes, we just show shuffle icons
      // Actual random pairing happens at match creation time
      // Return pairs with negative seeds to indicate "random"
      return Array.from({ length: numMatches }, (_, i) => {
        return [-(i * 2 + 1), -(i * 2 + 2)] as [number, number];
      });

    case 'bracket':
      // Bracket progression: winners vs winners, losers vs losers from previous week
      // For preview, show "Winner Match X" / "Loser Match X" placeholders
      // Seed encoding: 100 + matchNum = Winner, 200 + matchNum = Loser
      //
      // With 4 teams (2 matches in week 1), week 2 shows:
      //   Match 1: Winner M1 vs Winner M2
      //   Match 2: Loser M1 vs Loser M2
      //
      // With 6 teams (3 matches in week 1), week 2 shows:
      //   Match 1: Winner M1 vs Winner M2
      //   Match 2: Winner M3 vs Loser M1
      //   Match 3: Loser M2 vs Loser M3
      {
        const results: Array<[number, number]> = [];

        // Pair winners together (Winner M1 vs Winner M2, etc.)
        const winnerPairs = Math.floor(numMatches / 2);
        for (let i = 0; i < winnerPairs; i++) {
          const match1 = i * 2 + 1;
          const match2 = i * 2 + 2;
          results.push([100 + match1, 100 + match2]);
        }

        // If odd number of matches, the last winner plays the first loser
        if (numMatches % 2 === 1) {
          const lastWinnerMatch = numMatches;
          // Last winner vs first loser
          results.push([100 + lastWinnerMatch, 200 + 1]);
        }

        // Pair remaining losers together
        if (numMatches % 2 === 0) {
          // Even matches: pair all losers (Loser M1 vs Loser M2, etc.)
          const loserPairs = numMatches / 2;
          for (let i = 0; i < loserPairs; i++) {
            const match1 = i * 2 + 1;
            const match2 = i * 2 + 2;
            results.push([200 + match1, 200 + match2]);
          }
        } else {
          // Odd matches: first loser already used, pair remaining losers
          // With 3 matches: Loser M1 used above, so Loser M2 vs Loser M3
          const remainingLosers = numMatches - 1; // e.g., 3 - 1 = 2 remaining losers
          const loserPairs = Math.floor(remainingLosers / 2);
          for (let i = 0; i < loserPairs; i++) {
            // Start from loser 2 (since loser 1 was used with the odd winner)
            const match1 = i * 2 + 2; // 2, 4, 6...
            const match2 = i * 2 + 3; // 3, 5, 7...
            results.push([200 + match1, 200 + match2]);
          }
        }

        return results;
      }

    default:
      return [];
  }
}

/**
 * Get a human-readable label for a matchup style
 */
export function getMatchupStyleLabel(style: MatchupStyle): string {
  switch (style) {
    case 'seeded':
      return 'Seeded';
    case 'ranked':
      return 'Ranked';
    case 'random':
      return 'Random Draw';
    case 'bracket':
      return 'Bracket Progression';
    default:
      return style;
  }
}

/**
 * Get a description for a matchup style
 */
export function getMatchupStyleDescription(style: MatchupStyle): string {
  switch (style) {
    case 'seeded':
      return '1st vs Last, 2nd vs 2nd-Last, etc.';
    case 'ranked':
      return '1st vs 2nd, 3rd vs 4th, etc.';
    case 'random':
      return 'Random pairings';
    case 'bracket':
      return 'Winners vs Winners from previous week';
    default:
      return '';
  }
}

/**
 * Hook for managing playoff settings state
 *
 * @param initialState - Optional initial state to override defaults
 * @returns Tuple of [state, dispatch] for managing playoff settings
 *
 * @example
 * ```tsx
 * const [settings, dispatch] = usePlayoffSettingsReducer();
 *
 * // Update qualification type
 * dispatch({ type: 'SET_QUALIFICATION_TYPE', payload: 'fixed' });
 *
 * // Open add weeks modal
 * dispatch({ type: 'OPEN_ADD_WEEKS_MODAL' });
 *
 * // Load settings from database
 * dispatch({ type: 'LOAD_SETTINGS', payload: savedSettings });
 * ```
 */
export function usePlayoffSettingsReducer(
  initialState?: Partial<PlayoffSettingsState>
): [PlayoffSettingsState, React.Dispatch<PlayoffSettingsAction>] {
  return useReducer(
    playoffSettingsReducer,
    { ...initialPlayoffSettingsState, ...initialState }
  );
}

export default usePlayoffSettingsReducer;
