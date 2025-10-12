/**
 * @fileoverview Team Editor Modal
 *
 * Modal form for creating and editing teams.
 * Allows operators to set team name, captain, home venue, and roster players.
 */
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MemberCombobox } from '@/components/MemberCombobox';
import { InfoButton } from '@/components/InfoButton';
import type { Member } from '@/types/member';
import type { Venue } from '@/types/venue';
import type { TeamFormat } from '@/types/league';

interface LeagueVenue {
  id: string;
  venue_id: string;
  available_total_tables: number;
}

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
  existingTeam,
  onSuccess,
  onCancel,
}) => {
  const rosterSize = teamFormat === '5_man' ? 5 : 8;
  const isEditing = !!existingTeam;

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
  const [playerIds, setPlayerIds] = useState<string[]>(Array(rosterSize).fill(''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load existing roster when editing
   */
  useEffect(() => {
    if (!existingTeam) return;

    const loadRoster = async () => {
      try {
        const { data: rosterData, error: rosterError } = await supabase
          .from('team_players')
          .select('member_id, is_captain')
          .eq('team_id', existingTeam.id)
          .order('is_captain', { ascending: false });

        if (rosterError) throw rosterError;

        // Filter out captain, get just the other players
        const nonCaptainPlayers = rosterData?.filter(p => !p.is_captain).map(p => p.member_id) || [];

        // Fill the roster array with existing players, pad with empty strings
        const filledRoster = [...nonCaptainPlayers];
        while (filledRoster.length < rosterSize - 1) {
          filledRoster.push('');
        }

        setPlayerIds(filledRoster.slice(0, rosterSize - 1));
      } catch (err) {
        console.error('Error loading roster:', err);
        setError('Failed to load existing roster');
      }
    };

    loadRoster();
  }, [existingTeam, rosterSize]);

  /**
   * Update player at specific roster index
   */
  const handlePlayerChange = (index: number, memberId: string) => {
    const newPlayerIds = [...playerIds];
    newPlayerIds[index] = memberId;
    setPlayerIds(newPlayerIds);

    // Clear error first
    setError(null);

    // Validate for duplicates immediately
    if (memberId) {
      const selectedPlayers = newPlayerIds.filter(id => id !== '');
      const uniquePlayers = new Set(selectedPlayers);

      if (selectedPlayers.length !== uniquePlayers.size) {
        setError('Cannot select the same player multiple times');
      } else if (selectedPlayers.includes(captainId)) {
        setError('Captain is automatically added to roster - do not select them again as a player');
      }
    }
  };

  /**
   * Validate form data
   */
  const validate = (): string | null => {
    if (!teamName.trim()) return 'Team name is required';
    if (!captainId) return 'Captain is required';

    // Check for duplicate players
    const selectedPlayers = playerIds.filter(id => id !== '');
    const uniquePlayers = new Set(selectedPlayers);
    if (selectedPlayers.length !== uniquePlayers.size) {
      return 'Cannot select the same player multiple times';
    }

    // Check if captain is also in roster
    if (selectedPlayers.includes(captainId)) {
      return 'Captain is automatically added to roster - do not select them again as a player';
    }

    return null;
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

        // Delete existing roster
        const { error: deleteError } = await supabase
          .from('team_players')
          .delete()
          .eq('team_id', existingTeam.id);

        if (deleteError) throw deleteError;

        // Insert new roster
        const rosterPlayers = [captainId, ...playerIds.filter(id => id !== '')];
        const rosterData = rosterPlayers.map((memberId) => ({
          team_id: existingTeam.id,
          member_id: memberId,
          season_id: seasonId,
          is_captain: memberId === captainId,
        }));

        const { error: rosterError } = await supabase
          .from('team_players')
          .insert(rosterData);

        if (rosterError) throw rosterError;

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

        // Prepare roster data (captain + selected players)
        const rosterPlayers = [captainId, ...playerIds.filter(id => id !== '')];
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
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Team Name */}
          <div>
            <Label>Team Name</Label>
            <Input
              type="text"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                setError(null);
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
          <MemberCombobox
            label="Captain"
            members={members}
            value={captainId}
            onValueChange={setCaptainId}
            placeholder="Select team captain..."
          />

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
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
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
  );
};
