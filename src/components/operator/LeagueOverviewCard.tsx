/**
 * @fileoverview LeagueOverviewCard Component
 * Displays the current active season with team format information
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Button } from '@/components/ui/button';
import { DeleteSeasonModal } from '@/components/modals/DeleteSeasonModal';
import type { League } from '@/types/league';

interface LeagueOverviewCardProps {
  /** League data to display */
  league: League;
}

interface Season {
  id: string;
  league_id: string;
  season_name: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'upcoming';
  team_count?: number;
  week_count?: number;
  created_at: string;
}

/**
 * LeagueOverviewCard Component
 *
 * Displays:
 * - Current active season information
 * - Team format (5-Man or 8-Man)
 * - Season dates and team/week counts
 */
export const LeagueOverviewCard: React.FC<LeagueOverviewCardProps> = ({ league }) => {
  const navigate = useNavigate();
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasTeams, setHasTeams] = useState(false);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Fetch the most recent season for this league (active or otherwise)
   * Shows season info even if no teams/schedule exist yet
   * Also checks if season has teams and schedule to determine if it's complete
   */
  useEffect(() => {
    const fetchCurrentSeason = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('seasons')
          .select('*')
          .eq('league_id', league.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" - not really an error
          throw error;
        }

        setCurrentSeason(data);

        // Check if season has teams
        if (data) {
          const { count: teamCount } = await supabase
            .from('teams')
            .select('*', { count: 'exact', head: true })
            .eq('season_id', data.id);

          setHasTeams((teamCount ?? 0) > 0);

          // Check if season has schedule (season_weeks)
          const { count: weekCount } = await supabase
            .from('season_weeks')
            .select('*', { count: 'exact', head: true })
            .eq('season_id', data.id);

          setHasSchedule((weekCount ?? 0) > 0);
        }
      } catch (err) {
        console.error('Error fetching current season:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentSeason();
  }, [league.id]);

  /**
   * Navigate to wizard to edit the current season
   */
  const handleEditSeasonClick = () => {
    if (currentSeason) {
      // Edit existing season - navigate with seasonId
      navigate(`/league/${league.id}/create-season?seasonId=${currentSeason.id}`);
    } else {
      // Create new season - clear localStorage and navigate
      localStorage.removeItem(`season-creation-${league.id}`);
      localStorage.removeItem(`season-wizard-step-${league.id}`);
      localStorage.removeItem('season-blackout-weeks');
      navigate(`/league/${league.id}/create-season`);
    }
  };

  /**
   * Determine if season is complete (has teams and schedule)
   */
  const isSeasonComplete = (): boolean => {
    return hasTeams && hasSchedule;
  };

  /**
   * Get status badge info based on season completion
   */
  const getStatusBadge = () => {
    if (isSeasonComplete()) {
      return {
        text: currentSeason?.status === 'active' ? 'Active' : 'Complete',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
      };
    } else {
      return {
        text: 'Incomplete',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
      };
    }
  };

  /**
   * Handle season deletion
   * Deletes season and all related data (season_weeks, teams, matches, etc.)
   */
  const handleDeleteSeason = async () => {
    if (!currentSeason) return;

    setIsDeleting(true);
    try {
      console.log('🗑️ Deleting season:', currentSeason.id);

      // Delete season (CASCADE will automatically delete related records)
      const { error } = await supabase
        .from('seasons')
        .delete()
        .eq('id', currentSeason.id);

      if (error) throw error;

      console.log('✅ Season deleted successfully');

      // Clear localStorage for this league
      localStorage.removeItem(`season-creation-${league.id}`);
      localStorage.removeItem(`season-wizard-step-${league.id}`);
      localStorage.removeItem('season-schedule-review');
      localStorage.removeItem('season-blackout-weeks');

      // Close modal and refresh page
      setShowDeleteModal(false);
      window.location.reload();
    } catch (err) {
      console.error('❌ Error deleting season:', err);
      alert('Failed to delete season. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Determine if delete button should be shown
   * Only show for incomplete/upcoming seasons (not active or completed)
   */
  const canDeleteSeason = (): boolean => {
    if (!currentSeason) return false;
    // Allow deletion if season is not active or if it's incomplete
    return currentSeason.status !== 'active' && currentSeason.status !== 'completed';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-gray-900">League Overview</h2>
        <div className="flex gap-2">
          {currentSeason && hasSchedule && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/league/${league.id}/season/${currentSeason.id}/manage-schedule`)}
            >
              Manage Schedule
            </Button>
          )}
          {currentSeason && canDeleteSeason() && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDeleteModal(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Delete Season
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleEditSeasonClick}
          >
            {currentSeason ? 'Edit Season' : 'Create Season'}
          </Button>
        </div>
      </div>
      <h3 className="text-sm text-gray-600 mb-4">Current Season</h3>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading season...</p>
        </div>
      ) : currentSeason ? (
        <div className={`${isSeasonComplete() ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${isSeasonComplete() ? 'text-green-900' : 'text-orange-900'}`}>
              {currentSeason.season_name}
            </h3>
            <span className={`px-3 py-1 ${getStatusBadge().bgColor} ${getStatusBadge().textColor} text-xs font-medium rounded-full`}>
              {getStatusBadge().text}
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className={isSeasonComplete() ? 'text-green-700' : 'text-orange-700'}>Start Date:</span>{' '}
              <span className={`${isSeasonComplete() ? 'text-green-900' : 'text-orange-900'} font-medium`}>
                {new Date(currentSeason.start_date).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className={isSeasonComplete() ? 'text-green-700' : 'text-orange-700'}>End Date:</span>{' '}
              <span className={`${isSeasonComplete() ? 'text-green-900' : 'text-orange-900'} font-medium`}>
                {new Date(currentSeason.end_date).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className={isSeasonComplete() ? 'text-green-700' : 'text-orange-700'}>Format:</span>{' '}
              <span className={`${isSeasonComplete() ? 'text-green-900' : 'text-orange-900'} font-medium`}>
                {league.team_format === '5_man' ? '5-Man' : '8-Man'}
              </span>
            </div>
            {currentSeason.team_count !== undefined && (
              <div>
                <span className={isSeasonComplete() ? 'text-green-700' : 'text-orange-700'}>Teams:</span>{' '}
                <span className={`${isSeasonComplete() ? 'text-green-900' : 'text-orange-900'} font-medium`}>
                  {currentSeason.team_count}
                </span>
              </div>
            )}
            {currentSeason.week_count !== undefined && (
              <div>
                <span className={isSeasonComplete() ? 'text-green-700' : 'text-orange-700'}>Weeks:</span>{' '}
                <span className={`${isSeasonComplete() ? 'text-green-900' : 'text-orange-900'} font-medium`}>
                  {currentSeason.week_count}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            No active season currently.
          </p>
        </div>
      )}

      {/* Delete Season Confirmation Modal */}
      {currentSeason && (
        <DeleteSeasonModal
          isOpen={showDeleteModal}
          seasonName={currentSeason.season_name}
          hasTeams={hasTeams}
          hasSchedule={hasSchedule}
          isDeleting={isDeleting}
          onConfirm={handleDeleteSeason}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};
