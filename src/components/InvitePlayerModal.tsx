/**
 * @fileoverview Invite Player Modal
 *
 * Modal for inviting placeholder players to register and claim their profile.
 * Email-first approach: captains can enter the player's email which enables
 * various invite methods.
 *
 * Flow:
 * 1. Captain enters player's email (optional but recommended)
 * 2. Email is saved to PP record (enables multi-team capability)
 * 3. Captain chooses invite method:
 *    - Email invite: Sends branded email via Edge Function
 *    - In-app message: For users who already have accounts
 *    - Device handoff: In-person registration on captain's device
 *    - Share link: Copy link or show QR code
 *
 * Key behavior:
 * - If player already has an account (email in auth.users), email method MUST be used
 * - Email is always saved to PP record when entered (identity anchor)
 * - PP with email can be on multiple teams
 */
import { useState, useMemo, useEffect } from 'react';
import { Copy, Check, Smartphone, AlertTriangle, QrCode, ChevronDown, ChevronUp, ArrowLeft, Mail, Save, MessageSquare, Pencil } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/supabaseClient';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

/** Modes for the modal */
type ModalMode = 'options' | 'handoff' | 'success';

/**
 * Determine current environment based on hostname
 * Returns: 'local' | 'staging' | 'production'
 */
function getEnvironment(): 'local' | 'staging' | 'production' {
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return 'local';
  }

  // TODO: Update these with your actual domains
  if (hostname.includes('staging') || hostname.includes('dev') || hostname.includes('test')) {
    return 'staging';
  }

  return 'production';
}

interface InvitePlayerModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
  /** The player's member ID */
  playerId: string;
  /** The player's display name */
  playerName: string;
  /** The player's current email (if already set on PP record) */
  playerEmail?: string | null;
  /** Team ID for invite context */
  teamId?: string;
  /** Team name for email content */
  teamName?: string;
  /** Captain's name for email content */
  captainName?: string;
  /** Captain's member ID for tracking who sent the invite */
  captainMemberId?: string;
}

/**
 * InvitePlayerModal Component
 *
 * Email-first approach to inviting placeholder players.
 * Allows saving email to PP record and provides multiple invite methods.
 */
