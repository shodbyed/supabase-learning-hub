/**
 * @fileoverview Match Information Card Component
 *
 * Displays match details including date, opponent, home/away status, and venue.
 * Reusable across different lineup pages (regular match, tiebreaker, 5v5).
 */

import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { TeamNameLink } from '@/components/TeamNameLink';
import { parseLocalDate } from '@/utils/formatters';
import { VenueWithMaps } from '@/components/VenueWithMaps';

interface MatchInfoCardProps {
  scheduledDate?: string;
  opponent: {
    id: string;
    name: string;
  } | null;
  isHomeTeam: boolean;
  venueId?: string | null;
}

/**
 * Match information display card
 *
 * Shows match date, opponent, home/away status, and venue in a compact format.
 */
export function MatchInfoCard({
  scheduledDate,
  opponent,
  isHomeTeam,
  venueId,
}: MatchInfoCardProps) {
  return (
    <Card>
      <CardContent className="px-4 py-0 space-y-1">
        {/* Date */}
        {scheduledDate && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {parseLocalDate(scheduledDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        )}

        {/* Matchup */}
        <div className="text-lg font-semibold text-gray-900">
          vs{' '}
          {opponent ? (
            <TeamNameLink teamId={opponent.id} teamName={opponent.name} />
          ) : (
            'BYE'
          )}
        </div>

        {/* Home/Away & Venue on same line */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="font-medium">
            {isHomeTeam ? 'Home Game' : 'Away Game'}
          </span>
          {venueId && (
            <>
              <span>@</span>
              <VenueWithMaps venueId={venueId} className="text-sm" />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
