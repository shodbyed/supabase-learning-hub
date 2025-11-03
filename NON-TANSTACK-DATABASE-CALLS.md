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
- [x] `api/queries/handicaps.ts` - **NEW: Handicap thresholds for 3v3 scoring** ✅
- [x] `api/queries/leagues.ts`
- [x] `api/queries/matches.ts`
- [x] `api/queries/members.ts`
- [x] `api/queries/messages.ts`
- [x] `api/queries/seasons.ts` - **UPDATED: Added getPreviousCompletedSeason** ✅
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

### 3. Real-time Subscriptions (3 files)
**Location:** `src/realtime/` and `src/api/hooks/`
**Reason:** Real-time WebSocket subscriptions need direct Supabase channel access. This is correct.

- [x] `api/hooks/useMessagingRealtime.ts` - Message real-time updates
- [x] `realtime/useMatchGamesRealtime.ts` - **NEW: Match game real-time updates for scoring** ✅
- [x] `hooks/useRealtime.ts` - General real-time subscriptions (legacy, consider deprecating)

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
- [x] `hooks/useCurrentMember.ts` - **DUPLICATE - DELETED (TanStack version in api/hooks)** ✅
- [x] `hooks/useMatchLineup.ts` - **NOT USED - DELETED** ✅
- [x] `hooks/useMatchScoring.ts` - **MIGRATED - Now uses TanStack Query for all data fetching** ✅
- [x] `hooks/useOperatorId.ts` - **DUPLICATE - DELETED (TanStack version in api/hooks)** ✅
- [x] `hooks/useOperatorProfanityFilter.ts` - **ALREADY MIGRATED - Wrapper around TanStack Query hook** ✅
- [x] `hooks/usePendingReportsCount.ts` - **ALREADY MIGRATED - Wrapper around TanStack Query hook** ✅
- [x] `hooks/useProfanityFilter.ts` - **MIGRATED - Now uses TanStack Query internally** ✅
- [ ] `hooks/useRosterEditor.ts` - **USED in TeamEditorModal.tsx** - Needs migration (lines 107-113 fetch roster)
- [x] `hooks/useTeamManagement.ts` - **MIGRATED - Now uses TanStack Query for leagues, venues, members, seasons** ✅
- [x] `hooks/useUnreadMessageCount.ts` - **DUPLICATE - DELETED (TanStack version in api/hooks)** ✅
- [x] `hooks/useUserProfile.ts` - **DUPLICATE - DELETED (TanStack version in api/hooks)** ✅

### Priority 2: Components with Direct DB Calls (15 files)
**Location:** `src/player/` and `src/operator/`
**Issue:** Components should fetch data through TanStack Query hooks, not direct Supabase calls
**Solution:** Create queries/mutations in api layer, then use hooks in components

**Player Components:**
- [ ] `player/MatchLineup.tsx` - **CLEAN - Only real-time cleanup (line 382)** ✅
- [x] `player/MyTeams.tsx` - **FILE DOESN'T EXIST** ✅
- [ ] `player/ScoreMatch.tsx` - **NEEDS MIGRATION - fetchMatchData (lines 211-487), mutations (lines 978-1199)**

**Operator Components:**
- [x] `operator/LeagueCreationWizard.tsx` - **CLEAN - No supabase calls** ✅
- [x] `operator/LeagueDetail.tsx` - **CLEAN - No supabase calls** ✅
- [x] `operator/OrganizationSettings.tsx` - **CLEAN - No supabase calls** ✅
- [x] `operator/ScheduleSetup.tsx` - **CLEAN - No supabase calls** ✅
- [x] `operator/ScheduleView.tsx` - **CLEAN - No supabase calls** ✅
- [x] `operator/SeasonCreationWizard.tsx` - **CLEAN - No supabase calls** ✅
- [x] `operator/SeasonScheduleManager.tsx` - **CLEAN - No supabase calls** ✅
- [x] `operator/SeasonSchedulePage.tsx` - **CLEAN - Only auth call (line 199)** ✅
- [x] `operator/SeasonSchedulePage.refactored.tsx` - **CLEAN - No supabase calls** ✅
- [x] `operator/TeamEditorModal.tsx` - **CLEAN - No supabase calls** ✅
- [x] `operator/TeamManagement.tsx` - **CLEAN - No supabase calls** ✅
- [x] `operator/VenueLimitModal.tsx` - **CLEAN - No supabase calls** ✅

### Priority 3: Service Files (3 files)
**Location:** `src/services/`
**Issue:** Service layer should be in `api/queries` or `api/mutations`, not separate services
**Solution:** Move functions to api layer and wrap with TanStack hooks

- [x] `services/championshipService.ts` - **MIGRATED** ✅ (moved to `/src/api/queries/seasons.ts` as `getChampionshipPreferences()`)
- [x] `services/leagueService.ts` - **ALREADY MIGRATED** ✅ (`updateLeagueDayOfWeek` already in `/src/api/mutations/leagues.ts`)
- [x] `services/seasonService.ts` - **ALREADY MIGRATED** ✅ (`createSeason` already in `/src/api/mutations/seasons.ts`)

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
| ✅ Legitimate (API Layer) | 22 | Correct (+4 files: handicaps, seasons, members queries, members mutations) |
| ✅ Legitimate (Real-time) | 3 | Correct (+1 new file) |
| ✅ Legitimate (Context) | 1 | Correct |
| ✅ Old Custom Hooks (Migrated) | 11 | **11 of 12 migrated/deleted** ✅ |
| ✅ Components (Clean) | 14 | **14 of 15 clean** ✅ |
| ✅ Services (Migrated) | 3 | **All 3 service files migrated/deleted** ✅ |
| ⚠️ Old Custom Hooks (Need Work) | 1 | useRosterEditor only |
| ⚠️ Components (Need Work) | 1 | ScoreMatch.tsx |
| **TOTAL LEGITIMATE/CLEAN** | **60** | (32 + 11 + 14 + 3) |
| **TOTAL NEEDS WORK** | **2** | (1 hook + 1 component) |

---

## Current State: ~97% TanStack Coverage Complete!
**32 files legitimate** + **28 migrated/clean** = **60 good** vs **2 files need work**

**Recent Progress:**
- ✅ Messaging system: 100% TanStack Query
- ✅ Scoring system: useMatchScoring migrated to TanStack Query
- ✅ Team Management: useTeamManagement migrated to TanStack Query
- ✅ Profanity Filter: useProfanityFilter migrated to TanStack Query
- ✅ Hooks folder: 11 of 12 hooks now use TanStack Query (92% complete)
- ✅ Services: All 3 service files migrated to TanStack Query (100% complete)
- ✅ Created new `/src/realtime/` folder for real-time subscriptions
- ✅ Added handicap queries, season queries, championship preferences, member profanity settings
- ✅ Proper type system with `PartialMember` for efficiency
- ✅ Created `isEighteenOrOlder()` helper function for age verification

**Remaining Work:**
- 1 hook still needs migration (useRosterEditor)
- 1 player component needs migration (ScoreMatch.tsx)

**Summary:**
- **Hooks:** 92% complete (11/12) - Only 1 hook needs migration
- **Components:** 93% complete (14/15) - Only 1 component needs migration
- **Services:** 100% complete (3/3) - All service files migrated ✅
