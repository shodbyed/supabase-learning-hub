/**
 * @fileoverview Messages Page
 *
 * Full-page messaging interface with two-column layout:
 * - Left: Conversation list with search
 * - Right: Selected conversation with message history and input
 *
 * Supports both group chats and announcement-style messages.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageView } from '@/components/messages/MessageView';

export function Messages() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  // const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  const handleNewMessage = () => {
    // TODO: Open new message modal
    console.log('New message clicked - modal will be implemented next');
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Button onClick={handleNewMessage}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Conversation List */}
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          <ConversationList
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
          />
        </div>

        {/* Right: Message View */}
        <div className="flex-1 flex flex-col">
          {selectedConversationId ? (
            <MessageView conversationId={selectedConversationId} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No conversation selected</p>
                <p className="text-sm">Choose a conversation or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
