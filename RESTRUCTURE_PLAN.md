# Codebase Restructure Plan

> **Created**: 2025-11-01
> **Status**: Planning Phase
> **Branch**: `app-restructure`

---

## 🎯 Goal

Reorganize the codebase to eliminate duplication, improve discoverability, and establish clear patterns for future development as the application scales.

---

## 📋 Problems to Solve

### 1. Duplicate Components

**Problem**: Same components exist in multiple locations with unclear which is canonical

**Examples**:
- `MatchCard.tsx` (root `/components` vs `/components/schedule`)
- `TeamCard.tsx` (root `/components` vs `/components/player`)
- `VisibilityChoiceCard.tsx` (`/leagueOperator` vs `/components/privacy`)

**Impact**: Confusion about which to use, potential divergence in functionality, maintenance burden

---

### 2. Legacy/Deprecated Files Not Removed

**Problem**: Old versions and refactor-in-progress files exist alongside production code

**Examples**:
- `LeagueCreationWizard.old.tsx`
- `SeasonSchedulePage.refactored.tsx`
- `BlockedUsersModal.REFACTORED.tsx`

**Impact**: Unclear which version is current, codebase bloat, potential for using wrong version

---

### 3. Feature Code Split Across Multiple Top-Level Directories

**Problem**: Related functionality scattered across `/operator`, `/components/operator`, `/pages`, `/hooks`, `/utils`

**Affected Features**:
- Operator functionality spread across 3+ directories
- Player functionality split between `/player`, `/components/player`, `/pages`
- League management across `/operator`, `/leagueOperator`, `/components/operator`
- Messaging across `/pages`, `/components/messages`

**Impact**: Hard to find all code related to a feature, difficult to understand feature boundaries

---

### 4. Inconsistent Page vs Feature Organization

**Problem**: No clear pattern for when something is a "page" vs a "feature" vs a "component"

**Confusion Points**:
- When does something go in `/pages` vs top-level feature directory?
- What belongs in `/components` vs feature-specific subdirectory?
- Route components mixed with feature logic

**Impact**: New features have no clear "home", pattern inconsistency grows over time

---

### 5. Root Components Directory Overcrowded

**Problem**: 15+ components at root of `/components` with unclear categorization

**Current Root Components**:
- `AllPlayersRosterCard.tsx`
- `ConfirmDialog.tsx`
- `InfoButton.tsx`
- `MatchCard.tsx`
- `MemberCombobox.tsx`
- `PaymentCardForm.tsx`
- `PlayerNameLink.tsx`
- `ProtectedRoute.tsx`
- `ReportUserModal.tsx`
- `SponsorLogos.tsx`
- `TeamCard.tsx`
- `TeamNameLink.tsx`
- `TeamRosterList.tsx`
- `VenueListItem.tsx`

**Questions**:
- Which are truly shared across entire app?
- Which belong with specific features?
- Which are page-specific vs reusable?

**Impact**: Hard to find components, unclear what's available for reuse

---

### 6. Utils Directory Growing Without Clear Organization

**Problem**: 20+ utility files with overlapping concerns

**Current Utils** (partial list):
- `scheduleGenerator.ts`
- `scheduleUtils.ts`
- `scheduleDisplayUtils.ts`
- `conflictDetectionUtils.ts`
- `messageQueries.ts`
- `messageFormatters.ts`
- `messageValidators.ts`
- `teamQueries.ts`
- `playerQueries.ts`
- `leagueUtils.ts`
- `tournamentUtils.ts`

**Questions**:
- Should query functions live near the features they support?
- Should formatters/validators be grouped with their domains?
- What stays as "shared utility" vs "feature utility"?

**Impact**: Utility bloat, unclear where to add new utilities, potential circular dependencies

---

### 7. Hooks Directory Lacks Feature Grouping

**Problem**: 20+ hooks in flat directory, no clear relationship to features

**Current Hooks** (partial):
- `useLeagueWizard.ts`
- `useScheduleGeneration.ts`
- `useSeasonSchedule.ts`
- `useTeamManagement.ts`
- `useMatchLineup.ts`
- `useMatchScoring.ts`
- `useMessages.ts`
- `useConversations.ts`

**Questions**:
- Which hooks are truly shared vs feature-specific?
- How to find all hooks related to a feature?
- Which hooks depend on each other?

**Impact**: Hard to discover available hooks, unclear dependencies

---

### 8. Data Directory Mixed Concerns

