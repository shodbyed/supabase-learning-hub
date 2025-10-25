/**
 * @fileoverview Conversation Header Component
 *
 * Single responsibility: Display conversation title/recipient name.
 * Reusable component for the top of a conversation view.
 *
 * Mobile: Shows back button and conversation title
 * Desktop: Shows only conversation title (back button hidden)
 */

import { ArrowLeft, MoreVertical, LogOut, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ConversationHeaderProps {
  title: string;
  onBack?: () => void;
  onLeave?: () => void;
  onBlock?: () => void;
  canLeave?: boolean;
  canBlock?: boolean;
}

export function ConversationHeader({ title, onBack, onLeave, onBlock, canLeave = true, canBlock = false }: ConversationHeaderProps) {
  return (
    <div className="border-b bg-gray-300 px-3 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3 justify-between">
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
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

      {/* Options menu */}
      {(canLeave || canBlock) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canBlock && onBlock && (
              <>
                <DropdownMenuItem onClick={onBlock} className="text-orange-600 focus:text-orange-600">
                  <UserX className="h-4 w-4 mr-2" />
                  Block User
                </DropdownMenuItem>
                {canLeave && <DropdownMenuSeparator />}
              </>
            )}
            {canLeave && onLeave && (
              <DropdownMenuItem onClick={onLeave} className="text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Leave Conversation
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
