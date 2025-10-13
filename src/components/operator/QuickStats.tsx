/**
 * @fileoverview QuickStats Component
 * Displays quick statistics for operator dashboard
 */
import React from 'react';

interface QuickStatsProps {
  /** Number of active leagues */
  activeLeagues: number;
  /** Number of active teams (current season) */
  activeTeams?: number;
  /** Number of active players (current season) */
  activePlayers?: number;
  /** Number of active venues */
  activeVenues?: number;
  /** Total seasons completed (all time) */
  totalSeasons?: number;
  /** Total teams (all time) */
  totalTeams?: number;
  /** Total players (all time) */
  totalPlayers?: number;
}

/**
 * QuickStats Component
 *
 * Displays key metrics for the operator with two sections:
 * - Active Stats: Current activity (leagues, teams, players, venues)
 * - Historical Stats: All-time totals (seasons completed, total teams)
 */
export const QuickStats: React.FC<QuickStatsProps> = ({
  activeLeagues,
  activeTeams = 0,
  activePlayers = 0,
  activeVenues = 0,
  totalSeasons = 0,
  totalTeams = 0,
  totalPlayers = 0,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>

      {/* Active Stats Section */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Active</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Leagues</span>
            <span className="font-medium">{activeLeagues}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Teams</span>
            <span className="font-medium">{activeTeams}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Players</span>
            <span className="font-medium">{activePlayers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Venues</span>
            <span className="font-medium">{activeVenues}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-6"></div>

      {/* Historical Stats Section */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">All Time</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Seasons Completed</span>
            <span className="font-medium">{totalSeasons}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Teams</span>
            <span className="font-medium">{totalTeams}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Players</span>
            <span className="font-medium">{totalPlayers}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
