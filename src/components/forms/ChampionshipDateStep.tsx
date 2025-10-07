/**
 * @fileoverview Championship Date Step Component
 * Dual date picker with "ignore dates" checkbox for championship events
 */
import React from 'react';
import { InfoButton } from '../InfoButton';

interface ChampionshipDateStepProps {
  championshipName: 'BCA' | 'APA';
  startValue: string;
  endValue: string;
  ignored: boolean;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onIgnoredChange: (ignored: boolean) => void;
  websiteUrl: string;
  infoTitle?: string;
  infoContent?: string | React.ReactElement | null;
  infoLabel?: string;
}

/**
 * ChampionshipDateStep Component
 *
 * Displays dual date pickers for championship events with an "ignore" option
 */
export const ChampionshipDateStep: React.FC<ChampionshipDateStepProps> = ({
  championshipName,
  startValue,
  endValue,
  ignored,
  onStartChange,
  onEndChange,
  onIgnoredChange,
  websiteUrl,
  infoTitle,
  infoContent,
  infoLabel,
}) => {
  return (
    <div>
      {/* Ignore Checkbox */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
          <input
            type="checkbox"
            checked={ignored}
            onChange={(e) => onIgnoredChange(e.target.checked)}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <span className="font-medium text-gray-900">
              My players don't attend {championshipName} championships
            </span>
            <p className="text-sm text-gray-600 mt-1">
              Check this to skip scheduling around these dates
            </p>
          </div>
        </label>
      </div>

      {/* Date Pickers (disabled if ignored) */}
      {!ignored && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Championship Start Date
            </label>
            <input
              type="date"
              value={startValue}
              onChange={(e) => onStartChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">
              First day of the {championshipName} championship
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Championship End Date
            </label>
            <input
              type="date"
              value={endValue}
              onChange={(e) => onEndChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">
              Last day of the {championshipName} championship
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 Not sure of the dates?{' '}
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium hover:text-blue-900"
              >
                Check the {championshipName} website
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Info Button */}
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
