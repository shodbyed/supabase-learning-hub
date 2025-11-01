# 📋 Messaging System Refactoring Plan

**Created**: 2025-11-01
**Purpose**: Break down messaging system into smaller, testable, reusable components
**Current Status**: Working but monolithic (2,303 LOC across 12 files)

---

## 🔍 Current Architecture Analysis

### File Structure (2,303 total LOC)
```
pages/
  Messages.tsx                    (259 LOC) - Main page coordinator

components/messages/
  MessageView.tsx                 (272 LOC) - Message display + sending + real-time
  ConversationList.tsx            (250+ LOC) - Conversation list + real-time
  NewMessageModal.tsx             (253 LOC) - Create DM/group conversations
  AnnouncementModal.tsx           (150+ LOC) - League/org announcements
  MessageSettingsModal.tsx        (100+ LOC) - Blocking, settings
  ConversationHeader.tsx          (78 LOC) - Header with recipient info
  MessageBubble.tsx               (84 LOC) - Individual message display
  MessageInput.tsx                (71 LOC) - Message input field
  BlockedUsersModal.tsx           (2 versions - needs cleanup)
  MessagesEmptyState.tsx          (Small) - Empty state display
  UserListItem.tsx                (Small) - User selection item

hooks/
  useConversationParticipants.ts  (96 LOC) - Fetch participant info + real-time

utils/
  messageQueries.ts               (578 LOC) - 14 functions (read + write mixed)
```

### Problems Identified

#### 1. **Large Monolithic Components**
**MessageView.tsx (272 LOC)** does too much:
- ❌ Fetches messages
- ❌ Handles real-time subscriptions
- ❌ Manages conversation details (type, participants)
- ❌ Sends messages
- ❌ Updates read receipts
- ❌ Handles leaving conversations
- ❌ Handles blocking users
- ❌ Manages scroll behavior

**ConversationList.tsx (250+ LOC)** does too much:
- ❌ Fetches conversations
- ❌ Handles real-time subscriptions (2 channels)
- ❌ Manages search functionality
- ❌ Manages UI state (showSearch)
- ❌ Renders conversation items

**Messages.tsx (259 LOC)** does too much:
- ❌ Manages navigation state
- ❌ Checks captain status
- ❌ Handles announcements
- ❌ Handles conversation creation
- ❌ Manages 3 modals
- ❌ Handles refresh logic
- ❌ Manages layout (mobile/desktop)

#### 2. **Mixed Concerns in messageQueries.ts (578 LOC)**
**14 functions with no organization:**
- ✅ 4 READ operations
- ✅ 7 WRITE operations (mutations)
- ✅ 3 ANNOUNCEMENT operations
- ❌ All in one file
- ❌ No separation of concerns
- ❌ Hard to test independently

#### 3. **Duplicate/Inconsistent Hooks**
- `useConversationParticipants` in `/hooks` (old style)
- `useConversationParticipants` in `/api/hooks` (TanStack Query)
- Both exist, creates confusion

#### 4. **Real-Time Logic Scattered**
**Real-time subscriptions in 3 places:**
- ConversationList.tsx (2 subscriptions)
- MessageView.tsx (1 subscription)
- useConversationParticipants.ts (1 subscription)

**No central pattern**, hard to:
- Test real-time behavior
- Debug subscription leaks
- Ensure consistent cache updates

#### 5. **No Mutation Abstractions**
**Direct database calls everywhere:**
```typescript
// In components
await sendMessage(conversationId, userId, content);
await updateLastRead(conversationId, userId);
await leaveConversation(conversationId, userId);
```

**Problems:**
- ❌ No loading states
- ❌ No error handling
- ❌ No optimistic updates
- ❌ No automatic cache invalidation
- ❌ Hard to test

---

## 🎯 Refactoring Goals

### 1. **Single Responsibility Principle**
Each component/hook should do ONE thing well.

### 2. **Testability**
Each piece should be testable in isolation without mocking the entire system.

### 3. **Reusability**
Components should be reusable across different contexts.

### 4. **Clear Data Flow**
```
API Layer (queries/mutations)
    ↓
Hooks Layer (TanStack Query + real-time)
    ↓
Component Layer (UI only)
```

---

## 📐 Proposed New Architecture

### Phase 1: Separate Concerns in API Layer