export function InvitePlayerModal({
  open,
  onOpenChange,
  playerId,
  playerName,
  playerEmail: initialEmail,
  teamId,
  teamName,
  captainName,
  captainMemberId,
}: InvitePlayerModalProps) {
  const queryClient = useQueryClient();

  // Modal mode state
  const [mode, setMode] = useState<ModalMode>('options');

  // Email state - pre-fill if already set on PP
  const [email, setEmail] = useState(initialEmail || '');
  const [emailSaved, setEmailSaved] = useState(!!initialEmail);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  // Track if user is editing a pre-existing email
  const [isEditingEmail, setIsEditingEmail] = useState(!initialEmail);

  // Options mode state
  const [copied, setCopied] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // Handoff form state
  const [handoffEmail, setHandoffEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect current environment (for staging warning)
  const environment = useMemo(() => getEnvironment(), []);
  const isStaging = environment === 'staging';

  // Generate the registration link
  const registrationLink = `${window.location.origin}/register?claim=${playerId}`;

  // Reset email state when modal opens with new player
  useEffect(() => {
    if (open) {
      setEmail(initialEmail || '');
      setEmailSaved(!!initialEmail);
      setIsEditingEmail(!initialEmail); // Show input if no email, show display if email exists
    }
  }, [open, initialEmail]);

  /**
   * Reset all form state when modal closes or mode changes
   */
  const resetForm = () => {
    setHandoffEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setIsSubmitting(false);
  };

  /**
   * Handle modal close - reset to options mode
   */
  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset everything when closing
      setMode('options');
      resetForm();
      setShowQrCode(false);
      setCopied(false);
    }
    onOpenChange(newOpen);
  };

  /**
   * Save email to PP record
   * This enables multi-team capability and identity verification
   */
  const handleSaveEmail = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSavingEmail(true);

    try {
      const { error: updateError } = await supabase
        .from('members')
        .update({ email: email.trim() })
        .eq('id', playerId);

      if (updateError) {
        logger.error('Failed to save email to PP', { error: updateError.message });
        toast.error('Failed to save email. Please try again.');
        return;
      }

      setEmailSaved(true);
      toast.success('Email saved');

      // Invalidate member queries so UI updates
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', playerId] });

    } catch (err) {
      logger.error('Unexpected error saving email', { error: err });
      toast.error('An unexpected error occurred');
    } finally {
      setIsSavingEmail(false);
    }
  };

  /**
   * Send email invite via Edge Function
   */
  const handleSendEmailInvite = async () => {
    if (!email.trim()) {
      toast.error('Please enter and save an email address first');
      return;
    }

    // Save email first if not already saved
    if (!emailSaved) {
      await handleSaveEmail();
    }

    setIsSendingInvite(true);

    try {
      const { error: fnError } = await supabase.functions.invoke('send-invite', {
        body: {
          memberId: playerId,
          email: email.trim(),
          teamId,
          invitedByMemberId: captainMemberId,
          teamName: teamName || 'your team',
          captainName: captainName || 'Your captain',
          baseUrl: window.location.origin,
        },
      });

      if (fnError) {
        logger.error('Failed to send email invite', { error: fnError.message });
        toast.error('Failed to send invite email. Please try again.');
        return;
      }

      toast.success(`Invite sent to ${email}`);
      logger.info('Email invite sent', { memberId: playerId, email: email.trim() });

      // Close modal after successful send
      handleClose(false);

    } catch (err) {
      logger.error('Unexpected error sending email invite', { error: err });
      toast.error('An unexpected error occurred');
    } finally {
      setIsSendingInvite(false);
    }
  };

  /**
   * Copy registration link to clipboard
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(registrationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = registrationLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * Start device handoff flow - switch to handoff mode
   */
  const handleDeviceHandoff = () => {
    resetForm();
    // Pre-fill email if we have it
    setHandoffEmail(email || '');
    setMode('handoff');
  };

  /**
   * Go back to options from handoff mode
   */
  const handleBackToOptions = () => {
    resetForm();
    setMode('options');
  };

  /**
   * Handle handoff form submission
   * Creates auth account and links to placeholder member
   */
  const handleHandoffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!handoffEmail.trim()) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create auth account (does NOT log anyone in)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: handoffEmail.trim(),
        password,
      });

      if (authError) {
        logger.error('Handoff signUp failed', { error: authError.message });
        setError(authError.message);
        setIsSubmitting(false);
        return;
      }

      if (!authData.user) {
        setError('Failed to create account - no user returned');
        setIsSubmitting(false);
        return;
      }

      const newUserId = authData.user.id;
      logger.info('Auth account created for handoff', { userId: newUserId, email: handoffEmail.trim() });

      // Step 2: Link the new user_id to the placeholder member record
      // Also save the email to the member record
      const { error: updateError } = await supabase
        .from('members')
        .update({
          user_id: newUserId,
          email: handoffEmail.trim(),
        })
        .eq('id', playerId)
        .is('user_id', null); // Only update if still a placeholder

      if (updateError) {
        logger.error('Failed to link user to placeholder', { error: updateError.message });
        // Account was created but linking failed - this is a problem
        // The user can still confirm email and log in, but they won't be linked
        setError('Account created but failed to link to profile. Contact support.');
        setIsSubmitting(false);
        return;
      }

      logger.info('Successfully linked user to placeholder member', {
        userId: newUserId,
        memberId: playerId
      });

      // Success! Show success state
      setMode('success');
      setIsSubmitting(false);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', playerId] });

    } catch (err) {
      logger.error('Unexpected error during handoff', { error: err });
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        {/* ============ OPTIONS MODE ============ */}
        {mode === 'options' && (
          <>
            <DialogHeader>
              <DialogTitle>Invite Player</DialogTitle>
              <DialogDescription>
                Help <span className="font-medium text-gray-900">{playerName}</span> create their account and claim their profile
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto -mx-6 px-6" style={{ maxHeight: '55vh' }}>
              <div className="space-y-6 py-2">
              {/* Email Section - Top Priority */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                <Label className="text-sm font-medium">Player's Email</Label>

                {/* Display mode - email already exists on PP */}
                {!isEditingEmail && emailSaved && email ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 p-2 bg-white rounded border">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="h-4 w-4 text-gray-500 shrink-0" />
                        <span className="text-sm truncate">{email}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingEmail(true)}
                        className="shrink-0 h-7 px-2"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Email on file - ready to send invite
                    </p>
                  </div>
                ) : (
                  /* Edit mode - no email or user clicked edit */
                  <>
                    <p className="text-xs text-gray-600">
                      Enter the player's email to enable invite options and allow them to be on multiple teams.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="player@example.com"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setEmail(e.target.value);
                          setEmailSaved(false); // Mark as unsaved when changed
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant={emailSaved ? 'outline' : 'default'}
                        size="sm"
                        onClick={async () => {
                          await handleSaveEmail();
                          // After saving, switch back to display mode if we had an initial email
                          if (email.trim()) {
                            setIsEditingEmail(false);
                          }
                        }}
                        disabled={isSavingEmail || !email.trim() || emailSaved}
                        isLoading={isSavingEmail}
                        loadingText="Saving..."
                        className="shrink-0"
                      >
                        {emailSaved ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Option 1: Email Invite - For existing accounts or new users */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Email Invite</Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Send an email or message to connect this profile to a registered or new player. This is the only method to connect existing accounts.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="default"
                    className="flex-1 gap-2"
                    onClick={handleSendEmailInvite}
                    disabled={!email.trim() || isSendingInvite}
                    isLoading={isSendingInvite}
                    loadingText="Sending..."
                  >
                    <Mail className="h-4 w-4" />
                    Send Email
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 gap-2"
                    disabled={!email.trim()}
                    title="Coming soon"
                  >
                    <MessageSquare className="h-4 w-4" />
                    In-App Message
                  </Button>
                </div>
                {!email.trim() && (
                  <p className="text-xs text-amber-600">Enter and save an email above to enable these options.</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">or for new players</span>
                </div>
              </div>

              {/* Option 2: In-Person Device Handoff */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">In-Person Registration</Label>
                <p className="text-xs text-gray-600">
                  Hand your device to the player so they can register right now.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={handleDeviceHandoff}
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Start Device Handoff</span>
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">or share link</span>
                </div>
              </div>

              {/* Option 3: Share Link */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Share Registration Link</Label>
                <p className="text-xs text-gray-600">
                  Copy the link to share via text, social media, or other messaging apps.
                </p>

                {/* Environment Warning - staging only */}
                {isStaging && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-xs text-blue-800">
                      <p className="font-medium">Staging Environment</p>
                      <p>This link points to the staging site, not production.</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={registrationLink}
                    className="flex-1 text-sm bg-gray-50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="shrink-0"
                    title="Copy link"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600">Link copied to clipboard!</p>
                )}
              </div>

              {/* Option 4: QR Code */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowQrCode(!showQrCode)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-gray-600" />
                    <Label className="text-sm font-medium cursor-pointer">Show QR Code</Label>
                  </div>
                  {showQrCode ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>

                {showQrCode && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-600">
                      Have the player scan this code with their phone to register.
                    </p>
                    <div className="flex justify-center p-4 bg-white rounded-lg border">
                      <QRCodeSVG
                        value={registrationLink}
                        size={180}
                        level="M"
                        includeMargin={true}
                      />
                    </div>
                  </div>
                )}
              </div>
              </div>
            </div>
          </>
        )}

        {/* ============ HANDOFF MODE ============ */}
        {mode === 'handoff' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBackToOptions}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <DialogTitle>Device Handoff</DialogTitle>
              </div>
              <DialogDescription>
                Hand your device to <span className="font-medium text-gray-900">{playerName}</span> to complete registration
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleHandoffSubmit} className="space-y-4">
              {/* Instructions for the person registering */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Hi {playerName.split(' ')[0]}!</span> Enter your email and create a password to claim your player profile.
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="handoff-email">Email</Label>
                <Input
                  id="handoff-email"
                  type="email"
                  placeholder="your@email.com"
                  value={handoffEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHandoffEmail(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="handoff-password">Password</Label>
                <Input
                  id="handoff-password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="handoff-confirm">Confirm Password</Label>
                <Input
                  id="handoff-confirm"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToOptions}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  loadingText="Creating account..."
                  className="flex-1"
                >
                  Create Account
                </Button>
              </div>
            </form>
          </>
        )}

        {/* ============ SUCCESS MODE ============ */}
        {mode === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle>Account Created!</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Success icon */}
              <div className="flex justify-center">
                <div className="p-4 bg-green-100 rounded-full">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </div>

              {/* Success message */}
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-900">
                  A confirmation email has been sent to <span className="font-medium">{handoffEmail}</span>
                </p>
                <p className="text-xs text-gray-600">
                  {playerName.split(' ')[0]} should check their email and click the confirmation link to complete setup.
                  They can then log in on their own device.
                </p>
              </div>

              {/* Important note */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <span className="font-medium">Important:</span> Please hand the device back to the league operator now.
                  Your session is safe and you are not logged in as {playerName.split(' ')[0]}.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end">
              <Button variant="default" loadingText="none" onClick={() => handleClose(false)}>
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
