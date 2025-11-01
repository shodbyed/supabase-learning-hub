# Database Usage Map & Migration Checklist

> **Created**: 2025-11-01
> **Purpose**: Complete inventory of all database access patterns for TanStack Query migration
> **Total Files**: 55 files directly importing supabaseClient

---

## 📊 Summary Statistics

- **Query Utility Files**: 4 (`*Queries.ts`)
- **Service Files**: 3 (`*Service.ts`)
- **Custom Hooks with DB**: 22 hooks
- **Components with Direct DB**: 28 components
- **Direct `supabase.from()` calls**: 3 locations (mostly abstracted)
- **Auth operations** (`supabase.auth`): 8 locations

---

## 🎯 Migration Priority Levels

### ✅ Priority 1: Core Auth & User Data (COMPLETED)
**Impact**: Highest - Used across entire app, fetched repeatedly
**Status**: ✅ 100% Complete - All 25 files migrated to TanStack Query

1. **Members/Auth Hooks** ✅
   - ✅ `hooks/useCurrentMember.ts` → `api/hooks/useCurrentMember.ts` (TanStack Query)
   - ✅ `hooks/useUserProfile.ts` → `api/hooks/useUserProfile.ts` (TanStack Query)
   - ✅ `hooks/useOperatorId.ts` → `api/hooks/useOperatorId.ts` (TanStack Query)

2. **Authentication Operations** ⚠️
   - `login/Login.tsx` - `supabase.auth.signInWithPassword()` (Keep as-is - auth mutations)
   - `login/Register.tsx` - `supabase.auth.signUp()` (Keep as-is - auth mutations)
   - `login/ForgotPassword.tsx` - `supabase.auth.resetPasswordForEmail()` (Keep as-is)
   - `login/ResetPassword.tsx` - `supabase.auth.updateUser()` (Keep as-is)
   - `login/EmailConfirmation.tsx` - `supabase.auth.verifyOtp()` (Keep as-is)
   - `login/LogoutButton.tsx` - `supabase.auth.signOut()` (Keep as-is)
   - **Note**: Auth operations should stay direct - they're mutations, not queries

3. **Files Migrated to New Hooks** ✅
   - ✅ PlayerNameLink.tsx
   - ✅ ReportUserModal.tsx
   - ✅ MessageSettingsModal.tsx
   - ✅ AdminReports.tsx
   - ✅ ReportsManagement.tsx
   - ✅ OrganizationSettings.tsx
   - ✅ TeamManagement.tsx
   - ✅ SeasonCreationWizard.tsx
   - ✅ VenueManagement.tsx
   - ✅ MatchLineup.tsx
   - ✅ ScoreMatch.tsx
   - ✅ useMatchLineup.ts
   - ✅ Messages.tsx
   - ✅ Home.tsx
   - ✅ NavBar.tsx
   - ✅ Dashboard.tsx
   - ✅ LeagueOperatorApplication.tsx
   - ✅ useApplicationForm.ts
   - ✅ ProtectedRoute.tsx
   - ✅ useProfileForm.ts
   - ✅ Profile.tsx
   - ✅ OperatorDashboard.tsx
   - ✅ LeagueCreationWizard.tsx
   - ✅ SeasonCreationWizard.smoke.test.tsx (test mock updated)
   - ✅ ApplicationPreview.tsx (import updated)

### 🟠 Priority 2: Team & Player Data (Frequently Accessed)
**Impact**: High - Used in navigation, dashboards, rosters

#### Query Utilities to Migrate
- **`utils/playerQueries.ts`** (3 functions):
  - `fetchPlayerTeams(memberId)` - All teams for a player
  - `fetchTeamDetails(teamId)` - Single team with full details
  - `fetchCaptainTeamEditData(teamId)` - Team edit view

- **`utils/teamQueries.ts`** (1 function):
  - `fetchTeamsWithDetails(leagueId)` - All teams in a league

#### Hooks Using Team Data
- `hooks/useTeamManagement.ts` - Team CRUD operations
- `hooks/useRosterEditor.ts` - Roster management

#### Components with Direct Team Access
- `player/MyTeams.tsx` - Player's team list
- `player/TeamSchedule.tsx` - Team schedule view
- `operator/TeamManagement.tsx` - Operator team management
- `operator/TeamEditorModal.tsx` - Team editor
- `components/TeamNameLink.tsx` - Team link component

