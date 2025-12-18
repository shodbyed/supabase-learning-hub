/**
 * @fileoverview Claim Player Page
 *
 * This page handles the "existing user" flow for placeholder player invites.
 * When an existing authenticated user receives an invite email, they're directed
 * here to merge the placeholder player's history into their account.
 *
 * URL: /claim-player?claim={memberId}&token={token}
 *
 * Flow:
 * 1. Verify user is authenticated (redirect to login if not)
 * 2. Fetch invite details using the token
 * 3. Display PP name, team name, captain name
 * 4. On "Join Team" click, call claim-placeholder Edge Function
 * 5. On success, redirect to dashboard
 *
 * Security:
 * - Edge Function verifies the authenticated user's email matches the invite email
 * - Token must be valid and not expired/claimed/cancelled
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { LoginCard } from './LoginCard';
import {
  AlertTriangle,
  UserCheck,
  Users,
  Clock,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { logger } from '@/utils/logger';
import { useUser } from '@/context/useUser';

/** Data returned from get_invite_details() */
interface InviteDetails {
  member_id: string;
  placeholder_first_name: string;
  placeholder_last_name: string;
  team_name: string;
  captain_name: string | null;
  expires_at: string;
  status: string;
}

/** State for the claim process */
type ClaimState =
  | 'loading'
  | 'not_authenticated'
  | 'valid'
  | 'expired'
  | 'invalid'
  | 'already_claimed'
  | 'success'
  | 'error';

/**
 * Separate button component to handle the claiming action with proper loading state
 */
const ClaimButton: React.FC<{
  teamName: string;
  onClaim: () => Promise<void>;
  isClaiming: boolean;
}> = ({ teamName, onClaim, isClaiming }) => (
  <Button
    className="w-full"
    size="lg"
    loadingText="Joining Team..."
    isLoading={isClaiming}
    onClick={onClaim}
  >
    <UserCheck className="mr-2 h-4 w-4" />
    Join {teamName}
  </Button>
);

