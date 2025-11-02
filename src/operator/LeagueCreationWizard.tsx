/**
 * @fileoverview League Creation Wizard (Simplified)
 *
 * Multi-step wizard for creating the core league identity.
 * Focuses ONLY on: game type, start date, qualifier, and team format/handicap.
 *
 * Season scheduling and team building moved to separate wizards.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile, useCreateLeague } from '@/api/hooks';
import { useLeagueWizard } from '../hooks/useLeagueWizard';
import { generateAllLeagueNames, getTimeOfYear } from '@/utils/leagueUtils';
import { parseLocalDate, getDayOfWeekName } from '@/utils/formatters';
import { WizardProgress } from '@/components/forms/WizardProgress';
import { LeaguePreview } from '@/components/forms/LeaguePreview';
import { WizardStepRenderer } from '@/components/forms/WizardStepRenderer';
import { supabase } from '@/supabaseClient';
import type { GameType, DayOfWeek, TeamFormat } from '@/types/league';

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
  const [operatorId, setOperatorId] = useState<string | null>(null);

  // Use TanStack Query mutation for league creation
  const createLeagueMutation = useCreateLeague();
  const isCreating = createLeagueMutation.isPending;

  /**
   * Fetch operator ID and clear old form data on mount
   * This ensures each new wizard starts with a clean slate
   */
  useEffect(() => {
    const fetchOperatorId = async () => {
      if (!member) return;

      const { data, error } = await supabase
        .from('league_operators')
        .select('id')
        .eq('member_id', member.id)
        .single();

      if (data && !error) {
        setOperatorId(data.id);
      }
    };

    fetchOperatorId();

    // Clear any previous wizard data when starting a new league creation
    // This prevents form fields from pre-filling with old data
    localStorage.removeItem('league-creation-wizard');
    localStorage.removeItem('league-wizard-step');
  }, [member]);

  /**
   * Handle form submission - create the league in database
   */
  const handleSubmit = async () => {
    if (!operatorId) {
      console.error('❌ No operator profile found');
      return;
    }

    try {
      console.group('🏆 LEAGUE CREATION - DATABASE OPERATIONS');

      // Convert formData to database format
      const startDate = parseLocalDate(formData.startDate);
      const dayOfWeekName = getDayOfWeekName(formData.startDate);
      const dayOfWeek = dayOfWeekName.toLowerCase() as DayOfWeek;

      // Map display game type to database format
      const gameTypeMap: Record<string, GameType> = {
        '8-ball': 'eight_ball',
        '9-ball': 'nine_ball',
        '10-ball': 'ten_ball'
      };
      const gameType = gameTypeMap[formData.gameType] || 'eight_ball';

      console.log('📋 Creating league with TanStack Query mutation');

      // Create league using TanStack Query mutation
      const newLeague = await createLeagueMutation.mutateAsync({
        operatorId,
        gameType,
        dayOfWeek,
        teamFormat: formData.teamFormat as TeamFormat,
        leagueStartDate: formData.startDate,
        division: formData.qualifier || null,
      });

      console.log('✅ League created successfully!');
      console.log('📊 New league:', newLeague);

      // Generate league names for display
      const leagueComponents = {
        organizationName: 'Test Organization', // TODO: Get from operator profile
        year: startDate.getFullYear(),
        season: getTimeOfYear(startDate),
        gameType: formData.gameType,
        dayOfWeek: dayOfWeekName,
        qualifier: formData.qualifier
      };
      const allNames = generateAllLeagueNames(leagueComponents);

      console.group('📛 FORMATTED LEAGUE NAMES (for display)');
      console.log('Systematic Name:', allNames.systematicName);
      console.log('Player-Friendly Name:', allNames.playerFriendlyName);
      console.log('Operator Management Name:', allNames.operatorName);
      console.log('Full Display Name:', allNames.fullDisplayName);
      console.groupEnd();

      console.groupEnd();

      // Clear localStorage after successful creation
      clearFormData();

      // Navigate back to dashboard
      navigate('/operator-dashboard');

    } catch (error) {
      console.error('❌ Failed to create league:', error);
      // TODO: Show error message to user
    }
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
            isSubmitting={isCreating}
          />
        </div>

        {/* League Preview */}
        <LeaguePreview formData={formData} />
      </div>
    </div>
  );
};