### 🟡 Priority 3: Messaging System (Real-time + Cache)
**Impact**: Medium-High - Heavy use, needs real-time integration

#### Query Utilities to Migrate
- **`utils/messageQueries.ts`** (14 functions):
  - **READ**: `fetchUserConversations()`, `fetchConversationMessages()`, `getBlockedUsers()`, `isUserBlocked()`
  - **WRITE**: `sendMessage()`, `createOrOpenConversation()`, `createGroupConversation()`
  - **UPDATE**: `updateLastRead()`, `blockUser()`, `unblockUser()`, `leaveConversation()`
  - **ANNOUNCEMENTS**: `createLeagueAnnouncement()`, `createOrganizationAnnouncement()`
  - **RPC**: Uses `supabase.rpc()` for conversation creation

#### Hooks Using Messaging
- `hooks/useMessages.ts` - Message management
- `hooks/useConversations.ts` - Conversation list
- `hooks/useConversationParticipants.ts` - Participant management
- `hooks/useUnreadMessageCount.ts` - Unread count
- `hooks/useRealtime.ts` - Real-time subscriptions (KEEP, integrate with TQ)

#### Components with Direct Messaging Access
- `pages/Messages.tsx` - Main messaging page
- `components/messages/MessageView.tsx` - Message display
- `components/messages/ConversationList.tsx` - Conversation list
- `components/messages/NewMessageModal.tsx` - New message modal
- `components/messages/AnnouncementModal.tsx` - Announcements

### 🟢 Priority 4: League/Season Management (Operator-Heavy)
**Impact**: Medium - Operator-specific, less frequent

#### Service Files to Migrate
- **`services/leagueService.ts`** (1 function):
  - `updateLeagueDayOfWeek()` - Update league day

- **`services/seasonService.ts`** (1 function):
  - `createSeason()` - Season creation with complex logic

- **`services/championshipService.ts`** (1 function):
  - `fetchChampionshipPreferences()` - Championship date preferences

#### Hooks Using League/Season Data
- `hooks/useLeagueWizard.ts` - League wizard state
- `hooks/useScheduleGeneration.ts` - Schedule generation
- `hooks/useSeasonSchedule.ts` - Season schedule data
- `hooks/useChampionshipAutoFill.ts` - Championship date autofill

#### Components with Direct League/Season Access
- `operator/LeagueCreationWizard.tsx` - League wizard
- `operator/LeagueDetail.tsx` - League details
- `operator/SeasonCreationWizard.tsx` - Season wizard
- `operator/ScheduleSetup.tsx` - Schedule setup
- `operator/ScheduleView.tsx` - Schedule view
- `operator/SeasonScheduleManager.tsx` - Season schedule management
- `operator/SeasonSchedulePage.tsx` - Season schedule page
- `operator/SeasonSchedulePage.refactored.tsx` - Refactored version (in progress)
- `components/operator/ActiveLeagues.tsx` - Active leagues display
- `components/operator/LeagueOverviewCard.tsx` - League overview
- `components/operator/ScheduleCard.tsx` - Schedule card

### 🔵 Priority 5: Match/Scoring System (Real-time Critical)
**Impact**: Medium - Real-time updates essential

#### Hooks Using Match Data
- `hooks/useMatchLineup.ts` - Match lineup editor
- `hooks/useMatchScoring.ts` - Match scoring state

#### Components with Direct Match Access
- `player/MatchLineup.tsx` - Lineup editor
- `player/ScoreMatch.tsx` - Scoring interface (uses `supabase.from()` directly)
- `components/lineup/LineupSelector.tsx` - Lineup selector

### 🟣 Priority 6: Venue Management
**Impact**: Low - Operator-only, infrequent

#### Components with Direct Venue Access
- `operator/VenueManagement.tsx` - Venue CRUD
- `operator/VenueLimitModal.tsx` - Venue limits
- `components/operator/VenueCreationModal.tsx` - Venue creation

### ⚪ Priority 7: Reporting & Admin
**Impact**: Low - Admin-only, infrequent

#### Query Utilities to Migrate
- **`utils/reportingQueries.ts`** (8 functions):
  - **CREATE**: `createUserReport()`, `reportMessage()`
  - **READ**: `getMyReports()`, `getPendingReportsForOperator()`, `getReportDetails()`
  - **UPDATE**: `updateReportStatus()`, `takeReportAction()`, `escalateReport()`

