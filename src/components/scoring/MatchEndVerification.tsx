/**
 * @fileoverview Match End Verification Component
 *
 * Replaces the scoreboard header area when all games are complete.
 * Shows match result and verification status for both teams.
 * Both teams must verify scores before auto-navigating to dashboard.
 *
 * Features:
 * - Match result summary (Home X - Y Away, Win/Tie status)
 * - Verification status indicators for both teams
 * - "Verify Scores" button (enabled only for user's team)
 * - Auto-navigate to dashboard when both teams verify
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCompleteMatch } from '@/api/hooks/useMatches';

interface MatchEndVerificationProps {
  /** Match ID */
  matchId: string;
  /** Home team ID */
  homeTeamId: string;
  /** Away team ID */
  awayTeamId: string;
  /** Home team name */
  homeTeamName: string;
  /** Away team name */
  awayTeamName: string;
  /** Home team wins count */
  homeWins: number;
  /** Away team wins count */
  awayWins: number;
  /** Home team win threshold */
  homeWinThreshold: number;
  /** Away team win threshold */
  awayWinThreshold: number;
  /** Home team tie threshold (null for formats without ties) */
  homeTieThreshold: number | null;
  /** Away team tie threshold (null for formats without ties) */
  awayTieThreshold: number | null;
  /** Member ID who verified for home team (null if not verified) */
  homeVerifiedBy: string | null;
  /** Member ID who verified for away team (null if not verified) */
  awayVerifiedBy: string | null;
  /** Is current user on home team? */
  isHomeTeam: boolean;
  /** Handler when user clicks verify */
  onVerify: () => void;
  /** Is verification in progress? */
  isVerifying?: boolean;
}

/**
 * Determine match result from scores and thresholds
 */
function determineMatchResult(
  homeWins: number,
  awayWins: number,
  homeWinThreshold: number,
  awayWinThreshold: number,
  homeTieThreshold: number | null,
  awayTieThreshold: number | null
): 'home_win' | 'away_win' | 'tie' {
  // Check for wins first
  if (homeWins >= homeWinThreshold) {
    return 'home_win';
  }
  if (awayWins >= awayWinThreshold) {
    return 'away_win';
  }

  // Check for tie (only if thresholds exist)
  if (
    homeTieThreshold !== null &&
    awayTieThreshold !== null &&
    homeWins === homeTieThreshold &&
    awayWins === awayTieThreshold
  ) {
    return 'tie';
  }

  // Shouldn't happen if all games are complete
  return 'tie';
}

/**
 * Match end verification component
 * Replaces header area when all games are complete
 */
