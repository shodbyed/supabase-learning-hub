# Active Context

## Current Work Focus

### **✅ COMPLETED: Season Creation Database Schema & Wizard Integration** 🎉
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

**Test Results**:
```
✅ Season created: 2b860873-2a78-4417-b7ca-cd52de9c8a03
🔄 Inserting 20 weeks into season_weeks table (deduplicated)
✅ Season schedule saved: 20 weeks
```

**Next Steps**:
- Commit and push database schema files
- Update memory bank documentation
- Ready for team creation and schedule display features

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

### **Previously Completed: Season Creation Wizard with Championship Dates & Holiday System**
**Implementation Date**: 2025-01-07
**Status**: ✅ **WIZARD COMPLETE, DATABASE INTEGRATION COMPLETE**

**What's Been Built**:
- Championship dates system (BCA/APA) with community voting database
- Holiday selection using `date-holidays` package
- Initial season schedule generation with blackout weeks
- Conflict detection and interactive resolution
- Schedule review with editable weeks
- Full wizard flow from start to database save

## Recent Changes

### **Database Schema Simplification**
**Key Changes**:
- Removed `holidays`, `bca_championship`, `apa_championship` from seasons table
- These are fetched on-demand during schedule creation/editing
- Operator re-evaluates skip/play decision each time they edit
- Final decision baked into season_weeks as blackout rows

### **Season Weeks Unified Design**
**Architecture**:
- One table for everything: regular weeks, blackouts, playoffs, season-end breaks
- User sees full calendar sorted by date
- Blackout weeks show reason ("Thanksgiving", "Venue Closed")
- Easy to add/remove blackouts without regenerating entire schedule

## Next Steps

### **🎯 Immediate: Commit Database Schema**
- [database/seasons.sql](database/seasons.sql)
- [database/season_weeks.sql](database/season_weeks.sql)
- [database/README_DATABASE_INTEGRATION.md](database/README_DATABASE_INTEGRATION.md)
- Updated TypeScript types and wizard integration

### **🔜 Team Creation System**
**Next Major Feature**:
- Design teams database table
- Team registration wizard
- Link teams to seasons
- Home venue assignment
- Captain/player roster management

### **🔜 Schedule Display**
**After Teams Exist**:
- Load season schedule from season_weeks table
- Display full calendar to users
- Show blackout weeks with reasons
- Week completion status
- Navigation to match scoring (future)

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

## Current Status Summary

✅ **Database Schema**: Complete, tested, production-ready
✅ **Season Creation Wizard**: Full database integration working
✅ **Conflict Detection**: Refactored, tested, DRY principle applied
✅ **Schedule Generation**: Working with blackouts and playoffs
✅ **Transaction Safety**: Rollback on failure prevents orphaned records
🔄 **Team Creation**: Next major feature to implement
🔄 **Schedule Display**: Waiting for teams to exist
