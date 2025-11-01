/**
 * @fileoverview Message Mutation Hooks
 *
 * TanStack Query mutation hooks for messaging operations.
 * Automatically invalidates relevant queries on success.
 *
 * @see api/mutations/messages.ts - Raw mutation functions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sendMessage,
  updateLastRead,
  blockUser,
  unblockUser,
  type SendMessageParams,
  type UpdateLastReadParams,
  type BlockUserParams,
  type UnblockUserParams,
} from '../mutations/messages';
import { queryKeys } from '../queryKeys';

/**
 * Hook to send a message
 *
 * Sends message and invalidates conversation queries to show new message.
 * Real-time subscriptions will also update other participants.
 *
 * @returns Mutation hook with mutate function and state
 *
 * @example
 * function MessageInput({ conversationId, senderId }) {
 *   const sendMsg = useSendMessage();
 *   const [content, setContent] = useState('');
 *
 *   const handleSend = () => {
 *     sendMsg.mutate({
 *       conversationId,
 *       senderId,
 *       content
 *     }, {
 *       onSuccess: () => {
 *         setContent(''); // Clear input
 *       }
 *     });
 *   };
 *
 *   return (
 *     <input
 *       value={content}
 *       onChange={(e) => setContent(e.target.value)}
 *       disabled={sendMsg.isPending}
 *     />
 *   );
 * }
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SendMessageParams) => sendMessage(params),
    onSuccess: (_, variables) => {
      // Invalidate messages in this conversation
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byConversation(variables.conversationId),
      });

      // Invalidate conversations list (to update last message preview)
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversations(variables.senderId),
      });
    },
  });
}

/**
 * Hook to mark messages as read
 *
 * Updates last read timestamp for conversation.
 * Used to track unread message counts.
 *
 * @returns Mutation hook with mutate function and state
 *
 * @example
 * function MessageView({ conversationId, userId }) {
 *   const markRead = useUpdateLastRead();
 *
 *   useEffect(() => {
 *     // Mark as read when user opens conversation
 *     markRead.mutate({ conversationId, userId });
 *   }, [conversationId]);
 *
 *   return <div>Messages...</div>;
 * }
 */
export function useUpdateLastRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateLastReadParams) => updateLastRead(params),
    onSuccess: (_, variables) => {
      // Invalidate conversations to update unread count
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversations(variables.userId),
      });

      // Invalidate unread count query
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.unreadCount(variables.userId),
      });
    },
  });
}

/**
 * Hook to block a user
 *
 * Blocks user and invalidates relevant queries.
 * Blocked users cannot send messages to blocker.
 *
 * @returns Mutation hook with mutate function and state
 *
 * @example
 * function BlockUserButton({ blockedUserId, blockerId }) {
 *   const block = useBlockUser();
 *
 *   const handleBlock = () => {
 *     block.mutate({ blockerId, blockedUserId }, {
 *       onSuccess: () => {
 *         alert('User blocked successfully');
 *       }
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleBlock} disabled={block.isPending}>
 *       {block.isPending ? 'Blocking...' : 'Block User'}
 *     </button>
 *   );
 * }
 */
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: BlockUserParams) => blockUser(params),
    onSuccess: (_, variables) => {
      // Invalidate blocked users list
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.all,
      });

      // Invalidate conversations (blocked conversation should be hidden)
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversations(variables.blockerId),
      });
    },
  });
}

/**
 * Hook to unblock a user
 *
 * Removes block and invalidates relevant queries.
 *
 * @returns Mutation hook with mutate function and state
 *
 * @example
 * function UnblockButton({ blockedUserId, blockerId }) {
 *   const unblock = useUnblockUser();
 *
 *   return (
 *     <button
 *       onClick={() => unblock.mutate({ blockerId, blockedUserId })}
 *       disabled={unblock.isPending}
 *     >
 *       {unblock.isPending ? 'Unblocking...' : 'Unblock'}
 *     </button>
 *   );
 * }
 */
export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UnblockUserParams) => unblockUser(params),
    onSuccess: (_, variables) => {
      // Invalidate blocked users list
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.all,
      });

      // Invalidate conversations (unblocked conversation may appear)
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversations(variables.blockerId),
      });
    },
  });
}
