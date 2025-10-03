/**
 * @fileoverview Wizard Step Renderer Component
 *
 * Renders different types of wizard steps (choice, dual date, input) based on step configuration.
 * Used by multi-step wizards like LeagueCreationWizard to display the appropriate step UI.
 */
import React from 'react';
import { QuestionStep } from './QuestionStep';
import { RadioChoiceStep } from './RadioChoiceStep';
import { DualDateStep } from './DualDateStep';
import type { WizardStep, LeagueFormData } from '@/data/leagueWizardSteps';
import type { Member } from '@/types';

interface WizardStepRendererProps {
  /** Current step configuration */
  currentStep: WizardStep;
  /** Whether this is the last step in the wizard */
  isLastStep: boolean;
  /** Whether user can navigate back */
  canGoBack: boolean;
  /** Current input value (for input-type steps) */
  currentInput: string;
  /** Form data for dual date steps */
  formData: LeagueFormData;
  /** Member data for database operations */
  member: Member | null;
  /** Validation error message */
  error?: string;
  /** Handler for input changes */
  onInputChange: (value: string) => void;
  /** Handler for choice selection */
  onChoiceSelect: (choiceId: string) => void;
  /** Handler for next button */
  onNext: () => void;
  /** Handler for previous button */
  onPrevious: () => void;
  /** Handler for cancel button */
  onCancel: () => void;
  /** Handler for form data updates */
  updateFormData: (field: keyof LeagueFormData, value: string | number) => void;
}

/**
 * Wizard Step Renderer
 *
 * Dynamically renders the appropriate step component based on step type:
 * - 'choice': RadioChoiceStep for single/multiple selection
 * - 'dual_date': DualDateStep for date range selection
 * - 'input': QuestionStep for text/date input
 */
export const WizardStepRenderer: React.FC<WizardStepRendererProps> = ({
  currentStep,
  isLastStep,
  canGoBack,
  currentInput,
  formData,
  member,
  error,
  onInputChange,
  onChoiceSelect,
  onNext,
  onPrevious,
  onCancel,
  updateFormData
}) => {
  // Render choice-based step (radio buttons)
  if (currentStep.type === 'choice') {
    return (
      <RadioChoiceStep
        title={currentStep.title}
        subtitle={currentStep.subtitle}
        choices={currentStep.choices || []}
        selectedValue={currentStep.getValue()}
        onSelect={onChoiceSelect}
        onNext={onNext}
        onPrevious={onPrevious}
        onCancel={onCancel}
        canGoBack={canGoBack}
        isLastQuestion={isLastStep}
        infoTitle={currentStep.infoTitle}
        infoContent={currentStep.infoContent ?? undefined}
        infoLabel={currentStep.infoLabel}
        error={error}
      />
    );
  }

  // Render dual date step (date range picker)
  if (currentStep.type === 'dual_date') {
    return (
      <DualDateStep
        title={currentStep.title}
        subtitle={currentStep.subtitle || ''}
        startValue={formData.bcaNationalsStart}
        endValue={formData.bcaNationalsEnd}
        onStartChange={(value: string) => {
          updateFormData('bcaNationalsStart', value);
          console.log('📝 CUSTOM BCA DATE: User entered start date:', value);
        }}
        onEndChange={(value: string) => {
          updateFormData('bcaNationalsEnd', value);
          console.log('📝 CUSTOM BCA DATE: User entered end date:', value);
          if (formData.bcaNationalsStart && value) {
            console.log('🔄 DATABASE OPERATION: Saving custom BCA tournament dates for voting');
            console.log('📊 New entry structure:', {
              table: 'tournament_dates',
              data: {
                organization: 'BCA',
                tournament_type: 'nationals',
                year: new Date().getFullYear(),
                start_date: formData.bcaNationalsStart,
                end_date: value,
                entered_by: member?.id,
                vote_count: 1,
                created_at: new Date().toISOString()
              }
            });
          }
        }}
        onNext={onNext}
        onPrevious={onPrevious}
        onCancel={onCancel}
        canGoBack={canGoBack}
        isLastQuestion={isLastStep}
        infoTitle={currentStep.infoTitle}
        infoContent={currentStep.infoContent ?? undefined}
        infoLabel={currentStep.infoLabel}
        error={error}
      />
    );
  }

  // Render input step (text or date input)
  return (
    <QuestionStep
      title={currentStep.title}
      subtitle={currentStep.subtitle || ''}
      placeholder={currentStep.placeholder || ''}
      value={currentInput}
      onChange={onInputChange}
      onNext={onNext}
      onPrevious={onPrevious}
      onCancel={onCancel}
      canGoBack={canGoBack}
      isLastQuestion={isLastStep}
      infoTitle={currentStep.infoTitle}
      infoContent={currentStep.infoContent ?? undefined}
      error={error}
      inputType={
        currentStep.id === 'start_date' ||
        currentStep.id === 'bca_custom_start_date' ||
        currentStep.id === 'bca_custom_end_date'
          ? 'date' : 'text'
      }
    />
  );
};
