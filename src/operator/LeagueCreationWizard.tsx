/**
 * @fileoverview League Creation Wizard
 * Multi-step wizard for league operators to create new leagues.
 * See memory-bank/leagueCreationWizard.md for detailed documentation.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDateSafe } from '@/components/forms/DateField';
import { VenueCreationWizard } from './VenueCreationWizard';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateAllLeagueNames, getTimeOfYear, getDayOfWeek } from '@/utils/leagueUtils';
import type { Venue } from '@/data/mockVenues';
import { fetchOrganizationVenues } from '@/data/mockVenues';
import { useTournamentSearch } from '@/hooks/useTournamentSearch';
import { WizardProgress } from '@/components/forms/WizardProgress';
import { LeaguePreview } from '@/components/forms/LeaguePreview';
import { WizardStepRenderer } from '@/components/forms/WizardStepRenderer';
import { createWizardSteps, type WizardStep, type LeagueFormData } from '@/data/leagueWizardSteps';



/**
 * League Creation Wizard Component
 *
 * Guides league operators through creating a new league with proper
 * validation and explanation of complex concepts like handicap systems.
 *
 * FLOW:
 * 1. Venue selection from organization venues
 * 2. League format (in-house vs traveling)
 * 3. Game type selection
 * 4. Start date selection
 * 5. Optional qualifier
 * 6. Team format selection (5-man vs 8-man)
 * 7. Handicap system selection with detailed explanations
 * 8. Review and creation
 */
