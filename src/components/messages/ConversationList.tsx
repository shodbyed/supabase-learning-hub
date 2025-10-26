/**
 * @fileoverview Conversation List Component
 *
 * Displays list of conversations with search functionality.
 * Shows conversation preview with last message and timestamp.
 *
 * Mobile-optimized with:
 * - Larger touch targets (min 60px height)
 * - Responsive padding and font sizes
 * - Touch-friendly spacing
 */

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageSquarePlus, Settings, Megaphone, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchUserConversations } from '@/utils/messageQueries';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/supabaseClient';
import { LoadingState, EmptyState } from '@/components/shared';

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  // Fetch conversations
  useEffect(() => {
    async function loadConversations() {
      const { data, error } = await fetchUserConversations(userId);

      if (error) {
        console.error('Error loading conversations:', error);
        setLoading(false);
        return;
      }

      setConversations(data || []);
      setLoading(false);
    }

    loadConversations();

    // Subscribe to new messages in any conversation
    const messagesChannel = supabase
      .channel('all-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async () => {
          // Reload conversations to get updated preview and timestamp
          const { data } = await fetchUserConversations(userId);
          if (data) {
            setConversations(data);
          }
        }
      )
      .subscribe();

    // Subscribe to conversation participant updates (for unread counts)
    const participantsChannel = supabase
      .channel('all-participants')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          // Reload conversations to get updated unread counts
          const { data } = await fetchUserConversations(userId);
          if (data) {
            setConversations(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [userId]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) => {
    const title = conv.title || 'Direct Message';
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Format timestamp
  const formatTimestamp = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

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
      <div className="px-3 pb-3 pt-0 md:px-4 md:pb-4 md:pt-0 border-b bg-gray-300">
        <div className="flex gap-2 justify-around bg-gray-50 rounded-lg p-2 shadow-sm border border-gray-200">
          {/* New Message */}
          <Button
            variant="ghost"
            onClick={onNewMessage}
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
            aria-label="New message"
          >
            <MessageSquarePlus className="h-5 w-5" />
            <span className="text-[10px] text-gray-600">New</span>
          </Button>

          {/* Search Toggle */}
          <Button
            variant="ghost"
            onClick={() => setShowSearch(!showSearch)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 h-auto py-2',
              showSearch && 'bg-blue-100 text-blue-600 hover:bg-blue-100'
            )}
            aria-label="Toggle search"
          >
            <Search className="h-5 w-5" />
            <span className="text-[10px] text-gray-600">Search</span>
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            onClick={onSettings}
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
            <span className="text-[10px] text-gray-600">Settings</span>
          </Button>
        </div>
      </div>

      {/* Search Bar - Collapsible */}
      {showSearch && (
        <div className="p-3 md:p-4 border-b bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 md:pl-10 h-10 md:h-11"
              autoFocus
            />
          </div>
        </div>
      )}

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
          filteredConversations.map((conversation) => {
            const isAnnouncement = conversation.conversationType === 'announcements';
            const displayTitle = conversation.title || 'Direct Message';

            return (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  // Mobile-first: Larger touch targets with responsive padding
                  'w-full p-4 md:p-3 text-left border-b border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition-colors',
                  // Min height for touch targets (60px on mobile, 56px on desktop)
                  'min-h-[60px] md:min-h-[56px]',
                  selectedConversationId === conversation.id && 'bg-blue-50 hover:bg-blue-100'
                )}
              >
                <div className="flex items-start justify-between mb-1.5 md:mb-1">
                  <span className="font-semibold text-sm md:text-base flex items-center gap-2">
                    {displayTitle}
                    {isAnnouncement && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Announcement
                      </span>
                    )}
                  </span>
                  <span className="text-xs md:text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatTimestamp(conversation.lastMessageAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm md:text-sm text-gray-600 truncate flex-1">
                    {conversation.lastMessagePreview || 'No messages yet'}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="ml-2 bg-blue-600 text-white text-xs font-medium rounded-full h-6 w-6 md:h-5 md:w-5 flex items-center justify-center flex-shrink-0">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer - Exit button (mobile only) */}
      {onExit && (
        <div className="md:hidden border-t bg-gray-300 px-4 py-4 flex justify-end flex-shrink-0">
          <Button onClick={onExit}>
            Exit to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
