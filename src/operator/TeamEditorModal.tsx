/**
 * @fileoverview Team Editor Modal
 *
 * Modal form for creating and editing teams.
 * Allows operators to set team name, captain, home venue, and roster players.
 *
 * Profanity Validation:
 * - If operator has profanity_filter_enabled, team names are validated for profanity
 * - Team names containing profanity will be rejected with an error message
 */
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateTeam, useUpdateTeam } from '@/api/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CapitalizeInput } from '@/components/ui/capitalize-input';
import { MemberCombobox } from '@/components/MemberCombobox';
import { InfoButton } from '@/components/InfoButton';
import { useRosterEditor } from '@/hooks/useRosterEditor';
import { useOperatorProfanityFilter } from '@/hooks/useOperatorProfanityFilter';
import { containsProfanity } from '@/utils/profanityFilter';
import type { PartialMember } from '@/types/member';
import type { Venue, LeagueVenue } from '@/types/venue';
import type { TeamFormat } from '@/types/league';
import { logger } from '@/utils/logger';

interface TeamEditorModalProps {
  /** League ID for the team */
  leagueId: string;
  /** Season ID for the team */
  seasonId: string;
  /** Team format (5_man or 8_man) */
  teamFormat: TeamFormat;
  /** Available venues for home venue selection */
  venues: Venue[];
  /** League venues assignments */
  leagueVenues: LeagueVenue[];
  /** Available members for captain/player selection (only needs id, name, player number) */
  members: PartialMember[];
  /** Default team name (e.g., "Team 1") */
  defaultTeamName: string;
  /** All teams (for cross-team duplicate validation) */
  allTeams: import('@/types/team').TeamWithQueryDetails[];
  /** Existing team to edit (optional) */
  existingTeam?: {
    id: string;
    team_name: string;
    captain_id: string;
    home_venue_id: string | null;
    roster_size: number;
  } | null;
  /** Called when team is successfully created/updated */
  onSuccess: () => void;
  /** Called when user cancels or closes modal */
  onCancel: () => void;
  /** Variant: 'operator' allows all edits, 'captain' restricts captain field */
  variant?: 'operator' | 'captain';
}

/**
 * TeamEditorModal Component
 *
 * Creates or edits a team with:
 * - Team name
 * - Captain selection
 * - Home venue
 * - Roster players (5 or 8 based on league format)
 */
