/**
 * @fileoverview Match Card Component
 *
 * Displays a single match with teams, venue, and table information.
 * Reusable component following single responsibility principle.
 */

import React from 'react';
import { MapPin } from 'lucide-react';

interface Team {
  id: string;
  team_name: string;
  captain_id: string;
}

interface Venue {
  id: string;
  name: string;
  street_address?: string;
  city?: string;
  state?: string;
}

interface MatchCardData {
  id: string;
  home_team?: Team | null;
  away_team?: Team | null;
  scheduled_venue?: Venue | null;
  scheduled_venue_id?: string | null;
}

interface MatchCardProps {
  match: MatchCardData;
  tableNumber?: number;
}

/**
 * MatchCard Component
 *
 * Displays match information including teams, venue, and table number.
 * Handles null/undefined values gracefully.
 *
 * @param match - Match data with team and venue details
 * @param tableNumber - Optional venue-specific table number
 */
export const MatchCard: React.FC<MatchCardProps> = ({ match, tableNumber }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        {/* Teams */}
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="text-right flex-1">
              <span className="font-semibold text-gray-900">
                {match.home_team?.team_name || 'BYE'}
              </span>
              <span className="text-xs text-gray-500 ml-2">(Home)</span>
            </div>
            <div className="text-xl font-bold text-gray-400">vs</div>
            <div className="text-left flex-1">
              <span className="font-semibold text-gray-900">
                {match.away_team?.team_name || 'BYE'}
              </span>
              <span className="text-xs text-gray-500 ml-2">(Away)</span>
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="flex items-center gap-2 text-sm text-gray-600 ml-6">
          <MapPin className="h-4 w-4" />
          {match.scheduled_venue ? (
            <div>
              <div className="font-medium">{match.scheduled_venue.name}</div>
              {match.scheduled_venue.city && match.scheduled_venue.state && (
                <div className="text-xs">
                  {match.scheduled_venue.city}, {match.scheduled_venue.state}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 italic">Venue TBD</div>
          )}
        </div>

        {/* Table Number - only show if venue exists and table number provided */}
        {match.scheduled_venue && tableNumber && (
          <div className="ml-6 text-right">
            <div className="text-xs text-gray-500">Table</div>
            <div className="text-lg font-semibold text-gray-900">
              {tableNumber}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
