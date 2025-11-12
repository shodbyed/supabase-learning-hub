/**
 * @fileoverview League Preview Component (Simplified)
 * Displays a preview card showing the league identity information
 * Used in the League Creation Wizard to show real-time preview of the league being created
 */
import { useState } from 'react';
import { Info } from 'lucide-react';
import { formatDateSafe } from './DateField';
import { buildLeagueTitle } from '@/utils/leagueUtils';
import { Button } from '@/components/ui/button';
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
  const [showRosterInfo, setShowRosterInfo] = useState(false);

  // Only show preview if we have at least the start date
  if (!formData.startDate) {
    return null;
  }

  // Build league title using helper function
  const leagueTitle = buildLeagueTitle({
    gameType: formData.gameType,
    dayOfWeek: formData.dayOfWeek,
    division: formData.qualifier,
    season: formData.season,
    year: formData.year > 0 ? formData.year : null
  });

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">League Preview:</h3>

        {/* League Title */}
        {leagueTitle && (
          <h2 className="text-2xl font-bold text-blue-900 mb-4 capitalize">
            {leagueTitle}
          </h2>
        )}

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

          {/* Format Section */}
          {formData.teamFormat && (
            <div className="pt-3 mt-3 border-t border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Format</h4>

              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-blue-800">Roster:</span>{' '}
                  {formData.teamFormat === '5_man' ? '5 Man Rosters' : '8 Man Rosters'}
                </p>
                {formData.teamFormat === '5_man' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-blue-200"
                    onClick={() => setShowRosterInfo(!showRosterInfo)}
                    title="Round Robin x2 Format Info"
                  >
                    <Info className="h-4 w-4 text-blue-700" />
                  </Button>
                )}
              </div>

              {showRosterInfo && formData.teamFormat === '5_man' && (
                <div className="mt-2 p-3 bg-blue-100 rounded-md border border-blue-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-blue-900">Round Robin x2 (RRx2)</span>
                  </div>
                  <div className="text-sm text-blue-900 space-y-1">
                    <p>• Teams have 5 players on their roster</p>
                    <p>• Match lineup: 3 players vs 3 players</p>
                    <p>• Double round robin format</p>
                    <p>• Each player plays each opposing player twice (once breaking, once racking)</p>
                    <p>• Total: 6 games per match (3 breaking, 3 racking)</p>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-700 mt-1">
                <span className="font-medium text-blue-800">Handicap System:</span>{' '}
                {formData.handicapVariant === 'none'
                  ? 'None'
                  : formData.handicapSystem === 'custom_5man'
                    ? 'Custom 3v3 Double Round Robin'
                    : 'BCA Standard'}
              </p>

              <p className="text-sm text-gray-700 mt-1">
                <span className="font-medium text-blue-800">Variation:</span>{' '}
                {formData.handicapVariant === 'none'
                  ? 'None'
                  : formData.handicapVariant === 'standard'
                    ? 'Standard'
                    : formData.handicapVariant === 'reduced'
                      ? 'Reduced'
                      : 'Not set'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
