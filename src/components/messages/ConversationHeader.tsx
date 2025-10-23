/**
 * @fileoverview Conversation Header Component
 *
 * Single responsibility: Display conversation title/recipient name.
 * Reusable component for the top of a conversation view.
 *
 * Mobile: Shows back button and conversation title
 * Desktop: Shows only conversation title (back button hidden)
 */

import { ArrowLeft } from 'lucide-react';

interface ConversationHeaderProps {
  title: string;
  onBack?: () => void;
}

export function ConversationHeader({ title, onBack }: ConversationHeaderProps) {
  return (
    <div className="border-b bg-gray-300 px-3 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3">
      {/* Back button - only visible on mobile */}
      {onBack && (
        <button
          onClick={onBack}
          className="md:hidden p-2 -ml-2 hover:bg-gray-400 rounded-lg transition-colors flex-shrink-0"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <h2 className="text-base md:text-lg font-semibold truncate">{title}</h2>
    </div>
  );
}
