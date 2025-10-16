/**
 * @fileoverview MyTeams Page
 *
 * Player-facing view that displays all teams the logged-in user is on.
 * Shows teams grouped by league with minimal information cards.
 *
 * Flow: Dashboard → My Teams (list of teams across all leagues)
 * Future: Clicking edit button (captains only) will open team management modal
 */

import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { supabase } from '@/supabaseClient';
import { TeamCard } from '@/components/player/TeamCard';
import { fetchPlayerTeams, fetchCaptainTeamEditData } from '@/utils/playerQueries';
import { TeamEditorModal } from '@/operator/TeamEditorModal';

interface TeamData {
  id: string;
  team_name: string;
  captain_id: string;
  roster_size: number;
  captain: {
    id: string;
    first_name: string;
    last_name: string;
    system_player_number: number;
    bca_member_number: string | null;
  };
  venue: {
    id: string;
    name: string;
  } | null;
  team_players: Array<{
    member_id: string;
    is_captain: boolean;
    members: {
      id: string;
      first_name: string;
      last_name: string;
      system_player_number: number;
      bca_member_number: string | null;
    };
  }>;
  season: {
    id: string;
    season_name: string;
    league: {
      id: string;
      game_type: string;
      day_of_week: string;
      division: string | null;
    };
  };
}

export function MyTeams() {
  const userContext = useContext(UserContext);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);

  // Team editing modal state
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [loadingEditData, setLoadingEditData] = useState(false);

  // Get member_id from user_id
  useEffect(() => {
    async function getMemberId() {
      if (!userContext?.user?.id) return;

      const { data, error } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', userContext.user.id)
        .single();

      if (error) {
        console.error('Error fetching member ID:', error);
        setError('Unable to load your profile');
        return;
      }

      setMemberId(data.id);
    }

    getMemberId();
  }, [userContext?.user?.id]);

  // Fetch teams once we have member_id
  useEffect(() => {
    async function loadTeams() {
      if (!memberId) return;

      setLoading(true);
      setError(null);

      const { data, error } = await fetchPlayerTeams(memberId);

      if (error) {
        console.error('Error fetching teams:', error);
        setError('Unable to load your teams');
        setLoading(false);
        return;
      }

      setTeams(data || []);
      setLoading(false);
    }

    loadTeams();
  }, [memberId]);

  // Handle edit button click - fetch data needed for editing
  const handleEditTeam = async (teamId: string) => {
    setEditingTeamId(teamId);
    setLoadingEditData(true);

    const { data, error } = await fetchCaptainTeamEditData(teamId);

    if (error || !data) {
      console.error('Error loading team edit data:', error);
      setError('Unable to load team details for editing');
      setEditingTeamId(null);
      setLoadingEditData(false);
      return;
    }

    setEditData(data);
    setLoadingEditData(false);
  };

  // Handle successful team update
  const handleTeamUpdateSuccess = async () => {
    setEditingTeamId(null);
    setEditData(null);

    // Reload teams to show updated data
    if (!memberId) return;

    setLoading(true);
    setError(null);

    const { data, error } = await fetchPlayerTeams(memberId);

    if (error) {
      console.error('Error fetching teams:', error);
      setError('Unable to load your teams');
      setLoading(false);
      return;
    }

    setTeams(data || []);
    setLoading(false);
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setEditingTeamId(null);
    setEditData(null);
  };

  if (userContext?.loading || loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-muted-foreground">Loading your teams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-destructive">{error}</p>
      </div>
    );
  }

  if (!userContext?.isLoggedIn) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-muted-foreground">
          Please log in to view your teams
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Teams</h1>

      {teams.length === 0 ? (
        <p className="text-center text-muted-foreground">
          You are not currently on any teams
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const isCaptain = team.captain_id === memberId;

            return (
              <TeamCard
                key={team.id}
                teamName={team.team_name}
                captain={team.captain}
                venue={team.venue}
                rosterSize={team.roster_size}
                players={team.team_players}
                season={team.season}
                leagueId={team.season.league.id}
                seasonId={team.season.id}
                currentUserId={memberId || undefined}
                showEditButton={isCaptain}
                onEditClick={() => handleEditTeam(team.id)}
              />
            );
          })}
        </div>
      )}

      {/* Team Editor Modal for Captains */}
      {editingTeamId && editData && !loadingEditData && (
        <TeamEditorModal
          leagueId={editData.leagueId}
          seasonId={editData.seasonId}
          teamFormat={editData.teamFormat}
          venues={editData.venues}
          leagueVenues={editData.leagueVenues}
          members={editData.members}
          defaultTeamName={editData.team.team_name}
          allTeams={editData.allTeams}
          existingTeam={{
            id: editData.team.id,
            team_name: editData.team.team_name,
            captain_id: editData.team.captain_id,
            home_venue_id: editData.team.home_venue_id,
            roster_size: editData.team.roster_size
          }}
          onSuccess={handleTeamUpdateSuccess}
          onCancel={handleCancelEdit}
          variant="captain"
        />
      )}
    </div>
  );
}
