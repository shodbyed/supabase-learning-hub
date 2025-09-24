/**
 * @fileoverview Application Reducer
 * State management logic for league operator application form
 */
import type {
  LeagueOperatorApplication as ApplicationData
} from '../schemas/leagueOperatorSchema';
import type { ApplicationAction } from './types';

/**
 * Initial state for the league operator application form
 */
export const initialApplicationState: ApplicationData = {
  leagueName: '',
  useProfileAddress: undefined,
  organizationAddress: '',
  organizationCity: '',
  organizationState: '',
  organizationZipCode: '',
  contactDisclaimerAcknowledged: undefined,
  venues: [],
  contactName: '',
  contactEmail: '',
  contactPhone: '',
};

/**
 * Application state reducer for managing form data
 *
 * Handles all form field updates and venue management operations
 * using immutable state updates for predictable state changes.
 *
 * @param state - Current application state
 * @param action - Action object with type and payload
 * @returns Updated application state
 */
export function applicationReducer(
  state: ApplicationData,
  action: ApplicationAction
): ApplicationData {
  switch (action.type) {
    case 'SET_LEAGUE_NAME':
      return { ...state, leagueName: action.payload };

    case 'SET_USE_PROFILE_ADDRESS':
      return { ...state, useProfileAddress: action.payload };

    case 'SET_ORGANIZATION_ADDRESS':
      return { ...state, organizationAddress: action.payload };

    case 'SET_ORGANIZATION_CITY':
      return { ...state, organizationCity: action.payload };

    case 'SET_ORGANIZATION_STATE':
      return { ...state, organizationState: action.payload };

    case 'SET_ORGANIZATION_ZIP_CODE':
      return { ...state, organizationZipCode: action.payload };

    case 'SET_CONTACT_DISCLAIMER_ACKNOWLEDGED':
      return { ...state, contactDisclaimerAcknowledged: action.payload };

    case 'ADD_VENUE':
      return { ...state, venues: [...state.venues, action.payload] };

    case 'UPDATE_VENUE':
      return {
        ...state,
        venues: state.venues.map((venue) =>
          venue.id === action.payload.id
            ? { ...venue, [action.payload.field]: action.payload.value }
            : venue
        ),
      };

    case 'SET_CONTACT_NAME':
      return { ...state, contactName: action.payload };

    case 'SET_CONTACT_EMAIL':
      return { ...state, contactEmail: action.payload };

    case 'SET_CONTACT_PHONE':
      return { ...state, contactPhone: action.payload };

    default:
      return state;
  }
}