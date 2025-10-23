# Season Edit Mode - Redesign Plan

## Problem Statement

Currently, the "Edit Season" button attempts to load existing seasons into the creation wizard, but this implementation is incomplete and creates a "no man's land" state where:
- The wizard doesn't load existing season data
- Users get stuck between steps with incomplete data
- Mid-season schedule changes (adding blackout weeks) aren't possible

## Solution: Separate Edit Functions

Replace the single "Edit Season" button with focused, purpose-built edit tools based on season state.

---

## Implementation Plan

### Phase 1: Schedule Manager (Priority - Most Common Use Case)

**Purpose:** Allow operators to add/remove blackout weeks for existing seasons

**Component:** `SeasonScheduleManager.tsx`

**Features:**
- Load existing season_weeks from database for a given season
- Display schedule in same format as ScheduleReview component
- Allow adding blackout weeks for future dates (week_number > currentPlayWeek)
- Allow removing blackout weeks that haven't been played yet
- Show conflicts with holidays/championships
- Save changes back to season_weeks table (UPDATE existing, INSERT new blackouts)

**Database Operations:**
- `SELECT * FROM season_weeks WHERE season_id = ? ORDER BY scheduled_date`
- `INSERT INTO season_weeks` for new blackout weeks
- `UPDATE season_weeks SET week_type = 'blackout', week_name = ?` for converted weeks
- `DELETE FROM season_weeks WHERE id = ?` for removed blackouts (if allowed)

**Restrictions:**
- Cannot edit weeks that have already been played (week_completed = true OR week_number <= currentPlayWeek)
- Cannot change regular weeks to blackouts if matches already exist
- Can only add future blackout weeks
- When adding blackout, shift all future week numbers accordingly

**UI Location:**
- Button in LeagueOverviewCard: "Manage Schedule"
- Shows for ALL seasons (active, upcoming, incomplete)
- Different permissions based on season status

---

### Phase 2: Season Settings Editor (For Upcoming Seasons)

**Purpose:** Edit basic season info before season starts

**Component:** `SeasonSettingsEditor.tsx` (Modal or separate page)

**Features:**
- Edit start date
- Edit season length
- Regenerate entire schedule based on new settings
- Only available for seasons with status = 'upcoming' AND no matches played

**Fields:**
- Start Date (Calendar component)
- Season Length (dropdown or input)

**On Save:**
- Regenerate schedule completely
- Delete all existing season_weeks
- Run schedule generation logic (same as wizard)
- Detect conflicts again
- INSERT new season_weeks

**UI Location:**
- Button in LeagueOverviewCard: "Edit Season Info"
- Only shows for `status = 'upcoming'` seasons

---

### Phase 3: Continue Incomplete Setup

**Purpose:** Resume wizard for seasons that were never completed

**Component:** Modified `SeasonCreationWizard.tsx`

**Features:**
- Detect incomplete seasons (seasons with no schedule or no teams)
- Load existing season data into wizard localStorage
- Resume at schedule review step
- Allow completing the setup

**Detection:**
- Season exists in database
- `hasSchedule = false` OR `hasTeams = false`

**UI Location:**
- Button in LeagueOverviewCard: "Continue Setup"
- Only shows for incomplete seasons

---

## Updated LeagueOverviewCard Button Logic

### Button Matrix by Season State:

| Season State | Buttons Available |
|--------------|------------------|
| **No Season** | "Create Season" |
| **Incomplete (no schedule/teams)** | "Continue Setup", "Delete Season" |
| **Upcoming (complete, not started)** | "Manage Schedule", "Edit Season Info", "Delete Season" |
| **Active (in progress)** | "Manage Schedule" |
| **Completed** | "Manage Schedule" (view only?), "Archive Season"? |

### Status Determination Logic:

```typescript
const getSeasonEditOptions = (season: Season, hasTeams: boolean, hasSchedule: boolean, currentPlayWeek: number) => {
  // No season exists
  if (!season) {
    return { showCreate: true };
  }

  // Incomplete season (partial wizard completion)
  if (!hasSchedule || !hasTeams) {
    return {
      showContinueSetup: true,
      showDelete: true,
    };
  }

  // Upcoming season (complete but not started)
  if (season.status === 'upcoming' && currentPlayWeek === 0) {
    return {
      showManageSchedule: true,
      showEditSeasonInfo: true,
      showDelete: true,
    };
  }

  // Active season (in progress)
  if (season.status === 'active') {
    return {
      showManageSchedule: true,
    };
  }

  // Completed season
  if (season.status === 'completed') {
    return {
      showManageSchedule: true, // View only or limited edits?
    };
  }

  return {};
};
```

---

## Changes to Existing Files

### `LeagueOverviewCard.tsx`
- Remove current "Edit Season" button logic
- Add new button rendering based on season state
- Add navigation to Schedule Manager
- Add navigation to Season Settings Editor
- Add navigation to Continue Setup

### `SeasonCreationWizard.tsx`
- Remove edit mode detection via `?seasonId` query param
- Keep wizard purely for creating NEW seasons
- (Optional) Add support for "resume incomplete" via different query param

### localStorage Cleanup
- Add utility to validate localStorage state matches URL/intent
- Clear stale wizard data on navigation
- Prevent "no man's land" by validating step/data consistency

---

## Implementation Order

1. **Phase 1: Schedule Manager** (highest priority - most common use case)
   - Build SeasonScheduleManager component
   - Load existing season_weeks from DB
   - Allow adding/removing blackout weeks
   - Save back to database

2. **Phase 2: Update LeagueOverviewCard Buttons**
   - Implement season state detection
   - Add conditional button rendering
   - Wire up navigation to Schedule Manager

3. **Phase 3: Season Settings Editor** (lower priority)
   - Build modal/page for editing season info
   - Implement schedule regeneration
   - Only for upcoming seasons

4. **Phase 4: Continue Incomplete Setup** (lowest priority)
   - Add resume logic to wizard
   - Load existing data into wizard state

---

## Testing Scenarios

### Schedule Manager Tests:
1. Add blackout week mid-season (week 8 of 16)
2. Remove blackout week that was added
3. Attempt to edit week that's already played (should be blocked)
4. Add multiple blackout weeks in sequence
5. Verify week numbers shift correctly after blackout insertion

### Season Settings Editor Tests:
1. Change start date for upcoming season
2. Change season length (increase and decrease)
3. Verify schedule regenerates correctly
4. Attempt to edit active season (should be blocked)

### Button Logic Tests:
1. No season → shows "Create Season"
2. Incomplete season → shows "Continue Setup" + "Delete"
3. Upcoming season → shows "Manage Schedule" + "Edit Info" + "Delete"
4. Active season → shows only "Manage Schedule"

---

## Future Enhancements

- **Championship date changes:** Allow editing BCA/APA dates and regenerating conflicts
- **Bulk schedule adjustments:** Move entire season forward/back by N weeks
- **Schedule templates:** Save/load common blackout patterns
- **Season cloning:** Copy season setup to create next season faster
