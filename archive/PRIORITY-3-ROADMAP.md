# 📋 Priority 3: Messaging System - Migration Roadmap

**Status**: 🟡 Planning Phase
**Complexity**: ⚠️ HIGH (Real-time subscriptions + complex queries)
**Estimated Scope**: 10 files, 578 lines of query logic, 4 existing hooks

---

## 🎯 Scope Overview

### Files to Migrate
1. **Query Utilities** (1 file):
   - `utils/messageQueries.ts` (578 lines) - 14 functions

2. **Existing Hooks** (4 files):
   - `hooks/useMessages.ts` - Message fetching and sending
   - `hooks/useConversations.ts` - Conversation list
   - `hooks/useConversationParticipants.ts` - Participant management
   - `hooks/useUnreadMessageCount.ts` - Unread count tracking

3. **Components** (5+ files):
   - `pages/Messages.tsx` - Main messaging page
   - `components/messages/MessageView.tsx` - Message display
   - `components/messages/ConversationList.tsx` - Conversation list
   - `components/messages/NewMessageModal.tsx` - New message modal
   - `components/messages/AnnouncementModal.tsx` - Announcements

### Functions in messageQueries.ts

**READ Operations** (4 functions):
- `fetchUserConversations(userId)` - Conversation list with blocked user filtering
- `fetchConversationMessages(conversationId)` - Messages in a conversation
- `getBlockedUsers(userId)` - List of blocked users
- `isUserBlocked(blockerId, blockedId)` - Check if user is blocked

**WRITE Operations** (3 functions):
- `sendMessage(conversationId, senderId, content)` - Send a message
- `updateLastRead(conversationId, userId)` - Mark conversation as read
- `leaveConversation(conversationId, userId)` - Leave a conversation

**CONVERSATION CREATION** (3 functions):
- `createOrOpenConversation(userId, otherUserId)` - DM conversation
- `createGroupConversation(userIds, title?, scopeType?)` - Group conversation
- `createTeamConversation(teamId, userId)` - Team chat

**BLOCKING** (2 functions):
- `blockUser(blockerId, blockedId)` - Block a user
- `unblockUser(blockerId, blockedId)` - Unblock a user

**ANNOUNCEMENTS** (2 functions):
- `createLeagueAnnouncement(leagueId, senderId, message)` - League-wide message
- `createOrganizationAnnouncement(operatorId, senderId, message)` - Operator-wide message

---

## ⚠️ Challenges & Considerations

### 1. Real-Time Subscriptions
**Current Pattern:**
```typescript
// Existing useRealtime.ts hook subscribes to Supabase changes
const subscription = supabase
  .channel(`messages_${conversationId}`)
  .on('postgres_changes', { event: '*', table: 'messages' }, callback)
  .subscribe();
```

**Challenge**: TanStack Query is optimized for request/response patterns, not real-time streams.

**Recommended Approach**:
- **Keep** existing `useRealtime.ts` hook for subscriptions
- **Add** TanStack Query for initial data fetch and caching
- **Use** TanStack Query's `queryClient.setQueryData()` to update cache when real-time events arrive

**Example Integration**:
```typescript
// Fetch with TanStack Query
const { data: messages } = useQuery({
  queryKey: queryKeys.messages.byConversation(conversationId),
  queryFn: () => getConversationMessages(conversationId),
  staleTime: STALE_TIME.MESSAGES, // 30 seconds
});

// Subscribe to real-time updates
useRealtime(`messages_${conversationId}`, (payload) => {
  queryClient.setQueryData(
    queryKeys.messages.byConversation(conversationId),
    (old) => [...old, payload.new]
  );
});
```

### 2. Blocked User Filtering
**Current Pattern**: Conversations query fetches blocked users first, then filters client-side

**Challenge**: Complex multi-step query logic that's hard to cache efficiently

**Recommended Approach**:
- Separate blocked users into own query/hook
- Use `enabled` option to conditionally fetch conversations
- Consider server-side filtering via Postgres functions for better performance

### 3. Mutation Operations
**Current Pattern**: Direct Supabase calls for sending messages, blocking, etc.

**Recommended Approach**:
- Use TanStack Query **mutations** (`useMutation`)
- Implement **optimistic updates** for instant UI feedback
- Invalidate relevant queries after successful mutations

**Example**:
```typescript
const sendMessageMutation = useMutation({
  mutationFn: (params) => sendMessage(params),
  onMutate: async (newMessage) => {
    // Optimistic update
    queryClient.setQueryData(queryKeys.messages.byConversation(conversationId), (old) => [
      ...old,
      { ...newMessage, id: 'temp', sending: true }
    ]);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
  },
});
```

### 4. Conversation List Complexity
**Current Pattern**: Fetches conversations, then makes additional queries per conversation to get participant names

**Challenge**: N+1 query problem (1 query + N queries for names)

