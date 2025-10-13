/**
 * @fileoverview QuestionStep Component
 * Reusable component for displaying individual survey questions with validation and formatting
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  isSubmitting
}) => {
  const [autoCapitalize, setAutoCapitalize] = useState(true);

  /**
   * Default formatting function for auto-capitalization
   * Capitalizes first letter of each word
   */
  const defaultFormat = (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  };

  // Use provided onFormat or default formatting
  const formatFunction = onFormat || defaultFormat;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Use external onKeyDown if provided, otherwise handle locally
    if (onKeyDown) {
      onKeyDown(e);
      return;
    }

    // Format when user presses Enter (if auto-capitalize is enabled)
    if (e.key === 'Enter' && autoCapitalize && inputType === 'text') {
      const formatted = formatFunction(value);
      onChange(formatted);
    }
  };

  const handleNext = () => {
    // Format before proceeding if auto-capitalize is enabled
    let finalValue = value;
    if (autoCapitalize && inputType === 'text') {
      finalValue = formatFunction(value);
      onChange(finalValue);
    }

    // Always call onNext - let the parent handle validation
    onNext(finalValue);
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
          <div>
            {inputType === 'date' ? (
              <Calendar
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                minDate={new Date().toISOString().split('T')[0]} // Today or future
              />
            ) : (
              <input
                type={inputType}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Auto-Capitalize Toggle - only show for text inputs */}
          {inputType === 'text' && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoCapitalize"
                checked={autoCapitalize}
                onChange={(e) => setAutoCapitalize(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="autoCapitalize" className="text-sm text-gray-700">
                {autoCapitalize
                  ? "Auto-capitalize (press Enter to preview, or Continue to format)"
                  : "Auto-format off (text will appear exactly as entered)"
                }
              </label>
            </div>
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
              onClick={handleNext}
              disabled={!value.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Submitting...' : isLastQuestion ? 'Continue' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};