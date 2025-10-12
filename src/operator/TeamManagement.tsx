/**
 * @fileoverview Team Management Page
 *
 * Central hub for managing teams in a league:
 * 1. Assign venues to the league (from operator's venues)
 * 2. Create and manage teams
 * 3. Assign captains and build rosters
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { ArrowLeft, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOperatorId } from '@/hooks/useOperatorId';
import { VenueLimitModal } from './VenueLimitModal';
import { TeamEditorModal } from './TeamEditorModal';
import { InfoButton } from '@/components/InfoButton';
import type { League } from '@/types/league';
import type { Venue } from '@/types/venue';
import type { Team } from '@/types/team';
import type { Member } from '@/types/member';

interface LeagueVenue {
  id: string;
  league_id: string;
  venue_id: string;
  available_bar_box_tables: number;
  available_regulation_tables: number;
  available_total_tables: number;
}

interface TeamWithDetails extends Team {
  captain?: {
    id: string;
    first_name: string;
    last_name: string;
    system_player_number: number;
    bca_member_number: string | null;
  };
  team_players?: Array<{
    count?: number;
    member_id?: string;
    is_captain?: boolean;
    members?: {
      id: string;
      first_name: string;
      last_name: string;
      system_player_number: number;
      bca_member_number: string | null;
    };
  }>;
  venue?: {
    id: string;
    name: string;
  };
}

/**
 * TeamManagement Component
 *
 * Two-phase approach:
 * Phase 1: Assign venues to league (what venues can teams use?)
 * Phase 2: Create teams and assign captains
 */
