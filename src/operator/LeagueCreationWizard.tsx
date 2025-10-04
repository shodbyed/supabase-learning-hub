/**
 * @fileoverview League Creation Wizard (Simplified)
 *
 * Multi-step wizard for creating the core league identity.
 * Focuses ONLY on: game type, start date, qualifier, and team format/handicap.
 *
 * Season scheduling and team building moved to separate wizards.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLeagueWizard } from '../hooks/useLeagueWizard';
import { generateAllLeagueNames, getTimeOfYear, getDayOfWeek } from '@/utils/leagueUtils';
import { WizardProgress } from '@/components/forms/WizardProgress';
import { LeaguePreview } from '@/components/forms/LeaguePreview';
import { WizardStepRenderer } from '@/components/forms/WizardStepRenderer';

/**
 * League Creation Wizard Component
 *
 * Creates the core league identity with 4 simple steps:
 * 1. Game Type (8-ball, 9-ball, 10-ball)
 * 2. Start Date (determines day/season/year for league name)
 * 3. Optional Qualifier ("East Division", "Beginner", etc.)
 * 4. Team Format + Handicap System (5-man/8-man combined choice)
 *
 * After completion, offers to create schedule or return to dashboard.
 */
export const LeagueCreationWizard: React.FC = () => {
  const navigate = useNavigate();
  const { member } = useUserProfile();

  /**
   * Handle form submission - create the league in database
   */
  const handleSubmit = async () => {
    console.group('🏆 LEAGUE CREATION - DATABASE OPERATIONS');

    console.log('📋 COMPLETE LEAGUE DATA:', formData);

    console.group('🏢 LEAGUE INFORMATION');
    console.log('Game Type:', formData.gameType);
    console.log('Start Date:', formData.startDate);
    console.log('Day of Week:', formData.dayOfWeek);
    console.log('Season:', formData.season);
    console.log('Year:', formData.year);
    console.log('Qualifier:', formData.qualifier || '(none)');
    console.log('Team Format:', formData.teamFormat);
    console.log('Handicap System:', formData.handicapSystem);

    // Generate all formatted league names for database storage
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const leagueComponents = {
        organizationName: 'Test Organization', // TODO: Get from operator profile
        year: startDate.getFullYear(),
        season: getTimeOfYear(startDate),
        gameType: formData.gameType || 'eight_ball',
        dayOfWeek: getDayOfWeek(startDate),
        qualifier: formData.qualifier
      };

      const allNames = generateAllLeagueNames(leagueComponents);

      console.group('📛 FORMATTED LEAGUE NAMES');
      console.log('Database Systematic Name:', allNames.systematicName);
      console.log('Player-Friendly Name:', allNames.playerFriendlyName);
      console.log('Operator Management Name:', allNames.operatorName);
      console.log('Full Display Name:', allNames.fullDisplayName);
      console.groupEnd();
    }

    console.groupEnd();

    console.group('📊 HANDICAP SYSTEM CONFIGURATION');
    if (formData.handicapSystem === 'custom_5man') {
      console.log('System: Custom 5-Man Double Round Robin');
      console.log('- Formula: (Wins - Losses) ÷ Weeks Played');
      console.log('- Handicap Range: +2 to -2');
      console.log('- Team Handicap: Sum of 3 active players');
      console.log('- Games per Match: 18 (3v3 double round robin)');
    } else if (formData.handicapSystem === 'bca_standard') {
      console.log('System: BCA Standard Handicap');
      console.log('- Formula: Win Percentage (Wins ÷ Total Games)');
      console.log('- Rolling Window: Last 50 games');
      console.log('- Team Handicap: Sum of 5 active players');
      console.log('- Games per Match: 25 (5v5 single round robin)');
    }
    console.groupEnd();

    console.group('🔄 DATABASE OPERATIONS TO PERFORM');
    console.log('1. INSERT INTO leagues (game_type, start_date, day_of_week, season, year, qualifier, team_format, handicap_system, operator_id)');
    console.log('2. Return new league_id');
    console.log('3. Create initial league_status = "created" (pending schedule)');
    console.groupEnd();

    console.group('✅ NEXT STEPS FOR LEAGUE OPERATOR');
    console.log('1. Create schedule (season length, tournament dates)');
    console.log('2. Add teams and players');
    console.log('3. Generate match schedule');
    console.groupEnd();

    console.groupEnd();

    // TODO: Actually save to database
    // const newLeague = await createLeague(formData);

    // Clear localStorage after successful creation
    clearFormData();

    // For now, just navigate back - in future, prompt for schedule creation
    navigate('/operator-dashboard');
  };

  // Use centralized wizard state management hook
  const {
    currentStep,
    currentInput,
    error,
    formData,
    steps,
    setCurrentInput,
    getCurrentStep,
    handleInputChange,
    handleChoiceSelect,
    handleNext,
    handlePrevious,
    clearFormData
  } = useLeagueWizard({
    onSubmit: handleSubmit
  });

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
  }, [currentStep]);

  const currentStepData = getCurrentStep();
  const isLastStep = currentStep === steps.length - 1;
  const canGoBack = currentStep > 0;

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
      window.location.reload();
    }
  };

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
          <p className="text-gray-600 mt-2">
            Step {currentStep + 1} of {steps.length}
          </p>
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
            updateFormData={() => {}} // Not used in simplified version
          />
        </div>

        {/* League Preview */}
        <LeaguePreview formData={formData} />
      </div>
    </div>
  );
};
