/**
 * @fileoverview Date Step Component
 * Wizard step for selecting a single date
 */
import React from 'react';
import { InfoButton } from './InfoButton';

interface DateStepProps {
  value: string;                          // ISO date string
  onChange: (value: string) => void;
  infoTitle?: string;
  infoContent?: string | React.ReactElement | null;
  infoLabel?: string;
}

/**
 * DateStep Component
 *
 * Displays a date picker for wizard steps
 */
export const DateStep: React.FC<DateStepProps> = ({
  value,
  onChange,
  infoTitle,
  infoContent,
  infoLabel,
}) => {
  return (
    <div>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
      />

      {infoTitle && infoContent && (
        <div className="mt-6">
          <InfoButton
            title={infoTitle}
            content={infoContent}
            label={infoLabel}
          />
        </div>
      )}
    </div>
  );
};