**Problem**: Wizard step definitions, matchup tables, and mock data all in `/data`

**Current Contents**:
- `leagueWizardSteps.tsx` (configuration)
- `leagueWizardSteps.simple.tsx` (variant configuration)
- `scheduleWizardSteps.tsx` (configuration)
- `seasonWizardSteps.tsx` (configuration)
- `mockVenues.ts` (test data)
- `/matchupTables/*` (static data/algorithms)

**Questions**:
- Should wizard configurations live with wizard components?
- Should mock data be in `/test` or feature directories?
- Are matchup tables data or algorithms?

**Impact**: Unclear purpose of `/data` directory, hard to find wizard configurations

---

### 9. Services vs Utils vs Hooks Boundaries Unclear

**Problem**: Business logic scattered across three patterns without clear rules

**Current State**:
- `/services` has 3 files (league, season, championship)
- `/utils` has 20+ files with mixed responsibilities
- `/hooks` has data fetching, state management, and business logic

**Questions**:
- When to create a service vs a utility function?
- When should data fetching be a hook vs a service?
- What's the difference between a service and a complex utility?

**Impact**: Inconsistent patterns, unclear where to add new business logic

---

### 10. Type Definitions Centralized But Feature Types Scattered

**Problem**: Core types in `/types`, but feature-specific types in feature directories

**Examples**:
- Core types: `/types/league.ts`, `/types/season.ts`
- Feature types: `/profile/types.ts`, `/leagueOperator/types.ts`, `/newPlayer/types.ts`

**Questions**:
- Which types belong in central `/types` vs feature directories?
- How to avoid type duplication?
- How to handle shared types across features?

**Impact**: Type discovery difficult, potential duplication, unclear single source of truth

---

### 11. Navigation Components Separate from Layout/Routes

**Problem**: Navigation in `/navigation`, routes in various locations, layout patterns unclear

**Current Split**:
- `/navigation` - NavBar components
- `/App.tsx` - Route definitions
- `/components/ProtectedRoute.tsx` - Route wrapper
- Page components in multiple directories

**Questions**:
- Should navigation, routes, and layouts be together?
- Where do layout components live?
- How to organize nested route structures?

**Impact**: Routing logic spread across files, hard to understand app structure

---

### 12. Form Components vs Wizard Components Overlap

**Problem**: Wizard-specific components in `/components/forms`, but wizards in feature directories

**Current State**:
- `/components/forms` - Reusable wizard steps
- `/operator` - Wizard containers using those steps
- `/leagueOperator` - Operator application wizard
- Wizard step data in `/data`

**Questions**:
- Should wizard components be feature-agnostic or feature-specific?
- Where do wizard containers live vs wizard step components?
- Should wizard state management be centralized?

**Impact**: Wizard code split across 3+ locations, unclear reusability

---

### 13. Modal Components Scattered

**Problem**: Modals in multiple locations with unclear organization

**Current Locations**:
- `/components/modals` - Shared modals (6 files)
- Root `/components` - Feature modals (`ReportUserModal.tsx`, `ConfirmDialog.tsx`)
- `/components/operator` - Operator modals (`VenueCreationModal.tsx`)
- `/operator` - Operator modals (`TeamEditorModal.tsx`, `VenueLimitModal.tsx`)
- Feature directories - Feature-specific modals

**Questions**:
- Which modals are truly shared vs feature-specific?
- Should all modals be in one place?
- How to handle modal state management?

**Impact**: Hard to find modals, duplication risk, inconsistent modal patterns

---

### 14. Constants vs Static Data Organization

**Problem**: `/constants` has both configuration and content

**Current Contents**:
- `states.ts` - Static reference data
- `scheduleConflicts.ts` - Business logic configuration
- `/infoContent` - UI content/copy

**Questions**:
- Should UI content live with components?
- Should config be separate from reference data?
- Where do feature-specific constants live?

**Impact**: Unclear where to add new constants, mixing concerns

---

### 15. Test Files Location Pattern

**Problem**: Tests in `/__tests__` separate from code they test

**Current State**:
- Unit tests in `/__tests__/unit`
- Integration tests in `/__tests__/integration`
- Test utilities in `/test`

**Questions**:
- Should tests live next to code they test?
- How to organize different test types?
- How to share test utilities?

**Impact**: Test maintenance harder, unclear test coverage per feature

---

### 16. Component Subdirectories Have Inconsistent Depth

**Problem**: Some feature component dirs have 1-2 files, others have 10+

