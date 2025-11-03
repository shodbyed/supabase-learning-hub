# Non-TanStack Database Call Audit

## Summary
This document lists all locations in the app where the database is accessed **without** using TanStack Query.

---

## ✅ LEGITIMATE (Should Stay As-Is)

### 1. Auth Operations (6 files)
**Location:** `src/login/`
**Reason:** Auth operations (login, register, password reset) should use Supabase auth directly, not TanStack Query.

- [x] `login/Login.tsx` - Login form with auth
- [x] `login/Register.tsx` - Registration with auth
- [x] `login/ForgotPassword.tsx` - Password reset request
- [x] `login/ResetPassword.tsx` - Password reset confirmation
- [x] `login/LogoutButton.tsx` - Logout
- [x] `login/EmailConfirmation.tsx` - Email confirmation

### 2. API Layer (19 files)
**Location:** `src/api/queries/` and `src/api/mutations/`
**Reason:** These are the pure query/mutation functions that TanStack Query hooks call. This is the correct pattern.

**Queries:**
- [x] `api/queries/conversations.ts`
- [x] `api/queries/leagues.ts`
- [x] `api/queries/matches.ts`
- [x] `api/queries/members.ts`
- [x] `api/queries/messages.ts`
- [x] `api/queries/seasons.ts`
- [x] `api/queries/teams.ts`
- [x] `api/queries/venues.ts`

**Mutations:**
- [x] `api/mutations/announcements.ts`
- [x] `api/mutations/conversations.ts`
- [x] `api/mutations/leagueVenues.ts`
- [x] `api/mutations/leagues.ts`
- [x] `api/mutations/matchLineups.ts`
- [x] `api/mutations/messages.ts`
- [x] `api/mutations/reports.ts`
- [x] `api/mutations/schedules.ts`
- [x] `api/mutations/seasons.ts`
- [x] `api/mutations/teams.ts`
- [x] `api/mutations/venues.ts`

### 3. Real-time Subscriptions (2 files)
**Location:** `src/api/hooks/` and `src/hooks/`
**Reason:** Real-time WebSocket subscriptions need direct Supabase channel access. This is correct.

- [x] `api/hooks/useMessagingRealtime.ts` - Message real-time updates
- [x] `hooks/useRealtime.ts` - General real-time subscriptions

### 4. Context Provider (1 file)
**Location:** `src/context/`
**Reason:** UserProvider manages auth state, needs direct Supabase access.

- [x] `context/UserProvider.tsx` - Auth state management

---

## ⚠️ NEEDS MIGRATION TO TANSTACK QUERY

### Priority 1: Old Custom Hooks (12 files)
**Location:** `src/hooks/`
**Issue:** These custom hooks fetch data directly instead of using TanStack Query
**Solution:** Either migrate to `api/queries` + `api/hooks` OR deprecate if TanStack version already exists

**Status Check:**
- [x] `hooks/useConversationParticipants.ts` - **MIGRATED - Now uses TanStack hooks internally** ✅
- [x] `hooks/useCurrentMember.ts` - **DUPLICATE - DELETE (TanStack version in api/hooks)** ✅
- [x] `hooks/useMatchLineup.ts` - **NOT USED - DELETED** ✅
- [ ] `hooks/useMatchScoring.ts` - **USED in GamesList.tsx** - Needs migration
- [x] `hooks/useOperatorId.ts` - **DUPLICATE - DELETE (TanStack version in api/hooks)** ✅
- [ ] `hooks/useOperatorProfanityFilter.ts` - **USED in TeamEditorModal.tsx** - Needs migration
- [ ] `hooks/usePendingReportsCount.ts` - **USED in OperatorNavBar.tsx, OperatorDashboard.tsx** - Needs migration
- [ ] `hooks/useProfanityFilter.ts` - **USED in 4 files (MessageBubble, MessageSettingsModal, etc.)** - Needs migration
- [ ] `hooks/useRosterEditor.ts` - **USED in TeamEditorModal.tsx** - Needs migration
- [ ] `hooks/useTeamManagement.ts` - **USED in TeamManagement.tsx** - Needs migration
- [x] `hooks/useUnreadMessageCount.ts` - **DUPLICATE - DELETE (TanStack version in api/hooks)** ✅
- [x] `hooks/useUserProfile.ts` - **DUPLICATE - DELETE (TanStack version in api/hooks)** ✅

