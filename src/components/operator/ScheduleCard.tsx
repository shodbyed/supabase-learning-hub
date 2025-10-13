/**
 * @fileoverview ScheduleCard Component
 * Displays schedule for a league (placeholder for future implementation)
 */
import React from 'react';

interface ScheduleCardProps {
  /** League ID to fetch schedule for */
  leagueId: string;
}

/**
 * ScheduleCard Component
 *
 * Placeholder component that will display:
 * - Weekly matchups
 * - Match dates and times
 * - Venues
 * - Filter by week or team
 */
export const ScheduleCard: React.FC<ScheduleCardProps> = ({ leagueId }) => {
  // TODO: Fetch schedule from database once schedule/matches table exists
  console.log('ScheduleCard for league:', leagueId);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule</h2>
      <div className="text-center py-8">
        <div className="text-4xl mb-3">🗓️</div>
        <p className="text-gray-600">Schedule will be generated after teams are added</p>
      </div>
    </div>
  );
};
