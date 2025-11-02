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
import { supabase } from '@/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MemberCombobox } from '@/components/MemberCombobox';
import { InfoButton } from '@/components/InfoButton';
import { useRosterEditor } from '@/hooks/useRosterEditor';
import { useOperatorProfanityFilter } from '@/hooks/useOperatorProfanityFilter';
import { containsProfanity } from '@/utils/profanityFilter';
import type { Member } from '@/types/member';
import type { Venue, LeagueVenue } from '@/types/venue';
import type { TeamFormat } from '@/types/league';

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
  /** Available members for captain/player selection */
  members: Member[];
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    setSaving(true);
    setError(null);

    try {
      if (isEditing && existingTeam) {
        // UPDATE existing team
        const { error: teamError } = await supabase
          .from('teams')
          .update({
            captain_id: captainId,
            home_venue_id: homeVenueId || null,
            team_name: teamName.trim(),
          })
          .eq('id', existingTeam.id);

        if (teamError) throw teamError;

        console.log('🎱 Team updated:', existingTeam.id);

        // Get current roster to handle captain separately
        const { data: currentRoster } = await supabase
          .from('team_players')
          .select('member_id, is_captain')
          .eq('team_id', existingTeam.id);

        console.log('📋 Current roster:', currentRoster);

        // If captain variant, captain row cannot be deleted by RLS policy
        // So we need to update the captain row instead of delete/insert
        if (isCaptainVariant && currentRoster) {
          const captainRow = currentRoster.find(r => r.is_captain);

          if (captainRow) {
            // Update captain's is_captain flag if needed
            await supabase
              .from('team_players')
              .update({ is_captain: captainRow.member_id === captainId })
              .eq('team_id', existingTeam.id)
              .eq('member_id', captainRow.member_id);
          }

          // Delete only non-captain rows (these CAN be deleted by captain)
          const { error: deleteError } = await supabase
            .from('team_players')
            .delete()
            .eq('team_id', existingTeam.id)
            .neq('member_id', captainRow?.member_id || '');

          if (deleteError) {
            console.error('Delete error:', deleteError);
            throw deleteError;
          }

          console.log('🗑️ Non-captain roster deleted');
        } else {
          // Operator variant - can delete all rows
          const { data: deletedData, error: deleteError } = await supabase
            .from('team_players')
            .delete()
            .eq('team_id', existingTeam.id)
            .select();

          if (deleteError) {
            console.error('Delete error:', deleteError);
            throw deleteError;
          }

          console.log('🗑️ Existing roster deleted:', deletedData?.length || 0, 'rows');
        }

        // Insert new roster using hook's helper
        const rosterPlayers = getAllPlayerIds();
        console.log('👥 Inserting roster players:', rosterPlayers);
        console.log('👤 Captain ID:', captainId);

        // Remove duplicates
        const uniqueRosterPlayers = [...new Set(rosterPlayers)];

        // Filter out captain if captain variant and they already exist
        let playersToInsert = uniqueRosterPlayers;
        if (isCaptainVariant && currentRoster) {
          const captainRow = currentRoster.find(r => r.is_captain);
          if (captainRow) {
            playersToInsert = uniqueRosterPlayers.filter(id => id !== captainRow.member_id);
            console.log('🔄 Skipping captain insert (already exists)');
          }
        }

        const rosterData = playersToInsert.map((memberId) => ({
          team_id: existingTeam.id,
          member_id: memberId,
          season_id: seasonId,
          is_captain: memberId === captainId,
        }));

        console.log('📝 Roster data to insert:', rosterData);

        if (rosterData.length > 0) {
          const { error: rosterError } = await supabase
            .from('team_players')
            .insert(rosterData);

          if (rosterError) {
            console.error('Insert error:', rosterError);
            throw rosterError;
          }
        }

        console.log('✅ Team updated successfully');
      } else {
        // CREATE new team
        const teamData = {
          season_id: seasonId,
          league_id: leagueId,
          captain_id: captainId,
          home_venue_id: homeVenueId || null,
          team_name: teamName.trim(),
          roster_size: rosterSize,
        };

        const { data: newTeam, error: teamError } = await supabase
          .from('teams')
          .insert(teamData)
          .select()
          .single();

        if (teamError) throw teamError;

        console.log('🎱 Team created:', newTeam);

        // Prepare roster data using hook's helper
        const rosterPlayers = getAllPlayerIds();
        const rosterData = rosterPlayers.map((memberId) => ({
          team_id: newTeam.id,
          member_id: memberId,
          season_id: seasonId,
          is_captain: memberId === captainId,
        }));

        // Insert roster players into database
        const { error: rosterError } = await supabase
          .from('team_players')
          .insert(rosterData);

        if (rosterError) throw rosterError;

        console.log('👥 Roster players added:', rosterData.length);
        console.log('✅ Team created successfully');
      }

      onSuccess();
    } catch (err) {
      console.error('❌ Error saving team:', err);
      setError(err instanceof Error ? err.message : 'Failed to save team');
    } finally {
      setSaving(false);
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
            <Label>Team Name</Label>
            <Input
              type="text"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                setError(null);
                clearRosterError();
              }}
              placeholder="Team 1"
            />
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
              excludeIds={excludedPlayerIds}
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
                  excludeIds={excludedPlayerIds}
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