#### Hooks Using Reports
- `hooks/usePendingReportsCount.ts` - Pending reports count

#### Components with Direct Report Access
- `pages/AdminReports.tsx` - Admin reports dashboard

### 🔧 Priority 8: Utilities & Misc
**Impact**: Variable - Used by other components

- `utils/scheduleGenerator.ts` - Schedule generation (complex logic)
- `utils/tournamentUtils.ts` - Tournament utilities
- `hooks/useTournamentSearch.ts` - Tournament search
- `hooks/useProfanityFilter.ts` - Profanity filtering
- `hooks/useOperatorProfanityFilter.ts` - Operator profanity filter
- `pages/PlayerProfile.tsx` - Player profile page
- `operator/OperatorDashboard.tsx` - Operator dashboard
- `operator/OrganizationSettings.tsx` - Organization settings

---

## 📋 Migration Checklist

### Phase 1: Foundation ✅
- [x] Install TanStack Query
- [x] Create `/api` structure
- [x] Create `queryKeys.ts`
- [x] Wrap app with `QueryClientProvider`

### Phase 2: Auth & Members (Week 1)
- [ ] Create `api/queries/members.ts`
  - [ ] `getCurrentMember(userId)` - from `useCurrentMember`
  - [ ] `getMemberProfile(memberId)` - from `useUserProfile`
  - [ ] `getOperatorId(memberId)` - from `useOperatorId`

- [ ] Create `api/hooks/useCurrentMember.ts`
  - [ ] Replace existing hook with TQ version
  - [ ] Test caching across page navigations

- [ ] Create `api/hooks/useUserProfile.ts`
- [ ] Create `api/hooks/useOperatorId.ts`

- [ ] Update `UserProvider` to not duplicate member fetches

**Success Criteria**: Member data fetched once, cached across app

---

### Phase 3: Teams & Players (Week 2)
- [ ] Create `api/queries/teams.ts`
  - [ ] Migrate `fetchTeamsWithDetails()` from `utils/teamQueries.ts`
  - [ ] Migrate `fetchPlayerTeams()` from `utils/playerQueries.ts`
  - [ ] Migrate `fetchTeamDetails()` from `utils/playerQueries.ts`
  - [ ] Migrate `fetchCaptainTeamEditData()` from `utils/playerQueries.ts`

- [ ] Create `api/hooks/useTeams.ts` (by league)
- [ ] Create `api/hooks/useTeamDetail.ts` (single team)
- [ ] Create `api/hooks/usePlayerTeams.ts` (teams for member)

- [ ] Create `api/mutations/teams.ts`
  - [ ] `createTeam()`
  - [ ] `updateTeam()`
  - [ ] `deleteTeam()`
  - [ ] `updateRoster()`

- [ ] Update hooks:
  - [ ] `hooks/useTeamManagement.ts` → Use TQ mutations
  - [ ] `hooks/useRosterEditor.ts` → Use TQ mutations

- [ ] Update components:
  - [ ] `player/MyTeams.tsx`
  - [ ] `player/TeamSchedule.tsx`
  - [ ] `operator/TeamManagement.tsx`
  - [ ] `operator/TeamEditorModal.tsx`
  - [ ] `components/TeamNameLink.tsx`

**Success Criteria**: Team data cached per league/player, no duplicate fetches

---

### Phase 4: Messaging (Week 3)
- [ ] Create `api/queries/messages.ts`
  - [ ] Migrate all READ functions from `utils/messageQueries.ts`
  - [ ] Add pagination support for message history

- [ ] Create `api/mutations/messages.ts`
  - [ ] Migrate all WRITE functions from `utils/messageQueries.ts`
  - [ ] Add optimistic updates for `sendMessage()`

- [ ] Create `api/hooks/useConversations.ts`
- [ ] Create `api/hooks/useConversationMessages.ts` (infinite query)
- [ ] Create `api/hooks/useUnreadCount.ts`

- [ ] Integrate `hooks/useRealtime.ts` with TQ:
  - [ ] Use `queryClient.setQueryData()` for real-time updates
  - [ ] Invalidate queries on real-time events

- [ ] Update components:
  - [ ] `pages/Messages.tsx`
  - [ ] `components/messages/MessageView.tsx`
  - [ ] `components/messages/ConversationList.tsx`
  - [ ] `components/messages/NewMessageModal.tsx`
  - [ ] `components/messages/AnnouncementModal.tsx`

