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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch league details and season count on mount
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

        // TODO: Once seasons table exists, fetch season count
        // const { count } = await supabase
        //   .from('seasons')
        //   .select('*', { count: 'exact', head: true })
        //   .eq('league_id', leagueId);
        // setSeasonCount(count || 0);

        // For now, hardcode to 0 (no seasons table yet)
        setSeasonCount(0);
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
                Started {new Date(league.league_start_date).toLocaleDateString()}
              </p>
            </div>
            <span className="px-4 py-2 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
              Setup Needed
            </span>
          </div>
        </div>

        {/* Status and Progress */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Progress and Next Steps - 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">League Status</h2>
            <LeagueProgressBar
              status="setup"
              progress={25}
              label="League Setup Progress"
              nextAction="Next: Create season and add teams"
            />
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
              <ol className="list-decimal list-inside text-blue-800 space-y-1">
                <li>Create your first season (set dates and weeks)</li>
                <li>Add teams to the season</li>
                <li>Enroll players on each team</li>
                <li>Generate the schedule</li>
                <li>You're ready to start!</li>
              </ol>
            </div>
          </div>

          {/* Action Button - 1 column */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Ready to Begin?</h3>
            <p className="text-sm text-gray-600 mb-6 text-center">
              {seasonCount === 0
                ? 'Create your first season to get started'
                : 'Create a new season for this league'
              }
            </p>
            <button
              onClick={() => console.log('Create season - Coming soon')}
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
          onCreateSeason={() => console.log('Create season - Coming soon')}
        />

        {/* Teams Section */}
        <TeamsCard leagueId={league.id} />

        {/* Schedule Section */}
        <ScheduleCard leagueId={league.id} />
      </div>
    </div>
  );
};