### Priority 2: Components with Direct DB Calls (15 files)
**Location:** `src/player/` and `src/operator/`
**Issue:** Components should fetch data through TanStack Query hooks, not direct Supabase calls
**Solution:** Create queries/mutations in api layer, then use hooks in components

**Player Components:**
- [ ] `player/MatchLineup.tsx` - Uses direct Supabase calls
- [ ] `player/MyTeams.tsx` - Uses direct Supabase calls
- [ ] `player/ScoreMatch.tsx` - Uses direct Supabase calls

**Operator Components:**
- [ ] `operator/LeagueCreationWizard.tsx` - Check if already migrated (there's a .REFACTORED version)
- [ ] `operator/LeagueDetail.tsx` - Uses direct Supabase calls
- [ ] `operator/OrganizationSettings.tsx` - Uses direct Supabase calls
- [ ] `operator/ScheduleSetup.tsx` - Uses direct Supabase calls
- [ ] `operator/ScheduleView.tsx` - Uses direct Supabase calls
- [ ] `operator/SeasonCreationWizard.tsx` - Check if already migrated (messaging uses TanStack version)
- [ ] `operator/SeasonScheduleManager.tsx` - Uses direct Supabase calls
- [ ] `operator/SeasonSchedulePage.tsx` - Has `.refactored` version - check which is used
- [ ] `operator/SeasonSchedulePage.refactored.tsx` - Check if this is the active one
- [ ] `operator/TeamEditorModal.tsx` - Uses direct Supabase calls
- [ ] `operator/TeamManagement.tsx` - Uses direct Supabase calls
- [ ] `operator/VenueLimitModal.tsx` - Uses direct Supabase calls

### Priority 3: Service Files (3 files)
**Location:** `src/services/`
**Issue:** Service layer should be in `api/queries` or `api/mutations`, not separate services
**Solution:** Move functions to api layer and wrap with TanStack hooks

- [ ] `services/championshipService.ts` - Should be in api/queries
- [ ] `services/leagueService.ts` - Should be in api/queries
- [ ] `services/seasonService.ts` - Should be in api/queries

---

## Migration Strategy

### Step 1: Identify Duplicates
Some hooks in `src/hooks/` may already have TanStack Query versions in `src/api/hooks/`. Identify and remove duplicates.

**Known Duplicates:**
- ✅ `hooks/useCurrentMember.ts` → `api/hooks/useCurrentMember.ts` (DELETE old one)
- ✅ `hooks/useOperatorId.ts` → `api/hooks/useOperatorId.ts` (DELETE old one)
- ✅ `hooks/useUnreadMessageCount.ts` → `api/hooks/useMessages.ts` (DELETE old one)
- ✅ `hooks/useUserProfile.ts` → `api/hooks/useUserProfile.ts` (DELETE old one)

### Step 2: Migrate Old Hooks
For hooks without TanStack versions:
1. Move query logic to `api/queries/`
2. Create TanStack hook in `api/hooks/`
3. Update all imports
4. Delete old hook

### Step 3: Migrate Components
For components with direct Supabase calls:
1. Extract queries to `api/queries/`
2. Extract mutations to `api/mutations/`
3. Create hooks in `api/hooks/`
4. Update component to use hooks
5. Test thoroughly

### Step 4: Migrate Services
For service files:
1. Move functions to appropriate api layer
2. Create TanStack hooks
3. Update all imports
4. Delete service files

---

## Total Count

| Category | Count | Status |
|----------|-------|--------|
| ✅ Legitimate (Auth) | 6 | Correct |
| ✅ Legitimate (API Layer) | 19 | Correct |
| ✅ Legitimate (Real-time) | 2 | Correct |
| ✅ Legitimate (Context) | 1 | Correct |
| ⚠️ Old Custom Hooks | 12 | **4 duplicates, 8 need migration** |
| ⚠️ Components | 15 | **Need migration** |
| ⚠️ Services | 3 | **Need migration** |
| **TOTAL LEGITIMATE** | **28** | - |
| **TOTAL NEEDS WORK** | **30** | - |

---

## Current State: ~50% TanStack Coverage
**28 files legitimate** vs **30 files need work**

The messaging system is now 100% TanStack Query, but the rest of the app still has work to do.