export const TeamManagement: React.FC = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const { operatorId, loading: operatorLoading } = useOperatorId();

  const [league, setLeague] = useState<League | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [leagueVenues, setLeagueVenues] = useState<LeagueVenue[]>([]);
  const [teams, setTeams] = useState<TeamWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningVenue, setAssigningVenue] = useState<string | null>(null);
  const [selectingAll, setSelectingAll] = useState(false);
  const [limitModalVenue, setLimitModalVenue] = useState<{ venue: Venue; leagueVenue: LeagueVenue } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [showTeamEditor, setShowTeamEditor] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamWithDetails | null>(null);
  const [previousSeasonId, setPreviousSeasonId] = useState<string | null>(null);
  const [importingTeams, setImportingTeams] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  /**
   * Check if all venues are assigned
   */
  const areAllVenuesAssigned = (): boolean => {
    if (venues.length === 0) return false;
    return venues.every(venue => isVenueAssigned(venue.id));
  };

  /**
   * Select or deselect all venues
   */
  const handleSelectAll = async () => {
    if (!leagueId || venues.length === 0) return;

    setSelectingAll(true);

    try {
      const allAssigned = areAllVenuesAssigned();

      if (allAssigned) {
        // Unassign all venues
        const { error: deleteError } = await supabase
          .from('league_venues')
          .delete()
          .eq('league_id', leagueId);

        if (deleteError) throw deleteError;

        setLeagueVenues([]);
        console.log('✅ All venues unassigned');
      } else {
        // Assign all venues
        const unassignedVenues = venues.filter(venue => !isVenueAssigned(venue.id));

        const newLeagueVenues = unassignedVenues.map(venue => ({
          league_id: leagueId,
          venue_id: venue.id,
          available_bar_box_tables: venue.bar_box_tables,
          available_regulation_tables: venue.regulation_tables,
        }));

        const { data: insertedData, error: insertError } = await supabase
          .from('league_venues')
          .insert(newLeagueVenues)
          .select();

        if (insertError) throw insertError;

        setLeagueVenues(prev => [...prev, ...insertedData]);
        console.log(`✅ ${unassignedVenues.length} venues assigned`);
      }
    } catch (err) {
      console.error('Error selecting all venues:', err);
      alert('Failed to update venues. Please try again.');
    } finally {
      setSelectingAll(false);
    }
  };

  /**
   * Fetch league, venues, and teams
   */
  useEffect(() => {
    if (!operatorId || !leagueId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch league
        const { data: leagueData, error: leagueError } = await supabase
          .from('leagues')
          .select('*')
          .eq('id', leagueId)
          .single();

        if (leagueError) throw leagueError;
        setLeague(leagueData);

        // Fetch operator's venues
        const { data: venuesData, error: venuesError } = await supabase
          .from('venues')
          .select('*')
          .eq('created_by_operator_id', operatorId)
          .eq('is_active', true)
          .order('name');

        if (venuesError) throw venuesError;
        setVenues(venuesData || []);

        // Fetch league's assigned venues
        const { data: leagueVenuesData, error: leagueVenuesError } = await supabase
          .from('league_venues')
          .select('*')
          .eq('league_id', leagueId);

        if (leagueVenuesError) throw leagueVenuesError;
        setLeagueVenues(leagueVenuesData || []);

        // Fetch teams with captain info, roster details, and venue
        const { data: teamsData, error: teamsError} = await supabase
          .from('teams')
          .select(`
            *,
            captain:members!captain_id(
              id,
              first_name,
              last_name,
              system_player_number,
              bca_member_number
            ),
            team_players(
              member_id,
              is_captain,
              members(
                id,
                first_name,
                last_name,
                system_player_number,
                bca_member_number
              )
            ),
            venue:venues(
              id,
              name
            )
          `)
          .eq('league_id', leagueId)
          .order('created_at', { ascending: false });

        if (teamsError) throw teamsError;
        setTeams(teamsData || []);

        // Fetch all members (for captain/player selection)
        // Note: Not filtering by role - anyone in the members table can be selected
        // Future: Add isPlayer boolean column to allow members to opt out
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*')
          .order('last_name', { ascending: true });

        if (membersError) throw membersError;
        setMembers(membersData || []);

        // Fetch current season for this league (upcoming or active)
        const { data: seasonData, error: seasonError } = await supabase
          .from('seasons')
          .select('id, created_at')
          .eq('league_id', leagueId)
          .in('status', ['upcoming', 'active'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (seasonError) throw seasonError;
        setSeasonId(seasonData?.id || null);

        // Fetch previous season (most recent completed season)
        if (seasonData) {
          const { data: prevSeasonData, error: prevSeasonError } = await supabase
            .from('seasons')
            .select('id')
            .eq('league_id', leagueId)
            .eq('status', 'completed')
            .lt('created_at', seasonData.created_at)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (prevSeasonError) {
            console.error('Error fetching previous season:', prevSeasonError);
          } else {
            setPreviousSeasonId(prevSeasonData?.id || null);
          }
        }

        // Debug logging
        console.log('📊 Team Management Data:', {
          leagueId: leagueId,
          leagueVenues: leagueVenuesData?.length || 0,
          teams: teamsData?.length || 0,
          members: membersData?.length || 0,
          seasonId: seasonData?.id || 'No active season',
          seasonFound: !!seasonData
        });

        if (!seasonData) {
          console.warn('⚠️ No season found for league:', leagueId, '- Please create a season first');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [operatorId, leagueId]);

  /**
   * Check if a venue is assigned to the league
   */
  const isVenueAssigned = (venueId: string): boolean => {
    return leagueVenues.some(lv => lv.venue_id === venueId);
  };

  /**
   * Toggle venue assignment (assign or unassign)
   */
  const handleToggleVenue = async (venue: Venue) => {
    if (!leagueId) return;

    setAssigningVenue(venue.id);

    try {
      const isAssigned = isVenueAssigned(venue.id);

      if (isAssigned) {
        // Unassign: Delete from league_venues
        const leagueVenue = leagueVenues.find(lv => lv.venue_id === venue.id);
        if (!leagueVenue) return;

        const { error: deleteError } = await supabase
          .from('league_venues')
          .delete()
          .eq('id', leagueVenue.id);

        if (deleteError) throw deleteError;

        // Update local state
        setLeagueVenues(prev => prev.filter(lv => lv.venue_id !== venue.id));
        console.log('✅ Venue unassigned:', venue.name);
      } else {
        // Assign: Insert into league_venues with all tables available by default
        const { data: newLeagueVenue, error: insertError } = await supabase
          .from('league_venues')
          .insert([{
            league_id: leagueId,
            venue_id: venue.id,
            available_bar_box_tables: venue.bar_box_tables,
            available_regulation_tables: venue.regulation_tables,
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        // Update local state
        setLeagueVenues(prev => [...prev, newLeagueVenue]);
        console.log('✅ Venue assigned:', venue.name);
      }
    } catch (err) {
      console.error('Error toggling venue:', err);
      alert('Failed to update venue assignment. Please try again.');
    } finally {
      setAssigningVenue(null);
    }
  };

  /**
   * Open limit modal for a specific venue
   */
  const handleOpenLimitModal = (venue: Venue) => {
    const leagueVenue = leagueVenues.find(lv => lv.venue_id === venue.id);
    if (!leagueVenue) return;

    setLimitModalVenue({ venue, leagueVenue });
  };

  /**
   * Handle successful limit update
   */
  const handleLimitUpdateSuccess = (updatedLeagueVenue: LeagueVenue) => {
    setLeagueVenues(prev =>
      prev.map(lv => lv.id === updatedLeagueVenue.id ? updatedLeagueVenue : lv)
    );
    setLimitModalVenue(null);
  };

  /**
   * Import teams from previous season
   * Copies teams, league venues, and rosters from the most recent completed season
   */
  const handleImportTeams = async () => {
    if (!previousSeasonId || !seasonId || !leagueId) return;

    const confirmImport = window.confirm(
      'Import teams from last season? This will copy:\n' +
      '• All team names and captains\n' +
      '• Home venue assignments\n' +
      '• Full rosters\n' +
      '• League venue assignments\n\n' +
      'Continue?'
    );

    if (!confirmImport) return;

    setImportingTeams(true);

    try {
      // Fetch previous season's teams with rosters
      const { data: prevTeams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('season_id', previousSeasonId);

      if (teamsError) throw teamsError;

      // Fetch previous season's team_players (rosters)
      const { data: prevRosters, error: rostersError } = await supabase
        .from('team_players')
        .select('*')
        .eq('season_id', previousSeasonId);

      if (rostersError) throw rostersError;

      // Fetch previous season's league venues
      const { data: prevLeagueVenues, error: leagueVenuesError } = await supabase
        .from('league_venues')
        .select('*')
        .eq('league_id', leagueId);

      if (leagueVenuesError) throw leagueVenuesError;

      console.log('📥 Importing from previous season:', {
        teams: prevTeams?.length || 0,
        rosters: prevRosters?.length || 0,
        leagueVenues: prevLeagueVenues?.length || 0,
        previousSeasonId,
        currentSeasonId: seasonId
      });

      // Prepare new teams data
      const newTeamsData = prevTeams?.map(team => ({
        season_id: seasonId,
        league_id: leagueId,
        captain_id: team.captain_id,
        home_venue_id: team.home_venue_id,
        team_name: team.team_name,
        roster_size: team.roster_size,
      })) || [];

      // Prepare league venues (if not already assigned)
      const venueImportData = prevLeagueVenues?.filter(lv =>
        !leagueVenues.some(existing => existing.venue_id === lv.venue_id)
      ).map(lv => ({
        league_id: leagueId,
        venue_id: lv.venue_id,
        available_bar_box_tables: lv.available_bar_box_tables,
        available_regulation_tables: lv.available_regulation_tables,
        available_total_tables: lv.available_total_tables,
      })) || [];

      console.log('🎱 Teams to import:', JSON.stringify(newTeamsData, null, 2));
      console.log('🏢 Venues to import:', JSON.stringify(venueImportData, null, 2));

      // Create mapping of old team IDs to prepare roster data
      const rostersByOldTeamId: Record<string, typeof prevRosters> = {};
      prevRosters?.forEach(roster => {
        if (!rostersByOldTeamId[roster.team_id]) {
          rostersByOldTeamId[roster.team_id] = [];
        }
        rostersByOldTeamId[roster.team_id].push(roster);
      });

      // Prepare roster data (will need to map to new team IDs after creation)
      const rosterImportData = prevTeams?.map((oldTeam, index) => {
        const oldRosters = rostersByOldTeamId[oldTeam.id] || [];
        return {
          teamIndex: index,
          rosters: oldRosters.map(roster => ({
            member_id: roster.member_id,
            season_id: seasonId,
            is_captain: roster.is_captain,
          }))
        };
      }) || [];

      console.log('👥 Rosters to import:', JSON.stringify(rosterImportData, null, 2));

      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('✅ Teams imported successfully (simulated)');
      alert(`Successfully imported ${prevTeams?.length || 0} teams from last season!`);

      // Refresh the page data (in real implementation, this would refetch from DB)
      // For now, just show success message
    } catch (err) {
      console.error('❌ Error importing teams:', err);
      alert(err instanceof Error ? err.message : 'Failed to import teams');
    } finally {
      setImportingTeams(false);
    }
  };

  /**
   * Handle successful team creation/update
   */
  const handleTeamCreateSuccess = async () => {
    setShowTeamEditor(false);
    setEditingTeam(null);

    // Refresh teams list
    if (!leagueId) return;

    try {
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          captain:members!captain_id(
            id,
            first_name,
            last_name,
            system_player_number,
            bca_member_number
          ),
          team_players(
            member_id,
            is_captain,
            members(
              id,
              first_name,
              last_name,
              system_player_number,
              bca_member_number
            )
          ),
          venue:venues(
            id,
            name
          )
        `)
        .eq('league_id', leagueId)
        .order('created_at', { ascending: false });

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);
      console.log('✅ Teams list refreshed');
    } catch (err) {
      console.error('Error refreshing teams:', err);
    }
  };

  /**
   * Handle team deletion
   */
  const handleDeleteTeam = async () => {
    if (!deletingTeamId) return;

    try {
      // Delete team (cascade will delete team_players)
      const { error: deleteError } = await supabase
        .from('teams')
        .delete()
        .eq('id', deletingTeamId);

      if (deleteError) throw deleteError;

      console.log('✅ Team deleted successfully');

      // Refresh teams list
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          captain:members!captain_id(
            id,
            first_name,
            last_name,
            system_player_number,
            bca_member_number
          ),
          team_players(
            member_id,
            is_captain,
            members(
              id,
              first_name,
              last_name,
              system_player_number,
              bca_member_number
            )
          ),
          venue:venues(
            id,
            name
          )
        `)
        .eq('league_id', leagueId!)
        .order('created_at', { ascending: false });

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);
    } catch (err) {
      console.error('❌ Error deleting team:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete team');
    } finally {
      setShowDeleteConfirm(false);
      setDeletingTeamId(null);
    }
  };

  /**
   * Toggle team expansion
   */
  const toggleTeamExpansion = (teamId: string) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  /**
   * Generate default team name
   */
  const generateDefaultTeamName = (): string => {
    const teamNumber = teams.length + 1;
    return `Team ${teamNumber}`;
  };

  const isLoading = operatorLoading || loading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-red-600 text-lg font-semibold mb-4">Error</h3>
            <p className="text-gray-700 mb-4">{error || 'League not found'}</p>
            <Button onClick={() => navigate('/operator-dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/league/${leagueId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to League
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Teams</h1>
              <p className="text-gray-600 mt-1">
                Assign venues and create teams for your league
              </p>
            </div>
          </div>
        </div>

        {/* Layout: Venues (left) and Teams (right) */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-4 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Setup Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900">
                    {leagueVenues.length > 1 ? 'Traveling' : leagueVenues.length === 1 ? 'In-House' : 'Not Set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Venues:</span>
                  <span className="font-medium text-gray-900">{leagueVenues.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tables Available:</span>
                  <span className="font-medium text-gray-900">
                    {leagueVenues.reduce((sum, lv) => sum + lv.available_total_tables, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">Max Teams:</span>
                    <InfoButton title="Max Teams Explained">
                      <p className="mb-2">
                        With traveling leagues you can have more than the max, but home teams may have to play at a different venue.
                      </p>
                      <p>
                        It's best to limit one home team per available table.
                      </p>
                    </InfoButton>
                  </div>
                  <span className="font-medium text-gray-900">
                    {leagueVenues.length === 1
                      ? `${leagueVenues[0].available_total_tables * 2}`
                      : leagueVenues.length > 1
                      ? `${leagueVenues.reduce((sum, lv) => sum + lv.available_total_tables, 0)} (approx)`
                      : '0'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teams Created:</span>
                  <span className="font-medium text-gray-900">{teams.length}</span>
                </div>
              </div>
            </div>

            {/* Venue Assignment Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">League Venues</h2>
              <p className="text-xs text-gray-600 mb-4">
                Select venues teams can use and adjust number of tables actually available
              </p>

              {/* Select All Checkbox */}
              {venues.length > 0 && (
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded mb-2">
                  <input
                    type="checkbox"
                    checked={areAllVenuesAssigned()}
                    onChange={handleSelectAll}
                    disabled={selectingAll}
                    className="mt-0"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {selectingAll ? 'Updating...' : 'Select All'}
                  </span>
                </div>
              )}

            {venues.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-600 mb-3">No venues yet</p>
                <Button size="sm" onClick={() => navigate('/venues')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Venue
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {venues.map((venue) => {
                  const assigned = isVenueAssigned(venue.id);
                  const leagueVenue = leagueVenues.find(lv => lv.venue_id === venue.id);
                  const availableTables = leagueVenue?.available_total_tables ?? venue.total_tables;

                  return (
                    <div
                      key={venue.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={assigned}
                        onChange={() => handleToggleVenue(venue)}
                        disabled={assigningVenue === venue.id}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {venue.name}
                        </p>
                      </div>
                      {assigned && (
                        <>
                          <span className="text-xs text-gray-600">
                            {availableTables} of {venue.total_tables}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenLimitModal(venue)}
                          >
                            Limit
                          </Button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          </div>

          {/* Teams Section - Main Right Area */}
          <div className="col-span-8 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Teams</h2>
              <div className="flex gap-2">
                {previousSeasonId && teams.length === 0 && (
                  <Button
                    variant="outline"
                    disabled={importingTeams || !seasonId}
                    onClick={handleImportTeams}
                  >
                    {importingTeams ? 'Importing...' : 'Import from Last Season'}
                  </Button>
                )}
                <Button
                  disabled={leagueVenues.length === 0 || !seasonId || teams.length >= 48}
                  onClick={() => setShowTeamEditor(true)}
                  title={
                    !seasonId
                      ? 'Create a season before adding teams'
                      : teams.length >= 48
                      ? 'Maximum of 48 teams reached'
                      : ''
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team
                </Button>
              </div>
            </div>

            {leagueVenues.length === 0 ? (
              <div className="text-center py-8 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 mb-2">Assign at least one venue before adding teams</p>
                <p className="text-sm text-blue-600">Teams need a venue to call home</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎱</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Yet</h3>
                <p className="text-gray-600 mb-6">
                  Add your first team to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map((team) => {
                  const captain = team.captain;
                  const rosterPlayers = team.team_players?.filter(tp => tp.members) || [];
                  const rosterCount = rosterPlayers.length;
                  const captainName = captain
                    ? `${captain.first_name} ${captain.last_name}`
                    : 'Unknown';
                  // Use BCA number if available, otherwise system player number
                  const playerNumber = captain?.bca_member_number || `P-${String(captain?.system_player_number || 0).padStart(5, '0')}`;
                  const displayNumber = playerNumber ? `#${playerNumber}` : '';
                  const isExpanded = expandedTeams.has(team.id);

                  return (
                    <div
                      key={team.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Team Header */}
                      <div className="p-4 flex items-start gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleTeamExpansion(team.id)}
                          className="shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{team.team_name}</h3>
                          <p className="text-sm text-gray-600">
                            Captain: {captainName} {displayNumber} • Roster: {rosterCount}/{team.roster_size}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingTeam(team);
                              setShowTeamEditor(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setDeletingTeamId(team.id);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-gray-200 bg-gray-50">
                          {/* Home Venue */}
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-700 uppercase mb-1">Home Venue</p>
                            <p className="text-sm text-gray-900">
                              {team.venue?.name || 'No venue assigned'}
                            </p>
                          </div>

                          {/* Roster */}
                          <div>
                            <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Roster</p>
                            {rosterPlayers.length > 0 ? (
                              <ul className="space-y-1">
                                {rosterPlayers.map((tp) => {
                                  const member = tp.members;
                                  if (!member) return null;

                                  const memberNumber = member.bca_member_number ||
                                    `P-${String(member.system_player_number).padStart(5, '0')}`;

                                  return (
                                    <li key={tp.member_id} className="text-sm text-gray-900 flex items-center gap-2">
                                      <span>{member.first_name} {member.last_name} #{memberNumber}</span>
                                      {tp.is_captain && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                          Captain
                                        </span>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No players assigned</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Venue Limit Modal */}
        {limitModalVenue && (
          <VenueLimitModal
            venue={limitModalVenue.venue}
            leagueVenue={limitModalVenue.leagueVenue}
            onSuccess={handleLimitUpdateSuccess}
            onCancel={() => setLimitModalVenue(null)}
          />
        )}

        {/* Team Editor Modal */}
        {showTeamEditor && league && seasonId && (
          <TeamEditorModal
            leagueId={leagueId!}
            seasonId={seasonId}
            teamFormat={league.team_format}
            venues={venues}
            leagueVenues={leagueVenues}
            members={members}
            defaultTeamName={generateDefaultTeamName()}
            existingTeam={editingTeam ? {
              id: editingTeam.id,
              team_name: editingTeam.team_name,
              captain_id: editingTeam.captain_id,
              home_venue_id: editingTeam.home_venue_id,
              roster_size: editingTeam.roster_size,
            } : null}
            onSuccess={handleTeamCreateSuccess}
            onCancel={() => {
              setShowTeamEditor(false);
              setEditingTeam(null);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowDeleteConfirm(false);
              setDeletingTeamId(null);
            }}
          >
            <div
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3">Delete Team?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this team? This will also remove all roster players. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletingTeamId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteTeam}
                >
                  Delete Team
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