**Current:**
```
utils/messageQueries.ts (578 LOC, 14 functions)
```

**Proposed:**
```
api/
├── queries/
│   └── messages.ts (READ operations only)
│       ├── getUserConversations()
│       ├── getConversationMessages()
│       ├── getBlockedUsers()
│       └── getConversationDetails()
│
└── mutations/
    └── messages.ts (WRITE operations only)
        ├── sendMessage()
        ├── updateLastRead()
        ├── blockUser()
        ├── unblockUser()
        ├── leaveConversation()
        ├── createOrOpenConversation()
        ├── createGroupConversation()
        ├── createLeagueAnnouncement()
        └── createOrganizationAnnouncement()
```

**Benefits:**
- ✅ Clear separation: reads vs writes
- ✅ Easier to test
- ✅ Easier to add caching strategies
- ✅ Easier to add error handling

---

### Phase 2: Create Focused Hooks

**Current:**
- Mixed old/new hooks
- Scattered real-time logic

**Proposed:**

#### A. Data Fetching Hooks (TanStack Query)
```typescript
// api/hooks/messaging/useConversations.ts
export function useConversations(userId: string) {
  // Just fetching + caching
  // Real-time handled separately
}

// api/hooks/messaging/useMessages.ts
export function useMessages(conversationId: string) {
  // Just fetching + caching
  // Real-time handled separately
}

// api/hooks/messaging/useConversationDetails.ts
export function useConversationDetails(conversationId: string) {
  // Fetch type, participants, metadata
}

// api/hooks/messaging/useBlockedUsers.ts
export function useBlockedUsers(userId: string) {
  // Cached list of blocked users
}
```

#### B. Mutation Hooks (TanStack Mutation)
```typescript
// api/hooks/messaging/useSendMessage.ts
export function useSendMessage() {
  return useMutation({
    mutationFn: sendMessage,
    onMutate: async (newMessage) => {
      // Optimistic update
    },
    onSuccess: () => {
      // Invalidate queries
    },
  });
}

// api/hooks/messaging/useBlockUser.ts
export function useBlockUser() {
  return useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      // Invalidate conversations, update UI
    },
  });
}

// api/hooks/messaging/useLeaveConversation.ts
export function useLeaveConversation() {
  return useMutation({
    mutationFn: leaveConversation,
    onSuccess: (_, variables) => {
      // Invalidate conversation list
      // Navigate away
    },
  });
}

// api/hooks/messaging/useCreateConversation.ts
export function useCreateConversation() {
  return useMutation({
    mutationFn: createOrOpenConversation,
    onSuccess: (data) => {
      // Return conversationId for navigation
    },
  });
}
```

#### C. Real-Time Integration Hook
```typescript
// api/hooks/messaging/useMessageRealtime.ts
export function useMessageRealtime(conversationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Single subscription handler
    // Updates cache automatically
    // Centralized logic
  }, [conversationId, queryClient]);
}

// api/hooks/messaging/useConversationRealtime.ts
export function useConversationRealtime(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Handle conversation list updates
    // New messages, unread counts
  }, [userId, queryClient]);
}
```

**Benefits:**
- ✅ Single responsibility per hook
- ✅ Easy to test (mock queryClient)
- ✅ Consistent patterns
- ✅ Optimistic updates built-in

---

### Phase 3: Break Down Large Components

#### A. MessageView.tsx (272 LOC → ~100 LOC)

**Current Structure (all in one):**
```typescript
MessageView.tsx (272 LOC)
  ├── Fetch messages
  ├── Fetch conversation details
  ├── Real-time subscriptions
  ├── Send message handler
  ├── Leave conversation handler
  ├── Block user handler
  ├── Scroll management
  └── Render UI
```

