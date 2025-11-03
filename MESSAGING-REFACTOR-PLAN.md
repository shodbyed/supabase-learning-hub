# Messaging System Refactor Plan

## Current State Analysis

### Complexity Overview
- **Total Lines of Code**: 2,531 lines
- **Number of Components**: 12 components
- **Hooks**: 2 custom hooks (useConversations, useMessages)
- **Utility Files**: messageQueries.ts with 13+ exported functions

### Architecture Issues Identified

#### 1. **Mixed Data Fetching Patterns** ❌
**Problem**: Components use THREE different ways to fetch data:
- Old custom hooks (`useConversations`, `useMessages` in `src/hooks/`)
- TanStack Query hooks (`useConversationMessages`, `useSendMessage` in `src/api/hooks/`)
- Direct utility function calls (`createOrOpenConversation`, `leaveConversation`, `blockUser`)

**Impact**:
- Inconsistent state management
- Duplicate code for similar operations
- Difficult to test and maintain
- No unified caching strategy

**Example from MessageView.tsx (lines 19-22)**:
```tsx
// THREE DIFFERENT PATTERNS IN ONE COMPONENT:
import { useConversationMessages, useSendMessage } from '@/api/hooks'; // TanStack Query
import { useConversationParticipants } from '@/hooks/useConversationParticipants'; // Old hook
import { leaveConversation, blockUser } from '@/utils/messageQueries'; // Direct utils
```

#### 2. **Manual Real-time Subscription Management** ❌
**Problem**: Each component manually sets up Supabase real-time subscriptions

**Files with Real-time Setup**:
- `ConversationList.tsx` (lines 66-112): Messages + Participants subscriptions
- `MessageView.tsx` (lines 113-165): Messages subscription with manual cache updates

**Issues**:
- Repeated subscription setup code
- Manual `queryClient.invalidateQueries()` calls
- Easy to forget cleanup
- Channel naming inconsistencies
- No centralized subscription management

#### 3. **Duplicate Conversation Type Definitions** ❌
**Problem**: Multiple interface definitions for Conversation type

**Found in**:
- `ConversationList.tsx` (lines 25-34)
- `src/hooks/useConversations.ts` (lines 26-35)
- `src/api/queries/messages.ts` (different structure)

**Impact**: Type inconsistencies, refactoring difficulty

#### 4. **Complex Component State Management** ❌
**Problem**: Components manage too much local state

**Messages.tsx** (root component) manages:
- `selectedConversationId`
- `showNewMessageModal`
- `showAnnouncementModal`
- `showSettingsModal`
- `refreshKey` (for manual cache invalidation)
- Plus navigation state handling

**MessageView.tsx** manages:
- `conversationType`
- `otherUserId`
- Plus all the query states

**Impact**: Complex props drilling, hard to debug state changes

#### 5. **Missing TanStack Query Coverage** ❌
**Operations Still Using Old Utils**:
- `createOrOpenConversation` - No TanStack mutation
- `createGroupConversation` - No TanStack mutation
- `createLeagueAnnouncement` - No TanStack mutation
- `createOrganizationAnnouncement` - No TanStack mutation
- `leaveConversation` - No TanStack mutation
- `blockUser` - Has hook but components don't use it
- `isUserBlocked` - No TanStack query

#### 6. **Large Component Files** ❌
**Components Over 250 Lines**:
- `AnnouncementModal.tsx` - 304 lines
- `Messages.tsx` - 300+ lines (main page)
- `MessageView.tsx` - 287 lines
- `ConversationList.tsx` - 270 lines
- `MessageSettingsModal.tsx` - 254 lines
- `NewMessageModal.tsx` - 253 lines

**Impact**: Hard to understand, test, and maintain

#### 7. **Inconsistent Error Handling** ❌
**Problem**: Mix of error handling patterns
- Some use try/catch
- Some use `{ data, error }` destructuring
- Some use `alert()` for errors
- Some log to console
- No centralized error boundary

---

## Refactor Goals

### 1. **Single Data Fetching Pattern** ✅
- Use ONLY TanStack Query hooks throughout
- Remove all old custom hooks
- Remove all direct utility calls from components
- Centralized caching and state management

### 2. **Simplified Real-time Integration** ✅
- Create reusable real-time subscription hooks
- Automatic cache invalidation on subscription events
- No manual `queryClient` usage in components
- Centralized channel management

### 3. **Unified Type System** ✅
- Single source of truth for types in `src/api/queries/messages.ts`
- Export types from API layer
- Remove duplicate interface definitions

### 4. **Reduced Component Complexity** ✅
- Break large components into smaller pieces
- Extract reusable logic into custom hooks
- Simplify state management with URL state where applicable
- Reduce props drilling

### 5. **Complete TanStack Query Coverage** ✅
- Create missing mutation functions
- Create missing query functions
- All database operations go through TanStack Query

### 6. **Consistent Error Handling** ✅
- Toast notifications for user-facing errors
- Error boundaries for component crashes
- Consistent error message formatting
- Proper error logging

---

## Refactor Plan

### Phase 1: Complete TanStack Query Migration
**Goal**: All database operations use TanStack Query

#### Step 1.1: Create Missing Mutations
Create in `src/api/mutations/conversations.ts`:
- `createOrOpenConversation(userId1, userId2)`
- `createGroupConversation(creatorId, title, memberIds)`
- `leaveConversation(conversationId, userId)`

