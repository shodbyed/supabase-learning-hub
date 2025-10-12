/**
 * @fileoverview Team Roster List Component
 *
 * Displays a team's roster with player names and captain badge.
 * Shows a message if no players are assigned.
 */

import React from 'react';
import { formatPartialMemberNumber, type PartialMember } from '@/types/member';

interface RosterPlayer {
  member_id?: string;
  is_captain?: boolean;
  members?: PartialMember;
}

interface TeamRosterListProps {
  /** Array of roster players with member details */
  rosterPlayers: RosterPlayer[];
}

/**
 * TeamRosterList Component
 *
 * Renders a formatted list of team roster players.
 * Each player shows their name, player number, and captain badge if applicable.
 *
 * @example
 * <TeamRosterList
 *   rosterPlayers={team.team_players?.filter(tp => tp.members) || []}
 * />
 */
export const TeamRosterList: React.FC<TeamRosterListProps> = ({
  rosterPlayers,
}) => {
  if (rosterPlayers.length === 0) {
    return <p className="text-sm text-gray-500 italic">No players assigned</p>;
  }

  return (
    <ul className="space-y-1">
      {rosterPlayers.map((tp) => {
        const member = tp.members;
        if (!member) return null;

        return (
          <li
            key={tp.member_id}
            className="text-sm text-gray-900 flex items-center gap-2"
          >
            <span>
              {member.first_name} {member.last_name}{' '}
              {formatPartialMemberNumber(member)}
            </span>
            {tp.is_captain && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                Captain
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
};