export const TeamEditorModal: React.FC<TeamEditorModalProps> = ({
  leagueId,
  seasonId,
  teamFormat,
  venues,
  leagueVenues,
  members,
  defaultTeamName,
  allTeams,
  existingTeam,
  onSuccess,
  onCancel,
  variant = 'operator',
}) => {
  const rosterSize = teamFormat === '5_man' ? 5 : 8;
  const isEditing = !!existingTeam;
  const isCaptainVariant = variant === 'captain';

  /**
   * Get assigned venues for home venue selection
   */
  const assignedVenues = venues.filter(venue =>
    leagueVenues.some(lv => lv.venue_id === venue.id)
  );

  // Auto-populate venue if there's only one available (e.g., in-house leagues)
  const defaultVenueId = assignedVenues.length === 1 ? assignedVenues[0].id : '';

  const [teamName, setTeamName] = useState(existingTeam?.team_name || defaultTeamName);
  const [captainId, setCaptainId] = useState(existingTeam?.captain_id || '');
  const [homeVenueId, setHomeVenueId] = useState(existingTeam?.home_venue_id || defaultVenueId);
  const [error, setError] = useState<string | null>(null);

  // Mutation hooks
  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();

  const saving = createTeamMutation.isPending || updateTeamMutation.isPending;

  // Check if operator has profanity filter enabled
  const { shouldValidate: operatorProfanityFilterEnabled } = useOperatorProfanityFilter(leagueId);

  // Use roster editor hook for roster management
  const {
    playerIds,
    rosterError,
    handlePlayerChange,
    validateRoster,
    clearRosterError,
    getAllPlayerIds,
  } = useRosterEditor({
    rosterSize,
    captainId,
    existingTeamId: existingTeam?.id,
    allTeams,
    seasonId,
  });

  /**
   * Get all player IDs from other teams in this season
   * Used to prevent duplicate player assignments across teams
   */
  const getPlayersOnOtherTeams = (): string[] => {
    const playerIds: string[] = [];

    allTeams.forEach((team) => {
      // Skip the current team being edited
      if (existingTeam && team.id === existingTeam.id) return;

      // Add captain
      if (team.captain_id) {
        playerIds.push(team.captain_id);
      }

      // Add roster players
      team.team_players?.forEach((tp) => {
        if (tp.member_id) {
          playerIds.push(tp.member_id);
        }
      });
    });

    return playerIds;
  };

  const excludedPlayerIds = getPlayersOnOtherTeams();

  /**
   * Get excluded player IDs for a specific roster slot
   * Excludes: players on other teams + captain + players in other slots
   */
  const getExcludedIdsForSlot = (currentSlotIndex: number): string[] => {
    const excluded = [...excludedPlayerIds];

    // Exclude captain
    if (captainId) {
      excluded.push(captainId);
    }

    // Exclude players already selected in other roster slots
    playerIds.forEach((playerId, index) => {
      if (playerId && index !== currentSlotIndex) {
        excluded.push(playerId);
      }
    });

    return excluded;
  };

  /**
   * Validate form data
   */
  const validate = (): string | null => {
    if (!teamName.trim()) return 'Team name is required';

    // Check for profanity if operator has filter enabled
    if (operatorProfanityFilterEnabled && containsProfanity(teamName)) {
      return 'Team name contains inappropriate language. Please choose a different name.';
    }

    if (!captainId) return 'Captain is required';

    // Validate roster using hook
    return validateRoster();
  };

  /**
   * Handle form submission (create or update)
   */
  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    try {
      const rosterPlayers = getAllPlayerIds();

      if (isEditing && existingTeam) {
        // UPDATE existing team
        await updateTeamMutation.mutateAsync({
          teamId: existingTeam.id,
          seasonId,
          captainId,
          teamName: teamName.trim(),
          homeVenueId: homeVenueId || null,
          rosterPlayerIds: rosterPlayers,
          isCaptainVariant,
        });

      } else {
        // CREATE new team
        await createTeamMutation.mutateAsync({
          seasonId,
          leagueId,
          captainId,
          teamName: teamName.trim(),
          rosterSize,
          homeVenueId: homeVenueId || null,
          rosterPlayerIds: rosterPlayers,
        });

      }

      onSuccess();
    } catch (err) {
      logger.error('Error saving team', { error: err instanceof Error ? err.message : String(err) });
      setError(err instanceof Error ? err.message : 'Failed to save team');
    }
  };

  /**
   * Handle escape key to close modal
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Team' : 'Add New Team'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-gray-600 mb-3">Build your team</p>
          <InfoButton
            title="Team Setup Guidelines"
            label="Minimum: Assign Captain"
          >
            <p className="mb-3">
              Captains have the authority to manage their teams throughout the season, including:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>Adding and removing players from the roster</li>
              <li>Updating the team name</li>
              <li>Selecting the home venue</li>
            </ul>
            <p className="text-xs text-gray-600">
              As a league operator, you can make changes to any team at any time.
            </p>
          </InfoButton>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Team Name */}
          <div>
            <CapitalizeInput
              id="team-name"
              label="Team Name"
              value={teamName}
              onChange={(newValue) => {
                setTeamName(newValue);
                setError(null);
                clearRosterError();
              }}
              placeholder="e.g., The Hustlers"
              defaultCapitalize={true}
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum 20 characters ({teamName.length}/20)
            </p>
          </div>

          {/* Home Venue (Optional) */}
          {assignedVenues.length > 0 && (
            <div>
              <Label>Home Venue (Optional)</Label>
              <Select value={homeVenueId} onValueChange={setHomeVenueId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select home venue..." />
                </SelectTrigger>
                <SelectContent>
                  {assignedVenues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Captain */}
          {isCaptainVariant ? (
            <div>
              <Label>Captain</Label>
              <Input
                type="text"
                value={members.find(m => m.id === captainId)?.first_name + ' ' + members.find(m => m.id === captainId)?.last_name || 'Unknown'}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-600 mt-1">
                Captain cannot be changed. Contact your league operator if needed.
              </p>
            </div>
          ) : (
            <MemberCombobox
              label="Captain"
              members={members}
              value={captainId}
              onValueChange={setCaptainId}
              placeholder="Select team captain..."
              excludeIds={[...excludedPlayerIds, ...playerIds.filter(id => id)]}
            />
          )}

          {/* Roster Players */}
          <div>
            <Label className="mb-3 block">
              Roster Players (Optional - {rosterSize} max)
            </Label>
            <p className="text-xs text-gray-600 mb-4">
              Captain is automatically added to the roster. You can add up to {rosterSize - 1} additional players.
            </p>
            <div className="space-y-3">
              {Array.from({ length: rosterSize - 1 }).map((_, index) => (
                <MemberCombobox
                  key={index}
                  members={members}
                  value={playerIds[index]}
                  onValueChange={(memberId) => handlePlayerChange(index, memberId)}
                  placeholder={`Player ${index + 2} (optional)`}
                  showClear={true}
                  excludeIds={getExcludedIdsForSlot(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {/* Error message */}
          {(error || rosterError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm font-medium">{error || rosterError}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving
                ? (isEditing ? 'Saving...' : 'Creating Team...')
                : (isEditing ? 'Save Changes' : 'Create Team')
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
