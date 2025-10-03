/**
 * @fileoverview League Creation Wizard
 * Multi-step wizard for league operators to create new leagues.
 * See memory-bank/leagueCreationWizard.md for detailed documentation.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDateSafe } from '@/components/forms/DateField';
import { VenueCreationWizard } from './VenueCreationWizard';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLeagueWizard } from '../hooks/useLeagueWizard';
import { generateAllLeagueNames, getTimeOfYear, getDayOfWeek } from '@/utils/leagueUtils';
import type { Venue } from '@/data/mockVenues';
import { WizardProgress } from '@/components/forms/WizardProgress';
import { LeaguePreview } from '@/components/forms/LeaguePreview';
import { WizardStepRenderer } from '@/components/forms/WizardStepRenderer';



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

  /**
   * Handle venue addition - opens venue creation wizard
   */
  const handleAddVenue = () => {
    console.log('🏢 Opening Venue Creation Wizard...');
    setShowVenueWizard(true);
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
    clearFormData();

    // Navigate back to operator dashboard with success message
    navigate('/operator-dashboard');
  };

  // Use centralized wizard state management hook
  const {
    currentStep,
    currentInput,
    error,
    showVenueWizard,
    formData,
    foundTournamentDates,
    steps,
    setShowVenueWizard,
    setCurrentInput,
    updateFormData,
    searchBCANationalsInDatabase,
    getCurrentStep,
    handleInputChange,
    handleChoiceSelect,
    handleNext,
    handlePrevious,
    getOrganizationName,
    refreshVenues,
    clearFormData
  } = useLeagueWizard({
    onAddVenue: handleAddVenue,
    onSubmit: handleSubmit
  });

  /**
   * Handle venue creation completion
   */
  const handleVenueCreated = async (newVenue: Venue) => {
    console.log('✅ Venue created successfully:', newVenue);
    setShowVenueWizard(false);

    // Refresh venue list to include new venue
    await refreshVenues();

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
   * Cancel wizard and return to operator dashboard
   */
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel league creation? All progress will be lost.')) {
      clearFormData();
      navigate('/operator-dashboard');
    }
  };

  /**
   * Clear form data and restart wizard
   */
  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear all form data and start over?')) {
      clearFormData();
      // Refresh the page to reset everything
      window.location.reload();
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member]); // updateFormData is stable from the hook



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