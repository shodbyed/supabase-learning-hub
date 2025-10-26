# Messaging System Refactoring Plan

## Current Code Quality Issues

### 1. **DRY Violations** (Don't Repeat Yourself)

#### Modal Pattern Repetition (4 instances)
All modals repeat the same structure:
- Fixed backdrop overlay (`fixed inset-0 bg-black/50`)
- Close button with X icon in header
- Similar header layout patterns

**Files:** NewMessageModal, AnnouncementModal, MessageSettingsModal, BlockedUsersModal, ReportUserModal

**Solution:** Create reusable `Modal` component

#### User Selection/List Pattern (3 instances)
Similar patterns for:
- Selected users with badges and remove buttons
- User list items with selection state
- Filter/search logic

**Files:** NewMessageModal, AnnouncementModal

**Solution:** Create `UserSelector` and `SelectableBadge` components

#### Loading/Empty States (6+ instances)
```tsx
{loading ? (
  <div>Loading...</div>
) : items.length === 0 ? (
  <div>No items found</div>
) : (
  // render items
)}
```

**Solution:** Create `LoadingState` and `EmptyState` components

### 2. **KISS Violations** (Keep It Simple, Stupid)

#### NewMessageModal.tsx (266 lines, 10 state variables)
**Violations:**
- Handles fetching members
- Handles filtering by leagues/teams
- Handles group name validation
- Handles blocked users
- Handles search
- Too many responsibilities

**Solution:** Extract:
- `useUserSearch` hook
- `useBlockedUsers` hook
- `UserFilter` component
- `GroupNameInput` component

#### MessageView.tsx (269 lines, 9 state variables)
**Violations:**
- Fetches conversation details
- Fetches messages
- Handles real-time subscriptions
- Handles blocking
- Handles leaving conversations
- Too complex

**Solution:** Extract:
- `useConversationMessages` hook
- `ConversationActions` component
- `MessageList` component

#### ConversationList.tsx (279 lines, 6 state variables)
**Violations:**
- Fetches conversations
- Real-time subscriptions
- Search filtering
- Unread count badges
- Multiple UI states

**Solution:** Extract:
- `useConversations` hook
- `ConversationSearch` component
- `ConversationItem` component

### 3. **Single Responsibility Principle Violations**

#### AnnouncementModal.tsx
**Current Responsibilities:**
1. Fetch leagues (captain access)
2. Fetch organizations (operator access)
3. Manage target selection
4. Validate message
5. UI rendering

**Should be split into:**
- `useAnnouncementTargets` hook (data fetching)
- `TargetSelector` component (selection UI)
- `AnnouncementForm` component (message input)

#### MessageSettingsModal.tsx
**Current Responsibilities:**
1. Fetch blocked users
2. Unblock users
3. Show success/error messages
4. List UI

**Should be split into:**
- `useBlockedUsers` hook
- `BlockedUsersList` component
- `ToastNotification` component (for success/error)

### 4. **Reusability Issues**

#### Missing Shared Components
1. **Modal wrapper** - 4 identical implementations
2. **List item buttons** - 5+ similar patterns
3. **Badge components** - 3+ similar implementations
4. **Form fields** - Repeated label/input/error patterns
5. **Loading spinners** - Different implementations
6. **Empty states** - Different messaging patterns

#### Missing Shared Hooks
1. **useRealtime** - Real-time subscriptions duplicated
2. **useDebounce** - Search filtering logic repeated
3. **useToggle** - Boolean state management repeated
4. **useFetch** - API call patterns repeated

#### Missing Utilities
1. **formatters.ts** - Date/time formatting duplicated
2. **validators.ts** - Input validation logic repeated
3. **messageHelpers.ts** - Message-specific utilities

## Refactoring Strategy

### Phase 1: Extract Reusable UI Components (High Priority)

1. **Create Modal Component**
```tsx
// components/ui/modal.tsx
<Modal isOpen={open} onClose={close} title="Title">
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>Actions</Modal.Footer>
</Modal>
```

2. **Create LoadingState Component**
```tsx
<LoadingState message="Loading..." />
```

3. **Create EmptyState Component**
```tsx
<EmptyState
  icon={Icon}
  title="No items"
  description="Description"
/>
```

4. **Create SelectableBadge Component**
```tsx
<SelectableBadge
  label="Item"
  onRemove={handleRemove}
/>
```