export const LeagueCreationWizard: React.FC = () => {
  const navigate = useNavigate();
  const { member } = useUserProfile();


  // Wizard state management with localStorage persistence
  const [currentStep, setCurrentStep] = useLocalStorage('league-wizard-step', 0);
  const [currentInput, setCurrentInput] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [showVenueWizard, setShowVenueWizard] = useState(false);
  const [seasonLengthChoice, setSeasonLengthChoice] = useState<string>('16'); // Track the radio button selection

  // Organization venues - loaded from database
  const [organizationVenues, setOrganizationVenues] = useState<Venue[]>([]);


  /**
   * Load venues when component mounts
   */
  useEffect(() => {
    const loadVenues = async () => {
      const venues = await fetchOrganizationVenues();
      setOrganizationVenues(venues);
    };
    loadVenues();
  }, []);

  // Tournament search hook for BCA/APA dates
  const {
    foundDates: foundTournamentDates,
    searchTournamentDates,
    findTournamentOption
  } = useTournamentSearch();

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
   * Handle venue addition - opens venue creation wizard
   */
  const handleAddVenue = () => {
    console.log('🏢 Opening Venue Creation Wizard...');
    setShowVenueWizard(true);
  };

  /**
   * Handle venue creation completion
   */
  const handleVenueCreated = async (newVenue: Venue) => {
    console.log('✅ Venue created successfully:', newVenue);
    setShowVenueWizard(false);

    // Refresh venue list to include new venue
    const updatedVenues = await fetchOrganizationVenues();
    setOrganizationVenues(updatedVenues);

    // Auto-select the new venue
    updateFormData('selectedVenueId', newVenue.id);
  };

  /**
   * Handle venue creation cancellation
   */
  const handleVenueCanceled = () => {
    console.log('❌ Venue creation canceled');
    setShowVenueWizard(false);
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
  const getCurrentStep = (): WizardStep => {
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
  };

  /**
   * Handle input changes with validation
   */
  const handleInputChange = (value: string) => {
    setCurrentInput(value);
    setError(undefined); // Clear error when user types
  };

  /**
   * Handle choice selection
   */
  const handleChoiceSelect = (choiceId: string) => {
    const step = getCurrentStep();

    // Handle special venue selection cases
    if (step.id === 'venue_selection') {
      if (choiceId === 'add_new') {
        handleAddVenue();
        return;
      }
    }

    step.setValue(choiceId);
    setError(undefined);
  };

  /**
   * Save current input to form data
   */
  const saveCurrentInput = (): boolean => {
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
  };

  /**
   * Navigate to next step with conditional step logic
   */
  const handleNext = () => {
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
      handleSubmit();
    }
  };

  /**
   * Navigate to previous step with conditional step logic
   */
  const handlePrevious = () => {
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
  };

  /**
   * Cancel wizard and return to operator dashboard
   */
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel league creation? All progress will be lost.')) {
      // Clear localStorage
      localStorage.removeItem('league-creation-wizard');
      localStorage.removeItem('league-wizard-step');
      navigate('/operator-dashboard');
    }
  };

  /**
   * Clear form data and restart wizard
   */
  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear all form data and start over?')) {
      // Clear localStorage
      localStorage.removeItem('league-creation-wizard');
      localStorage.removeItem('league-wizard-step');
      // Refresh the page to reset everything
      window.location.reload();
    }
  };

  /**
   * Handle form submission - create the league
   */
  const handleSubmit = async () => {
    console.group('🏆 LEAGUE CREATION - DATABASE OPERATIONS');

    console.log('📋 COMPLETE LEAGUE DATA:', formData);

    console.group('🏢 LEAGUE INFORMATION');
    console.log('Game Type:', formData.gameType);
    console.log('Start Date:', formData.startDate);
    console.log('Day of Week (derived):', formData.startDate ? formatDateSafe(formData.startDate, 'long').split(',')[0] : 'Not set');
    console.log('Team Format:', formData.teamFormat);
    console.log('Handicap System:', formData.handicapSystem);

    // Generate all formatted league names for database storage
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const leagueComponents = {
        organizationName: getOrganizationName(),
        year: startDate.getFullYear(),
        season: getTimeOfYear(startDate),
        gameType: formData.gameType || 'eight_ball',
        dayOfWeek: getDayOfWeek(startDate),
        qualifier: formData.qualifier
      };

      const allNames = generateAllLeagueNames(leagueComponents);

      console.group('📛 FORMATTED LEAGUE NAMES');
      console.log('Preview Name:', `${formData.gameType} ${formData.dayOfWeek} ${formData.season} ${formData.year} ${getOrganizationName()}${formData.qualifier ? ` ${formData.qualifier}` : ''}`.trim());
      console.log('Database Systematic Name:', allNames.systematicName);
      console.log('Player-Friendly Name:', allNames.playerFriendlyName);
      console.log('Operator Management Name:', allNames.operatorName);
      console.log('Full Display Name:', allNames.fullDisplayName);
      console.groupEnd();
    }

    console.groupEnd();

    console.group('📍 VENUE INFORMATION');
    console.log('Venue selection will be handled during team registration phase');
    console.groupEnd();

    console.group('📊 HANDICAP SYSTEM CONFIGURATION');
    if (formData.handicapSystem === 'custom_5man') {
      console.log('System: Custom 5-Man Double Round Robin');
      console.log('- Formula: (Wins - Losses) ÷ Weeks Played');
      console.log('- Handicap Range: +2 to -2 (rounds to nearest integer)');
      console.log('- Team Handicap: Sum of 3 active players');
      console.log('- Standings Modifier: (Home Wins - Away Wins) ÷ 2');
      console.log('- Games per Match: 18 (3v3 double round robin)');
      console.log('- Anti-sandbagging: Team win/loss policy');
    } else if (formData.handicapSystem === 'bca_standard') {
      console.log('System: BCA Standard Handicap');
      console.log('- Formula: Win Percentage (Wins ÷ Total Games)');
      console.log('- Rolling Window: Last 50 games');
      console.log('- Team Handicap: Sum of 5 active players');
      console.log('- Lookup: CHARTS table for game requirements');
      console.log('- Games per Match: 25 (5v5 single round robin)');
      console.log('- Point System: 1.5x for 70%+ close losses');
    }
    console.groupEnd();

    console.group('🔄 DATABASE OPERATIONS TO PERFORM');
    console.log('1. Create leagues table record');
    console.log('2. Link to selected venue(s)');
    console.log('3. Link to operator organization');
    console.log('4. Set up initial season framework');
    console.log('5. Configure handicap system parameters');
    console.log('6. Initialize league settings');
    console.groupEnd();

    console.group('✅ NEXT STEPS FOR LEAGUE OPERATOR');
    console.log('1. Set up first season parameters');
    console.log('2. Begin team registration process');
    console.log('3. Schedule venue partnerships (if traveling)');
    console.log('4. Set registration deadlines');
    console.log('5. Plan season schedule generation');
    console.groupEnd();

    console.groupEnd();

    // Clear localStorage after successful creation
    localStorage.removeItem('league-creation-wizard');
    localStorage.removeItem('league-wizard-step');

    // Navigate back to operator dashboard with success message
    navigate('/operator-dashboard');
  };

  /**
   * Load organization details from operator profile when component mounts
   */
  useEffect(() => {
    if (member) {
      // Pre-populate basic contact details from member profile
      updateFormData('contactEmail', member.email);
      updateFormData('contactPhone', member.phone);
    }
  }, [member]);



  /**
   * Sync input field with current step's saved value when navigating
   */
  useEffect(() => {
    const step = getCurrentStep();
    if (step.type === 'input') {
      const savedValue = step.getValue();
      if (savedValue) {
        setCurrentInput(savedValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]); // Only depend on currentStep - getCurrentStep changes with currentStep

  /**
   * Automatically search for BCA nationals dates when reaching that step
   */
  useEffect(() => {
    const step = getCurrentStep();
    // Trigger search when user reaches BCA nationals step for the first time
    if (step.id === 'bca_nationals_dates' && foundTournamentDates.length === 0) {
      console.log('🎯 STEP TRIGGER: Reached BCA Nationals step - starting automatic database search');
      searchBCANationalsInDatabase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]); // Trigger when step changes

  const currentStepData = getCurrentStep();
  const isLastStep = currentStep === steps.length - 1;
  const canGoBack = currentStep > 0;

  // Show venue creation wizard if requested
  if (showVenueWizard) {
    return (
      <VenueCreationWizard
        onComplete={handleVenueCreated}
        onCancel={handleVenueCanceled}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-between items-center mb-4">
            <div></div> {/* Spacer for centering */}
            <h1 className="text-3xl font-bold text-gray-900">
              Create New League
            </h1>
            <button
              onClick={handleClearForm}
              className="text-sm text-red-600 hover:text-red-800 underline"
              title="Clear all form data and start over"
            >
              Clear Form
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 max-w-2xl mx-auto">
          <WizardProgress
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        </div>


        {/* Main wizard content */}
        <div className="max-w-2xl mx-auto">
          <WizardStepRenderer
            currentStep={currentStepData}
            isLastStep={isLastStep}
            canGoBack={canGoBack}
            currentInput={currentInput}
            formData={formData}
            member={member}
            error={error}
            onInputChange={handleInputChange}
            onChoiceSelect={handleChoiceSelect}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onCancel={handleCancel}
            updateFormData={updateFormData}
          />
        </div>

        {/* League Preview */}
        <LeaguePreview formData={formData} />
      </div>
    </div>
  );
};