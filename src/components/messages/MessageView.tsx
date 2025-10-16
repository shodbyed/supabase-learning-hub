/**
 * @fileoverview Message View Component
 *
 * Displays message thread for selected conversation.
 * Shows message history and input box for sending new messages.
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

interface MessageViewProps {
  conversationId: string;
}

// Mock data - will be replaced with real data later
const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    {
      id: '1',
      senderId: 'user1',
      senderName: 'Captain Mike',
      content: 'Hey team, practice this Thursday at 7pm',
      timestamp: '2m ago',
      isCurrentUser: false,
    },
    {
      id: '2',
      senderId: 'user2',
      senderName: 'You',
      content: "I'll be there!",
      timestamp: '1m ago',
      isCurrentUser: true,
    },
  ],
  '2': [
    {
      id: '1',
      senderId: 'operator1',
      senderName: 'League Operator',
      content: 'Schedule has been updated for next week. Please check the new times.',
      timestamp: '1h ago',
      isCurrentUser: false,
    },
  ],
  '3': [
    {
      id: '1',
      senderId: 'user3',
      senderName: 'John Smith',
      content: 'Thanks for the game last night!',
      timestamp: '3h ago',
      isCurrentUser: false,
    },
    {
      id: '2',
      senderId: 'user2',
      senderName: 'You',
      content: 'Anytime! Great match.',
      timestamp: '2h ago',
      isCurrentUser: true,
    },
  ],
};

export function MessageView({ conversationId }: MessageViewProps) {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = MOCK_MESSAGES[conversationId] || [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    // TODO: Send message to backend
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.isCurrentUser ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-md rounded-lg px-4 py-2',
                  message.isCurrentUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                )}
              >
                {!message.isCurrentUser && (
                  <p className="text-xs font-semibold mb-1">{message.senderName}</p>
                )}
                <p className="text-sm">{message.content}</p>
                <p
                  className={cn(
                    'text-xs mt-1',
                    message.isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                  )}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
