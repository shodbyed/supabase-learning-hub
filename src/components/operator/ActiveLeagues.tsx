/**
 * @fileoverview ActiveLeagues Component
 * Displays operator's active leagues with progress tracking
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLeaguesWithProgress } from '@/api/hooks';
import type { League } from '@/types/league';
import type { LeagueWithProgress } from '@/api/queries/leagues';
import { formatGameType, formatDayOfWeek } from '@/types/league';
import { parseLocalDate } from '@/utils/formatters';
import { LeagueProgressBar } from './LeagueProgressBar';
import { DeleteLeagueModal } from '@/components/modals/DeleteLeagueModal';

interface ActiveLeaguesProps {
  /** Operator ID to fetch leagues for */
  operatorId: string | null;
}

/**
 * ActiveLeagues Component
 *
 * Displays a list of the operator's active leagues with:
 * - League name and details
 * - Progress indicators (creation, season setup, active, etc.)
 * - Quick action buttons
 * - Empty state for no leagues
 */
export const ActiveLeagues: React.FC<ActiveLeaguesProps> = ({ operatorId }) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<{ id: string; name: string } | null>(null);

  // Fetch leagues with progress data using TanStack Query
  const {
    data: leagues = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useLeaguesWithProgress(operatorId);

  const error = queryError ? 'Failed to load leagues' : null;

  /**
   * Generate display name for league
   */
  const getLeagueName = (league: League): string => {
    const gameType = formatGameType(league.game_type);
    const day = formatDayOfWeek(league.day_of_week);
    const division = league.division ? ` ${league.division}` : '';

    return `${day} ${gameType}${division}`;
  };

  /**
   * Handle delete button click - open modal
   */
  const handleDeleteClick = (e: React.MouseEvent, league: League) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling
    setSelectedLeague({ id: league.id, name: getLeagueName(league) });
    setDeleteModalOpen(true);
  };

  /**
   * Handle successful league deletion - refresh list
   */
  const handleDeleteSuccess = () => {
    setDeleteModalOpen(false);
    setSelectedLeague(null);

    // Refetch leagues data after deletion
    refetch();
  };

  /**
   * Calculate progress percentage for a league
   * Same logic as LeagueDetail.tsx
   */
  const calculateProgress = (league: LeagueWithProgress): number => {
    const progress = league._progress;
    if (!progress) return 0;

    // Only show season progress if the season is ACTIVE (not just created)
    // AND has weeks defined (setup complete and season running)
    if (progress.activeSeason && progress.activeSeason.status === 'active' && progress.totalWeeks > 0) {
      return Math.round((progress.completedWeeks / progress.totalWeeks) * 100);
    }

    // Otherwise show setup progress (even if season exists but not started)
    let setupProgress = 0;
    if (progress.seasonCount > 0) setupProgress += 20; // Season created
    if (progress.teamCount > 0) setupProgress += 20; // Teams added
    if (progress.playerCount > 0) setupProgress += 20; // Players enrolled
    if (progress.scheduleExists) setupProgress += 20; // Schedule generated
    // Final step is "ready to start"
    if (progress.seasonCount > 0 && progress.teamCount > 0 && progress.playerCount > 0 && progress.scheduleExists) {
      setupProgress += 20; // All done!
    }
    return setupProgress;
  };

  /**
   * Get progress status for styling
   * Same logic as LeagueDetail.tsx
   */
  const getProgressStatus = (league: LeagueWithProgress): 'setup' | 'active' | 'ending_soon' | 'playoffs' | 'completed' => {
    const progress = league._progress;
    if (!progress) return 'setup';

    // Only show "active" status if season is actually active (started)
    if (progress.activeSeason && progress.activeSeason.status === 'active') return 'active';

    // Check if setup is complete
    const isSetupComplete = progress.seasonCount > 0 && progress.teamCount > 0 && progress.playerCount > 0 && progress.scheduleExists;
    if (isSetupComplete) return 'active'; // Ready to play (green bar)

    return 'setup'; // Still in setup (orange bar)
  };

  /**
   * Get next action text
   * Same logic as LeagueDetail.tsx
   */
  const getNextAction = (league: LeagueWithProgress): string => {
    const progress = league._progress;
    if (!progress) return 'Loading...';

    // Only show week progress if season is actually active (started)
    if (progress.activeSeason && progress.activeSeason.status === 'active' && progress.totalWeeks > 0) {
      return `Week ${progress.completedWeeks} of ${progress.totalWeeks} completed`;
    }

    // Setup phase
    if (progress.seasonCount === 0) return 'Next: Create your first season';
    if (progress.teamCount === 0) return 'Next: Add teams to your season';
    if (progress.playerCount === 0) return 'Next: Enroll players on each team';
    if (!progress.scheduleExists) return 'Next: Generate the schedule';
    return "All set! You're ready to start!";
  };

  /**
   * Get status badge text and color
   * Matches logic from LeagueDetail.tsx
   */
  const getStatusBadge = (league: LeagueWithProgress): { text: string; className: string } => {
    const progress = league._progress;
    if (!progress) return { text: 'Loading', className: 'bg-gray-100 text-gray-800' };

    // Check if season is actually active (status = 'active')
    if (progress.activeSeason && progress.activeSeason.status === 'active') {
      return { text: 'In Session', className: 'bg-blue-100 text-blue-800' };
    }

    // Check if setup is complete (has season, teams, players, and schedule)
    const isSetupComplete = progress.seasonCount > 0 && progress.teamCount > 0 && progress.playerCount > 0 && progress.scheduleExists;
    if (isSetupComplete) {
      return { text: 'Ready to Play', className: 'bg-green-100 text-green-800' };
    }

    return { text: 'Setup Needed', className: 'bg-orange-100 text-orange-800' };
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Active Leagues</h3>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading your leagues...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Active Leagues</h3>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (leagues.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Active Leagues</h3>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎱</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Leagues</h4>
          <p className="text-gray-600 mb-6">
            You haven't created any leagues yet. Start by creating your first league!
          </p>
          <Button asChild>
            <Link to="/create-league">Create Your First League</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Leagues list
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Your Active Leagues</h3>
        <Button asChild size="sm">
          <Link to="/create-league">Create New League</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {leagues.map((league) => {
          const statusBadge = getStatusBadge(league);
          return (
            <div
              key={league.id}
              className="border-2 border-orange-300 rounded-lg p-4 hover:border-orange-400 hover:shadow-md transition-all bg-orange-50/30"
            >
              <div className="flex justify-between items-start mb-3">
                <Link to={`/league/${league.id}`} className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg hover:text-orange-600 transition-colors">
                    {getLeagueName(league)}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {league.team_format === '5_man' ? '5-Man Format' : '8-Man Format'} •
                    Started {parseLocalDate(league.league_start_date).toLocaleDateString()}
                  </p>
                </Link>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusBadge.className}`}>
                    {statusBadge.text}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleDeleteClick(e, league)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Progress indicator */}
              <Link to={`/league/${league.id}`}>
                <LeagueProgressBar
                  status={getProgressStatus(league)}
                  progress={calculateProgress(league)}
                  label={league._progress?.activeSeason ? "Season Progress" : "League Setup Progress"}
                  nextAction={getNextAction(league)}
                />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Delete League Modal */}
      {selectedLeague && (
        <DeleteLeagueModal
          isOpen={deleteModalOpen}
          onCancel={() => {
            setDeleteModalOpen(false);
            setSelectedLeague(null);
          }}
          onSuccess={handleDeleteSuccess}
          leagueId={selectedLeague.id}
          leagueName={selectedLeague.name}
        />
      )}
    </div>
  );
};
