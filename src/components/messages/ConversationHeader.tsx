/**
 * @fileoverview Conversation Header Component
 *
 * Single responsibility: Display conversation title/recipient name.
 * Reusable component for the top of a conversation view.
 */

interface ConversationHeaderProps {
  title: string;
}

export function ConversationHeader({ title }: ConversationHeaderProps) {
  return (
    <div className="border-b bg-green-300 px-6 py-4">
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}
