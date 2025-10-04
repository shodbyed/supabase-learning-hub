/**
 * @fileoverview League Preview Component (Simplified)
 * Displays a preview card showing the league identity information
 * Used in the League Creation Wizard to show real-time preview of the league being created
 */
import { formatDateSafe } from './DateField';
import { generateAllLeagueNames, getTimeOfYear, getDayOfWeek } from '@/utils/leagueUtils';
import type { LeagueFormData } from '@/data/leagueWizardSteps.simple';

interface LeaguePreviewProps {
  formData: LeagueFormData;
}

/**
 * League Preview Component
 *
 * Shows a formatted preview of the core league identity:
 * - Game type
 * - Start date (with formatted display)
 * - Day of week
 * - Season
 * - Year
 * - Optional qualifier
 * - Team format and handicap system
 *
 * Only displays when enough information is available
 */
export const LeaguePreview: React.FC<LeaguePreviewProps> = ({ formData }) => {
  // Only show preview if we have at least the start date
  if (!formData.startDate) {
    return null;
  }

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-blue-900 mb-4">League Preview:</h3>

        <div className="space-y-3">
          {/* Game Type */}
          {formData.gameType && (
            <p className="text-sm text-gray-700">
              <span className="font-medium text-blue-800">Game Type:</span>{' '}
              <span className="capitalize">{formData.gameType.replace('_', '-')}</span>
            </p>
          )}

          {/* Start Date */}
          <p className="text-sm text-gray-700">
            <span className="font-medium text-blue-800">Start Date:</span>{' '}
            {formatDateSafe(formData.startDate, 'long')}
          </p>

          {/* Day of Week */}
          {formData.dayOfWeek && (
            <p className="text-sm text-gray-700">
              <span className="font-medium text-blue-800">League Day:</span>{' '}
              {formData.dayOfWeek}
            </p>
          )}

          {/* Season */}
          {formData.season && (
            <p className="text-sm text-gray-700">
              <span className="font-medium text-blue-800">Season:</span>{' '}
              {formData.season}
            </p>
          )}

          {/* Year */}
          {formData.year > 0 && (
            <p className="text-sm text-gray-700">
              <span className="font-medium text-blue-800">Year:</span>{' '}
              {formData.year}
            </p>
          )}

          {/* Qualifier */}
          {formData.qualifier && (
            <p className="text-sm text-gray-700">
              <span className="font-medium text-blue-800">Qualifier:</span>{' '}
              {formData.qualifier}
            </p>
          )}

          {/* Team Format & Handicap */}
          {formData.teamFormat && (
            <div className="pt-3 mt-3 border-t border-blue-200">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-blue-800">Team Format:</span>{' '}
                {formData.teamFormat === '5_man' ? '5-Man Teams' : '8-Man Teams'}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-medium text-blue-800">Handicap System:</span>{' '}
                {formData.handicapSystem === 'custom_5man'
                  ? 'Custom 5-Man Handicap'
                  : 'BCA Standard Handicap'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
