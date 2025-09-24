/**
 * @fileoverview League Operator Application Form - Main Component
 *
 * This is the main orchestrator component for the league operator application.
 * It's been heavily refactored to be clean and focused on just rendering
 * and coordinating between smaller, specialized components.
 *
 * COMPONENT STRUCTURE:
 * 1. Uses custom hook (useApplicationForm) for ALL state management
 * 2. Renders appropriate question component based on current step
 * 3. Shows live preview of application data
 * 4. Handles modal overlays for disclaimers and guides
 *
 * STATE MANAGEMENT:
 * - All complex state logic moved to useApplicationForm hook
 * - Question definitions moved to questionDefinitions.tsx
 * - Form reducer logic moved to applicationReducer.ts
 * - Modal components extracted to separate files
 */
import React, { useEffect } from 'react';
import { QuestionStep } from './QuestionStep';
import { ChoiceStep } from './ChoiceStep';
import { ApplicationPreview } from './ApplicationPreview';
import { SecurityDisclaimerModal } from './SecurityDisclaimerModal';
import { SetupGuideModal } from './SetupGuideModal';
import { useApplicationForm } from './useApplicationForm';
import { leagueEmailSchema } from '../schemas/leagueOperatorSchema';

/**
 * League Operator Application Form Component
 *
 * Main entry point for the league operator onboarding survey.
 * Presents questions one at a time with dynamic preview and navigation.
 *
 * FLOW:
 * 1. Organization name input
 * 2. Address selection (profile vs custom)
 * 3. Contact information disclaimer and setup
 * 4. [Future] Venue information
 * 5. [Future] Contact method selection
 */
