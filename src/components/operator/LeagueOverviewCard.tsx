/**
 * @fileoverview LeagueOverviewCard Component
 * Displays key league information in a card format
 */
import React from 'react';
import type { League } from '@/types/league';
import { formatGameType, formatDayOfWeek } from '@/types/league';

interface LeagueOverviewCardProps {
  /** League data to display */
  league: League;
}

/**
 * LeagueOverviewCard Component
 *
 * Displays league details including:
 * - Game type (8-Ball, 9-Ball, 10-Ball)
 * - League night (day of week)
 * - Team format (5-Man or 8-Man)
 * - Division identifier (if any)
 * - League start date
 * - Created date
 */
export const LeagueOverviewCard: React.FC<LeagueOverviewCardProps> = ({ league }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">League Overview</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Game Type</h3>
          <p className="text-gray-900">{formatGameType(league.game_type)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">League Night</h3>
          <p className="text-gray-900">{formatDayOfWeek(league.day_of_week)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Team Format</h3>
          <p className="text-gray-900">
            {league.team_format === '5_man' ? '5-Man Format' : '8-Man Format'}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Division</h3>
          <p className="text-gray-900">{league.division || 'None'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">League Start Date</h3>
          <p className="text-gray-900">
            {new Date(league.league_start_date).toLocaleDateString()}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Created</h3>
          <p className="text-gray-900">
            {new Date(league.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};
