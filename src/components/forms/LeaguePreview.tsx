/**
 * @fileoverview League Preview Component
 * Displays a preview card showing the league name, dates, and tournament scheduling info
 * Used in the League Creation Wizard to show real-time preview of the league being created
 */
import React from 'react';
import { formatDateSafe } from './DateField';
import type { LeagueFormData } from '@/types';

interface LeaguePreviewProps {
  formData: LeagueFormData;
}

/**
 * League Preview Component
 *
 * Shows a formatted preview of the league being created including:
 * - Generated league name
 * - Start date and end date
 * - Week off and playoffs dates
 * - Tournament scheduling information (BCA/APA nationals)
 *
 * Only displays when startDate or endDate are set
 */
export const LeaguePreview: React.FC<LeaguePreviewProps> = ({ formData }) => {
  // Helper to get organization name from formData
  const getOrganizationName = (): string => {
    return formData.organizationName || 'ORGANIZATION_NAME_ERROR';
  };

  // Only show preview if we have date information
  if (!formData.startDate && !formData.endDate) {
    return null;
  }

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-3">League Preview:</h3>

        <p className="text-lg font-semibold text-blue-800 mb-2">
          <span className="text-blue-600">League Name:</span>{' '}
          {`${formData.gameType} ${formData.dayOfWeek} ${formData.season} ${formData.year || ''} ${getOrganizationName()}${formData.qualifier ? ` ${formData.qualifier}` : ''}`.trim()}
        </p>

        {formData.startDate && (
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-medium">Start Date:</span> {formatDateSafe(formData.startDate, 'long')}
          </p>
        )}

        {formData.endDate && (
          <>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">End of Regular Season:</span> {formatDateSafe(formData.endDate, 'long')}
            </p>

            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Week Off:</span>{' '}
              {(() => {
                const [year, month, day] = formData.endDate.split('-');
                const weekOff = new Date(parseInt(year), parseInt(month) - 1, parseInt(day) + 7);
                return formatDateSafe(weekOff.toISOString().split('T')[0], 'long');
              })()}
            </p>

            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Playoffs:</span>{' '}
              {(() => {
                const [year, month, day] = formData.endDate.split('-');
                const playoffs = new Date(parseInt(year), parseInt(month) - 1, parseInt(day) + 14);
                return formatDateSafe(playoffs.toISOString().split('T')[0], 'long');
              })()}
            </p>

            {formData.seasonLength && (
              <p className="text-sm text-gray-700 mb-3">
                <span className="font-medium">Season Length:</span> {formData.seasonLength} weeks
              </p>
            )}

            <p className="text-xs text-gray-400 italic">
              (does not include holiday breaks)
            </p>
          </>
        )}

        {/* Tournament Scheduling Information */}
        {formData.bcaNationalsChoice && (
          <div className="mt-4 pt-3 border-t border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">Tournament Scheduling:</p>

            {formData.bcaNationalsChoice === 'ignore' && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">BCA Nationals:</span> Not scheduling around tournament dates
              </p>
            )}

            {formData.bcaNationalsChoice === 'custom' && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">BCA Nationals:</span> Using custom tournament dates
                {formData.bcaNationalsStart && formData.bcaNationalsEnd && (
                  <span className="text-gray-600 ml-1">
                    ({formatDateSafe(formData.bcaNationalsStart)} - {formatDateSafe(formData.bcaNationalsEnd)})
                  </span>
                )}
              </p>
            )}

            {formData.bcaNationalsChoice.startsWith('found_dates_') && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">BCA Nationals:</span> Using community-verified dates
                {formData.bcaNationalsStart && formData.bcaNationalsEnd && (
                  <span className="text-gray-600 ml-1">
                    ({formatDateSafe(formData.bcaNationalsStart)} - {formatDateSafe(formData.bcaNationalsEnd)})
                  </span>
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
