/**
 * @fileoverview TeamCard Component
 *
 * Displays a player's team with minimal information:
 * - Team name
 * - Home venue
 * - Captain
 * - Full roster of all players
 *
 * Used in the player-facing "My Teams" view.
 */

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPartialMemberNumber } from '@/types/member';
import { formatGameType, formatDayOfWeek } from '@/types/league';
import { Link } from 'react-router-dom';

interface Captain {
  id: string;
  first_name: string;
  last_name: string;
  system_player_number: number;
  bca_member_number: string | null;
}

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  system_player_number: number;
  bca_member_number: string | null;
}

interface Venue {
  id: string;
  name: string;
}

interface Season {
  id: string;
  season_name: string;
  league: {
    id: string;
    game_type: string;
    day_of_week: string;
    division: string | null;
  };
}

interface TeamCardProps {
  teamName: string;
  captain: Captain;
  venue: Venue | null;
  rosterSize: number;
  players: Array<{
    member_id: string;
    is_captain: boolean;
    members: Player;
  }>;
  season: Season;
  leagueId: string;
  seasonId: string;
  currentUserId?: string;
  showEditButton?: boolean;
  onEditClick?: () => void;
}

export function TeamCard({
  teamName,
  captain,
  venue,
  rosterSize,
  players,
  season,
  leagueId,
  seasonId,
  currentUserId,
  showEditButton = false,
  onEditClick
}: TeamCardProps) {
  // Filter out captain from roster (already shown separately)
  const nonCaptainPlayers = players.filter(p => !p.is_captain);

  // Create array of all roster slots (including empty ones)
  const rosterSlots = [];

  // Add actual players (excluding captain)
  for (let i = 0; i < nonCaptainPlayers.length; i++) {
    rosterSlots.push({
      type: 'player' as const,
      player: nonCaptainPlayers[i],
      slotNumber: i + 2 // Start at 2 since captain is slot 1
    });
  }

  // Fill remaining slots with placeholders
  const remainingSlots = rosterSize - players.length; // Total - all players (including captain)
  for (let i = 0; i < remainingSlots; i++) {
    rosterSlots.push({
      type: 'empty' as const,
      slotNumber: nonCaptainPlayers.length + i + 2
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{teamName}</CardTitle>
            <p className="text-base text-gray-700 dark:text-gray-300 mt-1 font-medium">
              {formatGameType(season.league.game_type as any)} • {formatDayOfWeek(season.league.day_of_week as any)}
              {season.league.division && ` • ${season.league.division}`}
            </p>
          </div>
          {showEditButton && onEditClick && (
            <button
              onClick={onEditClick}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Edit Team
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Home Venue */}
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Home Venue</p>
          <p className="text-base text-gray-900 dark:text-gray-100">{venue?.name || 'No venue assigned'}</p>
        </div>

        {/* Captain */}
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Captain</p>
          <p className={`text-base ${captain.id === currentUserId ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {captain.first_name} {captain.last_name} {formatPartialMemberNumber(captain)}
          </p>
        </div>

        {/* Roster (excluding captain) */}
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Roster ({players.length}/{rosterSize})
          </p>
          <ul className="space-y-1">
            {rosterSlots.map((slot, index) => (
              <li
                key={slot.type === 'player' ? slot.player.member_id : `empty-${index}`}
                className={`text-sm ${
                  slot.type === 'player' && slot.player.member_id === currentUserId
                    ? 'font-semibold text-blue-600 dark:text-blue-400'
                    : slot.type === 'empty'
                    ? 'text-gray-400 dark:text-gray-600 italic'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {slot.type === 'player' ? (
                  <>
                    {slot.player.members.first_name} {slot.player.members.last_name}{' '}
                    {formatPartialMemberNumber(slot.player.members)}
                  </>
                ) : (
                  `Player ${slot.slotNumber}`
                )}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      {/* Action Buttons */}
      <CardFooter className="flex gap-3 pt-4">
        <Link to={`/league/${leagueId}/season/${seasonId}/schedule`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Schedule
          </Button>
        </Link>
        <Link to="/score-match" className="flex-1">
          <Button className="w-full">
            Score Match
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