**Recommended Approach**:
- Use Postgres joins/CTEs to fetch all data in one query
- Or batch participant name fetches using `Promise.all()`
- Cache aggressively (30 second stale time for conversations)

---

## 🔨 Proposed Implementation Plan

### Phase 1: Foundation (1-2 hours)
- [ ] Create `api/queries/messages.ts` with read-only functions
- [ ] Add message query keys to `queryKeys.ts`
- [ ] Create basic `useConversations` hook
- [ ] Create basic `useMessages` hook
- [ ] Test basic functionality

### Phase 2: Real-Time Integration (2-3 hours)
- [ ] Create `useRealtimeMessages` hook that combines TanStack Query + Supabase subscriptions
- [ ] Implement cache updates on real-time events
- [ ] Test real-time message delivery
- [ ] Verify no duplicate messages

### Phase 3: Mutations (1-2 hours)
- [ ] Create mutation functions for sending messages
- [ ] Implement optimistic updates
- [ ] Add error handling and rollback
- [ ] Test send message flow

### Phase 4: Component Migration (2-3 hours)
- [ ] Migrate `ConversationList.tsx`
- [ ] Migrate `MessageView.tsx`
- [ ] Migrate `Messages.tsx` page
- [ ] Test complete message flow

### Phase 5: Advanced Features (1-2 hours)
- [ ] Migrate blocking functionality
- [ ] Migrate announcements
- [ ] Add unread count caching
- [ ] Test all edge cases

**Total Estimated Time**: 8-12 hours

---

## 📊 Expected Benefits

### Performance Improvements
- **Conversation List**: Cache for 30 seconds → avoid refetch on every navigation
- **Message History**: Cache per conversation → instant load when returning to conversation
- **Unread Counts**: Cache and update via real-time events
- **Reduced Backend Load**: 50-70% fewer message queries

### User Experience
- **Instant Navigation**: Cached conversations load immediately
- **Optimistic UI**: Messages appear instantly (before server confirmation)
- **Better Error Handling**: Retry logic for failed sends
- **Offline Support**: View cached messages while offline

### Developer Experience
- **Centralized Logic**: All message queries in one place
- **Type Safety**: Full TypeScript support
- **DevTools**: Visual query/mutation debugging
- **Easier Testing**: Mock message data at API layer

---

## 🚨 Risks & Mitigation

### Risk 1: Real-Time Synchronization Issues
**Risk**: Cache and real-time subscriptions get out of sync
**Mitigation**:
- Add comprehensive logging
- Implement cache reconciliation on window focus
- Add manual "refresh" button for users

### Risk 2: Message Duplication
**Risk**: Optimistic updates + real-time events cause duplicate messages
**Mitigation**:
- Use message IDs for deduplication
- Implement proper cache merge logic
- Test extensively with slow network conditions

### Risk 3: Blocked User Edge Cases
**Risk**: Blocked users still appear in some views
**Mitigation**:
- Centralize blocking logic in one hook
- Add integration tests for blocking scenarios
- Consider server-side filtering

### Risk 4: Migration Complexity
**Risk**: Breaking existing messaging functionality during migration
**Mitigation**:
- **Feature flag approach**: Keep old code, add new code behind flag
- Migrate one component at a time
- Extensive testing at each step
- Easy rollback plan

---

## 🎯 Recommended Approach

### Option A: Incremental Migration (RECOMMENDED)
1. Start with **read-only operations** (conversations list, messages)
2. Keep existing mutation logic unchanged
3. Test thoroughly before moving to mutations
4. One component at a time
5. Feature flag for gradual rollout

**Pros**: Lower risk, easy rollback, can test in production
**Cons**: Takes longer, dual maintenance temporarily

### Option B: All-at-Once Migration
1. Build complete TanStack Query layer first
2. Migrate all components at once
3. Remove old code immediately

**Pros**: Faster completion, cleaner codebase
**Cons**: Higher risk, harder to debug issues

**Recommendation**: Use **Option A** for messaging due to real-time complexity

---

## 📝 Next Steps

### Before Starting
1. ✅ Review this roadmap with team
2. ✅ Decide on migration approach (Option A or B)
3. ✅ Set up feature flag if using Option A
4. ✅ Create test plan for messaging functionality
5. ✅ Schedule time for thorough testing

### First Actions
1. Create `api/queries/messages.ts` with read-only functions
2. Add comprehensive JSDoc documentation
3. Create basic hooks for conversations and messages
4. Test with React Query DevTools

---

## 📚 References

- [TanStack Query + Real-time Guide](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [Supabase Real-time Documentation](https://supabase.com/docs/guides/realtime)
- Current implementation: `utils/messageQueries.ts`
- Current hooks: `hooks/use*.ts`

---

**⏸️ Recommendation: Pause here and plan Priority 3 carefully. Messaging is complex and critical - better to do it right than do it fast.**