export const ClaimPlayer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();

  const claimId = searchParams.get('claim');
  const token = searchParams.get('token');

  const [claimState, setClaimState] = useState<ClaimState>('loading');
  const [isClaiming, setIsClaiming] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [mergeStats, setMergeStats] = useState<{
    teamsJoined: number;
    gamesTransferred: number;
    lineupsTransferred: number;
  } | null>(null);

  /**
   * Fetch invite details when component mounts
   * Uses the get_invite_details() PostgreSQL function
   */
  useEffect(() => {
    // Wait for user loading to complete
    if (userLoading) return;

    // If no user, they need to log in first
    if (!user) {
      setClaimState('not_authenticated');
      return;
    }

    // Validate URL params
    if (!token) {
      setClaimState('invalid');
      setErrorMessage('Missing invite token. Please use the link from your email.');
      return;
    }

    const fetchInviteDetails = async () => {
      try {
        const { data, error } = await supabase.rpc('get_invite_details', {
          p_token: token,
        });

        if (error) {
          logger.error('Error fetching invite details', { error: error.message });
          setClaimState('invalid');
          setErrorMessage('Could not load invite details. The link may be invalid.');
          return;
        }

        if (!data || data.length === 0) {
          setClaimState('invalid');
          setErrorMessage('This invite link is invalid or has already been used.');
          return;
        }

        const details = data[0] as InviteDetails;

        // Check status
        if (details.status === 'claimed') {
          setClaimState('already_claimed');
          setInviteDetails(details);
          return;
        }

        // Check expiration
        const expiresAt = new Date(details.expires_at);
        if (expiresAt < new Date() || details.status === 'expired') {
          setClaimState('expired');
          setInviteDetails(details);
          return;
        }

        if (details.status === 'cancelled') {
          setClaimState('invalid');
          setErrorMessage('This invite has been cancelled by the team captain.');
          return;
        }

        // Valid invite
        setInviteDetails(details);
        setClaimState('valid');
      } catch (err) {
        logger.error('Unexpected error fetching invite', { error: err });
        setClaimState('invalid');
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    };

    fetchInviteDetails();
  }, [token, user, userLoading]);

  /**
   * Handle the claim action
   * Calls the claim-placeholder Edge Function
   */
  const handleClaim = async () => {
    if (!inviteDetails || !token || !user) return;

    setIsClaiming(true);
    setErrorMessage('');

    try {
      // Get the user's JWT for authentication
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData?.session?.access_token;

      if (!jwt) {
        setIsClaiming(false);
        setClaimState('error');
        setErrorMessage('Session expired. Please log in again.');
        return;
      }

      // Call the Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claim-placeholder`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            placeholderMemberId: inviteDetails.member_id,
            token: token,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        logger.error('Claim failed', { status: response.status, result });

        // Handle specific error cases
        if (response.status === 403 && result.error === 'Email mismatch') {
          setIsClaiming(false);
          setClaimState('error');
          setErrorMessage(
            'This invite was sent to a different email address. Please log in with the correct account.'
          );
          return;
        }

        setIsClaiming(false);
        setClaimState('error');
        setErrorMessage(result.details || result.error || 'Failed to claim player history.');
        return;
      }

      // Success!
      logger.info('Successfully claimed placeholder', {
        memberId: inviteDetails.member_id,
        stats: result.stats,
      });

      setMergeStats(result.stats);
      setClaimState('success');
    } catch (err) {
      logger.error('Network error during claim', { error: err });
      setIsClaiming(false);
      setClaimState('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  // Loading state
  if (claimState === 'loading' || userLoading) {
    return (
      <LoginCard title="Loading..." description="Verifying your invite">
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </LoginCard>
    );
  }

  // Not authenticated - redirect to login
  if (claimState === 'not_authenticated') {
    // Build the return URL so they come back here after login
    const returnUrl = `/claim-player?claim=${claimId}&token=${token}`;

    return (
      <LoginCard
        title="Login Required"
        description="Please log in to claim your player history"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Users className="h-16 w-16 text-primary" />
          </div>
          <p className="text-gray-700">
            You need to be logged in to claim your player history.
          </p>
          <Button
            className="w-full"
            loadingText="none"
            onClick={() => navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`)}
          >
            Log In to Continue
          </Button>
        </div>
        <CardFooter className="mt-4 text-sm flex justify-around w-full">
          <Link to="/register">Don't have an account? Register</Link>
        </CardFooter>
      </LoginCard>
    );
  }

  // Invalid token
  if (claimState === 'invalid') {
    return (
      <LoginCard title="Invalid Invite" description="There was a problem with your invite link">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertTriangle className="h-16 w-16 text-amber-500" />
          </div>
          <p className="text-gray-700">{errorMessage}</p>
          <p className="text-gray-600 text-sm">
            Please contact your team captain for a new invite link.
          </p>
        </div>
        <CardFooter className="mt-4 text-sm flex justify-around w-full">
          <Link to="/dashboard">Go to Dashboard</Link>
        </CardFooter>
      </LoginCard>
    );
  }

  // Expired invite
  if (claimState === 'expired' && inviteDetails) {
    return (
      <LoginCard title="Invite Expired" description="This invite link has expired">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Clock className="h-16 w-16 text-amber-500" />
          </div>
          <p className="text-gray-700">
            The invite to join <strong>{inviteDetails.team_name}</strong> has expired.
          </p>
          <p className="text-gray-600 text-sm">
            Please ask{' '}
            {inviteDetails.captain_name ? (
              <strong>{inviteDetails.captain_name}</strong>
            ) : (
              'your team captain'
            )}{' '}
            to send you a new invite.
          </p>
        </div>
        <CardFooter className="mt-4 text-sm flex justify-around w-full">
          <Link to="/dashboard">Go to Dashboard</Link>
        </CardFooter>
      </LoginCard>
    );
  }

  // Already claimed
  if (claimState === 'already_claimed' && inviteDetails) {
    return (
      <LoginCard title="Already Claimed" description="This invite has already been used">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <UserCheck className="h-16 w-16 text-green-600" />
          </div>
          <p className="text-gray-700">
            The player profile for{' '}
            <strong>
              {inviteDetails.placeholder_first_name} {inviteDetails.placeholder_last_name}
            </strong>{' '}
            has already been claimed.
          </p>
          <p className="text-gray-600 text-sm">
            If this was you, your history should already be in your account.
          </p>
        </div>
        <CardFooter className="mt-4 text-sm flex justify-around w-full">
          <Link to="/dashboard">Go to Dashboard</Link>
        </CardFooter>
      </LoginCard>
    );
  }

  // Success state
  if (claimState === 'success' && inviteDetails) {
    return (
      <LoginCard title="Success!" description="Your player history has been merged">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <p className="text-gray-700">
            You've successfully joined <strong>{inviteDetails.team_name}</strong>!
          </p>
          {mergeStats && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-green-800 mb-2">
                Merged into your account:
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                {mergeStats.teamsJoined > 0 && (
                  <li>• {mergeStats.teamsJoined} team membership(s)</li>
                )}
                {mergeStats.gamesTransferred > 0 && (
                  <li>• {mergeStats.gamesTransferred} game(s)</li>
                )}
                {mergeStats.lineupsTransferred > 0 && (
                  <li>• {mergeStats.lineupsTransferred} lineup assignment(s)</li>
                )}
              </ul>
            </div>
          )}
          <Button className="w-full" loadingText="none" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </LoginCard>
    );
  }

  // Error state
  if (claimState === 'error') {
    return (
      <LoginCard title="Error" description="Something went wrong">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
          <p className="text-gray-700">{errorMessage}</p>
          <Button variant="outline" onClick={() => setClaimState('valid')}>
            Try Again
          </Button>
        </div>
        <CardFooter className="mt-4 text-sm flex justify-around w-full">
          <Link to="/dashboard">Go to Dashboard</Link>
        </CardFooter>
      </LoginCard>
    );
  }

  // Valid invite - show claim UI
  if (claimState === 'valid' && inviteDetails) {
    return (
      <LoginCard
        title="Join Team"
        description="Claim your player history and join the team"
      >
        <div className="space-y-6">
          {/* Invite details card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Users className="h-6 w-6 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">
                  {inviteDetails.captain_name
                    ? `${inviteDetails.captain_name} invited you to join`
                    : 'You\'ve been invited to join'}
                </p>
                <p className="text-lg font-semibold text-blue-800 mt-1">
                  {inviteDetails.team_name}
                </p>
              </div>
            </div>
          </div>

          {/* Player profile being claimed */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Claiming player profile:</p>
            <p className="text-lg font-semibold">
              {inviteDetails.placeholder_first_name} {inviteDetails.placeholder_last_name}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Your game history and stats will be merged into your account.
            </p>
          </div>

          {/* Claim button */}
          <ClaimButton
            teamName={inviteDetails.team_name}
            onClaim={handleClaim}
            isClaiming={isClaiming}
          />
        </div>
      </LoginCard>
    );
  }

  // Fallback
  return null;
};
