/**
 * @fileoverview Messages Page
 *
 * Full-page messaging interface with two-column layout:
 * - Left: Conversation list with search
 * - Right: Selected conversation with message history and input
 *
 * Supports both group chats and announcement-style messages.
 */

import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, X } from 'lucide-react';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageView } from '@/components/messages/MessageView';
import { NewMessageModal } from '@/components/messages/NewMessageModal';
import { UserContext } from '@/context/UserContext';
import { supabase } from '@/supabaseClient';
import { createOrOpenConversation } from '@/utils/messageQueries';

export function Messages() {
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [memberFirstName, setMemberFirstName] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Get member_id and first_name from user_id
  useEffect(() => {
    async function getMemberId() {
      if (!userContext?.user?.id) {
        return;
      }

      const { data, error } = await supabase
        .from('members')
        .select('id, user_id, first_name')
        .eq('user_id', userContext.user.id)
        .single();

      if (error) {
        console.error('Error fetching member ID:', error);
        return;
      }

      setMemberId(data.id);
      setMemberFirstName(data.first_name);
    }

    getMemberId();
  }, [userContext?.user?.id]);

  const handleNewMessage = () => {
    setShowNewMessageModal(true);
  };

  const handleSelectUser = async (userId: string) => {
    if (!memberId) {
      return;
    }

    // Create or open conversation with selected user
    const { data, error } = await createOrOpenConversation(memberId, userId);

    if (error) {
      console.error('Error creating/opening conversation:', error);
      return;
    }

    if (data) {
      setSelectedConversationId(data.conversationId);
      setShowNewMessageModal(false);
      // Refresh conversation list to show new conversation
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <h1 className="text-lg font-semibold">
          {memberFirstName ? `${memberFirstName}'s Messages` : 'Messages'}
        </h1>
        <Button onClick={handleNewMessage}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Conversation List - extends to bottom */}
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

        {/* Right: Message View + Exit Button */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {selectedConversationId && memberId ? (
            <MessageView conversationId={selectedConversationId} currentUserId={memberId} />
          ) : (
            <>
              {/* Empty state header - matches recipient header */}
              <div className="border-b bg-green-300 px-6 py-4">
                <h2 className="text-lg font-semibold">No Conversation Selected</h2>
              </div>
              {/* Empty state with green border */}
              <div className="flex-1 flex items-center justify-center text-gray-500 border-l-[16px] border-r-[16px] border-green-300 overflow-hidden">
                <div className="text-center">
                  <p className="text-lg mb-2">No conversation selected</p>
                  <p className="text-sm">Choose a conversation or start a new one</p>
                </div>
              </div>
              {/* Bottom Exit Button for empty state */}
              <div className="border-t bg-green-300 px-6 py-4 flex justify-end flex-shrink-0">
                <Button onClick={() => navigate('/dashboard')}>
                  Exit to Dashboard
                </Button>
              </div>
            </>
          )}

          {/* Bottom Exit Button - only shown when conversation is selected */}
          {selectedConversationId && memberId && (
            <div className="border-t bg-green-300 px-6 py-4 flex justify-end flex-shrink-0">
              <Button onClick={() => navigate('/dashboard')}>
                Exit to Dashboard
              </Button>
            </div>
          )}
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
