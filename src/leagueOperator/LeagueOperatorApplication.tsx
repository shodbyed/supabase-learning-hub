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
import { QuestionStep } from '@/components/forms/QuestionStep';
import { ChoiceStep } from '@/components/forms/ChoiceStep';
import { ApplicationPreview } from '@/components/previews/ApplicationPreview';
import { SecurityDisclaimerModal } from '@/components/modals/SecurityDisclaimerModal';
import { SetupGuideModal } from '@/components/modals/SetupGuideModal';
import { useApplicationForm } from './useApplicationForm';
import { leagueEmailSchema, leaguePhoneSchema } from '../schemas/leagueOperatorSchema';

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
      })())) &&
      // League phone choice made and filled (with validation for custom phone)
      state.useProfilePhone !== undefined &&
      (state.useProfilePhone || (!!state.leaguePhone && (() => {
        try {
          leaguePhoneSchema.parse(state.leaguePhone);
          return true;
        } catch {
          return false;
        }
      })())) &&
      // Payment information verified
      state.paymentVerified === true
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
   * Logs all data for database operations and clears form state
   */
  const handleSubmit = () => {
    // Log comprehensive application data for database operations
    console.group('🎯 LEAGUE OPERATOR APPLICATION - DATABASE OPERATIONS');

    console.log('📋 COMPLETE APPLICATION DATA:', state);

    console.group('🏢 ORGANIZATION INFORMATION');
    console.log('Organization Name:', state.leagueName);
    console.log('Use Profile Address:', state.useProfileAddress);

    if (state.useProfileAddress) {
      console.log('📍 Address Source: User Profile Address');
    } else {
      console.log('📍 Custom Organization Address:');
      console.log('  Street:', state.organizationAddress);
      console.log('  City:', state.organizationCity);
      console.log('  State:', state.organizationState);
      console.log('  ZIP:', state.organizationZipCode);
    }
    console.groupEnd();

    console.group('📧 CONTACT INFORMATION');
    console.log('Contact Disclaimer Acknowledged:', state.contactDisclaimerAcknowledged);

    console.log('📧 EMAIL SETUP:');
    console.log('  Use Profile Email:', state.useProfileEmail);
    if (state.useProfileEmail) {
      console.log('  Email Source: User Profile Email');
    } else {
      console.log('  Custom League Email:', state.leagueEmail);
    }
    console.log('  Email Visibility:', state.emailVisibility);

    console.log('📱 PHONE SETUP:');
    console.log('  Use Profile Phone:', state.useProfilePhone);
    if (state.useProfilePhone) {
      console.log('  Phone Source: User Profile Phone');
    } else {
      console.log('  Custom League Phone:', state.leaguePhone);
    }
    console.log('  Phone Visibility:', state.phoneVisibility);
    console.groupEnd();

    console.group('💳 PAYMENT INFORMATION');
    console.log('Payment Token (SECURE):', state.paymentToken);
    console.log('Card Last 4:', state.cardLast4);
    console.log('Card Brand:', state.cardBrand);
    console.log('Expiry Month:', state.expiryMonth);
    console.log('Expiry Year:', state.expiryYear);
    console.log('Billing ZIP:', state.billingZip);
    console.log('Payment Verified:', state.paymentVerified);
    console.groupEnd();

    console.group('🎱 VENUES (FUTURE)');
    console.log('Venues:', state.venues);
    console.log('Note: Venue creation will happen during league setup');
    console.groupEnd();

    console.group('👤 LEGACY CONTACT FIELDS (UNUSED)');
    console.log('Contact Name:', state.contactName);
    console.log('Contact Email:', state.contactEmail);
    console.log('Contact Phone:', state.contactPhone);
    console.log('Note: These fields are not used in current flow');
    console.groupEnd();

    console.group('🔄 NEXT DATABASE OPERATIONS');
    console.log('1. Create league_operators record');
    console.log('2. Store payment token securely');
    console.log('3. Set up operator permissions/role');
    console.log('4. Send welcome email');
    console.log('5. Navigate to league creation flow');
    console.groupEnd();

    console.groupEnd();

    // Clear saved progress since form is submitted
    try {
      localStorage.removeItem('leagueOperatorApplication');
      localStorage.removeItem('leagueOperatorApplication_currentStep');
      console.log('✅ Cleared localStorage progress data');
    } catch (error) {
      console.warn('⚠️ Failed to clear saved progress:', error);
    }

    // TODO: In the future, this will:
    // 1. Validate all required fields are complete
    // 2. Save application data to Supabase tables
    // 3. Create league operator account/permissions
    // 4. Send confirmation email
    // 5. Navigate to league creation dashboard
    // 6. Show success message

    alert('✅ Application submitted successfully!\n\n📊 Check console for complete database operation details.\n\n(Database integration coming soon)');
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
              Step {currentStep + 1} of {/* TODO: Update when more questions added */} 6
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