**Proposed Structure (composition):**
```typescript
// MessageView.tsx (100 LOC)
export function MessageView({ conversationId, userId }) {
  // Data
  const { data: messages } = useMessages(conversationId);
  const sendMessage = useSendMessage();

  // Real-time
  useMessageRealtime(conversationId);

  // UI only
  return (
    <div>
      <MessageViewHeader conversationId={conversationId} />
      <MessageList messages={messages} currentUserId={userId} />
      <MessageViewInput onSend={sendMessage.mutate} />
    </div>
  );
}

// New separate components:

// components/messages/MessageViewHeader.tsx (40 LOC)
export function MessageViewHeader({ conversationId }) {
  const { data: details } = useConversationDetails(conversationId);
  const leaveConversation = useLeaveConversation();
  const blockUser = useBlockUser();

  // Just header + actions
}

// components/messages/MessageList.tsx (60 LOC)
export function MessageList({ messages, currentUserId }) {
  const scrollRef = useAutoScroll(messages);

  // Just rendering messages + scroll
  return (
    <div ref={scrollRef}>
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} isOwn={msg.sender.id === currentUserId} />
      ))}
    </div>
  );
}

// components/messages/MessageViewInput.tsx (40 LOC)
export function MessageViewInput({ onSend, isLoading }) {
  // Just input field + send button
  // No mutation logic
}

// hooks/useAutoScroll.ts (20 LOC)
export function useAutoScroll(dependencies) {
  // Reusable scroll-to-bottom logic
}
```

**Benefits:**
- ✅ Each component < 100 LOC
- ✅ Easy to test in isolation
- ✅ Reusable pieces (MessageList, MessageViewInput)
- ✅ Clear separation: data vs UI vs behavior

#### B. ConversationList.tsx (250+ LOC → ~80 LOC)

**Current Structure:**
```typescript
ConversationList.tsx (250 LOC)
  ├── Fetch conversations
  ├── Real-time subscriptions (2x)
  ├── Search functionality
  ├── Announcement button
  ├── Settings button
  ├── Render conversation items
  └── Handle selection
```

**Proposed Structure:**
```typescript
// ConversationList.tsx (80 LOC)
export function ConversationList({ userId, onSelect }) {
  const { data: conversations } = useConversations(userId);
  useConversationRealtime(userId); // Real-time in hook

  return (
    <div>
      <ConversationListHeader />
      <ConversationSearch />
      <ConversationItems conversations={conversations} onSelect={onSelect} />
    </div>
  );
}

// components/messages/ConversationListHeader.tsx (40 LOC)
export function ConversationListHeader({
  onNewMessage,
  onAnnouncements,
  onSettings,
  showAnnouncements
}) {
  // Just buttons
}

// components/messages/ConversationSearch.tsx (40 LOC)
export function ConversationSearch({ onSearch }) {
  // Just search input + filter logic
}

// components/messages/ConversationItems.tsx (60 LOC)
export function ConversationItems({ conversations, selectedId, onSelect }) {
  // Just rendering conversation list
  return conversations.map(conv => (
    <ConversationItem
      key={conv.id}
      conversation={conv}
      isSelected={conv.id === selectedId}
      onSelect={onSelect}
    />
  ));
}

// components/messages/ConversationItem.tsx (50 LOC)
export function ConversationItem({ conversation, isSelected, onSelect }) {
  // Single conversation row
  // Title, preview, timestamp, unread badge
}
```

**Benefits:**
- ✅ Each component < 100 LOC
- ✅ Testable: Can test ConversationItem without entire list
- ✅ Reusable: ConversationSearch could be used elsewhere
- ✅ Clear responsibilities

#### C. Messages.tsx (259 LOC → ~120 LOC)

**Current Structure:**
```typescript
Messages.tsx (259 LOC)
  ├── Navigation state
  ├── Captain status check
  ├── Modal management (3 modals)
  ├── Announcement handler
  ├── Conversation creation handler
  ├── Layout (mobile/desktop)
  └── Render everything
```

**Proposed Structure:**
```typescript
// Messages.tsx (120 LOC)
export function Messages() {
  const [selectedId, setSelectedId] = useState(null);
  const createConversation = useCreateConversation();

  return (
    <MessagesLayout
      sidebar={<ConversationList onSelect={setSelectedId} />}
      main={selectedId && <MessageView conversationId={selectedId} />}
      selectedId={selectedId}
    />
  );
}

// components/messages/MessagesLayout.tsx (60 LOC)
export function MessagesLayout({ sidebar, main, selectedId }) {
  // Just responsive layout logic
  // Mobile: toggle between sidebar/main
  // Desktop: side-by-side
}

// components/messages/useMessagingModals.ts (50 LOC)
export function useMessagingModals() {
  // Centralize modal state management
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return {
    newMessage: { isOpen: newMessageOpen, open: () => setNewMessageOpen(true), close: () => setNewMessageOpen(false) },
    // ...
  };
}
```

