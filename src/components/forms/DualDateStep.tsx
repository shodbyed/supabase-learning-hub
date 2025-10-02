/**
 * @fileoverview DualDateStep Component
 * Custom step component for entering two dates (start and end) with validation
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { InfoButton } from '../InfoButton';

interface DualDateStepProps {
  title: string;
  subtitle?: string | React.ReactElement;
  startValue: string;
  endValue: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onCancel?: () => void;
  canGoBack: boolean;
  isLastQuestion: boolean;
  infoTitle?: string;
  infoContent?: React.ReactNode;
  infoLabel?: string;
  error?: string;
}

/**
 * DualDateStep Component
 *
 * Renders two date inputs (start and end) with validation and navigation
 */
export const DualDateStep: React.FC<DualDateStepProps> = ({
  title,
  subtitle,
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  onNext,
  onPrevious,
  onCancel,
  canGoBack,
  isLastQuestion,
  infoTitle,
  infoContent,
  infoLabel,
  error
}) => {
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  const handleNext = () => {
    // Validate both dates are entered
    if (!startValue || !endValue) {
      setLocalError('Both start and end dates are required');
      return;
    }

    // Validate dates are valid
    const start = new Date(startValue);
    const end = new Date(endValue);

    if (isNaN(start.getTime())) {
      setLocalError('Please enter a valid start date');
      return;
    }

    if (isNaN(end.getTime())) {
      setLocalError('Please enter a valid end date');
      return;
    }

    if (end <= start) {
      setLocalError('End date must be after start date');
      return;
    }

    setLocalError(undefined);
    onNext();
  };

  const displayError = error || localError;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-lg">

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {title}
          </h2>

          {/* Info Button on separate line */}
          {infoTitle && infoContent && (
            <div className="mb-6">
              <InfoButton title={infoTitle} label={infoLabel}>
                {infoContent}
              </InfoButton>
            </div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <div className="text-gray-600 mb-8">
              {subtitle}
            </div>
          )}

          {/* Date Inputs */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <Calendar
                value={startValue}
                onChange={(value: string) => {
                  onStartChange(value);
                  setLocalError(undefined);
                }}
                placeholder="Select start date"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <Calendar
                value={endValue}
                onChange={(value: string) => {
                  onEndChange(value);
                  setLocalError(undefined);
                }}
                placeholder="Select end date"
              />
            </div>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{displayError}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {canGoBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                className="flex-1"
              >
                Previous
              </Button>
            )}

            <Button
              type="button"
              onClick={handleNext}
              className="flex-1"
            >
              {isLastQuestion ? 'Finish' : 'Next'}
            </Button>
          </div>

          {/* Cancel Button */}
          {onCancel && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Cancel and return to dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};