/**
 * @fileoverview Conversation List Component
 *
 * Displays list of conversations with search functionality.
 * Shows conversation preview with last message and timestamp.
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isAnnouncement: boolean;
}

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

// Mock data - will be replaced with real data later
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    title: 'Team Sharks',
    lastMessage: 'Practice this Thursday at 7pm',
    timestamp: '2m ago',
    unreadCount: 2,
    isAnnouncement: false,
  },
  {
    id: '2',
    title: 'Monday Night League',
    lastMessage: 'Schedule has been updated',
    timestamp: '1h ago',
    unreadCount: 0,
    isAnnouncement: true,
  },
  {
    id: '3',
    title: 'John Smith',
    lastMessage: 'Thanks for the game last night!',
    timestamp: '3h ago',
    unreadCount: 1,
    isAnnouncement: false,
  },
];

export function ConversationList({
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations based on search
  const filteredConversations = MOCK_CONVERSATIONS.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={cn(
                'w-full p-4 text-left border-b hover:bg-gray-100 transition-colors',
                selectedConversationId === conversation.id && 'bg-blue-50 hover:bg-blue-50'
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="font-semibold text-sm flex items-center gap-2">
                  {conversation.title}
                  {conversation.isAnnouncement && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Announcement
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-500">{conversation.timestamp}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate flex-1">
                  {conversation.lastMessage}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
