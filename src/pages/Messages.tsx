/**
 * @fileoverview Messages Page
 *
 * Mobile-first messaging interface with responsive layout:
 * - Mobile: Single panel that toggles between conversation list and message view
 * - Desktop (md+): Two-column layout with conversation list and message view side-by-side
 *
 * Mobile Navigation:
 * - Shows conversation list by default
 * - Selecting a conversation hides the list and shows the message view
 * - Back button in message view returns to conversation list
 *
 * Desktop Navigation:
 * - Both panels always visible
 * - No back button needed
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageView } from '@/components/messages/MessageView';
import { MessagesEmptyState } from '@/components/messages/MessagesEmptyState';
import { NewMessageModal } from '@/components/messages/NewMessageModal';
import { AnnouncementModal } from '@/components/messages/AnnouncementModal';
import { MessageSettingsModal } from '@/components/messages/MessageSettingsModal';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  createOrOpenConversation,
  createGroupConversation,
  createLeagueAnnouncement,
  createOrganizationAnnouncement,
} from '@/utils/messageQueries';
import { cn } from '@/lib/utils';
import { supabase } from '@/supabaseClient';

export function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const { memberId, firstName } = useCurrentMember();
  const { canAccessLeagueOperatorFeatures } = useUserProfile();
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCaptain, setIsCaptain] = useState(false);

  // Check if we were passed a conversationId from navigation state
  useEffect(() => {
    const state = location.state as { conversationId?: string } | null;
    if (state?.conversationId) {
      setSelectedConversationId(state.conversationId);
      // Clear the state so refreshing doesn't re-select
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Check if user is a captain of any team
  useEffect(() => {
    async function checkCaptainStatus() {
      if (!memberId) return;

      const { data } = await supabase
        .from('team_players')
        .select('is_captain')
        .eq('member_id', memberId)
        .eq('is_captain', true)
        .limit(1);

      setIsCaptain(!!data && data.length > 0);
    }

    checkCaptainStatus();
  }, [memberId]);

  const handleNewMessage = () => {
    setShowNewMessageModal(true);
  };

  const handleAnnouncements = () => {
    setShowAnnouncementModal(true);
  };

  const handleCreateAnnouncement = async (
    targets: Array<{ id: string; name: string; type: 'league' | 'organization' }>,
    message: string
  ) => {
    if (!memberId) {
      return;
    }

    // Send announcement to each selected target
    for (const target of targets) {
      if (target.type === 'league') {
        const { error } = await createLeagueAnnouncement(target.id, memberId, message);
        if (error) {
          console.error(`Error creating announcement for league ${target.id}:`, error);
          alert(`Failed to send announcement to one or more targets. Please try again.`);
          return;
        }
      } else if (target.type === 'organization') {
        const { error } = await createOrganizationAnnouncement(target.id, memberId, message);
        if (error) {
          console.error(`Error creating announcement for organization ${target.id}:`, error);
          alert(`Failed to send announcement to one or more targets. Please try again.`);
          return;
        }
      }
    }

    // Close modal and refresh conversations
    setShowAnnouncementModal(false);
    setRefreshKey((prev) => prev + 1);

    // Show success message
    alert(
      `Announcement sent successfully to ${targets.length} target${targets.length > 1 ? 's' : ''}!`
    );
  };

  const handleCreateConversation = async (
    userIds: string[],
    groupName?: string
  ) => {
    if (!memberId) {
      return;
    }

    let conversationId: string | null = null;

    if (userIds.length === 1) {
      // Direct message
      const { data, error } = await createOrOpenConversation(
        memberId,
        userIds[0]
      );

      if (error) {
        console.error('Error creating/opening conversation:', error);
        return;
      }

      conversationId = data?.conversationId || null;
    } else {
      // Group conversation
      if (!groupName) {
        console.error('Group name is required for group conversations');
        return;
      }

      // Include current user in the group
      const allMemberIds = [memberId, ...userIds];

      const { data, error } = await createGroupConversation(
        memberId,
        groupName,
        allMemberIds
      );

      if (error) {
        console.error('Error creating group conversation:', error);
        return;
      }

      conversationId = data?.conversationId || null;
    }

    if (conversationId) {
      setSelectedConversationId(conversationId);
      setShowNewMessageModal(false);
      setRefreshKey((prev) => prev + 1);
    }
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header - Shows when viewing conversation list */}
      <div
        className={cn(
          'border-b bg-gray-300 px-4 md:px-6 py-4 md:py-4 flex items-center gap-2 flex-shrink-0',
          // Hide on mobile when viewing a conversation
          selectedConversationId ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Back button - only on mobile */}
        <button
          onClick={() => navigate('/dashboard')}
          className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-xl md:text-4xl font-semibold">
          {firstName ? `${firstName}'s Messages` : 'Messages'}
        </div>
      </div>

      {/* Responsive layout: Single panel on mobile, two-column on desktop */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Conversation List - Hidden on mobile when message is selected */}
        <div
          className={cn(
            'w-full md:w-80 border-r bg-gray-50 flex flex-col h-full',
            // On mobile: hide when message is selected, show when no message selected
            selectedConversationId ? 'hidden md:flex' : 'flex'
          )}
        >
          {memberId && (
            <ConversationList
              key={refreshKey}
              userId={memberId}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
              onNewMessage={handleNewMessage}
              showAnnouncements={isCaptain || canAccessLeagueOperatorFeatures()}
              onAnnouncements={handleAnnouncements}
              onSettings={() => setShowSettingsModal(true)}
              onExit={() => navigate('/dashboard')}
            />
          )}
        </div>

        {/* Message View - Hidden on mobile when no message selected */}
        <div
          className={cn(
            'flex-1 flex flex-col min-h-0 overflow-hidden',
            // On mobile: hide when no message selected, show when message is selected
            selectedConversationId ? 'flex' : 'hidden md:flex'
          )}
        >
          {selectedConversationId && memberId ? (
            <MessageView
              conversationId={selectedConversationId}
              currentUserId={memberId}
              onBack={handleBackToList}
              onLeaveConversation={() => {
                setSelectedConversationId(null);
                setRefreshKey((prev) => prev + 1);
              }}
            />
          ) : (
            <MessagesEmptyState />
          )}

          {/* Exit Button - Only show on desktop */}
          <div className="hidden md:flex border-t bg-green-300 px-4 md:px-6 py-4 justify-end flex-shrink-0">
            <Button onClick={() => navigate('/dashboard')}>
              Exit to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && memberId && (
        <NewMessageModal
          onClose={() => setShowNewMessageModal(false)}
          onCreateConversation={handleCreateConversation}
          currentUserId={memberId}
        />
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && memberId && (
        <AnnouncementModal
          onClose={() => setShowAnnouncementModal(false)}
          onCreateAnnouncement={handleCreateAnnouncement}
          currentUserId={memberId}
          canAccessOperatorFeatures={canAccessLeagueOperatorFeatures()}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <MessageSettingsModal
          onClose={() => setShowSettingsModal(false)}
          onUnblocked={() => setRefreshKey((prev) => prev + 1)}
        />
      )}
    </div>
  );
}
