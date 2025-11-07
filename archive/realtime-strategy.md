# Real-time Strategy for Messaging System

## Current Problem
- Real-time channels are being set up in individual components
- Channels may stay open when user navigates away from messages
- Unread badge has real-time subscription (unnecessary resource usage)

## Revised Strategy

### 1. Messages Page: Real-time ONLY when viewing
**Location**: `/messages` page
**Behavior**:
- Open real-time channel when user enters Messages page
- Close channel when user leaves Messages page
- Subscribe to all message events for this user's conversations
- Auto-update conversation list and active message thread

**Implementation**:
```tsx
// In Messages.tsx (root messages page)
useConversationsRealtime(userId); // Only active on this page
useConversationMessagesRealtime(selectedConversationId, userId); // Only for active conversation
```

### 2. Unread Badge: Polling (NO real-time)
**Location**: Navigation bar (always visible)
**Behavior**:
- Use TanStack Query polling instead of real-time
- `refetchOnWindowFocus: true` - Update when user returns to app
- `refetchInterval: 2 * 60 * 1000` - Poll every 2 minutes
- `staleTime: 30 * 1000` - Consider fresh for 30 seconds

**Implementation**:
```tsx
// In useUnreadMessageCount.ts hook
export function useUnreadMessageCount(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.messages.unreadCount(userId || ''),
    queryFn: () => getUnreadMessageCount(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds - fresh briefly to avoid rapid refetches
    refetchOnWindowFocus: true, // Update when user returns to tab
    refetchInterval: 2 * 60 * 1000, // Poll every 2 minutes
  });
}
```

### 3. Resource Management

**Real-time channels (expensive)**:
- ✅ Messages page: Conversations + Active conversation messages
- ❌ Navigation bar: NO real-time for unread count
- ❌ Other pages: NO real-time subscriptions

**Polling (efficient)**:
- ✅ Unread count badge: Poll every 2 minutes + window focus
- ✅ Leverages TanStack Query caching (single request shared across components)

## Benefits

### Performance
- **Fewer WebSocket connections**: Only 1-2 channels instead of 3+ everywhere
- **Reduced server load**: Unread count uses polling instead of real-time
- **Better battery life**: Real-time only when actively using messages

### User Experience
- **Still feels real-time where it matters**: Messages page updates instantly
- **Unread badge stays current**: 2-minute polling + window focus is sufficient
- **No notification spam**: User only sees updates when checking messages

### Developer Experience
- **Clear separation**: Real-time = Messages page, Polling = Everything else
- **Easier to debug**: Fewer active channels
- **Predictable behavior**: Channels open/close with page navigation

## Implementation Changes Needed

### 1. Update useMessagingRealtime.ts hooks
These should ONLY be used on the Messages page:
- `useConversationsRealtime(userId)` - Only in Messages.tsx
- `useConversationMessagesRealtime(conversationId, userId)` - Only in Messages.tsx
- ❌ REMOVE `useUnreadCountRealtime()` - Replace with polling

### 2. Update useUnreadMessageCount.ts hook
Add polling configuration:
```tsx
refetchOnWindowFocus: true,
refetchInterval: 2 * 60 * 1000, // 2 minutes
staleTime: 30 * 1000, // 30 seconds
```

### 3. Remove real-time from components outside Messages page
- Navigation bar: Use polling-based `useUnreadMessageCount()`
- Dashboard: Use polling-based `useUnreadMessageCount()`
- Other pages: No message subscriptions at all

## Example Usage

### Messages Page (Real-time)
```tsx
function Messages() {
  const { data: member } = useCurrentMember();
  const userId = member?.id;

  // Real-time subscriptions - only active on this page
  useConversationsRealtime(userId);
  useConversationMessagesRealtime(selectedConversationId, userId);

  // ... rest of component
}
```

### Navigation Bar (Polling)
```tsx
function NavBar() {
  const { data: member } = useCurrentMember();
  const userId = member?.id;

  // Polling-based (NO real-time)
  const { data: unreadCount } = useUnreadMessageCount(userId);
  // Polls every 2 minutes + refetches on window focus

  return <Badge>{unreadCount}</Badge>;
}
```

## Migration Checklist

- [ ] Update `useUnreadMessageCount` hook to use polling instead of real-time
- [ ] Remove `useUnreadCountRealtime` hook (not needed)
- [ ] Update `useMessagingRealtime.ts` documentation to clarify "Messages page only"
- [ ] Ensure Navigation bar uses polling-based `useUnreadMessageCount`
- [ ] Ensure Messages page uses real-time hooks
- [ ] Test channel cleanup when navigating away from Messages page
- [ ] Verify unread count updates on window focus
- [ ] Verify unread count polls every 2 minutes

## Summary

| Feature | Strategy | Why |
|---------|----------|-----|
| Conversations list | Real-time (Messages page only) | Instant updates while viewing |
| Active conversation | Real-time (Messages page only) | Instant new message delivery |
| Unread count badge | Polling (2 min + window focus) | Good enough, saves resources |
| Other pages | No subscriptions | Not needed |

**Result**: Efficient, scalable, great UX where it matters.
