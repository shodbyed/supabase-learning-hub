/**
 * @fileoverview League Wizard State Management Hook
 *
 * Custom hook that manages all state for the League Creation Wizard.
 * Handles form data, validation, step navigation, and localStorage persistence.
 */
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useTournamentSearch } from './useTournamentSearch';
import { createWizardSteps, type WizardStep, type LeagueFormData } from '@/data/leagueWizardSteps';
import type { Venue } from '@/data/mockVenues';
import { fetchOrganizationVenues } from '@/data/mockVenues';

interface UseLeagueWizardParams {
  /** Callback when venue creation wizard should open */
  onAddVenue: () => void;
  /** Callback when wizard is completed */
  onSubmit: () => void;
}

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
 * - Navigation handlers
 */
export const useLeagueWizard = ({ onAddVenue, onSubmit }: UseLeagueWizardParams) => {
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

  /**
   * Create wizard steps with current form data and functions
   */
  const steps: WizardStep[] = createWizardSteps({
    formData,
    updateFormData,
    foundTournamentDates,
    findTournamentOption,
    validateStartDate,
    validateTournamentDate,
    validateTournamentDateRange,
    seasonLengthChoice,
    setSeasonLengthChoice
  });

  /**
   * Get current step with dynamic choices (venue selection, etc.)
   */
  const getCurrentStep = useCallback((): WizardStep => {
    const step = steps[currentStep];

    // Dynamically populate venue choices based on organization venues
    if (step.id === 'venue_selection') {
      const venueChoices = organizationVenues.map(venue => ({
        value: venue.id,
        label: venue.name,
        subtitle: `${venue.barBoxTables + (venue.bigTables || 0)} tables • ${venue.city}, ${venue.state}`,
        description: `📍 ${venue.address}\n📞 ${venue.phone}\n🎱 ${venue.barBoxTables} Bar Box${venue.bigTables ? ` + ${venue.bigTables} Big tables` : ''}`
      }));

      // Add traveling league option
      venueChoices.push({
        value: 'traveling',
        label: 'Traveling League',
        subtitle: 'Multiple venues',
        description: 'League rotates between multiple venues. Teams take turns hosting matches at different locations.'
      });

      // Add option to create new venue
      venueChoices.push({
        value: 'add_new',
        label: '+ Add New Venue',
        subtitle: 'Create a new venue',
        description: 'Set up a new pool hall or bar for your organization.'
      });

      step.choices = venueChoices;
    }

    return step;
  }, [currentStep, organizationVenues, steps]);

  /**
   * Handle input changes with validation
   */
  const handleInputChange = useCallback((value: string) => {
    setCurrentInput(value);
    setError(undefined); // Clear error when user types
  }, []);

  /**
   * Handle choice selection
   */
  const handleChoiceSelect = useCallback((choiceId: string) => {
    const step = getCurrentStep();

    // Handle special venue selection cases
    if (step.id === 'venue_selection') {
      if (choiceId === 'add_new') {
        onAddVenue();
        return;
      }
    }

    step.setValue(choiceId);
    setError(undefined);
  }, [getCurrentStep, onAddVenue]);

  /**
   * Save current input to form data
   */
  const saveCurrentInput = useCallback((): boolean => {
    const step = getCurrentStep();

    if (step.validator) {
      const validation = step.validator(currentInput);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid input');
        return false;
      }
    }

    step.setValue(currentInput);
    setCurrentInput('');
    return true;
  }, [getCurrentStep, currentInput]);

  /**
   * Navigate to next step with conditional step logic
   */
  const handleNext = useCallback(() => {
    const step = getCurrentStep();

    // For input steps, validate before proceeding
    if (step.type === 'input') {
      if (!saveCurrentInput()) return;
    }

    // For choice steps, ensure selection was made
    if (step.type === 'choice' && !step.getValue()) {
      setError('Please make a selection to continue');
      return;
    }

    // Handle conditional step navigation
    let nextStep = currentStep + 1;

    // Skip custom season length step if not needed
    if (step.id === 'season_length' && seasonLengthChoice !== 'custom') {
      // Skip the custom_season_length step
      nextStep = currentStep + 2;
    }

    // Skip custom season length step when going backwards from game_type
    if (step.id === 'custom_season_length') {
      // Normal progression to game_type
      nextStep = currentStep + 1;
    }

    // Skip BCA custom date step if not needed
    if (step.id === 'bca_nationals_dates' && formData.bcaNationalsChoice !== 'custom') {
      // Skip the BCA custom date step and go directly to APA
      nextStep = currentStep + 2; // Skip bca_custom_dates
    }

    // Normal progression through BCA custom date step
    if (step.id === 'bca_custom_dates') {
      nextStep = currentStep + 1;
    }

    if (nextStep < steps.length) {
      setCurrentStep(nextStep);
      setCurrentInput('');
      setError(undefined);
    } else {
      onSubmit();
    }
  }, [getCurrentStep, saveCurrentInput, currentStep, seasonLengthChoice, formData.bcaNationalsChoice, steps.length, onSubmit]);

  /**
   * Navigate to previous step with conditional step logic
   */
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      let prevStep = currentStep - 1;

      // Handle conditional step navigation when going backwards
      const currentStepData = steps[currentStep];

      // If we're on game_type and the previous season_length choice wasn't 'custom',
      // skip back over the custom_season_length step
      if (currentStepData.id === 'game_type') {
        if (seasonLengthChoice !== 'custom') {
          prevStep = currentStep - 2; // Skip back over custom_season_length
        }
      }

      // If we're on APA step and BCA choice wasn't 'custom',
      // skip back over the BCA custom date step
      if (currentStepData.id === 'apa_nationals_start') {
        if (formData.bcaNationalsChoice !== 'custom') {
          prevStep = currentStep - 2; // Skip back over BCA custom date step
        }
      }

      // If we're on BCA custom date step, normal backwards navigation
      if (currentStepData.id === 'bca_custom_dates') {
        prevStep = currentStep - 1;
      }

      // Ensure we don't go below 0
      if (prevStep >= 0) {
        setCurrentStep(prevStep);
        setCurrentInput('');
        setError(undefined);
      }
    }
  }, [currentStep, seasonLengthChoice, formData.bcaNationalsChoice, steps]);

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
    steps,

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

    // Step navigation and handlers
    getCurrentStep,
    handleInputChange,
    handleChoiceSelect,
    handleNext,
    handlePrevious,

    // Utility functions
    getOrganizationName,
    refreshVenues,
    clearFormData
  };
};
