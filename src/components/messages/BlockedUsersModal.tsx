/**
 * @fileoverview Blocked Users Management Modal
 *
 * Displays a list of users the current user has blocked with ability to unblock them.
 * Shows user information and when they were blocked.
 *
 * REFACTORED VERSION:
 * - Uses shared Modal component (DRY)
 * - Uses LoadingState component (DRY)
 * - Uses EmptyState component (DRY)
 * - Extracted BlockedUserItem component (Single Responsibility)
 * - Cleaner, more maintainable code
 */

import { useState, useEffect } from 'react';
import { UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal, LoadingState, EmptyState } from '@/components/shared';
import { getBlockedUsers, unblockUser } from '@/utils/messageQueries';

interface BlockedUser {
  blocked_id: string;
  blocked_at: string;
  reason: string | null;
  blocked: {
    id: string;
    first_name: string;
    last_name: string;
    system_player_number: number;
  };
}

interface BlockedUsersModalProps {
  currentUserId: string;
  onClose: () => void;
  onUnblocked?: () => void;
}

/**
 * Blocked User List Item Component
 * Single responsibility: Display one blocked user with unblock action
 */
function BlockedUserItem({
  blockedUser,
  onUnblock,
  isUnblocking,
}: {
  blockedUser: BlockedUser;
  onUnblock: (id: string) => void;
  isUnblocking: boolean;
}) {
  if (!blockedUser.blocked) return null;

  const user = blockedUser.blocked;
  const userName = `${user.first_name} ${user.last_name}`;
  const blockedDate = new Date(blockedUser.blocked_at).toLocaleDateString();

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{userName}</div>
        <div className="text-xs text-gray-500">
          Player #{user.system_player_number} • Blocked {blockedDate}
        </div>
        {blockedUser.reason && (
          <div className="text-xs text-gray-600 mt-1">Reason: {blockedUser.reason}</div>
        )}
      </div>
      <Button
        onClick={() => onUnblock(blockedUser.blocked_id)}
        disabled={isUnblocking}
        variant="outline"
        size="sm"
        className="ml-3 flex-shrink-0"
      >
        {isUnblocking ? 'Unblocking...' : 'Unblock'}
      </Button>
    </div>
  );
}

/**
 * Main Modal Component
 * Responsibility: Orchestrate blocked users list and unblock actions
 */
export function BlockedUsersModal({
  currentUserId,
  onClose,
  onUnblocked,
}: BlockedUsersModalProps) {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  // Load blocked users on mount
  useEffect(() => {
    async function loadBlockedUsers() {
      setLoading(true);
      const { data, error } = await getBlockedUsers(currentUserId);

      if (error) {
        console.error('Error loading blocked users:', error);
      } else {
        setBlockedUsers((data as any) || []);
      }

      setLoading(false);
    }

    loadBlockedUsers();
  }, [currentUserId]);

  const handleUnblock = async (blockedUserId: string) => {
    if (!confirm('Are you sure you want to unblock this user? They will be able to message you again.')) {
      return;
    }

    setUnblockingId(blockedUserId);

    const { error } = await unblockUser(currentUserId, blockedUserId);

    if (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user. Please try again.');
      setUnblockingId(null);
      return;
    }

    // Remove from local list
    setBlockedUsers((prev) => prev.filter((u) => u.blocked_id !== blockedUserId));
    setUnblockingId(null);

    // Notify parent
    onUnblocked?.();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Blocked Users"
      icon={<UserX className="h-5 w-5 text-gray-600" />}
    >
      <Modal.Body>
        {loading ? (
          <LoadingState message="Loading blocked users..." />
        ) : blockedUsers.length === 0 ? (
          <EmptyState
            icon={UserX}
            title="No Blocked Users"
            description="You haven't blocked anyone yet."
          />
        ) : (
          <div className="space-y-2">
            {blockedUsers.map((blockedUser) => (
              <BlockedUserItem
                key={blockedUser.blocked_id}
                blockedUser={blockedUser}
                onUnblock={handleUnblock}
                isUnblocking={unblockingId === blockedUser.blocked_id}
              />
            ))}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
