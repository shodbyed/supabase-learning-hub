/**
 * @fileoverview League Wizard State Management Hook
 *
 * Custom hook that manages all state for the League Creation Wizard.
 * Handles form data, validation, step navigation, and localStorage persistence.
 */
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useTournamentSearch } from './useTournamentSearch';
import type { LeagueFormData } from '@/data/leagueWizardSteps';
import type { Venue } from '@/data/mockVenues';
import { fetchOrganizationVenues } from '@/data/mockVenues';

/**
 * League Wizard State Hook
 *
 * Provides centralized state management for the league creation wizard:
 * - Form data with localStorage persistence
 * - Current step tracking
 * - Input and error state
 * - Organization venues
 * - Tournament date search
 * - Validation functions
 */
export const useLeagueWizard = () => {
  // Wizard step state with localStorage persistence
  const [currentStep, setCurrentStep] = useLocalStorage('league-wizard-step', 0);
  const [currentInput, setCurrentInput] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [showVenueWizard, setShowVenueWizard] = useState(false);
  const [seasonLengthChoice, setSeasonLengthChoice] = useState<string>('16');

  // Organization venues - loaded from database
  const [organizationVenues, setOrganizationVenues] = useState<Venue[]>([]);

  // League form data with localStorage persistence
  const [formData, setFormData] = useLocalStorage<LeagueFormData>('league-creation-wizard', {
    selectedVenueId: '',
    venueIds: [],
    gameType: '',
    startDate: '',
    dayOfWeek: '',
    season: '',
    year: 0,
    seasonLength: 16, // default 16 weeks
    endDate: '',
    bcaNationalsChoice: '',
    bcaNationalsStart: '',
    bcaNationalsEnd: '',
    apaNationalsStart: '',
    apaNationalsEnd: '',
    qualifier: '',
    teamFormat: '',
    handicapSystem: '',
    organizationName: '',
    organizationAddress: '',
    organizationCity: '',
    organizationState: '',
    organizationZipCode: '',
    contactEmail: '',
    contactPhone: ''
  });

  // Tournament search hook for BCA/APA dates
  const {
    foundDates: foundTournamentDates,
    searchTournamentDates,
    findTournamentOption
  } = useTournamentSearch();

  /**
   * Load venues when hook initializes
   */
  useEffect(() => {
    const loadVenues = async () => {
      const venues = await fetchOrganizationVenues();
      setOrganizationVenues(venues);
    };
    loadVenues();
  }, []);

  /**
   * Update form data for a specific field
   */
  const updateFormData = (field: keyof LeagueFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Search for BCA tournament dates
   */
  const searchBCANationalsInDatabase = async () => {
    await searchTournamentDates({
      organization: 'BCA',
      tournamentType: 'nationals'
    });
  };

  /**
   * Get the organization name for league naming
   */
  const getOrganizationName = (): string => {
    // For now, use a placeholder. In the future, this should come from the operator's profile
    // Using ERROR in the name ensures we catch missing organization data immediately
    return formData.organizationName || 'ORGANIZATION_NAME_ERROR';
  };

  /**
   * Start date validation - must be a valid future date
   */
  const validateStartDate = (value: string): { isValid: boolean; error?: string } => {
    if (!value) {
      return { isValid: false, error: 'Start date is required' };
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Please enter a valid date' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only

    if (date < today) {
      return { isValid: false, error: 'Start date must be today or in the future' };
    }

    return { isValid: true };
  };

  /**
   * Tournament date validation - must be valid dates
   */
  const validateTournamentDate = (value: string): { isValid: boolean; error?: string } => {
    if (!value) {
      return { isValid: false, error: 'Tournament date is required' };
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Please enter a valid date' };
    }

    return { isValid: true };
  };

  /**
   * Tournament date range validation - validates both start and end dates
   */
  const validateTournamentDateRange = (value: string): { isValid: boolean; error?: string } => {
    const [startDate, endDate] = value.split('|');

    if (!startDate || !endDate) {
      return { isValid: false, error: 'Both start and end dates are required' };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      return { isValid: false, error: 'Please enter a valid start date' };
    }

    if (isNaN(end.getTime())) {
      return { isValid: false, error: 'Please enter a valid end date' };
    }

    if (end <= start) {
      return { isValid: false, error: 'End date must be after start date' };
    }

    return { isValid: true };
  };

  /**
   * Refresh organization venues list
   */
  const refreshVenues = async () => {
    const updatedVenues = await fetchOrganizationVenues();
    setOrganizationVenues(updatedVenues);
    return updatedVenues;
  };

  /**
   * Clear all form data and reset wizard
   */
  const clearFormData = () => {
    localStorage.removeItem('league-creation-wizard');
    localStorage.removeItem('league-wizard-step');
  };

  return {
    // State
    currentStep,
    currentInput,
    error,
    showVenueWizard,
    seasonLengthChoice,
    organizationVenues,
    formData,
    foundTournamentDates,

    // State setters
    setCurrentStep,
    setCurrentInput,
    setError,
    setShowVenueWizard,
    setSeasonLengthChoice,
    setOrganizationVenues,

    // Form data management
    updateFormData,

    // Tournament search
    searchBCANationalsInDatabase,
    findTournamentOption,

    // Validation functions
    validateStartDate,
    validateTournamentDate,
    validateTournamentDateRange,

    // Utility functions
    getOrganizationName,
    refreshVenues,
    clearFormData
  };
};
