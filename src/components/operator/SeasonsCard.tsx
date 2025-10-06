/**
 * @fileoverview SeasonsCard Component
 * Displays current active season and past seasons for a league
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SeasonsCardProps {
  /** League ID to fetch seasons for */
  leagueId: string;
  /** Callback when "Create Season" button is clicked */
  onCreateSeason: () => void;
}

// TODO: Replace with actual Season type once seasons table is created
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
 * SeasonsCard Component
 *
 * Displays:
 * - Current active season with details
 * - Collapsible past seasons section showing count
 * - "Create Season" button if no seasons exist
 */
export const SeasonsCard: React.FC<SeasonsCardProps> = ({ leagueId, onCreateSeason }) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPastSeasons, setShowPastSeasons] = useState(false);

  /**
   * Fetch seasons for this league
   */
  useEffect(() => {
    const fetchSeasons = async () => {
      setLoading(true);

      // TODO: Once seasons table exists, uncomment this:
      // try {
      //   const { data, error } = await supabase
      //     .from('seasons')
      //     .select('*')
      //     .eq('league_id', leagueId)
      //     .order('start_date', { ascending: false });
      //
      //   if (error) throw error;
      //   setSeasons(data || []);
      // } catch (err) {
      //   console.error('Error fetching seasons:', err);
      // } finally {
      //   setLoading(false);
      // }

      // For now, simulate empty state (no seasons table yet)
      console.log('Fetching seasons for league:', leagueId);
      setSeasons([]);
      setLoading(false);
    };

    fetchSeasons();
  }, [leagueId]);

  // Separate current and past seasons
  const currentSeason = seasons.find(s => s.status === 'active');
  const pastSeasons = seasons.filter(s => s.status === 'completed');

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Seasons</h2>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading seasons...</p>
        </div>
      </div>
    );
  }

  // Empty state - no seasons yet
  if (seasons.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Seasons</h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Seasons Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first season to start adding teams and scheduling matches.
          </p>
          <button
            onClick={onCreateSeason}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Season
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Seasons</h2>

      {/* Current Active Season */}
      {currentSeason ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-green-900">{currentSeason.season_name}</h3>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Active
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800 text-sm">
            No active season. <button onClick={onCreateSeason} className="underline font-medium">Create a new season</button> to get started.
          </p>
        </div>
      )}

      {/* Past Seasons - Collapsible */}
      {pastSeasons.length > 0 && (
        <div>
          <button
            onClick={() => setShowPastSeasons(!showPastSeasons)}
            className="flex items-center justify-between w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-gray-700 font-medium">
              {pastSeasons.length} Past Season{pastSeasons.length !== 1 ? 's' : ''}
            </span>
            {showPastSeasons ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {showPastSeasons && (
            <div className="mt-3 space-y-2">
              {pastSeasons.map((season) => (
                <div
                  key={season.id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{season.season_name}</h4>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      Completed
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(season.start_date).toLocaleDateString()} - {new Date(season.end_date).toLocaleDateString()}
                    {season.team_count !== undefined && ` • ${season.team_count} teams`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
