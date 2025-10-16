/**
 * @fileoverview All Players Roster Card Component
 *
 * Displays a list of all players assigned to any team in the league.
 * Shows players alphabetically by last name with their player number.
 */

import React from 'react';
import type { TeamWithQueryDetails } from '@/types/team';
import type { Member } from '@/types/member';
import { formatPartialMemberNumber } from '@/types/member';

interface AllPlayersRosterCardProps {
  /** All teams with their rosters */
  teams: TeamWithQueryDetails[];
}

interface PlayerInfo {
  memberId: string;
  firstName: string;
  lastName: string;
  playerNumber: string;
  teamName: string;
  isCaptain: boolean;
}

/**
 * AllPlayersRosterCard Component
 *
 * Displays all players currently on teams, sorted alphabetically.
 * Includes:
 * - Player name
 * - Player number
 * - Team assignment indicator (captain icon)
 *
 * @example
 * <AllPlayersRosterCard teams={teams} />
 */
export const AllPlayersRosterCard: React.FC<AllPlayersRosterCardProps> = ({ teams }) => {
  /**
   * Extract all players from all teams and sort alphabetically
   */
  const getAllPlayers = (): PlayerInfo[] => {
    const playersMap = new Map<string, PlayerInfo>();

    teams.forEach((team) => {
      // Add captain
      if (team.captain) {
        playersMap.set(team.captain_id, {
          memberId: team.captain_id,
          firstName: team.captain.first_name,
          lastName: team.captain.last_name,
          playerNumber: formatPartialMemberNumber(team.captain),
          teamName: team.team_name,
          isCaptain: true,
        });
      }

      // Add roster players
      team.team_players?.forEach((tp) => {
        if (tp.members && tp.member_id && !playersMap.has(tp.member_id)) {
          const member = tp.members as Member;
          playersMap.set(tp.member_id, {
            memberId: tp.member_id,
            firstName: member.first_name,
            lastName: member.last_name,
            playerNumber: formatPartialMemberNumber(member),
            teamName: team.team_name,
            isCaptain: tp.is_captain ?? false,
          });
        }
      });
    });

    // Convert to array and sort by last name, then first name
    return Array.from(playersMap.values()).sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    });
  };

  const players = getAllPlayers();

  if (players.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">All Players</h3>
        <p className="text-sm text-gray-600">No players assigned yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-3">
        All Players ({players.length})
      </h3>
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {players.map((player) => (
          <div
            key={player.memberId}
            className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-900">
                {player.lastName}, {player.firstName}
              </span>
              {player.isCaptain && (
                <span
                  className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded"
                  title="Team Captain"
                >
                  C
                </span>
              )}
            </div>
            <span className="text-gray-600 text-xs">{player.playerNumber}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
