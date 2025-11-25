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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { User, MessageSquare, Flag, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemberId, useCreateOrOpenConversation, useBlockUser, useUnblockUser, useIsUserBlocked } from '@/api/hooks';
import { ReportUserModal } from '@/components/ReportUserModal';
import { ConfirmDialog } from '@/components/shared';

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
  const memberId = useMemberId();
  const [open, setOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);

  // TanStack Query hooks
  const createOrOpenConversationMutation = useCreateOrOpenConversation();
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

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
      console.error('Current user member ID not found');
      setOpen(false);
      return;
    }

    // Don't allow messaging yourself
    if (memberId === playerId) {
      console.log('Cannot message yourself');
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
      console.error('Error creating/opening conversation:', error);
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
      console.error('Current user member ID not found');
      setOpen(false);
      return;
    }

    // Don't allow blocking yourself
    if (memberId === playerId) {
      console.log('Cannot block yourself');
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

      alert(`${playerName} has been blocked. You won't see messages from them.`);
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user. Please try again.');
    }
  };

  const handleUnblockConfirm = async () => {
    if (!memberId) return;

    try {
      await unblockUserMutation.mutateAsync({
        blockerId: memberId,
        blockedUserId: playerId,
      });

      alert(`${playerName} has been unblocked.`);
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user. Please try again.');
    }
  };

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
    </>
  );
}
