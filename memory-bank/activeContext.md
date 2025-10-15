# Active Context

## Current Work Focus

### **✅ COMPLETED: Schedule Display & Match Generation System** 🎉
**Implementation Date**: 2025-01-15
**Status**: ✅ **PRODUCTION READY - FULL WORKFLOW COMPLETE**

**What Was Built**:
- Complete schedule display page showing all week types (regular, playoffs, blackouts, breaks)
- Schedule generator refactored into testable single-responsibility functions
- Match generation with venue-specific table numbering
- Clear schedule functionality for regeneration
- Accept schedule button to activate season and complete league setup

**Key Features Implemented**:

1. **Schedule Display Page** ([SeasonSchedulePage.tsx](../src/operator/SeasonSchedulePage.tsx))
   - Displays ALL week types (not just regular weeks)
   - Visual styling for different week types:
     - Playoffs: Purple background
     - Breaks: Yellow background with "BREAK" badge
     - Blackouts: Normal styling (no badge per user request)
   - Venue display with "Venue TBD" for unassigned venues
   - Venue-specific table numbering (each venue counts tables independently)
   - Shows "Matchups TBD" for playoff weeks

2. **Schedule Generator Refactor** ([scheduleGenerator.ts](../src/utils/scheduleGenerator.ts))
   - Broke monolithic function into 6 single-responsibility functions:
     - `validateTeams()` - Validates teams array
     - `fetchSeasonWeeks()` - Fetches regular season weeks only
     - `buildTeamPositionMap()` - Creates position-to-team lookup
     - `generateWeekMatches()` - Generates matches for a single week
     - `generateAllMatches()` - Orchestrates match generation for entire season
     - `insertMatches()` - Inserts match records into database
   - Main `generateSchedule()` function now orchestrates these helpers
   - More testable, maintainable, and easier to debug

3. **Venue-Specific Table Numbering**
   - `calculateTableNumbers()` function computes table numbers per venue within each week
   - Example: Week 1 has 5 matches (3 at Venue A, 2 at Venue B)
     - Venue A: Tables 1, 2, 3
     - Venue B: Tables 1, 2
   - Table numbers only shown when venue is assigned

4. **Clear Schedule Functionality**
   - `clearSchedule()` function deletes all matches for a season
   - Returns count of deleted matches
   - Allows operators to regenerate schedule if needed

5. **Accept Schedule & Complete Setup**
   - "Accept Schedule & Complete Setup" button finalizes league creation
   - Updates season status from `'upcoming'` to `'active'`
   - Navigates user back to league dashboard
   - Completes the entire league generation workflow

**Navigation Flow**:
```
League Creation Wizard → Season Creation → Team Management → Schedule Setup →
Schedule Generation → Schedule Display → Accept Schedule → League Dashboard (Active)
```

**Database Integration**:
- Matches table stores all generated matchups
- Links to season_weeks, teams, and venues tables
- RLS policies ensure operators can only access their own league's matches
- Season status updated to 'active' when schedule is accepted

**Files Modified**:
- `/src/operator/SeasonSchedulePage.tsx` - Complete schedule display with accept/clear functionality
- `/src/utils/scheduleGenerator.ts` - Refactored into testable functions, added clearSchedule()
- `/src/operator/ScheduleSetupPage.tsx` - Wrapper page for schedule generation
- `/src/navigation/NavRoutes.tsx` - Added schedule routes

**Known Issues to Address Next**:
1. **Week 17 + Playoffs Duplication**: Season wizard creating both "Week 17" AND a separate "Playoffs" week
   - Should only have one playoff week
   - Need to fix season creation logic

2. **Blackout Week Names**: Week names include parenthetical warnings like "Thanksgiving (Monday 2 days before)"
   - These warnings should not be stored in the database
   - Need to clean up week name generation in season wizard

