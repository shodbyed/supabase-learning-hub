/**
 * @fileoverview Messages Page
 *
 * Full-page messaging interface with two-column layout:
 * - Left: Conversation list with search
 * - Right: Selected conversation with message history and input
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageView } from '@/components/messages/MessageView';
import { MessagesEmptyState } from '@/components/messages/MessagesEmptyState';
import { NewMessageModal } from '@/components/messages/NewMessageModal';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { createOrOpenConversation } from '@/utils/messageQueries';

export function Messages() {
  const navigate = useNavigate();
  const { memberId, firstName } = useCurrentMember();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNewMessage = () => {
    setShowNewMessageModal(true);
  };

  const handleSelectUser = async (userId: string) => {
    if (!memberId) {
      return;
    }

    const { data, error } = await createOrOpenConversation(memberId, userId);

    if (error) {
      console.error('Error creating/opening conversation:', error);
      return;
    }

    if (data) {
      setSelectedConversationId(data.conversationId);
      setShowNewMessageModal(false);
      setRefreshKey((prev) => prev + 1);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <h1 className="text-lg font-semibold">
          {firstName ? `${firstName}'s Messages` : 'Messages'}
        </h1>
        <Button onClick={handleNewMessage}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Conversation List */}
        <div className="w-80 border-r bg-gray-50 flex flex-col h-full">
          {memberId && (
            <ConversationList
              key={refreshKey}
              userId={memberId}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
            />
          )}
        </div>

        {/* Right: Message View or Empty State */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {selectedConversationId && memberId ? (
            <MessageView conversationId={selectedConversationId} currentUserId={memberId} />
          ) : (
            <MessagesEmptyState />
          )}

          {/* Bottom Exit Button */}
          <div className="border-t bg-green-300 px-6 py-4 flex justify-end flex-shrink-0">
            <Button onClick={() => navigate('/dashboard')}>Exit to Dashboard</Button>
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <NewMessageModal
          onClose={() => setShowNewMessageModal(false)}
          onSelectUser={handleSelectUser}
        />
      )}
    </div>
  );
}
