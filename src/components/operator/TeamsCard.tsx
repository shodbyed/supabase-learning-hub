/**
 * @fileoverview TeamsCard Component
 * Displays teams for a league (placeholder for future implementation)
 */
import React from 'react';

interface TeamsCardProps {
  /** League ID to fetch teams for */
  leagueId: string;
}

/**
 * TeamsCard Component
 *
 * Placeholder component that will display:
 * - List of teams enrolled in the league
 * - Team captains
 * - Player counts
 * - Team records
 */
export const TeamsCard: React.FC<TeamsCardProps> = ({ leagueId }) => {
  // TODO: Fetch teams from database once teams table exists
  console.log('TeamsCard for league:', leagueId);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Teams</h2>
      <div className="text-center py-8">
        <div className="text-4xl mb-3">👥</div>
        <p className="text-gray-600">Teams will appear here once you create a season</p>
      </div>
    </div>
  );
};