**User Experience Improvements**:
- Season schedule subtitle shows only season name (removed redundant league name)
- Playoff weeks clearly marked with purple background and "Matchups TBD" message
- Blackout weeks display cleanly without badges or red coloring
- Clear confirmation dialogs for both clearing and accepting schedule

---

### **🎯 NEXT: Fix Season Week Storage Issues**
**Priority**: High
**Focus**: Season Creation Wizard data quality issues

**Problems Identified**:
1. **Duplicate Playoff Week**
   - System creating "Week 17" (marked as regular) AND "Playoffs" week
   - Should only have 16 regular weeks + 1 playoff week for a 16-week season
   - Issue in [scheduleUtils.ts](../src/utils/scheduleUtils.ts) or wizard logic

2. **Week Name Pollution**
   - Blackout week names storing UI warnings: "Thanksgiving (Monday 2 days before)"
   - These parenthetical notes should be UI-only, not database values
   - Need to separate display text from stored data in [SeasonCreationWizard.tsx](../src/operator/SeasonCreationWizard.tsx)

**Investigation Needed**:
- Review [scheduleUtils.ts](../src/utils/scheduleUtils.ts) `generateSchedule()` function
- Check how `seasonLength` parameter is being used
- Verify week type assignment logic
- Clean up week name generation to remove conflict warnings before database insert

---

### **Previously Completed: Season Creation Database Schema & Wizard Integration** 🎉
**Implementation Date**: 2025-01-11
**Status**: ✅ **PRODUCTION READY - TESTED IN LOCAL DATABASE**

**What Was Built**:
- Complete database schema for season scheduling with normalized table structure
- Season creation wizard now saves to database (seasons + season_weeks tables)
- Unified season_weeks table storing all calendar dates (regular, blackouts, playoffs, breaks)
- Transaction-like rollback behavior if weeks insertion fails
- Successful test: Created season with 20 weeks in local Supabase

**Database Architecture**:
- **seasons table**: Simple metadata (season_name, dates, length, status)
  - Removed holidays/championships columns - fetched on-demand
  - Each season just tracks basic info

- **season_weeks table**: Unified calendar storage
  - Each row = one calendar date
  - `week_type`: 'regular' | 'blackout' | 'playoffs' | 'season_end_break'
  - `week_completed`: Boolean for locking past weeks from editing
  - `scheduled_date`: Primary sort key (no week_number needed)
  - Blackout weeks visible to users with reason displayed

**Key Design Decisions**:
1. **One Table for All Weeks**: Regular + blackouts + playoffs all in season_weeks
   - User sees full calendar including skipped dates with reasons
   - Easy add/remove blackouts by inserting/deleting rows
   - Sortable by date, no artificial week numbering

2. **Fetch Holidays/Championships On-Demand**: Not stored in seasons table
   - Operator re-evaluates skip/play decision each edit session
   - Championships can change - always fetch latest
   - Final decision baked into season_weeks as blackout rows or absence

3. **week_completed Column**: Fast locking mechanism
   - Boolean check prevents editing past weeks
   - Updated when all matches for week are scored
   - No need to query match_results table for every week

4. **Rollback Protection**: Manual transaction-like behavior
   - If weeks insertion fails, season record is deleted
   - Either both succeed or neither exists in database
   - Console logs show rollback process

**Type Mapping Fix**:
- UI uses `type: 'week-off'` generically
- Database expects specific types: 'season_end_break' | 'blackout'
- Wizard maps: schedule week-offs → 'season_end_break', blackout week-offs → 'blackout'

**Deduplication**:
- Schedule and blackoutWeeks kept separate in UI
- Deduplicated before database insert (blackout takes precedence)
- Prevents unique constraint violations on (season_id, scheduled_date)

