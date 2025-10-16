/**
 * @fileoverview LeagueOverviewCard Component
 * Displays the current active season with team format information
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
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
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch the current active season for this league
   */
  useEffect(() => {
    const fetchCurrentSeason = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('seasons')
          .select('*')
          .eq('league_id', league.id)
          .eq('status', 'active')
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" - not really an error
          throw error;
        }

        setCurrentSeason(data);
      } catch (err) {
        console.error('Error fetching current season:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentSeason();
  }, [league.id]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">League Overview</h2>
      <h3 className="text-sm text-gray-600 mb-4">Current Season</h3>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading season...</p>
        </div>
      ) : currentSeason ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-green-900">{currentSeason.season_name}</h3>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Active
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-green-700">Start Date:</span>{' '}
              <span className="text-green-900 font-medium">
                {new Date(currentSeason.start_date).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-green-700">End Date:</span>{' '}
              <span className="text-green-900 font-medium">
                {new Date(currentSeason.end_date).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-green-700">Format:</span>{' '}
              <span className="text-green-900 font-medium">
                {league.team_format === '5_man' ? '5-Man' : '8-Man'}
              </span>
            </div>
            {currentSeason.team_count !== undefined && (
              <div>
                <span className="text-green-700">Teams:</span>{' '}
                <span className="text-green-900 font-medium">{currentSeason.team_count}</span>
              </div>
            )}
            {currentSeason.week_count !== undefined && (
              <div>
                <span className="text-green-700">Weeks:</span>{' '}
                <span className="text-green-900 font-medium">{currentSeason.week_count}</span>
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
    </div>
  );
};
