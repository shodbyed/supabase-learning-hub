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

  // UI-only actions
  | { type: 'SET_EXAMPLE_TEAM_COUNT'; payload: number }
  | { type: 'OPEN_ADD_WEEKS_MODAL' }
  | { type: 'CLOSE_ADD_WEEKS_MODAL' }
  | { type: 'SET_WEEKS_TO_ADD'; payload: number }

  // Bulk actions
  | { type: 'LOAD_SETTINGS'; payload: Partial<PlayoffSettingsState> }
  | { type: 'RESET_SETTINGS' };

/**
 * Reducer function for playoff settings state
 */
function playoffSettingsReducer(
  state: PlayoffSettingsState,
  action: PlayoffSettingsAction
): PlayoffSettingsState {
  switch (action.type) {
    // === Persistent Setting Actions ===

    case 'SET_PLAYOFF_WEEKS':
      return { ...state, playoffWeeks: action.payload };

    case 'ADD_PLAYOFF_WEEKS':
      return {
        ...state,
        playoffWeeks: state.playoffWeeks + action.payload,
        showAddWeeksModal: false,
      };

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
  };
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
