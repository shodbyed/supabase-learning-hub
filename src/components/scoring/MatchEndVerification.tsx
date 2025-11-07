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

import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock } from 'lucide-react';

interface MatchEndVerificationProps {
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

  console.log('MatchEndVerification render:', {
    isHomeTeam,
    homeVerifiedBy,
    awayVerifiedBy,
    homeVerified,
    awayVerified,
    userTeamVerified,
    bothVerified
  });

  // Calculate points (wins - threshold)
  const homePoints = homeWins - homeWinThreshold;
  const awayPoints = awayWins - awayWinThreshold;

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
          <div className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-2 border-b ${
            result === 'home_win' ? 'bg-blue-50' : ''
          }`}>
            <div className={`truncate ${
              result === 'home_win' ? 'text-lg font-bold text-blue-600' : 'font-medium'
            }`}>
              {homeTeamName}
            </div>
            <div className={`text-center w-16 ${
              result === 'home_win' ? 'text-lg font-bold text-blue-600' : 'font-medium'
            }`}>
              {homeWins}
            </div>
            <div className={`text-center w-16 ${
              result === 'home_win' ? 'text-lg font-bold text-blue-600' : 'font-medium'
            }`}>
              {homePoints}
            </div>
            <div className="w-12 text-center">
              {result === 'home_win' && <span className="text-xl">🏆</span>}
            </div>
          </div>

          {/* Away Team Row */}
          <div className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-2 ${
            result === 'away_win' ? 'bg-orange-50' : ''
          }`}>
            <div className={`truncate ${
              result === 'away_win' ? 'text-lg font-bold text-blue-600' : 'font-medium'
            }`}>
              {awayTeamName}
            </div>
            <div className={`text-center w-16 ${
              result === 'away_win' ? 'text-lg font-bold text-blue-600' : 'font-medium'
            }`}>
              {awayWins}
            </div>
            <div className={`text-center w-16 ${
              result === 'away_win' ? 'text-lg font-bold text-blue-600' : 'font-medium'
            }`}>
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


        {/* Verify Button */}
        {!bothVerified && (
          <div className="text-center">
            <Button
              onClick={onVerify}
              disabled={userTeamVerified || isVerifying}
              className="w-full max-w-xs"
              size="lg"
            >
              {isVerifying
                ? 'Verifying...'
                : userTeamVerified
                ? '✓ You Have Verified'
                : 'Verify Scores'}
            </Button>
          </div>
        )}

        {/* Both Verified Message */}
        {bothVerified && (
          <div className="text-center text-sm font-medium text-green-600">
            ✓ Both teams verified - Returning to dashboard...
          </div>
        )}
      </div>
    </div>
  );
}