**Files Created/Modified**:
- `/database/seasons.sql` - Clean seasons table (no schedule/holidays/championships)
- `/database/season_weeks.sql` - Unified calendar table with week_type and week_completed
- `/database/README_DATABASE_INTEGRATION.md` - Complete integration guide for partner
- `/src/types/season.ts` - Updated Season and SeasonWeek interfaces
- `/src/operator/SeasonCreationWizard.tsx` - Full database integration with rollback
- `/memory-bank/databaseSchema.md` - Updated with new schema design

---

### **Previously Completed: Schedule Conflict Detection Refactoring** 🎉
**Implementation Date**: 2025-01-10
**Status**: ✅ **PRODUCTION READY**

**What Was Built**:
- Extracted ~180 lines of duplicated conflict detection logic into shared utilities
- Created centralized constants for magic numbers and severity ordering
- Broke complex functions into small, testable, single-purpose helpers
- Two-pass algorithm for "closest league night only" conflict detection

**DRY Violation Eliminated**:
- Before: ScheduleReview.tsx and SeasonCreationWizard.tsx had duplicate code
- After: Single source of truth in `/src/utils/conflictDetectionUtils.ts`
- Impact: Bug fixes now only needed once, testing burden halved

**Files Created/Modified**:
- `/src/constants/scheduleConflicts.ts` - CONFLICT_DETECTION_THRESHOLD_DAYS, SEVERITY_ORDER, STORAGE_KEYS
- `/src/utils/conflictDetectionUtils.ts` - 6 helper functions (detectScheduleConflicts, buildConflictList, etc.)
- `/src/components/season/ScheduleReview.tsx` - Reduced from ~140 lines to ~20 lines
- `/src/components/season/ScheduleWeekRow.tsx` - Uses getHighestSeverity() helper
- `/src/operator/SeasonCreationWizard.tsx` - Uses shared conflict detection

---

## Active Decisions and Considerations

### **Unified Calendar vs Separate Tables**
**Decision**: One unified season_weeks table for all week types
**Rationale**:
- User wants to see full calendar including blackouts
- Simplifies display logic (one query, sort by date)
- Easy add/remove blackouts (just insert/delete rows)
- Same structure for all week types (flexible, queryable)

### **Store Championships or Fetch On-Demand?**
**Decision**: Fetch on-demand, don't store in seasons table
**Rationale**:
- Championship dates subject to change (operator needs latest data)
- Operator re-evaluates skip/play decision during each edit session
- Final decision baked into season_weeks (blackout or absence)
- Keeps seasons table simple and focused

### **Week Numbering Strategy**
**Decision**: No week_number column, sort by scheduled_date
**Rationale**:
- Date is natural sort key
- No artificial week numbering to maintain
- Blackout weeks have dates but no week numbers
- Simpler schema, easier queries

### **Week Completion Tracking**
**Decision**: Boolean column on season_weeks table
**Rationale**:
- Fast check for locking past weeks (no join to match_results)
- Set to true when all matches scored
- UI disables editing for completed weeks
- Prevents accidental changes to finished weeks

### **Venue-Specific Table Numbering**
**Decision**: Calculate table numbers per venue within each week
**Rationale**:
- Multiple venues can host matches simultaneously
- Each venue needs independent table numbering (Table 1, Table 2, etc.)
- Calculated on display, not stored in database
- More flexible for venue changes

---

## Current Status Summary

✅ **Database Schema**: Complete, tested, production-ready
✅ **Season Creation Wizard**: Full database integration working
✅ **Conflict Detection**: Refactored, tested, DRY principle applied
✅ **Schedule Generation**: Refactored into testable functions
✅ **Schedule Display**: Complete with all week types, venue-specific tables
✅ **Match Generation**: Working with proper team position mapping
✅ **Clear Schedule**: Allows regeneration of matches
✅ **Accept Schedule**: Activates season and completes league setup
✅ **League Creation Flow**: End-to-end workflow complete
🔄 **Season Week Storage**: Next - fix duplicate playoff week and clean week names
🔜 **Mobile App**: Partner will mirror database operations for scorekeeping
