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
import { fetchConversationMessages, sendMessage } from '@/utils/messageQueries';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/supabaseClient';

interface Message {
  id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  is_edited: boolean;
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    system_player_number: number;
  };
}

interface MessageViewProps {
  conversationId: string;
  currentUserId: string;
}

export function MessageView({ conversationId, currentUserId }: MessageViewProps) {
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recipientName, setRecipientName] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation participants to get recipient name
  useEffect(() => {
    async function loadRecipient() {
      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          user_id,
          members:user_id (
            id,
            first_name,
            last_name,
            system_player_number
          )
        `)
        .eq('conversation_id', conversationId)
        .is('left_at', null);

      if (error) {
        console.error('Error loading participants:', error);
        return;
      }

      // Find the participant who is NOT the current user
      const otherParticipant = data?.find((p: any) => p.user_id !== currentUserId);
      if (otherParticipant?.members) {
        const member = otherParticipant.members;
        setRecipientName(`${member.first_name} ${member.last_name}`);
      }
    }

    loadRecipient();
  }, [conversationId, currentUserId]);

  // Load messages when conversation changes
  useEffect(() => {
    async function loadMessages() {
      setLoading(true);
      const { data, error } = await fetchConversationMessages(conversationId);

      if (error) {
        console.error('Error loading messages:', error);
        setLoading(false);
        return;
      }

      setMessages((data as any) || []);
      setLoading(false);
    }

    loadMessages();
  }, [conversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || sending) return;

    setSending(true);
    const { data, error } = await sendMessage(conversationId, currentUserId, messageInput);

    if (error) {
      console.error('Error sending message:', error);
      setSending(false);
      return;
    }

    // Reload messages to get proper sender data
    const { data: updatedMessages } = await fetchConversationMessages(conversationId);
    if (updatedMessages) {
      setMessages(updatedMessages as any);
    }

    setMessageInput('');
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTimestamp = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Header */}
      <div className="border-b bg-green-300 px-6 py-4">
        <h2 className="text-lg font-semibold">
          {recipientName || 'Direct Message'}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 border-l-[16px] border-r-[16px] border-green-300">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            // Handle case where sender data might not be loaded due to RLS
            if (!message.sender) {
              return null;
            }

            const isCurrentUser = message.sender.id === currentUserId;
            const senderName = `${message.sender.first_name} ${message.sender.last_name}`;

            return (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  isCurrentUser ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-md rounded-lg px-4 py-2',
                    isCurrentUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  )}
                >
                  {!isCurrentUser && (
                    <p className="text-xs font-semibold mb-1">{senderName}</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={cn(
                      'text-xs mt-1',
                      isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                    )}
                  >
                    {formatTimestamp(message.created_at)}
                    {message.is_edited && ' (edited)'}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t bg-green-300 p-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 bg-white"
            disabled={sending}
            maxLength={2000}
          />
          <Button onClick={handleSendMessage} disabled={!messageInput.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {messageInput.length}/2000 characters
        </p>
      </div>
    </div>
  );
}
