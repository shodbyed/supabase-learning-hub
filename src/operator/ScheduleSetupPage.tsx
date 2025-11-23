/**
 * @fileoverview Schedule Setup Page
 *
 * Page wrapper for the ScheduleSetup component.
 * Handles data fetching and navigation for schedule generation.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { ScheduleSetup } from './ScheduleSetup';
import { fetchTeamsWithDetails } from '@/api/hooks';
import type { TeamWithQueryDetails } from '@/types/team';

/**
 * ScheduleSetupPage Component
 *
 * Loads teams for a season and provides the ScheduleSetup interface
 * for assigning schedule positions and generating the season schedule.
 */
export const ScheduleSetupPage: React.FC = () => {
  const { leagueId, seasonId } = useParams<{ leagueId: string; seasonId: string }>();
  const navigate = useNavigate();

  const [teams, setTeams] = useState<TeamWithQueryDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch teams for the season
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!leagueId || !seasonId) {
        setError('Missing league or season ID');
        setLoading(false);
        return;
      }

      try {
        // Fetch teams for this season
        const { data: teamsData, error: teamsError } = await fetchTeamsWithDetails(leagueId);

        if (teamsError) throw teamsError;

        // Filter teams by season
        const seasonTeams = teamsData?.filter(team => team.season_id === seasonId) || [];

        if (seasonTeams.length === 0) {
          setError('No teams found for this season. Please add teams first.');
          setLoading(false);
          return;
        }

        setTeams(seasonTeams);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leagueId, seasonId]);

  /**
   * Handle successful schedule generation
   */
  const handleSuccess = () => {
    console.log('✅ Schedule generated successfully');
    // Navigate to schedule view page
    navigate(`/league/${leagueId}/season/${seasonId}/schedule`);
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    navigate(`/league/${leagueId}/manage-teams`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center text-gray-600">Loading teams...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-red-600 text-lg font-semibold mb-4">Error</h3>
            <p className="text-gray-700 mb-4">{error}</p>
            <div className="flex gap-3">
              <Button onClick={() => navigate(`/league/${leagueId}`)}>
                Back to League
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/league/${leagueId}/manage-teams`)}
              >
                Manage Teams
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        backTo={`/league/${leagueId}/manage-teams`}
        backLabel="Back to Team Management"
        title="Generate Schedule"
        subtitle="Assign schedule positions and generate matchups for your season"
      />

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Schedule Setup Component */}
        <ScheduleSetup
          seasonId={seasonId!}
          teams={teams}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default ScheduleSetupPage;