Create in `src/api/mutations/announcements.ts`:
- `createLeagueAnnouncement(leagueId, senderId, message)`
- `createOrganizationAnnouncement(orgId, senderId, message)`

#### Step 1.2: Create Missing Queries
Create in `src/api/queries/conversations.ts`:
- `getConversationType(conversationId)`
- `isUserBlocked(userId, otherUserId)`

#### Step 1.3: Create TanStack Hooks
Create in `src/api/hooks/useConversationMutations.ts`:
- `useCreateOrOpenConversation()`
- `useCreateGroupConversation()`
- `useLeaveConversation()`

Create in `src/api/hooks/useAnnouncementMutations.ts`:
- `useCreateLeagueAnnouncement()`
- `useCreateOrganizationAnnouncement()`

Create in `src/api/hooks/useConversationQueries.ts`:
- `useConversationType(conversationId)`
- `useIsUserBlocked(userId, otherUserId)`

### Phase 2: Real-time Subscription Hooks
**Goal**: Reusable hooks for real-time subscriptions

#### Step 2.1: Create Subscription Hook
Create `src/api/hooks/useMessagingRealtime.ts`:
```tsx
/**
 * Auto-invalidates conversation list when new messages arrive
 */
export function useConversationsRealtime(userId: string) {
  // Subscribes to messages and participant updates
  // Auto-invalidates queryKeys.messages.conversations(userId)
}

/**
 * Auto-updates message list when new messages arrive
 */
export function useConversationMessagesRealtime(conversationId: string) {
  // Subscribes to messages for this conversation
  // Auto-updates queryKeys.messages.byConversation(conversationId)
}
```

### Phase 3: Component Simplification
**Goal**: Break down large components

#### Step 3.1: Extract Sub-components
**AnnouncementModal.tsx** (304 lines) → Extract:
- `AnnouncementTargetSelector` (league/org selection)
- `AnnouncementForm` (message input)
- `AnnouncementPreview` (preview before sending)

**NewMessageModal.tsx** (253 lines) → Extract:
- `RecipientSelector` (user selection with search)
- `GroupNameInput` (optional group name)
- `ConversationTypeToggle` (DM vs Group)

**MessageSettingsModal.tsx** (254 lines) → Extract:
- `BlockedUsersList`
- `ConversationParticipants`
- `LeaveConversationButton`

#### Step 3.2: Extract Business Logic Hooks
**Create `src/hooks/useMessageComposer.ts`**:
- Handles message drafts
- Emoji picker state
- File upload (future)

**Create `src/hooks/useConversationActions.ts`**:
- Leave conversation
- Block/unblock user
- Archive conversation (future)

### Phase 4: Migrate Components
**Goal**: Update all components to use new hooks

#### Migration Order:
1. **ConversationList.tsx** - Use new real-time hook, remove manual subscriptions
2. **MessageView.tsx** - Use new real-time hook, new conversation hooks
3. **Messages.tsx** - Use new mutation hooks for creating conversations
4. **NewMessageModal.tsx** - Use new mutation hooks
5. **AnnouncementModal.tsx** - Use new announcement mutation hooks
6. **MessageSettingsModal.tsx** - Use new conversation action hooks

### Phase 5: Cleanup
**Goal**: Remove old code

#### Step 5.1: Remove Old Hooks
- Delete `src/hooks/useConversations.ts`
- Delete `src/hooks/useMessages.ts`
- Delete `src/hooks/useConversationParticipants.ts`

#### Step 5.2: Remove Old Utils
- Delete `src/utils/messageQueries.ts` (all functions moved to TanStack layer)

#### Step 5.3: Remove Duplicate Interfaces
- Keep types only in `src/api/queries/messages.ts`
- Export from `src/api/hooks/index.ts`

---

## Success Metrics

### Before Refactor:
- 2,531 lines of code
- 3 different data fetching patterns
- Manual real-time subscription management
- 6 components over 250 lines
- Inconsistent error handling

### After Refactor:
- **Reduced code**: Target ~1,800 lines (-30%)
- **Single pattern**: 100% TanStack Query
- **Auto real-time**: Hooks handle subscriptions
- **Smaller components**: Max 150 lines per component
- **Consistent errors**: Toast notifications + error boundaries

### Developer Experience Improvements:
- ✅ Predictable data flow (all through TanStack Query)
- ✅ Easier testing (centralized query/mutation functions)
- ✅ Better caching (automatic with TanStack Query)
- ✅ Simpler components (less state management)
- ✅ Reusable hooks (business logic extracted)

---

## Implementation Timeline

### Week 1: TanStack Query Foundation
- Day 1-2: Create missing mutations and queries
- Day 3-4: Create mutation/query hooks
- Day 5: Create real-time subscription hooks

### Week 2: Component Migration
- Day 1: Migrate ConversationList + MessageView
- Day 2: Migrate Messages page
- Day 3: Migrate NewMessageModal + AnnouncementModal
- Day 4: Migrate MessageSettingsModal
- Day 5: Testing and bug fixes

### Week 3: Cleanup and Polish
- Day 1-2: Remove old hooks and utils
- Day 3: Add error boundaries
- Day 4: Add loading states
- Day 5: Final testing and documentation

---

## Next Steps

1. ✅ Review and approve this plan
2. ⬜ Create Phase 1 mutations and queries
3. ⬜ Create Phase 2 real-time hooks
4. ⬜ Begin Phase 3 component migration
5. ⬜ Execute Phase 4 cleanup

**Ready to start with Phase 1: Creating missing TanStack Query functions?**
