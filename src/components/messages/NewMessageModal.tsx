/**
 * @fileoverview New Message Modal
 *
 * Modal for starting a new conversation (direct or group).
 * Features:
 * - Multi-select user picker
 * - Search bar for finding users
 * - Filter tabs: All | My Leagues | My Teams
 * - Group name input (when 2+ users selected)
 * - Creates DM (1 person) or Group (2+ people)
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Search, Users } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { UserListItem } from './UserListItem';
import { getBlockedUsers } from '@/utils/messageQueries';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  system_player_number: number;
}

interface NewMessageModalProps {
  onClose: () => void;
  onCreateConversation: (userIds: string[], groupName?: string) => void;
  currentUserId: string;
}

type FilterTab = 'all' | 'leagues' | 'teams';

export function NewMessageModal({
  onClose,
  onCreateConversation,
  currentUserId,
}: NewMessageModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);

  // Fetch blocked users
  useEffect(() => {
    async function fetchBlockedUsers() {
      const { data, error } = await getBlockedUsers(currentUserId);

      if (error) {
        console.error('Error fetching blocked users:', error);
        return;
      }

      // Extract IDs of blocked users
      setBlockedUserIds((data || []).map((block: any) => block.blocked_id));
    }

    fetchBlockedUsers();
  }, [currentUserId]);

  // Fetch members (excluding current user and blocked users)
  useEffect(() => {
    async function fetchMembers() {
      const { data, error} = await supabase
        .from('members')
        .select('id, first_name, last_name, system_player_number')
        .not('user_id', 'is', null)
        .neq('id', currentUserId) // Exclude current user
        .order('last_name', { ascending: true });

      if (error) {
        console.error('Error fetching members:', error);
        setLoading(false);
        return;
      }

      // Filter out blocked users
      const filteredData = (data || []).filter((member) => !blockedUserIds.includes(member.id));
      setMembers(filteredData);
      setLoading(false);
    }

    // Only fetch members after we have blocked users list
    if (blockedUserIds.length >= 0) {
      fetchMembers();
    }
  }, [currentUserId, blockedUserIds]);

  const filteredMembers = members.filter((member) => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const cleanQuery = query.replace(/^p-?/, '');
    const playerNumber = member.system_player_number.toString().padStart(5, '0');

    return fullName.includes(query) || playerNumber.includes(cleanQuery);
  });

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = () => {
    if (selectedUserIds.length === 0) return;

    if (selectedUserIds.length === 1) {
      // Direct message - no group name needed
      onCreateConversation(selectedUserIds);
    } else {
      // Group conversation - group name required
      if (!groupName.trim()) {
        alert('Please enter a group name');
        return;
      }
      onCreateConversation(selectedUserIds, groupName);
    }
  };

  const selectedMembers = members.filter((m) => selectedUserIds.includes(m.id));
  const isGroup = selectedUserIds.length >= 2;

  // Auto-generate group name suggestion
  const suggestedGroupName =
    selectedMembers.length > 0 ? selectedMembers.map((m) => m.first_name).join(', ') : '';

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
          <h2 className="text-2xl font-bold text-gray-900">New Message</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Selected Users */}
        {selectedUserIds.length > 0 && (
          <div className="px-6 pt-4 border-b bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Selected ({selectedUserIds.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pb-4">
              {selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white border border-blue-300 rounded-full px-3 py-1 text-sm flex items-center gap-2"
                >
                  <span>
                    {member.first_name} {member.last_name}
                  </span>
                  <button
                    onClick={() => handleToggleUser(member.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Group Name Input (only show for 2+ people) */}
            {isGroup && (
              <div className="pb-4">
                <Input
                  type="text"
                  placeholder={`Group name (e.g., "${suggestedGroupName}")`}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="bg-white"
                />
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or member number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 pt-4 border-b">
          <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterTab)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="leagues">My Leagues</TabsTrigger>
              <TabsTrigger value="teams">My Teams</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <p>Loading members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No members found</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredMembers.map((member) => (
                <UserListItem
                  key={member.id}
                  firstName={member.first_name}
                  lastName={member.last_name}
                  playerNumber={member.system_player_number}
                  onClick={() => handleToggleUser(member.id)}
                  isSelected={selectedUserIds.includes(member.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={selectedUserIds.length === 0} className="flex-1">
            {selectedUserIds.length === 0
              ? 'Select People'
              : selectedUserIds.length === 1
                ? 'Message'
                : `Create Group (${selectedUserIds.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
