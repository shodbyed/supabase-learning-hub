/**
 * @fileoverview Message Input Component
 *
 * Single responsibility: Handle message input and sending.
 * Reusable component for composing and sending messages.
 */

import { useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  maxLength?: number;
}

export function MessageInput({ onSend, disabled = false, maxLength = 2000 }: MessageInputProps) {
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || sending) return;

    setSending(true);
    await onSend(messageInput);
    setMessageInput('');
    setSending(false);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t bg-green-300 p-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 bg-white"
          disabled={sending || disabled}
          maxLength={maxLength}
        />
        <Button onClick={handleSendMessage} disabled={!messageInput.trim() || sending || disabled}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-600 mt-1">
        {messageInput.length}/{maxLength} characters
      </p>
    </div>
  );
}