export function MatchEndVerification({
  matchId,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  homeWins,
  awayWins,
  homeWinThreshold,
  awayWinThreshold,
  homeTieThreshold,
  awayTieThreshold,
  homeVerifiedBy,
  awayVerifiedBy,
  isHomeTeam,
  onVerify,
  isVerifying = false,
}: MatchEndVerificationProps) {
  const navigate = useNavigate();
  const completeMatchMutation = useCompleteMatch();
  const [isCompleting, setIsCompleting] = useState(false);

  const result = determineMatchResult(
    homeWins,
    awayWins,
    homeWinThreshold,
    awayWinThreshold,
    homeTieThreshold,
    awayTieThreshold
  );

  const homeVerified = homeVerifiedBy !== null;
  const awayVerified = awayVerifiedBy !== null;
  const bothVerified = homeVerified && awayVerified;

  // Current user's team verification status
  const userTeamVerified = isHomeTeam ? homeVerified : awayVerified;

  // Calculate points (wins - threshold)
  const homePoints = homeWins - homeWinThreshold;
  const awayPoints = awayWins - awayWinThreshold;

  // Auto-complete match when both teams verify
  useEffect(() => {
    if (!bothVerified || isCompleting) return;

    const completeTheMatch = async () => {
      setIsCompleting(true);

      try {
        // Calculate completion data
        const winnerTeamId =
          result === 'home_win' ? homeTeamId :
          result === 'away_win' ? awayTeamId :
          null; // tie

        await completeMatchMutation.mutateAsync({
          matchId,
          completionData: {
            homeGamesWon: homeWins,
            awayGamesWon: awayWins,
            homePointsEarned: homePoints,
            awayPointsEarned: awayPoints,
            winnerTeamId,
            matchResult: result,
            homeVerifiedBy,
            awayVerifiedBy,
          },
        });

        // Navigate based on result
        if (result === 'tie') {
          // Navigate to lineup page for tiebreaker lineup selection
          navigate(`/match/${matchId}/lineup`);
        } else {
          // Navigate to dashboard
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Failed to complete match:', error);
        setIsCompleting(false);
        // Stay on page to allow retry
      }
    };

    completeTheMatch();
  }, [bothVerified, isCompleting, matchId, homeTeamId, awayTeamId, homeWins, awayWins, homePoints, awayPoints, result, completeMatchMutation, navigate]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-orange-50 border-b-2 border-gray-300">
      <div className="px-4 py-3">
        {/* Match Result Header */}
        <div className="text-center mb-3">
          <div className="text-sm font-semibold text-gray-600">
            Match Complete
          </div>
        </div>

        {/* Score Table */}
        <div className="bg-white rounded-lg shadow-sm mb-3 overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 text-xs font-semibold bg-gray-100 px-3 py-2 border-b">
            <div>Team</div>
            <div className="text-center w-16">Score</div>
            <div className="text-center w-16">Points</div>
            <div className="w-12"></div>
          </div>

          {/* Home Team Row */}
          <div
            className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-2 border-b ${
              result === 'home_win' ? 'bg-blue-50' : ''
            }`}
          >
            <div
              className={`truncate ${
                result === 'home_win'
                  ? 'text-lg font-bold text-blue-600'
                  : 'font-medium'
              }`}
            >
              {homeTeamName}
            </div>
            <div
              className={`text-center w-16 ${
                result === 'home_win'
                  ? 'text-lg font-bold text-blue-600'
                  : 'font-medium'
              }`}
            >
              {homeWins}
            </div>
            <div
              className={`text-center w-16 ${
                result === 'home_win'
                  ? 'text-lg font-bold text-blue-600'
                  : 'font-medium'
              }`}
            >
              {homePoints}
            </div>
            <div className="w-12 text-center">
              {result === 'home_win' && <span className="text-xl">🏆</span>}
            </div>
          </div>

          {/* Away Team Row */}
          <div
            className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-2 ${
              result === 'away_win' ? 'bg-orange-50' : ''
            }`}
          >
            <div
              className={`truncate ${
                result === 'away_win'
                  ? 'text-lg font-bold text-blue-600'
                  : 'font-medium'
              }`}
            >
              {awayTeamName}
            </div>
            <div
              className={`text-center w-16 ${
                result === 'away_win'
                  ? 'text-lg font-bold text-blue-600'
                  : 'font-medium'
              }`}
            >
              {awayWins}
            </div>
            <div
              className={`text-center w-16 ${
                result === 'away_win'
                  ? 'text-lg font-bold text-blue-600'
                  : 'font-medium'
              }`}
            >
              {awayPoints}
            </div>
            <div className="w-12 text-center">
              {result === 'away_win' && <span className="text-xl">🏆</span>}
            </div>
          </div>

          {/* Tie Message (if applicable) */}
          {result === 'tie' && (
            <div className="bg-purple-50 px-3 py-2 text-center">
              <span className="text-sm font-bold text-purple-600">
                TIEBREAKER REQUIRED
              </span>
            </div>
          )}
        </div>

        {/* Verification Status */}
        {!bothVerified && (
          <div className="space-y-3 w-full">
            {/* Status Flags Row */}
            <div className="flex items-center justify-around text-sm w-full">
              <div
                className={`font-medium ${
                  homeVerified ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                Home: {homeVerified ? '✅ Verified' : '⏳ Waiting'}
              </div>
              <div
                className={`font-medium ${
                  awayVerified ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                Away: {awayVerified ? '✅ Verified' : '⏳ Waiting'}
              </div>
            </div>

            {/* Verify Button Row */}
            <div className="text-center">
              <Button
                onClick={onVerify}
                disabled={userTeamVerified || isVerifying}
                size="default"
                className="w-full max-w-xs"
              >
                {isVerifying
                  ? 'Verifying...'
                  : userTeamVerified
                  ? '✓ You Have Verified'
                  : 'Verify Scores'}
              </Button>
            </div>
          </div>
        )}

        {/* Both Verified Message */}
        {bothVerified && (
          <div className="text-center text-sm font-medium text-green-600">
            {isCompleting ? '✓ Both teams verified - Completing match...' : '✓ Both teams verified - Returning to dashboard...'}
          </div>
        )}
      </div>
    </div>
  );
}
