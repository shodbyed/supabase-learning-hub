/**
 * @fileoverview League Detail Page
 *
 * Central hub for managing a specific league - shows overview, status, seasons,
 * teams, schedule, standings, and all league-specific settings.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { ArrowLeft } from 'lucide-react';
import type { League } from '@/types/league';
import { formatGameType, formatDayOfWeek } from '@/types/league';
import { parseLocalDate } from '@/utils/formatters';
import { LeagueProgressBar } from '@/components/operator/LeagueProgressBar';
import { LeagueOverviewCard } from '@/components/operator/LeagueOverviewCard';
import { SeasonsCard } from '@/components/operator/SeasonsCard';
import { TeamsCard } from '@/components/operator/TeamsCard';
import { ScheduleCard } from '@/components/operator/ScheduleCard';

/**
 * League Detail Component
 *
 * Displays comprehensive information about a specific league including:
 * - Overview (game type, day, format, dates)
 * - Current status and next steps
 * - Seasons (current and historical)
 * - Teams enrolled
 * - Schedule and standings
 * - Player roster
 * - League-specific settings
 */
export const LeagueDetail: React.FC = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();

  const [league, setLeague] = useState<League | null>(null);
  const [seasonCount, setSeasonCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [playerCount, setPlayerCount] = useState(0);
  const [scheduleExists, setScheduleExists] = useState(false);
  const [activeSeason, setActiveSeason] = useState<any | null>(null);
  const [completedWeeksCount, setCompletedWeeksCount] = useState(0);
  const [totalWeeksCount, setTotalWeeksCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch league details, season count, team count, player count, and schedule status on mount
   */
  useEffect(() => {
    const fetchLeague = async () => {
      if (!leagueId) {
        setError('No league ID provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('leagues')
          .select('*')
          .eq('id', leagueId)
          .single();

        if (error) throw error;

        setLeague(data);

        // Fetch season count
        const { count: seasonCountResult } = await supabase
          .from('seasons')
          .select('*', { count: 'exact', head: true })
          .eq('league_id', leagueId);
        setSeasonCount(seasonCountResult || 0);

        // Fetch active season (if any)
        const { data: activeSeasonData } = await supabase
          .from('seasons')
          .select('*')
          .eq('league_id', leagueId)
          .eq('status', 'active')
          .single();

        if (activeSeasonData) {
          setActiveSeason(activeSeasonData);

          // Get week counts for the active season
          const { count: totalWeeks } = await supabase
            .from('season_weeks')
            .select('*', { count: 'exact', head: true })
            .eq('season_id', activeSeasonData.id)
            .eq('week_type', 'regular'); // Only count regular play weeks

          const { count: completedWeeks } = await supabase
            .from('season_weeks')
            .select('*', { count: 'exact', head: true })
            .eq('season_id', activeSeasonData.id)
            .eq('week_type', 'regular')
            .eq('week_completed', true);

          setTotalWeeksCount(totalWeeks || 0);
          setCompletedWeeksCount(completedWeeks || 0);
        }

        // Fetch team count
        const { count: teamCountResult } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true })
          .eq('league_id', leagueId);
        setTeamCount(teamCountResult || 0);

        // Fetch player count (through team_players join)
        const { count: playerCountResult } = await supabase
          .from('team_players')
          .select('teams!inner(league_id)', { count: 'exact', head: true })
          .eq('teams.league_id', leagueId);
        setPlayerCount(playerCountResult || 0);

        // Check if schedule exists (schedule = matches have been generated for this league's season)
        // First get the season IDs for this league, then check if any matches exist
        const { data: seasonData } = await supabase
          .from('seasons')
          .select('id')
          .eq('league_id', leagueId);

        if (seasonData && seasonData.length > 0) {
          const seasonIds = seasonData.map(s => s.id);
          const { count: matchesCountResult } = await supabase
            .from('matches')
            .select('*', { count: 'exact', head: true })
            .in('season_id', seasonIds);
          setScheduleExists((matchesCountResult || 0) > 0);
        } else {
          setScheduleExists(false);
        }
      } catch (err) {
        console.error('Error fetching league:', err);
        setError('Failed to load league details');
      } finally {
        setLoading(false);
      }
    };

    fetchLeague();
  }, [leagueId]);

  /**
   * Calculate progress percentage
   * - If active season exists: Show weeks completed / total weeks
   * - Otherwise: Show setup progress (0-100% based on setup tasks)
   */
  const calculateProgress = (): number => {
    // If there's an active season, show season progress
    if (activeSeason && totalWeeksCount > 0) {
      return Math.round((completedWeeksCount / totalWeeksCount) * 100);
    }

    // Otherwise show setup progress
    let progress = 0;
    if (seasonCount > 0) progress += 20; // Season created
    if (teamCount > 0) progress += 20; // Teams added
    if (playerCount > 0) progress += 20; // Players enrolled
    if (scheduleExists) progress += 20; // Schedule generated
    // Final step is "ready to start" which happens when all above are done
    if (seasonCount > 0 && teamCount > 0 && playerCount > 0 && scheduleExists) {
      progress += 20; // All done!
    }
    return progress;
  };

  /**
   * Check if league setup is complete (all required steps done)
   */
  const isSetupComplete = (): boolean => {
    return seasonCount > 0 && teamCount > 0 && playerCount > 0 && scheduleExists;
  };

  /**
   * Check if league is currently in an active season
   */
  const isInSession = (): boolean => {
    return activeSeason !== null;
  };

  /**
   * Generate display name for league
   */
  const getLeagueName = (league: League): string => {
    const gameType = formatGameType(league.game_type);
    const day = formatDayOfWeek(league.day_of_week);
    const division = league.division ? ` ${league.division}` : '';

    return `${day} ${gameType}${division}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center text-gray-600">Loading league details...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !league) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-red-600 text-lg font-semibold mb-4">Error</h3>
            <p className="text-gray-700 mb-4">{error || 'League not found'}</p>
            <button
              onClick={() => navigate('/operator-dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Back to Dashboard
            </button>
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
          <button
            onClick={() => navigate('/operator-dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{getLeagueName(league)}</h1>
              <p className="text-gray-600 mt-1">
                {league.team_format === '5_man' ? '5-Man Format' : '8-Man Format'} •
                Started {parseLocalDate(league.league_start_date).toLocaleDateString()}
              </p>
            </div>
            {isInSession() ? (
              <span className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                In Session
              </span>
            ) : isSetupComplete() ? (
              <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Ready to Play
              </span>
            ) : (
              <span className="px-4 py-2 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                Setup Needed
              </span>
            )}
          </div>
        </div>

        {/* Status and Progress */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Progress and Next Steps - 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {isInSession() ? 'Season Status' : 'League Status'}
            </h2>
            <LeagueProgressBar
              status={isInSession() ? "active" : isSetupComplete() ? "active" : "setup"}
              progress={calculateProgress()}
              label={isInSession() ? "Season Progress" : "League Setup Progress"}
              nextAction={
                isInSession()
                  ? `Week ${completedWeeksCount} of ${totalWeeksCount} completed`
                  : seasonCount === 0 ? "Next: Create your first season" :
                    teamCount === 0 ? "Next: Add teams to your season" :
                    playerCount === 0 ? "Next: Enroll players on each team" :
                    !scheduleExists ? "Next: Generate the schedule" :
                    "All set! You're ready to start!"
              }
            />
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                {isInSession() ? 'Season Management' : 'Next Steps'}
              </h3>
              {isInSession() ? (
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>Enter scores after each week's matches</li>
                  <li>View standings and player statistics</li>
                  <li>Manage schedule changes and makeup matches</li>
                  <li>Prepare for playoffs when season ends</li>
                </ul>
              ) : (
                <ol className="list-decimal list-inside text-blue-800 space-y-1">
                  <li className={seasonCount > 0 ? 'line-through opacity-50' : ''}>
                    Create your first season (set dates and weeks)
                  </li>
                  <li className={teamCount > 0 ? 'line-through opacity-50' : ''}>
                    Add teams to the season
                  </li>
                  <li className={playerCount > 0 ? 'line-through opacity-50' : ''}>
                    Enroll players on each team
                  </li>
                  <li className={scheduleExists ? 'line-through opacity-50' : ''}>
                    Generate the schedule
                  </li>
                  <li className={seasonCount > 0 && teamCount > 0 && playerCount > 0 && scheduleExists ? 'line-through opacity-50' : ''}>
                    You're ready to start!
                  </li>
                </ol>
              )}
            </div>
          </div>

          {/* Action Button - 1 column */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Ready to Begin?</h3>
            <p className="text-sm text-gray-600 mb-6 text-center">
              {seasonCount === 0
                ? 'Create your first season to get started'
                : 'Manage venues and teams for your league'
              }
            </p>
            <button
              onClick={() => navigate(seasonCount === 0 ? `/league/${league.id}/create-season` : `/league/${league.id}/manage-teams`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Let's Go!
            </button>
          </div>
        </div>

        {/* League Overview */}
        <LeagueOverviewCard league={league} />

        {/* Seasons Section */}
        <SeasonsCard
          leagueId={league.id}
          onCreateSeason={() => navigate(`/league/${league.id}/create-season`)}
        />

        {/* Teams Section */}
        <TeamsCard leagueId={league.id} />

        {/* Schedule Section */}
        <ScheduleCard leagueId={league.id} />
      </div>
    </div>
  );
};
