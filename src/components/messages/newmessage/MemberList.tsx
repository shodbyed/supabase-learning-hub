/**
 * @fileoverview Member List Component
 *
 * Displays list of selectable members for messaging.
 * Handles loading and empty states.
 * Shows checkable user list items.
 */

import { Users } from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/shared';
import { UserListItem } from '../UserListItem';
import type { MemberForMessaging } from '@/types';

interface MemberListProps {
  members: MemberForMessaging[];
  selectedUserIds: string[];
  loading: boolean;
  onToggle: (userId: string) => void;
}

export function MemberList({ members, selectedUserIds, loading, onToggle }: MemberListProps) {
  if (loading) {
    return <LoadingState message="Loading members..." />;
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members found"
        description="Try a different search term"
      />
    );
  }

  return (
    <div className="space-y-1">
      {members.map((member) => (
        <UserListItem
          key={member.id}
          firstName={member.first_name}
          lastName={member.last_name}
          playerNumber={member.system_player_number}
          onClick={() => onToggle(member.id)}
          isSelected={selectedUserIds.includes(member.id)}
        />
      ))}
    </div>
  );
}