### Phase 2: Extract Custom Hooks (High Priority)

1. **useRealtime Hook**
```tsx
const { data, loading } = useRealtime({
  table: 'messages',
  filter: { conversation_id: id }
});
```

2. **useDebounce Hook**
```tsx
const debouncedSearch = useDebounce(searchQuery, 300);
```

3. **useConversations Hook**
```tsx
const { conversations, loading, refresh } = useConversations(userId);
```

4. **useMessages Hook**
```tsx
const { messages, loading, sendMessage } = useMessages(conversationId);
```

### Phase 3: Refactor Large Components (Medium Priority)

1. **NewMessageModal** → Split into:
   - `NewMessageModal` (orchestration)
   - `UserFilter` (tabs component)
   - `SelectedUsersList` (badges)
   - `UserSearchList` (results)
   - `GroupNameField` (conditional input)

2. **MessageView** → Split into:
   - `MessageView` (orchestration)
   - `MessageList` (messages display)
   - `ConversationActions` (menu)
   - `useConversationMessages` hook

3. **ConversationList** → Split into:
   - `ConversationList` (orchestration)
   - `ConversationSearch` (search bar)
   - `ConversationItem` (list item)
   - `useConversations` hook

### Phase 4: Extract Utilities (Low Priority)

1. **Create formatters.ts**
```tsx
export const formatTimestamp = (date: string) => { ... }
export const formatMessagePreview = (text: string) => { ... }
```

2. **Create validators.ts**
```tsx
export const isValidGroupName = (name: string) => { ... }
export const isValidMessage = (text: string) => { ... }
```

## Benefits After Refactoring

### Code Quality
- ✅ Each component has **one clear responsibility**
- ✅ Components are **small and focused** (<100 lines)
- ✅ Logic is **DRY** - no duplication
- ✅ Complex logic extracted to **custom hooks**

### Maintainability
- ✅ Easy to find and fix bugs
- ✅ Easy to add new features
- ✅ Easy to test individual pieces
- ✅ Clear separation of concerns

### Reusability
- ✅ Modal component used throughout app
- ✅ Hooks shared across features
- ✅ Utilities available system-wide
- ✅ Consistent UI patterns

### Developer Experience
- ✅ Faster to understand code
- ✅ Less context switching
- ✅ Clearer file structure
- ✅ Better TypeScript inference

## Estimated Impact

### Lines of Code Reduction
- **Before:** ~2,000 lines across 11 components
- **After:** ~1,400 lines (30% reduction)
  - Shared components: ~200 lines
  - Custom hooks: ~300 lines
  - Refactored components: ~900 lines

### Component Complexity Reduction
- **NewMessageModal:** 266 → 120 lines
- **MessageView:** 269 → 100 lines
- **ConversationList:** 279 → 150 lines
- **AnnouncementModal:** 320 → 140 lines

### Reusability Gains
- **Modal:** Used by 5+ components → saves ~100 lines
- **Loading/Empty States:** Used by 10+ places → saves ~80 lines
- **Hooks:** Used by 8+ components → saves ~200 lines

## Implementation Order (Recommended)

1. ✅ **Extract Modal Component** (30 min) - Highest impact
2. ✅ **Extract LoadingState/EmptyState** (20 min) - Highest impact
3. ✅ **Create useDebounce hook** (10 min) - Quick win
4. ✅ **Create useRealtime hook** (30 min) - Medium complexity
5. ✅ **Refactor NewMessageModal** (60 min) - Most complex component
6. ✅ **Refactor MessageView** (45 min) - Second most complex
7. ✅ **Refactor ConversationList** (45 min) - Third most complex
8. ⏸️ **Create utilities** (30 min) - Nice to have
9. ⏸️ **Extract remaining patterns** (60 min) - Polish

**Total Estimated Time:** 5-6 hours

## Testing Strategy

After each refactor:
1. ✅ Run build (`pnpm run build`)
2. ✅ Visual test in browser
3. ✅ Test user flows (send message, create conversation, etc.)
4. ⏸️ Run RLS tests (once implemented)

## Notes

- Start with **highest impact, lowest complexity** changes first
- Keep **git commits small and focused** (one refactor per commit)
- **Test thoroughly** after each change
- If a refactor breaks something, **revert and try differently**
- **Don't over-engineer** - keep it simple!