**Success Criteria**: Messages cached, infinite scroll works, real-time updates integrate smoothly

---

### Phase 5: Leagues & Seasons (Week 4)
- [ ] Create `api/queries/leagues.ts`
- [ ] Create `api/queries/seasons.ts`
- [ ] Create `api/queries/schedules.ts`

- [ ] Migrate service functions:
  - [ ] `services/leagueService.ts` → `api/mutations/leagues.ts`
  - [ ] `services/seasonService.ts` → `api/mutations/seasons.ts`
  - [ ] `services/championshipService.ts` → `api/queries/championships.ts`

- [ ] Update hooks:
  - [ ] `hooks/useLeagueWizard.ts`
  - [ ] `hooks/useScheduleGeneration.ts`
  - [ ] `hooks/useSeasonSchedule.ts`
  - [ ] `hooks/useChampionshipAutoFill.ts`

- [ ] Update operator components (12 files)

**Success Criteria**: League/season data cached, wizard flows work smoothly

---

### Phase 6: Matches & Scoring (Week 5)
- [ ] Create `api/queries/matches.ts`
- [ ] Create `api/mutations/matches.ts`
  - [ ] Add optimistic updates for score changes

- [ ] Update hooks:
  - [ ] `hooks/useMatchLineup.ts`
  - [ ] `hooks/useMatchScoring.ts`

- [ ] Update components:
  - [ ] `player/MatchLineup.tsx`
  - [ ] `player/ScoreMatch.tsx` (remove direct `supabase.from()`)
  - [ ] `components/lineup/LineupSelector.tsx`

**Success Criteria**: Real-time scoring updates, optimistic UI

---

### Phase 7: Venues, Reports & Misc (Week 6)
- [ ] Create `api/queries/venues.ts`
- [ ] Create `api/mutations/venues.ts`
- [ ] Create `api/queries/reports.ts`
- [ ] Create `api/mutations/reports.ts`

- [ ] Migrate remaining utilities:
  - [ ] `utils/reportingQueries.ts`
  - [ ] `utils/scheduleGenerator.ts` (keep as utility, not query)
  - [ ] `utils/tournamentUtils.ts`

- [ ] Update remaining hooks & components

**Success Criteria**: All database access through TanStack Query

---

### Phase 8: Cleanup & Polish (Week 7)
- [ ] Delete deprecated files:
  - [ ] `utils/playerQueries.ts`
  - [ ] `utils/teamQueries.ts`
  - [ ] `utils/messageQueries.ts`
  - [ ] `utils/reportingQueries.ts`
  - [ ] Old service files (if fully migrated)

- [ ] Update TABLE_OF_CONTENTS.md
- [ ] Document patterns in memory-bank
- [ ] Performance audit with DevTools
- [ ] Update CLAUDE.md with new patterns

**Success Criteria**: Clean codebase, all queries visible in DevTools, documentation complete

---

## 🔍 Special Considerations

### Real-Time Integration
Keep `hooks/useRealtime.ts` but integrate with TanStack Query:
- Use `queryClient.setQueryData()` for optimistic updates
- Use `queryClient.invalidateQueries()` to trigger refetches
- Maintain current real-time subscription patterns

### Complex Mutations
For multi-step operations (e.g., `createSeason()`):
- Keep complex logic in service-like functions
- Wrap service calls with `useMutation`
- Use `onSuccess` to invalidate related queries

### Auth Operations
Auth operations (`supabase.auth.*`) stay as-is:
- Auth is already well-managed by Supabase
- Keep in `UserProvider` context
- Only migrate member data fetching to TQ

### Direct `supabase.from()` Calls
Only 3 locations use direct calls - all should be abstracted:
1. `player/ScoreMatch.tsx` - Move to mutation
2. `services/seasonService.ts` - Already being migrated
3. `supabaseClient.ts` - Just the export

---

## 📝 Notes

- **Start small**: Begin with `useCurrentMember` (highest impact, lowest risk)
- **Test thoroughly**: Verify caching works before moving to next entity
- **Keep DevTools open**: Monitor cache behavior during migration
- **Document learnings**: Update this file as patterns emerge

---

*This is a living document. Check off items as they're completed.*

**Next Action**: Start Phase 2 - Migrate `useCurrentMember` hook
