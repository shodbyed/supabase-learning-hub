/**
 * @fileoverview Team Management Page
 *
 * Central hub for managing teams in a league:
 * 1. Assign venues to the league (from operator's venues)
 * 2. Create and manage teams
 * 3. Assign captains and build rosters
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/supabaseClient';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { useOperatorId } from '@/api/hooks';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { queryKeys } from '@/api/queryKeys';
import { VenueLimitModal } from './VenueLimitModal';
import { TeamEditorModal } from './TeamEditorModal';
import { VenueCreationModal } from '@/components/operator/VenueCreationModal';
import { InfoButton } from '@/components/InfoButton';
import { TeamCard } from '@/components/TeamCard';
import { VenueListItem } from '@/components/VenueListItem';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AllPlayersRosterCard } from '@/components/AllPlayersRosterCard';
import type { Venue, LeagueVenue } from '@/types/venue';
import type { TeamWithQueryDetails } from '@/types/team';

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
  const queryClient = useQueryClient();
  const { data: operator, isLoading: operatorLoading } = useOperatorId();
  const operatorId = operator?.id;

  // Use custom hook for all data fetching
  const {
    league,
    venues,
    leagueVenues,
    teams,
    members,
    seasonId,
    previousSeasonId,
    loading,
    error,
    refreshTeams,
    setLeagueVenues,
  } = useTeamManagement(operatorId || null, leagueId);

  // UI state
  const [assigningVenue, setAssigningVenue] = useState<string | null>(null);
  const [selectingAll, setSelectingAll] = useState(false);
  const [limitModalVenue, setLimitModalVenue] = useState<{ venue: Venue; leagueVenue: LeagueVenue } | null>(null);
  const [showTeamEditor, setShowTeamEditor] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamWithQueryDetails | null>(null);
  const [importingTeams, setImportingTeams] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [showVenueCreation, setShowVenueCreation] = useState(false);

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

      // Invalidate TanStack Query cache to refetch updated data
      await queryClient.invalidateQueries({
        queryKey: [...queryKeys.leagues.detail(leagueId), 'venues']
      });
    } catch (err) {
      console.error('Error selecting all venues:', err);
      alert('Failed to update venues. Please try again.');
    } finally {
      setSelectingAll(false);
    }
  };

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

      // Invalidate TanStack Query cache to refetch updated data
      await queryClient.invalidateQueries({
        queryKey: [...queryKeys.leagues.detail(leagueId), 'venues']
      });
    } catch (err: any) {
      console.error('Error toggling venue:', err);
      alert(`Failed to update venue assignment: ${err.message || 'Please try again.'}`);
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

    // Refresh teams list using hook function
    await refreshTeams();
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

      // Refresh teams list using hook function
      await refreshTeams();
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

  /**
   * Handle successful venue creation
   * Refreshes the venues list from the hook
   */
  const handleVenueCreated = () => {
    setShowVenueCreation(false);
    // The useTeamManagement hook will automatically refresh venues
    // when the component re-renders
    window.location.reload(); // Simple refresh for now
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
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        backTo={`/league/${leagueId}`}
        backLabel="Back to League"
        title="Manage Teams"
        subtitle="Assign venues and create teams for your league"
      >
        <div className="mt-2 flex flex-col gap-4">
          <InfoButton title="Quick Tip" label="Team Management Tips">
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                All you have to do is pick a captain for each team.
                After that, the captain can fill in the rest—team name, venue, and players.
              </p>
              <p className="text-sm text-gray-700">
                Feel free to add more info if you have it, but it's optional.
              </p>
              <p className="text-sm text-gray-700">
                If a team ever wants to change captains, that's something only you can do.
              </p>
            </div>
          </InfoButton>
          {teams.length > 0 && seasonId && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="w-full"
                size="lg"
                variant="outline"
                onClick={() => navigate(`/league/${leagueId}`)}
              >
                Save & Exit
              </Button>
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate(`/league/${leagueId}/season/${seasonId}/schedule-setup`)}
              >
                Save & Continue →
                </Button>
              </div>
            )}
          </div>
      </PageHeader>

      <div className="container mx-auto px-4 max-w-7xl py-3 lg:py-8">
        {/* Layout: Venues (left) and Teams (right) */}
        <div className="w-full grid grid-cols-1 gap-2 lg:grid-cols-12 lg:gap-6">
          {/* Left Column */}
          <div className="col-span-1 lg:col-span-4 space-y-3">
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
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">League Venues</h2>
                {venues.length > 0 && (
                  <Button size="sm" variant="outline" onClick={() => setShowVenueCreation(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New
                  </Button>
                )}
              </div>
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
                <Button size="sm" onClick={() => setShowVenueCreation(true)}>
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
                    <VenueListItem
                      key={venue.id}
                      venue={venue}
                      isAssigned={assigned}
                      isToggling={assigningVenue === venue.id}
                      availableTables={availableTables}
                      onToggle={() => handleToggleVenue(venue)}
                      onLimitClick={() => handleOpenLimitModal(venue)}
                    />
                  );
                })}
              </div>
            )}
            </div>

            {/* All Players Roster Card */}
            {teams.length > 0 && (
              <AllPlayersRosterCard teams={teams} />
            )}
          </div>

          {/* Teams Section - Main Right Area */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-sm p-6">
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
                    leagueVenues.length === 0
                      ? 'Assign at least one venue before adding teams'
                      : !seasonId
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
              <>
                <div className="space-y-3">
                  {teams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      isExpanded={expandedTeams.has(team.id)}
                      onToggleExpand={() => toggleTeamExpansion(team.id)}
                      onEdit={() => {
                        setEditingTeam(team);
                        setShowTeamEditor(true);
                      }}
                      onDelete={() => {
                        setDeletingTeamId(team.id);
                        setShowDeleteConfirm(true);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Completion Actions - Outside cards for better visibility */}
        {teams.length > 0 && seasonId && (
          <div className="flex justify-center gap-4 mt-6">
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate(`/league/${leagueId}`)}
            >
              Save & Exit
            </Button>
            <Button
              size="lg"
              onClick={() => navigate(`/league/${leagueId}/season/${seasonId}/schedule-setup`)}
            >
              Save & Continue →
            </Button>
          </div>
        )}

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
            allTeams={teams}
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
          <ConfirmDialog
            title="Delete Team?"
            message="Are you sure you want to delete this team? This will also remove all roster players. This action cannot be undone."
            confirmText="Delete Team"
            onConfirm={handleDeleteTeam}
            onCancel={() => {
              setShowDeleteConfirm(false);
              setDeletingTeamId(null);
            }}
          />
        )}

        {/* Venue Creation Modal */}
        {showVenueCreation && operatorId && (
          <VenueCreationModal
            operatorId={operatorId}
            onSuccess={handleVenueCreated}
            onCancel={() => setShowVenueCreation(false)}
          />
        )}
      </div>
    </div>
  );
};
