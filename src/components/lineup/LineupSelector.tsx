/**
 * @fileoverview Lineup Selector Component
 *
 * Handles player selection for match lineups with configurable player counts.
 * Supports 3v3 (3 players) and 5v5 (5 players) formats.
 * Automatically fetches team members and adds substitute option to dropdowns.
 * Enforces one position per player/substitute rule.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Special substitute member IDs
const SUB_HOME_ID = '00000000-0000-0000-0000-000000000001';
const SUB_AWAY_ID = '00000000-0000-0000-0000-000000000002';

export interface LineupPlayer {
  position: number; // 1-indexed position
  playerId: string;
  handicap: number;
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  handicap: number;
}

interface LineupSelectorProps {
  team: {
    id: string;
    roster_size: number; // 5 = 3v3, 8 = 5v5
  };
  isHomeTeam: boolean;
  allowedPlayerIds?: string[]; // Optional - for tiebreaker restrictions
  showHandicaps?: boolean;
  onLineupChange: (lineup: LineupPlayer[]) => void;
  onSubstituteSelected?: (position: number) => void;
  locked?: boolean;
  initialLineup?: LineupPlayer[];
  testHandicaps?: Record<string, number>;
}

/**
 * Format handicap display
 */
function formatHandicap(handicap: number): string {
  return handicap === Math.floor(handicap) ? handicap.toString() : handicap.toFixed(1);
}

/**
 * Lineup selector with dynamic player count
 *
 * Fetches team members, adds substitute option, and enforces selection rules.
 */
export function LineupSelector({
  team,
  isHomeTeam,
  allowedPlayerIds,
  showHandicaps = true,
  onLineupChange,
  onSubstituteSelected,
  locked = false,
  initialLineup = [],
  testHandicaps = {},
}: LineupSelectorProps) {
  // Determine player count from roster size
  const playerCount = team.roster_size === 5 ? 3 : 5;
  const substituteId = isHomeTeam ? SUB_HOME_ID : SUB_AWAY_ID;

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayers, setSelectedPlayers] = useState<Record<number, string>>({});

  // Fetch team members
  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const { data: playersData, error } = await supabase
          .from('team_players')
          .select(`
            members:members!team_players_member_id_fkey(
              id,
              first_name,
              last_name,
              nickname
            )
          `)
          .eq('team_id', team.id);

        if (error) throw error;

        // Transform to team members (handicaps will be passed via props or calculated)
        const members: TeamMember[] = (playersData || []).map((p: any) => ({
          id: p.members.id,
          firstName: p.members.first_name,
          lastName: p.members.last_name,
          nickname: p.members.nickname,
          handicap: 0, // Will be overridden by parent
        }));

        setTeamMembers(members);
      } catch (err) {
        console.error('Error fetching team members:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamMembers();
  }, [team.id]);

  // Initialize from initial lineup
  useEffect(() => {
    if (initialLineup.length > 0) {
      const selections: Record<number, string> = {};
      initialLineup.forEach((player) => {
        selections[player.position] = player.playerId;
      });
      setSelectedPlayers(selections);
    }
  }, [initialLineup]);

  // Notify parent when lineup changes
  useEffect(() => {
    const lineup: LineupPlayer[] = [];
    for (let position = 1; position <= playerCount; position++) {
      const playerId = selectedPlayers[position];
      if (playerId) {
        lineup.push({
          position,
          playerId,
          handicap: getPlayerHandicap(playerId),
        });
      }
    }
    onLineupChange(lineup);
  }, [selectedPlayers, playerCount, testHandicaps]);

  /**
   * Get handicap for a player (with test mode override)
   */
  const getPlayerHandicap = (playerId: string): number => {
    // Test mode override
    if (testHandicaps[playerId] !== undefined) {
      return testHandicaps[playerId];
    }

    // Regular player
    const member = teamMembers.find((m) => m.id === playerId);
    return member?.handicap || 0;
  };

  /**
   * Handle player selection
   */
  const handlePlayerSelect = (position: number, playerId: string) => {
    setSelectedPlayers((prev) => ({
      ...prev,
      [position]: playerId,
    }));

    // If substitute was selected, notify parent
    if (playerId === substituteId && onSubstituteSelected) {
      onSubstituteSelected(position);
    }
  };

  /**
   * Check if a player is already selected in another position
   */
  const isPlayerDisabled = (playerId: string, currentPosition: number): boolean => {
    for (const [position, selectedId] of Object.entries(selectedPlayers)) {
      if (parseInt(position) !== currentPosition && selectedId === playerId) {
        return true;
      }
    }
    return false;
  };

  /**
   * Get available players for a position (filtered by allowedPlayerIds if provided)
   */
  const getAvailablePlayers = (): TeamMember[] => {
    if (allowedPlayerIds) {
      return teamMembers.filter((m) => allowedPlayerIds.includes(m.id));
    }
    return teamMembers;
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading players...</div>;
  }

  const availablePlayers = getAvailablePlayers();

  return (
    <div className="pt-2">
      {/* Header Row */}
      <div className="flex gap-3 items-center pb-1 border-b">
        <div className="w-12 text-center">
          <div className="text-xs font-medium text-gray-500">Player</div>
        </div>
        {showHandicaps && (
          <div className="w-12 text-center">
            <div className="text-xs font-medium text-gray-500">H/C</div>
          </div>
        )}
        <div className="flex-1">
          <div className="text-xs font-medium text-gray-500">Player Name</div>
        </div>
      </div>

      {/* Player Selection Rows */}
      <div className="space-y-2 mt-2">
        {Array.from({ length: playerCount }, (_, i) => i + 1).map((position) => {
          const playerId = selectedPlayers[position];
          const handicap = playerId ? getPlayerHandicap(playerId) : 0;

          return (
            <div key={position} className="flex gap-3 items-center">
              {/* Position Number */}
              <div className="w-12 text-center">
                <div className="text-sm font-semibold text-gray-700">{position}</div>
              </div>

              {/* Handicap */}
              {showHandicaps && (
                <div className="w-12 text-center">
                  <div className="text-sm font-semibold text-blue-600">
                    {playerId ? formatHandicap(handicap) : '-'}
                  </div>
                </div>
              )}

              {/* Player Dropdown */}
              <div className="flex-1">
                <Select
                  value={playerId || ''}
                  onValueChange={(value) => handlePlayerSelect(position, value)}
                  disabled={locked}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select Player ${position}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Team Members */}
                    {availablePlayers.map((member) => (
                      <SelectItem
                        key={member.id}
                        value={member.id}
                        disabled={isPlayerDisabled(member.id, position)}
                      >
                        {member.nickname || `${member.firstName} ${member.lastName}`}
                      </SelectItem>
                    ))}

                    {/* Substitute Option */}
                    <SelectItem
                      value={substituteId}
                      disabled={isPlayerDisabled(substituteId, position)}
                    >
                      Sub ({isHomeTeam ? 'Home' : 'Away'})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