**Examples**:
- `/components/lineup` - 5 files
- `/components/scoring` - 5 files
- `/components/messages` - 11 files
- `/components/operator` - 11 files
- `/components/schedule` - 5 files
- `/components/player` - 1 file
- `/components/privacy` - 2 files
- `/components/previews` - 1 file

**Questions**:
- What threshold justifies a subdirectory?
- Should 1-2 file directories be moved?
- How to handle growing feature components?

**Impact**: Inconsistent organization, some directories feel premature

---

### 17. Player vs Operator Code Not Clearly Separated

**Problem**: App has two distinct user types but code organization doesn't reflect this

**User Types**:
- **Players**: Use app to view schedules, enter lineups, score matches, message
- **Operators**: Manage leagues, teams, schedules, venues, reports

**Current State**:
- `/player` directory - 4 pages
- `/operator` directory - 20+ pages/wizards
- `/components/player` - 1 file
- `/components/operator` - 11 files
- Shared components unclear which user type they serve

**Questions**:
- Should player and operator code be more clearly separated?
- Which components are truly shared vs user-type-specific?
- How to prevent operator code creeping into player views?

**Impact**: Hard to understand user boundaries, risk of exposing operator features to players

---

### 18. Info/Educational Content Organization

**Problem**: Educational content scattered across directories

**Current Locations**:
- `/info` - Format comparison pages
- `/about` - About page
- `/constants/infoContent` - Info content for wizards
- `InfoButton.tsx` - Component for showing info

**Questions**:
- Should all educational content be together?
- Should info content live with the features they explain?
- How to organize help/documentation?

**Impact**: Hard to maintain consistent help content, duplication risk

---

### 19. No Clear Entry Point for Each Feature

**Problem**: Features don't have obvious "index" or entry point files

**Impact**:
- Hard to understand what a feature exports
- Difficult to see public API of a feature
- Import paths inconsistent across codebase

**Example**:
- Want to use messaging? Check `/pages/Messages.tsx`, `/components/messages/*`, `/hooks/useMessages.ts`, `/utils/messageQueries.ts`
- No single place that says "this is the messaging feature API"

---

### 20. Assets Directory Organization Unknown

**Problem**: `/assets` directory exists but structure unknown

**Questions**:
- How are images/logos organized?
- Are there unused assets?
- Should assets be co-located with features or centralized?

**Impact**: Can't assess asset organization issues

---

## 🎨 Architectural Questions to Answer

Beyond the specific problems above, we need to decide:

### A. Feature Organization Philosophy
- [ ] Feature-first (group by feature domain) vs Layer-first (group by technical type)?
- [ ] If feature-first, what defines a "feature"?
- [ ] If layer-first, how to prevent files getting lost in large directories?

### B. Shared vs Feature-Specific Guidelines
- [ ] What qualifies as "shared"? (Used by 2+ features? Used by both user types?)
- [ ] Should feature-specific code live in feature directory even if reusable?
- [ ] How to prevent premature abstraction to "shared"?

### C. Import Path Strategy
- [ ] Use barrel exports (`index.ts`) for features?
- [ ] Allow deep imports into features or only from index?
- [ ] How to prevent circular dependencies?

### D. State Management Location
- [ ] Should state management (reducers, context) live with features or centralized?
- [ ] Where do hooks that manage state live?
- [ ] How to organize global vs feature state?

### E. Route Organization
- [ ] Should routes be co-located with page components or centralized?
- [ ] How to organize nested routes?
- [ ] Where do route-level layouts live?

---

## 🚀 Next Steps

1. **Audit & Document Current State** ✅ (Table of Contents created)
2. **Answer Architectural Questions** (Discuss with team)
3. **Create Detailed Restructure Plan** (After decisions made)
4. **Execute Restructure in Phases** (To avoid breaking everything)
5. **Update Documentation & Patterns** (Memory bank, guidelines)

---

## 📏 Success Criteria

When restructure is complete:

- [ ] No duplicate files with different locations
- [ ] All legacy/deprecated files removed
- [ ] Can find all code for a feature in predictable location(s)
- [ ] Clear pattern for where new code should live
- [ ] Related code is co-located (components + hooks + utils for a feature)
- [ ] Shared code is truly shared (used by multiple features)
- [ ] Import paths follow consistent pattern
- [ ] Table of Contents remains accurate and useful
- [ ] No build errors, all imports updated
- [ ] All tests still pass

---

*This is a living document. Update as decisions are made and work progresses.*
