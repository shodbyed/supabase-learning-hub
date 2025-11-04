# TanStack Query Migration TODO

## Overview
This document tracks the remaining work to fully migrate the application to use TanStack Query for all database operations.

## Current Status

### ✅ Completed
- API layer structure (`src/api/queries/` and `src/api/mutations/`)
- All TanStack hooks created in `src/api/hooks/`
- League Creation Wizard migrated
- Season Creation Wizard migrated
- Venue Creation/Edit Modal migrated
- Team Creation/Edit Modal migrated
- Schedule mutations (generate, delete)
- Match Lineup mutations (save, lock, unlock)

### ❌ Not Yet Migrated

#### 1. Messaging System (REQUIRES REFACTOR FIRST)
**Status**: Postponed until messaging refactor is complete
**Reason**: Current messaging code is overly complex and needs simplification before adding TanStack Query

**Files to Migrate After Refactor:**
- `src/hooks/useConversations.ts` - OLD custom hook wrapping old utils
- `src/hooks/useMessages.ts` - OLD custom hook wrapping old utils
- `src/components/messages/MessageView.tsx` - Uses OLD hooks
- `src/components/messages/ConversationList.tsx` - Uses OLD hooks
- `src/pages/Messages.tsx` - Uses OLD utils
- `src/components/PlayerNameLink.tsx` - Uses OLD message utils

**Missing TanStack Functions to Create:**
- `createOrOpenConversation` mutation
- `createGroupConversation` mutation
- `createLeagueAnnouncement` mutation
- `createOrganizationAnnouncement` mutation
- `useIsUserBlocked` query
- `useLeaveConversation` mutation
- Real-time subscription integration with TanStack Query

#### 2. Team/Player Components (3 files)
**Priority**: High (can migrate now)

**Files:**
- `src/components/operator/TeamsCard.tsx` - Uses `fetchTeamsWithDetails()`
  - Should use: `useTeamsByLeague()` hook
- `src/hooks/useTeamManagement.ts` - Uses old team utils
  - Should use: TanStack Query hooks for teams
- `src/operator/ScheduleSetupPage.tsx` - Uses old team queries
  - Should use: `useTeamsBySeason()` or `useTeamsByLeague()` hook

**Migration Notes:**
- All necessary TanStack hooks already exist
- Straightforward replacement of old utils with hooks
- No missing functionality

#### 3. Reports Management (2 files)
**Priority**: Medium

**Files:**
- `src/operator/ReportsManagement.tsx` - Uses old reporting utils
- `src/pages/AdminReports.tsx` - Uses old reporting utils

**Missing TanStack Functions to Create:**
- `useMyReports(userId)` query
- `usePendingReportsForOperator()` query
- `useReportDetails(reportId)` query
- `useReportMessage` mutation
- `useTakeReportAction` mutation
- `useEscalateReport` mutation

**Existing TanStack Functions:**
- ✅ `useCreateUserReport` mutation
- ✅ `useUpdateReportStatus` mutation

## Cleanup Tasks (After Migration Complete)

### Old Files to Remove:
1. `src/utils/messageQueries.ts` - Replace with TanStack Query
2. `src/utils/teamQueries.ts` - Replace with TanStack Query
3. `src/utils/playerQueries.ts` - Replace with TanStack Query
4. `src/utils/reportingQueries.ts` - Replace with TanStack Query
5. `src/hooks/useConversations.ts` - Replace with TanStack Query hook
6. `src/hooks/useMessages.ts` - Replace with TanStack Query hook
7. `src/services/seasonService.ts` - Already migrated, can be removed

## Migration Sequence

### Phase 1: Team/Player Components (NEXT)
1. Migrate `TeamsCard.tsx` to use `useTeamsByLeague()`
2. Migrate `useTeamManagement.ts` to use TanStack hooks
3. Migrate `ScheduleSetupPage.tsx` to use TanStack hooks
4. Remove `src/utils/teamQueries.ts`
5. Remove `src/utils/playerQueries.ts`

### Phase 2: Reports Management
1. Create missing report query functions in `src/api/queries/reports.ts`
2. Create missing report hooks in `src/api/hooks/useReports.ts`
3. Migrate `ReportsManagement.tsx` to use new hooks
4. Migrate `AdminReports.tsx` to use new hooks
5. Remove `src/utils/reportingQueries.ts`

### Phase 3: Messaging System (AFTER REFACTOR)
1. **Complete messaging refactor first** (separate project)
2. Create missing message mutation functions
3. Create TanStack Query hooks for messages
4. Migrate all message components
5. Remove old message hooks and utils

## Benefits After Complete Migration

- **Single Source of Truth**: All database operations go through TanStack Query
- **Automatic Caching**: Reduced unnecessary database queries
- **Optimistic Updates**: Better UX with instant feedback
- **Request Deduplication**: Multiple components can use same data efficiently
- **Background Refetching**: Data stays fresh automatically
- **Better Error Handling**: Consistent error patterns across app
- **Easier Testing**: Centralized query/mutation layer is more testable
- **Type Safety**: Full TypeScript support throughout data layer