export const LeagueOperatorApplication: React.FC = () => {
  // Get all form state and handlers from custom hook
  const {
    // Application data
    state,

    // Current question navigation
    currentStep,
    currentQuestion,
    isLastQuestion,
    canGoBack,

    // Input handling
    currentInput,
    error,
    handleInputChange,
    handleChoiceSelect,
    handleSaveCurrentInput,

    // Navigation
    handleNext,
    handlePrevious,

    // Modal states and controls
    showSecurityDisclaimer,
    setShowSecurityDisclaimer,
    showSetupGuide,
    setShowSetupGuide,

    // Utility functions
    setCurrentInput,
  } = useApplicationForm();

  /**
   * Check if the application is complete (all required fields filled)
   * TODO: Update this function as we add more questions to the form.
   * Currently only checks the first 3 questions, but we'll be adding venue
   * questions, contact method selection, and other required fields.
   * This completion check must be updated to include ALL required questions.
   */
  const isApplicationComplete = (): boolean => {
    // Check if we have completed all questions
    return (
      // Organization name filled
      !!state.leagueName &&
      // Address choice made and filled
      state.useProfileAddress !== undefined &&
      (state.useProfileAddress ||
        (!!state.organizationAddress && !!state.organizationCity && !!state.organizationState && !!state.organizationZipCode)
      ) &&
      // Contact disclaimer acknowledged
      state.contactDisclaimerAcknowledged === true &&
      // League email choice made and filled (with validation for custom email)
      state.useProfileEmail !== undefined &&
      (state.useProfileEmail || (!!state.leagueEmail && (() => {
        try {
          leagueEmailSchema.parse(state.leagueEmail);
          return true;
        } catch {
          return false;
        }
      })()))
      // TODO: Add checks for future questions:
      // - Venue information (name, address, tables, etc.)
      // - Contact method selection (phone, etc.)
      // - Any other required fields we add to the form
    );
  };

  /**
   * Sync input field with current question's value when navigating
   * This ensures the input shows the saved value when user goes back to a question
   * Only runs when the step changes, not on every render
   */
  useEffect(() => {
    if (currentQuestion?.getValue && currentQuestion.type !== 'choice') {
      const savedValue = currentQuestion.getValue();
      // Only set if we actually have a saved value, otherwise let user type freely
      if (savedValue) {
        setCurrentInput(savedValue);
      }
    }
  }, [currentStep]); // Only depend on currentStep, not currentQuestion or setCurrentInput

  /**
   * Handle Enter key press in input fields
   * Saves current input and moves to next question if valid
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const success = handleSaveCurrentInput();
      if (success) {
        handleNext();
      }
    }
  };

  /**
   * Handle form submission (when user clicks Continue on last question)
   * In the future, this will save the application data
   */
  const handleSubmit = () => {
    // For now, just console.log the completed application
    console.log('League Operator Application Submitted:', state);

    // Clear saved progress since form is submitted
    try {
      localStorage.removeItem('leagueOperatorApplication');
      localStorage.removeItem('leagueOperatorApplication_currentStep');
    } catch (error) {
      console.warn('Failed to clear saved progress:', error);
    }

    // TODO: In the future, this will:
    // 1. Validate all required fields are complete
    // 2. Save application data to Supabase
    // 3. Navigate to next step (venue setup, etc.)
    // 4. Show success message

    alert('Application submitted! (This is temporary - will integrate with database later)');
  };

  /**
   * Handle Next button click
   * For input questions: saves current input first, then navigates
   * For choice questions: just navigates (choice is already saved)
   * For last question: submits the application
   */
  const handleContinue = () => {
    if (isLastQuestion) {
      handleSubmit();
      return;
    }

    // For input questions, save current input before proceeding
    if (currentQuestion.type !== 'choice') {
      const success = handleSaveCurrentInput();
      if (!success) return; // Don't proceed if validation failed
    }

    handleNext();
  };

  // Show loading state if no current question is available
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading application form...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {/* TODO: Update when more questions added */} 4
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Question Area (2/3 width on large screens) */}
          <div className="lg:col-span-2">
            {/* Render appropriate question component based on type */}
            {currentQuestion.type === 'choice' ? (
              <ChoiceStep
                title={currentQuestion.title}
                subtitle={currentQuestion.subtitle}
                content={currentQuestion.content}
                choices={currentQuestion.choices || []}
                selectedValue={currentQuestion.getValue()}
                onSelect={handleChoiceSelect}
                onNext={handleContinue}
                onPrevious={handlePrevious}
                canGoBack={canGoBack}
                isLastQuestion={isLastQuestion}
                infoTitle={currentQuestion.infoTitle}
                infoContent={currentQuestion.infoContent}
                additionalContent={currentQuestion.additionalContent}
                error={error}
              />
            ) : (
              <QuestionStep
                title={currentQuestion.title}
                subtitle={currentQuestion.subtitle || ''}
                placeholder={currentQuestion.placeholder || ''}
                value={currentInput}
                onChange={handleInputChange}
                onNext={handleContinue}
                onPrevious={handlePrevious}
                onKeyDown={handleKeyDown}
                onFormat={currentQuestion.formatter || undefined}
                validator={currentQuestion.validator || undefined}
                error={error}
                canGoBack={canGoBack}
                isLastQuestion={isLastQuestion}
                infoTitle={currentQuestion.infoTitle}
                infoContent={currentQuestion.infoContent}
              />
            )}
          </div>

          {/* Live Preview Panel (1/3 width on large screens) */}
          <div className="lg:col-span-1">
            <ApplicationPreview
              applicationData={state}
              isComplete={isApplicationComplete()}
            />
          </div>
        </div>
      </div>

      {/* Modal Overlays */}

      {/* Security Warning Modal */}
      {/* TODO: Have a lawyer review this disclaimer to ensure it's legally enforceable and provides adequate protection */}
      <SecurityDisclaimerModal
        isOpen={showSecurityDisclaimer}
        onClose={() => setShowSecurityDisclaimer(false)}
      />

      {/* Professional Setup Guide Modal */}
      <SetupGuideModal
        isOpen={showSetupGuide}
        onClose={() => setShowSetupGuide(false)}
      />
    </div>
  );
};