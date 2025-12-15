/**
 * @fileoverview PlayerNameLink Component
 *
 * Reusable component that wraps player names and makes them interactive.
 * Shows a popover menu with actions: View Profile, Send Message, Report User, Block User.
 *
 * Usage:
 * <PlayerNameLink playerId="uuid" playerName="John Doe" />
 *
 * Replace regular player name displays throughout the app with this component
 * to provide consistent user interaction patterns.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { User, MessageSquare, Flag, Ban, DollarSign, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemberId, useCreateOrOpenConversation, useBlockUser, useUnblockUser, useIsUserBlocked, useUserProfile } from '@/api/hooks';
import { ReportUserModal } from '@/components/ReportUserModal';
import { ConfirmDialog } from '@/components/shared';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';
import { supabase } from '@/supabaseClient';
import { markMembershipPaid, updateMembershipPaidDate, updatePlayerStartingHandicaps } from '@/api/queries/players';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface CustomAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

interface PlayerNameLinkProps {
  playerId: string;
  playerName: string;
  className?: string;
  onSendMessage?: (playerId: string) => void;
  onReportUser?: (playerId: string) => void;
  onBlockUser?: (playerId: string) => void;
  customActions?: CustomAction[];
}

export function PlayerNameLink({
  playerId,
  playerName,
  className,
  onSendMessage,
  onReportUser,
  onBlockUser,
  customActions = [],
}: PlayerNameLinkProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const memberId = useMemberId();
  const { canAccessLeagueOperatorFeatures } = useUserProfile();
  const isOperator = canAccessLeagueOperatorFeatures();

  const [open, setOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showReversePaymentConfirm, setShowReversePaymentConfirm] = useState(false);
  const [showHandicapModal, setShowHandicapModal] = useState(false);
  const [handicap3v3, setHandicap3v3] = useState<string>('0');
  const [handicap5v5, setHandicap5v5] = useState<string>('40');

  // TanStack Query hooks
  const createOrOpenConversationMutation = useCreateOrOpenConversation();
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  // Fetch player's full name (always when popover is open)
  const { data: playerFullName } = useQuery({
    queryKey: ['playerFullName', playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('first_name, last_name')
        .eq('id', playerId)
        .single();
      if (error) throw error;
      return `${data.first_name} ${data.last_name}`;
    },
    enabled: open && !!playerId,
    staleTime: 60000, // 1 minute - names don't change often
  });

  // Fetch player's membership status and handicaps (only when popover is open and user is operator)
  const { data: playerData } = useQuery({
    queryKey: ['playerOperatorData', playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('membership_paid_date, starting_handicap_3v3, starting_handicap_5v5')
        .eq('id', playerId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: open && isOperator && !!playerId,
    staleTime: 30000, // 30 seconds
  });

  // Mark membership as paid mutation
  const markPaidMutation = useMutation({
    mutationFn: (id: string) => markMembershipPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerOperatorData', playerId] });
      queryClient.invalidateQueries({ queryKey: ['playerDetails'] });
      toast.success(`${playerName}'s membership marked as paid!`);
    },
    onError: (error) => {
      logger.error('Error marking membership as paid', { error: error instanceof Error ? error.message : String(error) });
      toast.error('Failed to update membership status. Please try again.');
    },
  });

  // Reverse membership mutation
  const reverseMembershipMutation = useMutation({
    mutationFn: (id: string) => updateMembershipPaidDate(id, null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerOperatorData', playerId] });
      queryClient.invalidateQueries({ queryKey: ['playerDetails'] });
      toast.success(`${playerName}'s membership reversed!`);
    },
    onError: (error) => {
      logger.error('Error reversing membership', { error: error instanceof Error ? error.message : String(error) });
      toast.error('Failed to reverse membership. Please try again.');
    },
  });

  // Check if user is blocked (only fetch when popover is open)
  // Note: We can't conditionally enable this hook based on `open` state because hooks can't be conditional.
  // The hook itself already has `enabled: !!userId && !!otherUserId` built-in.
  const { data: isBlocked = false } = useIsUserBlocked(
    open && memberId ? memberId : undefined,
    open ? playerId : undefined
  );

  const handleViewProfile = () => {
    navigate(`/player/${playerId}`);
    setOpen(false);
  };

  const handleSendMessage = async () => {
    if (onSendMessage) {
      onSendMessage(playerId);
      setOpen(false);
      return;
    }

    // Default: Create/open DM with this player
    if (!memberId) {
      logger.error('Current user member ID not found');
      setOpen(false);
      return;
    }

    // Don't allow messaging yourself
    if (memberId === playerId) {
      setOpen(false);
      return;
    }

    try {
      const result = await createOrOpenConversationMutation.mutateAsync({
        userId1: memberId,
        userId2: playerId,
      });

      if (result?.conversationId) {
        // Navigate to messages with the conversation ID as state
        navigate('/messages', { state: { conversationId: result.conversationId } });
      }

      setOpen(false);
    } catch (error) {
      logger.error('Error creating/opening conversation', { error: error instanceof Error ? error.message : String(error) });
      setOpen(false);
    }
  };

  const handleReportUser = () => {
    if (onReportUser) {
      onReportUser(playerId);
      setOpen(false);
    } else {
      // Open report modal
      setOpen(false);
      setShowReportModal(true);
    }
  };

  const handleBlockToggle = () => {
    if (onBlockUser) {
      onBlockUser(playerId);
      setOpen(false);
      return;
    }

    if (!memberId) {
      logger.error('Current user member ID not found');
      setOpen(false);
      return;
    }

    // Don't allow blocking yourself
    if (memberId === playerId) {
      setOpen(false);
      return;
    }

    // Show appropriate confirmation dialog
    if (isBlocked) {
      setShowUnblockConfirm(true);
    } else {
      setShowBlockConfirm(true);
    }
    setOpen(false);
  };

  const handleBlockConfirm = async () => {
    if (!memberId) return;

    try {
      await blockUserMutation.mutateAsync({
        blockerId: memberId,
        blockedUserId: playerId,
      });

      toast.success(`${playerName} has been blocked. You won't see messages from them.`);
    } catch (error) {
      logger.error('Error blocking user', { error: error instanceof Error ? error.message : String(error) });
      toast.error('Failed to block user. Please try again.');
    }
  };

  const handleUnblockConfirm = async () => {
    if (!memberId) return;

    try {
      await unblockUserMutation.mutateAsync({
        blockerId: memberId,
        blockedUserId: playerId,
      });

      toast.success(`${playerName} has been unblocked.`);
    } catch (error) {
      logger.error('Error unblocking user', { error: error instanceof Error ? error.message : String(error) });
      toast.error('Failed to unblock user. Please try again.');
    }
  };

  // Handle membership payment click (operators only)
  const handleMembershipAction = () => {
    if (!isOperator) return;

    const hasPaid = !!playerData?.membership_paid_date;
    if (hasPaid) {
      setShowReversePaymentConfirm(true);
    } else {
      setShowPaymentConfirm(true);
    }
    setOpen(false);
  };

  // Confirm payment received
  const handlePaymentConfirm = () => {
    markPaidMutation.mutate(playerId);
  };

  // Confirm reverse payment
  const handleReversePaymentConfirm = () => {
    reverseMembershipMutation.mutate(playerId);
  };

  // Update starting handicaps mutation
  const updateHandicapsMutation = useMutation({
    mutationFn: ({ h3v3, h5v5 }: { h3v3: number; h5v5: number }) =>
      updatePlayerStartingHandicaps(playerId, h3v3, h5v5),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerOperatorData', playerId] });
      queryClient.invalidateQueries({ queryKey: ['unauthorizedPlayers'] });
      queryClient.invalidateQueries({ queryKey: ['playerDetails'] });
      toast.success(`Starting handicaps set for ${playerName}!`);
      setShowHandicapModal(false);
    },
    onError: (error) => {
      logger.error('Error updating starting handicaps', {
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error('Failed to set starting handicaps. Please try again.');
    },
  });

  // Handle handicap action click (operators only)
  const handleHandicapAction = () => {
    if (!isOperator) return;

    // Pre-fill with current values or defaults
    const current3v3 = playerData?.starting_handicap_3v3;
    const current5v5 = playerData?.starting_handicap_5v5;
    setHandicap3v3(current3v3 !== null && current3v3 !== undefined ? String(current3v3) : '0');
    setHandicap5v5(current5v5 !== null && current5v5 !== undefined ? String(current5v5) : '40');
    setOpen(false);
    setShowHandicapModal(true);
  };

  // Handle saving handicaps from modal
  const handleHandicapSave = () => {
    const h3v3 = parseFloat(handicap3v3);
    const h5v5 = parseFloat(handicap5v5);

    // Validate ranges
    if (isNaN(h3v3) || h3v3 < -2 || h3v3 > 2) {
      toast.error('Starting Handicap (3v3) must be between -2 and 2');
      return;
    }

    if (isNaN(h5v5) || h5v5 < 0 || h5v5 > 100) {
      toast.error('Starting Handicap (5v5) must be between 0 and 100');
      return;
    }

    updateHandicapsMutation.mutate({ h3v3, h5v5 });
  };

  // Determine if membership action should be shown and what label to use
  const hasMembershipPaid = !!playerData?.membership_paid_date;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium transition-colors',
              className
            )}
          >
            {playerName}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <div className="flex flex-col">
            {/* Player Full Name Header */}
            <div className="px-4 py-3 border-b bg-gray-50">
              <div className="font-semibold text-gray-900">
                {playerFullName || playerName}
              </div>
            </div>

            {/* View Profile */}
            <button
              onClick={handleViewProfile}
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 transition-colors text-left"
            >
              <User className="h-4 w-4 text-gray-600" />
              <span>View Profile</span>
            </button>

            {/* Send Message */}
            <button
              onClick={handleSendMessage}
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 transition-colors text-left"
            >
              <MessageSquare className="h-4 w-4 text-gray-600" />
              <span>Send Message</span>
            </button>

            <div className="border-t" />

            {/* Report User */}
            <button
              onClick={handleReportUser}
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 transition-colors text-left text-orange-600"
            >
              <Flag className="h-4 w-4" />
              <span>Report User</span>
            </button>

            {/* Block/Unblock User */}
            <button
              onClick={handleBlockToggle}
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 transition-colors text-left text-red-600"
            >
              <Ban className="h-4 w-4" />
              <span>{isBlocked ? 'Unblock User' : 'Block User'}</span>
            </button>

            {/* Operator-Only Actions */}
            {isOperator && (
              <>
                <div className="border-t" />
                {/* Set Starting Handicaps */}
                <button
                  onClick={handleHandicapAction}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 transition-colors text-left text-blue-600"
                >
                  <UserCog className="h-4 w-4" />
                  <span>Set Starting H/C</span>
                </button>
                {/* Membership Payment */}
                <button
                  onClick={handleMembershipAction}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 transition-colors text-left",
                    hasMembershipPaid ? "text-red-600" : "text-green-600"
                  )}
                >
                  <DollarSign className="h-4 w-4" />
                  <span>{hasMembershipPaid ? 'Reverse Membership' : 'Received Membership Fee'}</span>
                </button>
              </>
            )}

            {/* Custom Actions */}
            {customActions.length > 0 && (
              <>
                <div className="border-t" />
                {customActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick();
                      setOpen(false);
                    }}
                    className={action.className || "flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 transition-colors text-left"}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Report Modal */}
      {showReportModal && (
        <ReportUserModal
          reportedUserId={playerId}
          reportedUserName={playerName}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Block User Confirmation */}
      <ConfirmDialog
        open={showBlockConfirm}
        onOpenChange={setShowBlockConfirm}
        title="Block User?"
        description={`Are you sure you want to block ${playerName}? You won't be able to message each other.`}
        confirmLabel="Block"
        cancelLabel="Cancel"
        onConfirm={handleBlockConfirm}
        variant="destructive"
      />

      {/* Unblock User Confirmation */}
      <ConfirmDialog
        open={showUnblockConfirm}
        onOpenChange={setShowUnblockConfirm}
        title="Unblock User?"
        description={`Unblock ${playerName}? You'll be able to message each other again.`}
        confirmLabel="Unblock"
        cancelLabel="Cancel"
        onConfirm={handleUnblockConfirm}
        variant="default"
      />

      {/* Mark Membership Paid Confirmation */}
      <ConfirmDialog
        open={showPaymentConfirm}
        onOpenChange={setShowPaymentConfirm}
        title="Mark Membership as Paid"
        description={`Confirm that ${playerName} has paid their membership fee for ${new Date().getFullYear()}. Their membership will be valid through December 31, ${new Date().getFullYear()}. Do not accept payments for ${new Date().getFullYear() + 1} until next calendar year.`}
        confirmLabel="Confirm Payment"
        cancelLabel="Cancel"
        onConfirm={handlePaymentConfirm}
        variant="default"
      />

      {/* Reverse Membership Confirmation */}
      <ConfirmDialog
        open={showReversePaymentConfirm}
        onOpenChange={setShowReversePaymentConfirm}
        title="Reverse Membership Payment"
        description={`Confirm that ${playerName} has not paid the membership fees for ${new Date().getFullYear()}. This will mark their membership as unpaid.`}
        confirmLabel="Reverse Payment"
        cancelLabel="Cancel"
        onConfirm={handleReversePaymentConfirm}
        variant="destructive"
      />

      {/* Set Starting Handicaps Modal */}
      <Dialog open={showHandicapModal} onOpenChange={setShowHandicapModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Starting Handicaps</DialogTitle>
            <DialogDescription>
              Set starting handicaps for {playerName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current values display */}
            <div className="text-sm text-gray-500">
              Current: 3v3 = {playerData?.starting_handicap_3v3 ?? 'Not set'}, 5v5 = {playerData?.starting_handicap_5v5 ?? 'Not set'}
            </div>

            {/* 3v3 Handicap */}
            <div>
              <Label htmlFor="handicap3v3">Starting Handicap (3v3)</Label>
              <Select value={handicap3v3} onValueChange={setHandicap3v3}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select handicap" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-2">-2</SelectItem>
                  <SelectItem value="-1">-1</SelectItem>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">+1</SelectItem>
                  <SelectItem value="2">+2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 5v5 Handicap */}
            <div>
              <Label htmlFor="handicap5v5">
                Starting Handicap (5v5)
                <span className="text-xs text-gray-500 ml-2">(0 to 100)</span>
              </Label>
              <Input
                id="handicap5v5"
                type="number"
                step="1"
                min="0"
                max="100"
                value={handicap5v5}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHandicap5v5(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHandicapModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleHandicapSave} disabled={updateHandicapsMutation.isPending} loadingText="Saving..." isLoading={updateHandicapsMutation.isPending}>
              Save Handicaps
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
