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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { User, MessageSquare, Flag, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemberId } from '@/api/hooks';
import { createOrOpenConversation, blockUser, unblockUser, isUserBlocked } from '@/utils/messageQueries';
import { ReportUserModal } from '@/components/ReportUserModal';

interface PlayerNameLinkProps {
  playerId: string;
  playerName: string;
  className?: string;
  onSendMessage?: (playerId: string) => void;
  onReportUser?: (playerId: string) => void;
  onBlockUser?: (playerId: string) => void;
}

export function PlayerNameLink({
  playerId,
  playerName,
  className,
  onSendMessage,
  onReportUser,
  onBlockUser,
}: PlayerNameLinkProps) {
  const navigate = useNavigate();
  const memberId = useMemberId();
  const [open, setOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Check if user is blocked when popover opens
  useEffect(() => {
    async function checkBlockStatus() {
      if (!memberId || !open) return;

      const { data } = await isUserBlocked(memberId, playerId);
      setIsBlocked(data || false);
    }

    checkBlockStatus();
  }, [memberId, playerId, open]);

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

    const { data, error } = await createOrOpenConversation(memberId, playerId);

    if (error) {
      console.error('Error creating/opening conversation:', error);
      setOpen(false);
      return;
    }

    if (data?.conversationId) {
      // Navigate to messages with the conversation ID as state
      navigate('/messages', { state: { conversationId: data.conversationId } });
    }

    setOpen(false);
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

  const handleBlockToggle = async () => {
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

    // Handle unblock
    if (isBlocked) {
      if (!confirm(`Unblock ${playerName}? You'll be able to message each other again.`)) {
        setOpen(false);
        return;
      }

      const { error } = await unblockUser(memberId, playerId);

      if (error) {
        console.error('Error unblocking user:', error);
        alert('Failed to unblock user. Please try again.');
        setOpen(false);
        return;
      }

      alert(`${playerName} has been unblocked.`);
      setIsBlocked(false);
      setOpen(false);
      return;
    }

    // Handle block
    if (!confirm(`Are you sure you want to block ${playerName}? You won't be able to message each other.`)) {
      setOpen(false);
      return;
    }

    const { error } = await blockUser(memberId, playerId);

    if (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user. Please try again.');
      setOpen(false);
      return;
    }

    alert(`${playerName} has been blocked. You won't see messages from them.`);
    setIsBlocked(true);
    setOpen(false);
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
    </>
  );
}
