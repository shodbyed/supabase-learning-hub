/**
 * @fileoverview PlayoffsCard Component
 *
 * Card displayed on the League Detail page to access playoff setup.
 * Shows playoff status and provides navigation to the playoff configuration page.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/supabaseClient';
import { checkRegularSeasonComplete, getPlayoffWeek } from '@/utils/playoffGenerator';
import { parseLocalDate } from '@/utils/formatters';

interface PlayoffsCardProps {
  /** League ID */
  leagueId: string;
  /** Active season ID (if any) */
  seasonId: string | null;
}

/**
 * PlayoffsCard Component
 *
 * Displays playoff information and navigation for a league's active season.
 * Shows different states based on:
 * - Whether there's an active season
 * - Whether playoffs are configured
 * - Regular season completion status
 */
export const PlayoffsCard: React.FC<PlayoffsCardProps> = ({ leagueId, seasonId }) => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playoffWeek, setPlayoffWeek] = useState<{
    id: string;
    scheduled_date: string;
    week_name: string;
  } | null>(null);
  const [seasonStatus, setSeasonStatus] = useState<{
    isComplete: boolean;
    completedMatches: number;
    totalMatches: number;
  } | null>(null);
  const [playoffMatchesExist, setPlayoffMatchesExist] = useState(false);

  useEffect(() => {
    async function loadPlayoffStatus() {
      if (!seasonId) {
        setLoading(false);
        return;
      }

      try {
        // Check for playoff week
        const week = await getPlayoffWeek(seasonId);
        setPlayoffWeek(week);

        if (week) {
          // Check regular season status
          const status = await checkRegularSeasonComplete(seasonId);
          setSeasonStatus(status);

          // Check if playoff matches already exist
          const { count } = await supabase
            .from('matches')
            .select('*', { count: 'exact', head: true })
            .eq('season_week_id', week.id);

          setPlayoffMatchesExist((count || 0) > 0);
        }
      } catch {
        // Silently handle errors - card will show default state
      } finally {
        setLoading(false);
      }
    }

    loadPlayoffStatus();
  }, [seasonId]);

  const handleNavigate = () => {
    if (!seasonId) return;
    setIsNavigating(true);
    navigate(`/league/${leagueId}/season/${seasonId}/playoffs`);
  };

  // No active season
  if (!seasonId) {
    return (
      <Card className="mb-6 opacity-60">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            Playoffs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Create a season to configure playoffs.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Loading
  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            Playoffs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading playoff status...</p>
        </CardContent>
      </Card>
    );
  }

  // No playoff week configured
  if (!playoffWeek) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            Playoffs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                No playoff week found in the season schedule.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Add a playoff week when creating or editing the season.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-purple-600" />
          Playoffs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Playoff Week Info */}
        <div className="bg-purple-50 rounded-lg p-3 mb-4">
          <div className="text-sm font-medium text-purple-800">
            {playoffWeek.week_name}
          </div>
          <div className="text-xs text-purple-600">
            {parseLocalDate(playoffWeek.scheduled_date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2 mb-4">
          {/* Regular season status */}
          {seasonStatus && (
            <div className="flex items-center gap-2 text-sm">
              {seasonStatus.isComplete ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-700">Regular season complete</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-700">
                    {seasonStatus.completedMatches}/{seasonStatus.totalMatches} matches completed
                  </span>
                </>
              )}
            </div>
          )}

          {/* Playoff matches status */}
          <div className="flex items-center gap-2 text-sm">
            {playoffMatchesExist ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-700">Playoff matches created</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Playoff matches not yet created</span>
              </>
            )}
          </div>
        </div>

        <Button
          onClick={handleNavigate}
          disabled={isNavigating}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isNavigating
            ? 'Loading...'
            : playoffMatchesExist
              ? 'View Playoff Bracket'
              : 'Setup Playoffs'
          }
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlayoffsCard;
