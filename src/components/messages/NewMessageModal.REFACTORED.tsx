/**
 * @fileoverview New Message Modal (REFACTORED)
 *
 * Modal for starting a new conversation (direct or group).
 *
 * REFACTORING IMPROVEMENTS:
 * - Extracted useFilteredMembers hook (data fetching + filtering logic)
 * - Uses SelectedUserChips shared component
 * - Extracted UserSearchInput component
 * - Extracted GroupNameInput component
 * - Extracted MemberList component
 * - Main component now only orchestrates sub-components (~85 lines vs 239)
 * - Each sub-component has single responsibility
 * - No direct Supabase calls - all through TanStack Query
 * - Easier to test and maintain
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare } from 'lucide-react';
import { Modal, SelectedUserChips } from '@/components/shared';
import { useFilteredMembers } from './newmessage/useFilteredMembers';
import { UserSearchInput } from './newmessage/UserSearchInput';
import { GroupNameInput } from './newmessage/GroupNameInput';
import { MemberList } from './newmessage/MemberList';

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
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');

  // Fetch and filter members using custom hook
  const { members, loading } = useFilteredMembers(currentUserId, searchQuery);

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

  // Prepare selected members for chips display
  const selectedMembers = useMemo(() => {
    return members
      .filter((m) => selectedUserIds.includes(m.id))
      .map((m) => ({
        id: m.id,
        name: `${m.first_name} ${m.last_name}`,
      }));
  }, [members, selectedUserIds]);

  const isGroup = selectedUserIds.length >= 2;

  // Auto-generate group name suggestion
  const suggestedGroupName = useMemo(() => {
    return selectedMembers.map((m) => m.name.split(' ')[0]).join(', ');
  }, [selectedMembers]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="New Message"
      icon={<MessageSquare className="h-5 w-5 text-gray-600" />}
      maxWidth="2xl"
    >
      <Modal.Body className="p-0">
        {/* Selected Users Chips */}
        {selectedUserIds.length > 0 && (
          <div className="px-6 pt-4 border-b bg-blue-50">
            <SelectedUserChips items={selectedMembers} onRemove={handleToggleUser} />

            {/* Group Name Input (only show for 2+ people) */}
            {isGroup && (
              <GroupNameInput
                value={groupName}
                onChange={setGroupName}
                suggestedName={suggestedGroupName}
              />
            )}
          </div>
        )}

        {/* Search */}
        <UserSearchInput value={searchQuery} onChange={setSearchQuery} />

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

        {/* Member List */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          <MemberList
            members={members}
            selectedUserIds={selectedUserIds}
            loading={loading}
            onToggle={handleToggleUser}
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
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
      </Modal.Footer>
    </Modal>
  );
}
