/**
 * @fileoverview Match Card Component
 *
 * Displays a single match with team names, venue, and status.
 * Reusable component for schedule views, team schedules, and weekly matchups.
 */

import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import type { MatchWithDetails } from '@/types/schedule';

interface MatchCardProps {
  /** Match data with team and venue details */
  match: MatchWithDetails;
  /** Optional: Show week information */
  showWeek?: boolean;
  /** Optional: Highlight a specific team */
  highlightTeamId?: string;
}

/**
 * MatchCard Component
 *
 * Displays a match in a card format showing:
 * - Home team vs Away team
 * - Venue (scheduled or actual)
 * - Week/date information (optional)
 * - Match status
 * - Score (if completed)
 *
 * @example
 * <MatchCard
 *   match={matchData}
 *   showWeek={true}
 *   highlightTeamId={currentTeamId}
 * />
 */
export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  showWeek = false,
  highlightTeamId,
}) => {
  const homeTeam = match.home_team;
  const awayTeam = match.away_team;
  const venue = match.actual_venue_id
    ? match.actual_venue
    : match.scheduled_venue;

  const isBye = !homeTeam || !awayTeam;

  // Status badge styling
  const statusColors = {
    scheduled: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    forfeited: 'bg-red-100 text-red-700',
    postponed: 'bg-yellow-100 text-yellow-700',
  };

  const statusColor = statusColors[match.status] || statusColors.scheduled;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      {/* Week Info (optional) */}
      {showWeek && match.season_week && (
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
          <Calendar className="h-3 w-3" />
          <span>{match.season_week.week_name}</span>
          <span className="text-gray-400">•</span>
          <span>
            {new Date(match.season_week.scheduled_date).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Match Info */}
      {isBye ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            {homeTeam?.team_name || awayTeam?.team_name} has a BYE week
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Teams */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  highlightTeamId === homeTeam?.id
                    ? 'text-blue-600'
                    : 'text-gray-900'
                }`}
              >
                {homeTeam?.team_name || 'Unknown'}
              </p>
              <p className="text-xs text-gray-500">Home</p>
            </div>

            <div className="px-4">
              {match.status === 'completed' &&
              match.home_team_score !== null &&
              match.away_team_score !== null ? (
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {match.home_team_score} - {match.away_team_score}
                  </p>
                </div>
              ) : (
                <div className="text-gray-400 text-2xl font-light">vs</div>
              )}
            </div>

            <div className="flex-1 text-right">
              <p
                className={`font-semibold ${
                  highlightTeamId === awayTeam?.id
                    ? 'text-blue-600'
                    : 'text-gray-900'
                }`}
              >
                {awayTeam?.team_name || 'Unknown'}
              </p>
              <p className="text-xs text-gray-500">Away</p>
            </div>
          </div>

          {/* Venue */}
          {venue && (
            <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t border-gray-100">
              <MapPin className="h-4 w-4" />
              <span>{venue.name}</span>
              {match.actual_venue_id && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                  Venue Changed
                </span>
              )}
            </div>
          )}

          {/* Status Badge */}
          <div className="flex justify-end">
            <span
              className={`text-xs px-2 py-1 rounded ${statusColor}`}
            >
              {match.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
