/**
 * @fileoverview Announcement Modal
 *
 * Modal for creating announcements to leagues where user is captain.
 * Features:
 * - Lists all leagues where user is a captain
 * - Allows selection of one or more leagues for announcement
 * - Text area for announcement content
 * - Creates read-only announcement messages
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/supabaseClient';
import { buildLeagueName } from '@/utils/leagueUtils';

interface League {
  id: string;
  name: string;
  season_id: string;
  season_name: string;
}

interface AnnouncementModalProps {
  onClose: () => void;
  onCreateAnnouncement: (leagueIds: string[], message: string) => void;
  currentUserId: string;
}

export function AnnouncementModal({
  onClose,
  onCreateAnnouncement,
  currentUserId,
}: AnnouncementModalProps) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeagueIds, setSelectedLeagueIds] = useState<string[]>([]);
  const [announcementText, setAnnouncementText] = useState('');
  const maxLength = 500;

  // Fetch leagues where user is captain
  useEffect(() => {
    async function fetchCaptainLeagues() {
      console.log('Fetching captain leagues for user:', currentUserId);

      // Get teams where user is captain
      const { data: captainTeams, error: teamsError } = await supabase
        .from('team_players')
        .select('team_id, teams!inner(id, league_id, season_id)')
        .eq('member_id', currentUserId)
        .eq('is_captain', true);

      console.log('Captain teams query result:', { data: captainTeams, error: teamsError });

      if (teamsError) {
        console.error('Error fetching captain leagues:', teamsError);
        setLoading(false);
        return;
      }

      // Get unique league and season IDs
      const leagueSeasonPairs = new Map<string, { leagueId: string; seasonId: string }>();

      (captainTeams || []).forEach((item: any) => {
        const team = item.teams;
        const leagueId = team.league_id;
        const seasonId = team.season_id;

        if (!leagueSeasonPairs.has(leagueId)) {
          leagueSeasonPairs.set(leagueId, { leagueId, seasonId });
        }
      });

      console.log('League-season pairs:', Array.from(leagueSeasonPairs.values()));

      // Fetch league and season details - simpler approach
      const leaguePromises = Array.from(leagueSeasonPairs.values()).map(async ({ leagueId, seasonId }) => {
        // Fetch league data
        const { data: league, error: leagueError } = await supabase
          .from('leagues')
          .select('id, game_type, day_of_week, division, league_start_date')
          .eq('id', leagueId)
          .single();

        if (leagueError) {
          console.error('Error fetching league:', leagueError);
          return null;
        }

        // Fetch season data
        const { data: season, error: seasonError } = await supabase
          .from('seasons')
          .select('id, season_name')
          .eq('id', seasonId)
          .single();

        if (seasonError) {
          console.error('Error fetching season:', seasonError);
          return null;
        }

        if (!league || !season) return null;

        // Build simple league display name from available data
        const gameNames: Record<string, string> = {
          'eight_ball': '8-Ball',
          'nine_ball': '9-Ball',
          'ten_ball': '10-Ball'
        };
        const gameName = gameNames[league.game_type] || league.game_type;
        const dayName = league.day_of_week.charAt(0).toUpperCase() + league.day_of_week.slice(1);
        const divisionPart = league.division ? ` (${league.division})` : '';
        const leagueName = `${gameName} ${dayName}${divisionPart}`;

        return {
          id: leagueId,
          name: leagueName,
          season_id: seasonId,
          season_name: season.season_name,
        };
      });

      const leaguesData = await Promise.all(leaguePromises);
      const leagueList = leaguesData.filter((league): league is League => league !== null);

      console.log('Final leagues list:', leagueList);
      setLeagues(leagueList);
      setLoading(false);
    }

    fetchCaptainLeagues();
  }, [currentUserId]);

  const handleToggleLeague = (leagueId: string) => {
    setSelectedLeagueIds((prev) =>
      prev.includes(leagueId)
        ? prev.filter((id) => id !== leagueId)
        : [...prev, leagueId]
    );
  };

  const handleCreate = () => {
    if (selectedLeagueIds.length === 0) {
      alert('Please select at least one league');
      return;
    }

    if (!announcementText.trim()) {
      alert('Please enter an announcement message');
      return;
    }

    onCreateAnnouncement(selectedLeagueIds, announcementText);
  };

  const selectedLeagues = leagues.filter((l) => selectedLeagueIds.includes(l.id));

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Megaphone className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Create Announcement</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Selected Leagues */}
        {selectedLeagueIds.length > 0 && (
          <div className="px-6 pt-4 border-b bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-blue-900">
                Selected Leagues ({selectedLeagueIds.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pb-4">
              {selectedLeagues.map((league) => (
                <div
                  key={league.id}
                  className="bg-white border border-blue-300 rounded-full px-3 py-1 text-sm flex items-center gap-2"
                >
                  <span>
                    {league.name} ({league.season_name})
                  </span>
                  <button
                    onClick={() => handleToggleLeague(league.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* League List */}
        <div className="flex-1 overflow-y-auto p-6">
          <Label className="text-base font-semibold mb-3 block">
            Select League(s) for Announcement
          </Label>

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <p>Loading leagues...</p>
            </div>
          ) : leagues.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>You are not a captain of any teams</p>
              <p className="text-sm mt-2">Only team captains can create announcements</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leagues.map((league) => (
                <button
                  key={league.id}
                  onClick={() => handleToggleLeague(league.id)}
                  className={cn(
                    'w-full p-4 rounded-lg border-2 transition-all text-left',
                    selectedLeagueIds.includes(league.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <div className="font-medium text-gray-900">{league.name}</div>
                  <div className="text-sm text-gray-600 mt-1">Season: {league.season_name}</div>
                </button>
              ))}
            </div>
          )}

          {/* Announcement Text */}
          {leagues.length > 0 && (
            <div className="mt-6">
              <Label htmlFor="announcement" className="text-base font-semibold mb-3 block">
                Announcement Message
              </Label>
              <textarea
                id="announcement"
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your announcement message..."
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value.slice(0, maxLength))}
                maxLength={maxLength}
              />
              <p className="text-xs text-gray-600 mt-1">
                {announcementText.length}/{maxLength} characters
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={selectedLeagueIds.length === 0 || !announcementText.trim()}
            className="flex-1"
          >
            {selectedLeagueIds.length === 0
              ? 'Select League'
              : `Send to ${selectedLeagueIds.length} League${selectedLeagueIds.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
