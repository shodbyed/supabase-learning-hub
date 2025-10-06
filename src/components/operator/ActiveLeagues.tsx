/**
 * @fileoverview ActiveLeagues Component
 * Displays operator's active leagues with progress tracking
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/supabaseClient';
import type { League } from '@/types/league';
import { formatGameType, formatDayOfWeek } from '@/types/league';
import { LeagueProgressBar } from './LeagueProgressBar';

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
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch operator's leagues from database
   */
  useEffect(() => {
    const fetchLeagues = async () => {
      if (!operatorId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('leagues')
          .select('*')
          .eq('operator_id', operatorId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setLeagues(data || []);
      } catch (err) {
        console.error('Error fetching leagues:', err);
        setError('Failed to load leagues');
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, [operatorId]);

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
          <Button asChild style={{ backgroundColor: '#2563eb', color: 'white' }}>
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
        <Button asChild size="sm" style={{ backgroundColor: '#2563eb', color: 'white' }}>
          <Link to="/create-league">Create New League</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {leagues.map((league) => (
          <div
            key={league.id}
            className="border-2 border-orange-300 rounded-lg p-4 hover:border-orange-400 transition-colors bg-orange-50/30"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">
                  {getLeagueName(league)}
                </h4>
                <p className="text-sm text-gray-600">
                  {league.team_format === '5_man' ? '5-Man Format' : '8-Man Format'} •
                  Started {new Date(league.league_start_date).toLocaleDateString()}
                </p>
              </div>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                Setup Needed
              </span>
            </div>

            {/* Progress indicator */}
            <LeagueProgressBar
              status="setup"
              progress={25}
              label="League Setup Progress"
              nextAction="Next: Create season and add teams"
            />

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                Create Season
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
