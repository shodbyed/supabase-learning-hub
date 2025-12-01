/**
 * @fileoverview League Creation Wizard (Simplified)
 *
 * Multi-step wizard for creating the core league identity.
 * Focuses ONLY on: game type, start date, qualifier, and team format/handicap.
 *
 * Season scheduling and team building moved to separate wizards.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserProfile, useCreateLeague, useOrganizationPreferences } from '@/api/hooks';
import { useOrganization } from '@/api/hooks/useOrganizations';
import { useLeagueWizard } from '../hooks/useLeagueWizard';
import { getDayOfWeekName } from '@/utils/formatters';
import { WizardProgress } from '@/components/forms/WizardProgress';
import { LeaguePreview } from '@/components/forms/LeaguePreview';
import { WizardStepRenderer } from '@/components/forms/WizardStepRenderer';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import type { GameType, DayOfWeek, TeamFormat } from '@/types/league';
import { logger } from '@/utils/logger';

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
  const { orgId } = useParams<{ orgId: string }>();
  const { member } = useUserProfile();
  const [createdLeagueId, setCreatedLeagueId] = useState<string | null>(null);

  // Fetch organization with TanStack Query (cached, reusable)
  useOrganization(orgId);
  const organizationId = orgId || null;

  // Fetch organization preferences with TanStack Query (cached, reusable)
  const { data: orgPreferences } = useOrganizationPreferences(organizationId);

  // Use TanStack Query mutation for league creation
  const createLeagueMutation = useCreateLeague();
  const isCreating = createLeagueMutation.isPending;

  /**
   * Clear old form data on mount
   * Organization fetched via TanStack Query hook above
   */
  useEffect(() => {
    // Clear any previous wizard data when starting a new league creation
    // This prevents form fields from pre-filling with old data
    localStorage.removeItem('league-creation-wizard');
    localStorage.removeItem('league-wizard-step');
  }, []);

  /**
   * Handle form submission - create the league in database
   */
  const handleSubmit = async () => {
    if (!organizationId) {
      logger.error('No organization found for league creation');
      return;
    }

    try {
      // Convert formData to database format
      const dayOfWeekName = getDayOfWeekName(formData.startDate);
      const dayOfWeek = dayOfWeekName.toLowerCase() as DayOfWeek;

      // formData.gameType is already in database format (eight_ball, nine_ball, ten_ball)
      const gameType = formData.gameType as GameType;

      // Create league using TanStack Query mutation
      const newLeague = await createLeagueMutation.mutateAsync({
        operatorId: organizationId,
        gameType,
        dayOfWeek,
        teamFormat: formData.teamFormat as TeamFormat,
        handicapVariant: (formData.handicapVariant as 'standard' | 'reduced' | 'none') || 'standard',
        teamHandicapVariant: (formData.teamHandicapVariant as 'standard' | 'reduced' | 'none') || 'standard',
        leagueStartDate: formData.startDate,
        division: formData.qualifier || null,
      });

      // Clear localStorage after successful creation
      clearFormData();

      // Store the created league ID and show success screen
      setCreatedLeagueId(newLeague.id);

    } catch (error) {
      logger.error('Failed to create league', { error: error instanceof Error ? error.message : String(error) });
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
    onSubmit: handleSubmit,
    orgPreferences,
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
      navigate(`/operator-dashboard/${orgId}`);
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

  // Show success screen if league was created
  if (createdLeagueId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                League Created Successfully!
              </h2>
              <p className="text-gray-600">
                Your league has been created. What would you like to do next?
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate(`/league/${createdLeagueId}/create-season`)}
                className="w-full"
                size="lg"
              >
                Create Season
              </Button>
              <Button
                onClick={() => navigate(`/operator-dashboard/${orgId}`)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        backTo={`/operator-dashboard/${orgId}`}
        backLabel="Back to Dashboard"
        title="Create New League"
        organizationId={orgId}
      >
        <button
          onClick={handleClearForm}
          className="text-sm text-red-600 hover:text-red-800 underline mt-2"
          title="Clear all form data and start over"
        >
          Clear Form
        </button>
      </PageHeader>

      <div className="container mx-auto px-4 max-w-4xl py-8">

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

export default LeagueCreationWizard;
