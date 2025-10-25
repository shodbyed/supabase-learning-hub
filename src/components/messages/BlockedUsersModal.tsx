/**
 * @fileoverview Blocked Users Management Modal
 *
 * Displays a list of users the current user has blocked with ability to unblock them.
 * Shows user information and when they were blocked.
 */

import { useState, useEffect } from 'react';
import { X, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  onUnblocked?: () => void; // Callback when a user is unblocked
}

export function BlockedUsersModal({ currentUserId, onClose, onUnblocked }: BlockedUsersModalProps) {
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
        setLoading(false);
        return;
      }

      setBlockedUsers((data as any) || []);
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

    // Notify parent to refresh conversations
    if (onUnblocked) {
      onUnblocked();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold">Blocked Users</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading blocked users...</p>
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserX className="h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No Blocked Users
              </h3>
              <p className="text-sm text-gray-500">
                You haven't blocked anyone yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map((blockedUser) => {
                if (!blockedUser.blocked) return null;

                const user = blockedUser.blocked;
                const userName = `${user.first_name} ${user.last_name}`;
                const blockedDate = new Date(blockedUser.blocked_at).toLocaleDateString();

                return (
                  <div
                    key={blockedUser.blocked_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {userName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Player #{user.system_player_number} • Blocked {blockedDate}
                      </div>
                      {blockedUser.reason && (
                        <div className="text-xs text-gray-600 mt-1">
                          Reason: {blockedUser.reason}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleUnblock(blockedUser.blocked_id)}
                      disabled={unblockingId === blockedUser.blocked_id}
                      variant="outline"
                      size="sm"
                      className="ml-3 flex-shrink-0"
                    >
                      {unblockingId === blockedUser.blocked_id ? 'Unblocking...' : 'Unblock'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex-shrink-0">
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