**Benefits:**
- ✅ Separation of concerns
- ✅ Reusable layout component
- ✅ Centralized modal management
- ✅ Easier to test

---

### Phase 4: Consolidate Real-Time Logic

**Current Problem:** Real-time subscriptions scattered across files

**Proposed Solution:** Custom hook that manages subscriptions

```typescript
// api/hooks/messaging/useMessagingRealtime.ts
export function useMessagingRealtime(options: {
  userId: string;
  conversationId?: string;
  onNewMessage?: (message: Message) => void;
  onConversationUpdate?: () => void;
}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channels: RealtimeChannel[] = [];

    // Conversation list updates
    if (options.userId) {
      const conversationsChannel = supabase
        .channel('user-conversations')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        }, () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.messages.conversations(options.userId)
          });
        })
        .subscribe();

      channels.push(conversationsChannel);
    }

    // Message updates for specific conversation
    if (options.conversationId) {
      const messagesChannel = supabase
        .channel(`conversation-${options.conversationId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${options.conversationId}`,
        }, async (payload) => {
          // Fetch full message with sender info
          const message = await fetchMessage(payload.new.id);

          // Update cache
          queryClient.setQueryData(
            queryKeys.messages.byConversation(options.conversationId),
            (old: any) => [...(old || []), message]
          );

          // Optional callback
          options.onNewMessage?.(message);
        })
        .subscribe();

      channels.push(messagesChannel);
    }

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [options.userId, options.conversationId, queryClient]);
}

// Usage in components:
export function MessageView({ conversationId, userId }) {
  useMessagingRealtime({
    userId,
    conversationId,
    onNewMessage: (msg) => {
      // Optional: play notification sound
    }
  });

  // Component code...
}
```

**Benefits:**
- ✅ Centralized subscription logic
- ✅ No subscription leaks
- ✅ Consistent cache updates
- ✅ Easy to add features (notifications, sounds)
- ✅ Testable (mock queryClient)

---

## 🧪 Testing Strategy

### 1. **Unit Tests for Pure Functions**
```typescript
// api/queries/messages.test.ts
describe('getUserConversations', () => {
  it('should fetch conversations for user', async () => {
    const conversations = await getUserConversations('user-123');
    expect(conversations).toHaveLength(3);
  });

  it('should filter blocked users', async () => {
    // Mock blocked users
    // Verify they don't appear in conversations
  });
});
```

### 2. **Component Tests (React Testing Library)**
```typescript
// MessageBubble.test.tsx
describe('MessageBubble', () => {
  it('should render message content', () => {
    render(<MessageBubble message={mockMessage} isOwn={false} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('should show timestamp', () => {
    // ...
  });
});
```

### 3. **Integration Tests for Hooks**
```typescript
// useSendMessage.test.ts
describe('useSendMessage', () => {
  it('should send message and update cache', async () => {
    const { result } = renderHook(() => useSendMessage());

    await act(async () => {
      await result.current.mutate({
        conversationId: 'conv-123',
        content: 'Test message',
      });
    });

    // Verify cache was updated
    expect(queryClient.getQueryData([...])).toContainMessage('Test message');
  });
});
```

### 4. **E2E Tests for Critical Flows**
```typescript
// messaging.e2e.test.ts
describe('Messaging E2E', () => {
  it('should send and receive message in real-time', async () => {
    // User A opens conversation
    // User B sends message
    // User A sees message appear (real-time)
  });
});
```

---

## 📊 File Structure After Refactoring

```
src/
├── api/
│   ├── queries/
│   │   └── messages.ts (READ only, ~150 LOC)
│   │
│   ├── mutations/
│   │   └── messages.ts (WRITE only, ~200 LOC)
│   │
│   └── hooks/
│       └── messaging/
│           ├── useConversations.ts (30 LOC)
│           ├── useMessages.ts (30 LOC)
│           ├── useConversationDetails.ts (30 LOC)
│           ├── useBlockedUsers.ts (20 LOC)
│           ├── useSendMessage.ts (40 LOC)
│           ├── useBlockUser.ts (30 LOC)
│           ├── useLeaveConversation.ts (30 LOC)
│           ├── useCreateConversation.ts (40 LOC)
│           ├── useMessagingRealtime.ts (80 LOC)
│           └── index.ts (exports)
│
├── components/
│   └── messages/
│       ├── Messages.tsx (120 LOC) - Main page
│       ├── MessagesLayout.tsx (60 LOC) - Responsive layout
│       │
│       ├── conversation-list/
│       │   ├── ConversationList.tsx (80 LOC)
│       │   ├── ConversationListHeader.tsx (40 LOC)
│       │   ├── ConversationSearch.tsx (40 LOC)
│       │   ├── ConversationItems.tsx (60 LOC)
│       │   └── ConversationItem.tsx (50 LOC)
│       │
│       ├── message-view/
│       │   ├── MessageView.tsx (100 LOC)
│       │   ├── MessageViewHeader.tsx (40 LOC)
│       │   ├── MessageList.tsx (60 LOC)
│       │   ├── MessageViewInput.tsx (40 LOC)
│       │   └── MessageBubble.tsx (50 LOC)
│       │
│       ├── modals/
│       │   ├── NewMessageModal.tsx (120 LOC)
│       │   ├── AnnouncementModal.tsx (100 LOC)
│       │   ├── MessageSettingsModal.tsx (80 LOC)
│       │   └── BlockedUsersModal.tsx (80 LOC)
│       │
│       └── shared/
│           ├── MessagesEmptyState.tsx (30 LOC)
│           └── UserListItem.tsx (40 LOC)
│
└── hooks/
    ├── useAutoScroll.ts (20 LOC)
    └── useMessagingModals.ts (50 LOC)
```

**Total LOC: ~2,000** (similar to current, but better organized)

**Key Improvements:**
- ✅ No file > 150 LOC
- ✅ Clear folder organization
- ✅ Easy to find specific functionality
- ✅ Easy to test each piece
- ✅ Easy to reuse components

---

## 🚀 Migration Strategy

### Step 1: Create New API Layer (2-3 hours)
- [ ] Create `api/mutations/messages.ts`
- [ ] Move write operations from `utils/messageQueries.ts`
- [ ] Add proper error handling
- [ ] Add JSDoc documentation

### Step 2: Create Mutation Hooks (3-4 hours)
- [ ] Create `useSendMessage` with optimistic updates
- [ ] Create `useBlockUser` with cache invalidation
- [ ] Create `useLeaveConversation`
- [ ] Create `useCreateConversation`
- [ ] Test each hook individually

### Step 3: Centralize Real-Time (2-3 hours)
- [ ] Create `useMessagingRealtime` hook
- [ ] Migrate ConversationList to use it
- [ ] Migrate MessageView to use it
- [ ] Remove scattered subscriptions
- [ ] Test real-time updates

### Step 4: Break Down Components (4-6 hours)
- [ ] Extract MessageViewHeader
- [ ] Extract MessageList
- [ ] Extract ConversationItem
- [ ] Extract MessagesLayout
- [ ] Update imports
- [ ] Test each component

### Step 5: Cleanup (1-2 hours)
- [ ] Remove old `utils/messageQueries.ts`
- [ ] Remove old `hooks/useConversationParticipants.ts`
- [ ] Update TABLE_OF_CONTENTS.md
- [ ] Run full test suite
- [ ] Verify messaging works end-to-end

**Total Estimated Time: 12-18 hours**

---

## ✅ Success Criteria

After refactoring, you should have:

1. **No component > 150 LOC** ✅
2. **Clear separation**: queries / mutations / hooks / components ✅
3. **Every piece is testable** in isolation ✅
4. **Consistent patterns** across all messaging features ✅
5. **Optimistic updates** for better UX ✅
6. **Centralized real-time** logic ✅
7. **No code duplication** ✅
8. **Easy to add new features** ✅

---

## 📝 Notes

- This refactoring can be done **incrementally** - one component at a time
- **Keep old code** until new code is tested
- Use **feature flags** to gradually roll out changes
- **Test thoroughly** after each step
- Focus on **high-impact** areas first (MessageView, ConversationList)

---

**Priority:** Medium (messaging works, but would benefit from refactoring)
**Risk:** Low (can be done incrementally)
**ROI:** High (easier testing, maintenance, feature additions)
