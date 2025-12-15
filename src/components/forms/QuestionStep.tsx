/**
 * @fileoverview QuestionStep Component
 * Reusable component for displaying individual survey questions with validation and formatting
 */
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { InfoButton } from '../InfoButton';

interface QuestionStepProps {
  title: string;
  subtitle?: string | React.ReactElement;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onNext: (formattedValue?: string) => void;
  onPrevious: () => void;
  onCancel?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFormat?: (value: string) => string;
  error?: string;
  canGoBack: boolean;
  isLastQuestion: boolean;
  infoTitle?: string;
  infoContent?: React.ReactNode;
  inputType?: 'text' | 'date' | 'email' | 'tel'; // New prop to specify input type
  isSubmitting?: boolean;
  /** Shows loading state during navigation (for lazy loading feedback) */
  isNavigating?: boolean;
}

/**
 * QuestionStep Component
 *
 * Displays a single survey question with:
 * - Input field with validation
 * - Auto-capitalize toggle
 * - Navigation buttons
 * - Optional info popup
 */
export const QuestionStep: React.FC<QuestionStepProps> = ({
  title,
  subtitle,
  placeholder,
  value,
  onChange,
  onNext,
  onPrevious,
  onCancel,
  onKeyDown,
  onFormat,
  error,
  canGoBack,
  isLastQuestion,
  infoTitle,
  infoContent,
  inputType = 'text',
  isSubmitting,
  isNavigating
}) => {
  // Track the input ref for triggering blur before navigation
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => {
    // For text inputs with titleCase, trigger blur to apply formatting before proceeding
    if (inputType === 'text' && inputRef.current) {
      inputRef.current.blur();
    }

    // Small delay to ensure blur formatting is applied before navigation
    setTimeout(() => {
      onNext(value);
    }, 10);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {title}
          </h2>
          {infoTitle && infoContent && (
            <InfoButton title={infoTitle}>
              {infoContent}
            </InfoButton>
          )}
        </div>

        <p className="text-gray-600 mb-6">
          {subtitle}
        </p>

        <div className="space-y-6">
          {inputType === 'date' ? (
            <div>
              <Calendar
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                minDate={new Date().toISOString().split('T')[0]} // Today or future
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
          ) : inputType === 'text' ? (
            <Input
              ref={inputRef}
              value={value}
              onChange={(val: string) => onChange(val)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              error={error}
              titleCase
              showCapitalizeCheckbox
              formatFunction={onFormat}
              className="text-lg py-3"
            />
          ) : (
            <Input
              type={inputType}
              value={value}
              onChange={(val: string) => onChange(val)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              error={error}
              className="text-lg py-3"
            />
          )}

          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={!canGoBack}
              >
                Previous
              </Button>
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Cancel
                </Button>
              )}
            </div>

            <Button
              loadingText={isLastQuestion ? 'Submitting...' : 'Loading...'}
              isLoading={isSubmitting || isNavigating}
              onClick={handleNext}
              disabled={!value.trim() || isSubmitting || isNavigating}
            >
              {isLastQuestion ? 'Continue' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};