/**
 * @fileoverview Conversation List Component (REFACTORED)
 *
 * Displays list of conversations with search functionality.
 *
 * REFACTORING IMPROVEMENTS:
 * - Extracted ConversationMenuBar component (action buttons)
 * - Extracted ConversationSearchBar component (search input)
 * - Extracted ConversationItem component (individual conversation)
 * - Main component now only orchestrates sub-components (~90 lines vs 220)
 * - Each sub-component has single responsibility
 * - Easier to test and maintain
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Megaphone, MessageSquare } from 'lucide-react';
import { useConversations, useConversationsRealtime } from '@/api/hooks';
import { LoadingState, EmptyState } from '@/components/shared';
import { ConversationMenuBar } from './conversationlist/ConversationMenuBar';
import { ConversationSearchBar } from './conversationlist/ConversationSearchBar';
import { ConversationItem } from './conversationlist/ConversationItem';

interface Conversation {
  id: string;
  title: string | null;
  conversationType: string | null;
  scopeType: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  createdAt: string;
}

interface ConversationListProps {
  userId: string;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewMessage?: () => void;
  onSettings?: () => void;
  onExit?: () => void;
  onAnnouncements?: () => void;
  showAnnouncements?: boolean;
}

export function ConversationList({
  userId,
  selectedConversationId,
  onSelectConversation,
  onNewMessage,
  onSettings,
  onExit,
  onAnnouncements,
  showAnnouncements = false,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Fetch conversations using TanStack Query
  const { data: conversationsData = [], isLoading: loading } = useConversations(userId);
  const conversations = conversationsData as Conversation[];

  // Real-time subscriptions (auto-manages channels and cleanup)
  useConversationsRealtime(userId);

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    return conversations.filter((conv) => {
      const title = conv.title || 'Direct Message';
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      {/* Announcements Button - Only for captains/operators/admins */}
      {showAnnouncements && (
        <div className="px-3 pb-2 pt-0 md:px-4 md:pb-3 bg-gray-300">
          <Button
            onClick={onAnnouncements}
            variant="outline"
            className="w-full bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
          >
            <Megaphone className="h-4 w-4 mr-2" />
            Send Announcement
          </Button>
        </div>
      )}

      {/* Menu Bar */}
      <ConversationMenuBar
        showSearch={showSearch}
        onNewMessage={onNewMessage}
        onToggleSearch={() => setShowSearch(!showSearch)}
        onSettings={onSettings}
      />

      {/* Search Bar - Collapsible */}
      {showSearch && <ConversationSearchBar value={searchQuery} onChange={setSearchQuery} />}

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingState message="Loading conversations..." />
        ) : filteredConversations.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No conversations found"
            description="Start a new conversation to get started"
          />
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              id={conversation.id}
              title={conversation.title}
              conversationType={conversation.conversationType}
              lastMessageAt={conversation.lastMessageAt}
              lastMessagePreview={conversation.lastMessagePreview}
              unreadCount={conversation.unreadCount}
              isSelected={selectedConversationId === conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
            />
          ))
        )}
      </div>

      {/* Footer - Exit button (mobile only) */}
      {onExit && (
        <div className="md:hidden border-t bg-gray-300 px-4 py-4 flex justify-end flex-shrink-0">
          <Button onClick={onExit}>Exit to Dashboard</Button>
        </div>
      )}
    </div>
  );
}
