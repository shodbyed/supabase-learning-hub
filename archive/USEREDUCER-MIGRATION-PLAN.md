# useReducer Migration Plan - Season Creation Wizard

## ⚠️ CRITICAL: Incremental Migration Strategy
**Strategy: Migrate ONE state at a time → Test → Commit → Next state**

This is a VERY risky refactoring. We must be extremely careful.

---

## Current State Analysis

### All useState Hooks (16 total)
1. `league` - League | null
2. `existingSeasons` - Season[]
3. `bcaDateOptions` - ChampionshipDateOption[]
4. `apaDateOptions` - ChampionshipDateOption[]
5. `savedChampionshipPreferences` - ChampionshipPreference[]
6. `loading` - boolean
7. `error` - string | null
8. `currentStep` - number (with localStorage init)
9. `isEditingExistingSeason` - boolean
10. `isCreating` - boolean
11. `_refreshKey` - number (force re-render)
12. `validationError` - string | null
13. `dayOfWeekWarning` - object | null
14. `schedule` - WeekEntry[]
15. `seasonStartDate` - string
16. `holidays` - any[]
17. `bcaChampionship` - ChampionshipEvent | undefined
18. `apaChampionship` - ChampionshipEvent | undefined

---

## Migration Order (Safest → Riskiest)

### Group 1: Simple Boolean/String Flags (SAFEST)
These are the simplest - just boolean or string values that don't affect critical logic.

1. ✅ `loading` (boolean) - Simple flag
2. ✅ `error` (string | null) - Simple message
3. ✅ `validationError` (string | null) - Simple message
4. ✅ `isCreating` (boolean) - Simple flag
5. ✅ `isEditingExistingSeason` (boolean) - Simple flag

### Group 2: UI State (SAFE)
These affect UI but not core schedule logic.

6. ✅ `_refreshKey` (number) - Force re-render
7. ✅ `dayOfWeekWarning` (object | null) - Modal state

### Group 3: Navigation State (MEDIUM RISK)
8. ✅ `currentStep` (number) - Critical for wizard flow, but well-tested

### Group 4: Data Loading State (MEDIUM RISK)
These hold fetched data but don't directly affect schedule generation.

9. ✅ `league` (League | null) - Fetched once on mount
10. ✅ `existingSeasons` (Season[]) - Fetched once on mount
11. ✅ `bcaDateOptions` (ChampionshipDateOption[]) - Fetched once on mount
12. ✅ `apaDateOptions` (ChampionshipDateOption[]) - Fetched once on mount
13. ✅ `savedChampionshipPreferences` (ChampionshipPreference[]) - Fetched once on mount

### Group 5: Schedule-Related State (HIGH RISK - DO LAST)
These are CRITICAL to schedule generation logic. Any mistakes here break everything.

14. ❌ `schedule` (WeekEntry[]) - **CORE SCHEDULE DATA**
15. ❌ `seasonStartDate` (string) - Used in schedule generation
16. ❌ `holidays` (any[]) - Used in conflict detection
17. ❌ `bcaChampionship` (ChampionshipEvent) - Used in conflict detection
18. ❌ `apaChampionship` (ChampionshipEvent) - Used in conflict detection

---

## Phase-by-Phase Migration Plan

### Phase 1: Setup Reducer Infrastructure (30 min)
**Risk**: 🟢 LOW - No functional changes yet

1. Create reducer file `src/operator/wizardReducer.ts`
2. Define initial state type
3. Define action types
4. Create reducer function (handles only ONE state to start)
5. Add useReducer hook alongside existing useState
6. **DO NOT REMOVE ANY useState YET**
7. Test that app still works
8. Commit: "Add wizardReducer infrastructure (no migration yet)"

### Phase 2: Migrate Group 1 - Simple Flags (1 hour)
**Risk**: 🟢 LOW - Simple boolean/string values

#### Step 2.1: Migrate `loading`
- Add `loading` to reducer state
- Add `SET_LOADING` action
- Replace `setLoading` calls with dispatch
- Remove `useState` for `loading`
- **TEST**: App loads, loading spinner works
- Commit: "Migrate loading state to useReducer"

#### Step 2.2: Migrate `error`
- Add `error` to reducer state
- Add `SET_ERROR` action
- Replace `setError` calls with dispatch
- Remove `useState` for `error`
- **TEST**: Error messages display correctly
- Commit: "Migrate error state to useReducer"

#### Step 2.3: Migrate `validationError`
- Add `validationError` to reducer state
- Add `SET_VALIDATION_ERROR` action
- Replace `setValidationError` calls with dispatch
- Remove `useState` for `validationError`
- **TEST**: Form validation works
- Commit: "Migrate validationError state to useReducer"

#### Step 2.4: Migrate `isCreating`
- Add `isCreating` to reducer state
- Add `SET_IS_CREATING` action
- Replace `setIsCreating` calls with dispatch
- Remove `useState` for `isCreating`
- **TEST**: "Creating Season..." button works
- Commit: "Migrate isCreating state to useReducer"

#### Step 2.5: Migrate `isEditingExistingSeason`
- Add `isEditingExistingSeason` to reducer state
- Add `SET_IS_EDITING_EXISTING_SEASON` action
- Replace `setIsEditingExistingSeason` calls with dispatch
- Remove `useState` for `isEditingExistingSeason`
- **TEST**: Edit mode detection works
- Commit: "Migrate isEditingExistingSeason state to useReducer"

**After Group 1 Complete:**
- Run full test suite: `pnpm test:run`
- Manual test: Create a season from start to finish
- If ALL tests pass → Continue
- If ANY test fails → Rollback immediately

---

### Phase 3: Migrate Group 2 - UI State (30 min)
**Risk**: 🟢 LOW - UI-only state

#### Step 3.1: Migrate `_refreshKey`
- Add `_refreshKey` to reducer state
- Add `INCREMENT_REFRESH_KEY` action
- Replace `setRefreshKey` calls with dispatch
- Remove `useState` for `_refreshKey`
- **TEST**: Form updates trigger re-renders
- Commit: "Migrate refreshKey state to useReducer"

#### Step 3.2: Migrate `dayOfWeekWarning`
- Add `dayOfWeekWarning` to reducer state
- Add `SET_DAY_OF_WEEK_WARNING` action
- Replace `setDayOfWeekWarning` calls with dispatch
- Remove `useState` for `dayOfWeekWarning`
- **TEST**: Day of week warning modal works
- Commit: "Migrate dayOfWeekWarning state to useReducer"

**After Group 2 Complete:**
- Run full test suite: `pnpm test:run`
- Manual test: Change start date to different day of week
- If ALL tests pass → Continue
- If ANY test fails → Rollback immediately

---

### Phase 4: Migrate Group 3 - Navigation State (45 min)
**Risk**: 🟡 MEDIUM - Critical for wizard flow

#### Step 4.1: Migrate `currentStep`
- Add `currentStep` to reducer state (with localStorage init logic)
- Add `SET_CURRENT_STEP` action
- Replace `setCurrentStep` calls with dispatch
- **IMPORTANT**: Keep localStorage sync logic working
- Remove `useState` for `currentStep`
- **TEST**: Navigation buttons work
- **TEST**: localStorage persistence works
- **TEST**: Refresh page maintains current step
- Commit: "Migrate currentStep state to useReducer"

**After Group 3 Complete:**
- Run full test suite: `pnpm test:run`
- Manual test: Navigate through all wizard steps
- Manual test: Refresh page at different steps
- If ALL tests pass → Continue
- If ANY test fails → Rollback immediately

---

### Phase 5: Migrate Group 4 - Data Loading State (1 hour)
**Risk**: 🟡 MEDIUM - Affects data loading

#### Step 5.1: Migrate `league`
- Add `league` to reducer state
- Add `SET_LEAGUE` action
- Replace `setLeague` calls with dispatch
- Remove `useState` for `league`
- **TEST**: League data loads correctly
- Commit: "Migrate league state to useReducer"

#### Step 5.2: Migrate `existingSeasons`
- Add `existingSeasons` to reducer state
- Add `SET_EXISTING_SEASONS` action
- Replace `setExistingSeasons` calls with dispatch
- Remove `useState` for `existingSeasons`
- **TEST**: Existing seasons detection works
- Commit: "Migrate existingSeasons state to useReducer"

#### Step 5.3: Migrate `bcaDateOptions`
- Add `bcaDateOptions` to reducer state
- Add `SET_BCA_DATE_OPTIONS` action
- Replace `setBcaDateOptions` calls with dispatch
- Remove `useState` for `bcaDateOptions`
- **TEST**: BCA date options load correctly
- Commit: "Migrate bcaDateOptions state to useReducer"

#### Step 5.4: Migrate `apaDateOptions`
- Add `apaDateOptions` to reducer state
- Add `SET_APA_DATE_OPTIONS` action
- Replace `setApaDateOptions` calls with dispatch
- Remove `useState` for `apaDateOptions`
- **TEST**: APA date options load correctly
- Commit: "Migrate apaDateOptions state to useReducer"

#### Step 5.5: Migrate `savedChampionshipPreferences`
- Add `savedChampionshipPreferences` to reducer state
- Add `SET_SAVED_CHAMPIONSHIP_PREFERENCES` action
- Replace `setSavedChampionshipPreferences` calls with dispatch
- Remove `useState` for `savedChampionshipPreferences`
- **TEST**: Saved preferences work correctly
- **TEST**: Auto-skip logic works
- Commit: "Migrate savedChampionshipPreferences state to useReducer"

**After Group 4 Complete:**
- Run full test suite: `pnpm test:run`
- Manual test: Complete wizard with championship dates
- Manual test: Verify saved preferences work
- If ALL tests pass → Continue
- If ANY test fails → Rollback immediately

---

### Phase 6: Migrate Group 5 - Schedule State (STOP AND EVALUATE)
**Risk**: 🔴 HIGH - Core schedule generation logic

⛔ **DO NOT PROCEED WITHOUT:**
1. All previous phases complete and tested
2. Full test suite passing
3. Manual testing complete
4. Fresh backup of working code
5. Extra careful review session

#### Step 6.1: Migrate `seasonStartDate`
- Add `seasonStartDate` to reducer state
- Add `SET_SEASON_START_DATE` action
- Replace `setSeasonStartDate` calls with dispatch
- Remove `useState` for `seasonStartDate`
- **TEST**: Schedule generation uses correct start date
- Commit: "Migrate seasonStartDate state to useReducer"

#### Step 6.2: Migrate `holidays`
- Add `holidays` to reducer state
- Add `SET_HOLIDAYS` action
- Replace `setHolidays` calls with dispatch
- Remove `useState` for `holidays`
- **TEST**: Holiday conflicts detected correctly
- Commit: "Migrate holidays state to useReducer"

#### Step 6.3: Migrate `bcaChampionship`
- Add `bcaChampionship` to reducer state
- Add `SET_BCA_CHAMPIONSHIP` action
- Replace `setBcaChampionship` calls with dispatch
- Remove `useState` for `bcaChampionship`
- **TEST**: BCA championship conflicts work
- Commit: "Migrate bcaChampionship state to useReducer"

#### Step 6.4: Migrate `apaChampionship`
- Add `apaChampionship` to reducer state
- Add `SET_APA_CHAMPIONSHIP` action
- Replace `setApaChampionship` calls with dispatch
- Remove `useState` for `apaChampionship`
- **TEST**: APA championship conflicts work
- Commit: "Migrate apaChampionship state to useReducer"

#### Step 6.5: Migrate `schedule` (MOST CRITICAL)
- Add `schedule` to reducer state
- Add `SET_SCHEDULE` action
- Replace `setSchedule` calls with dispatch
- **IMPORTANT**: Keep `handleScheduleChange` callback working
- Remove `useState` for `schedule`
- **TEST**: Schedule generation works
- **TEST**: Blackout dates work
- **TEST**: Schedule saves to database correctly
- Commit: "Migrate schedule state to useReducer"

**After Group 5 Complete:**
- Run full test suite: `pnpm test:run`
- Manual test: Create complete season with blackouts
- Manual test: Verify database saves correctly
- Manual test: Edit existing season
- If ALL tests pass → Done!
- If ANY test fails → Rollback immediately

---

## Testing Checklist (After EACH Migration)

### Automated Tests
- [ ] `pnpm test:run` - All 17 tests pass
- [ ] `pnpm run build` - No TypeScript errors

### Manual Tests
- [ ] Wizard loads without errors
- [ ] Can navigate forward through all steps
- [ ] Can navigate backward through all steps
- [ ] Form data persists in localStorage
- [ ] Page refresh maintains wizard state
- [ ] Can create a complete season
- [ ] Can add blackout dates
- [ ] Schedule generates correctly
- [ ] Championship conflicts detected
- [ ] Season saves to database
- [ ] Can navigate to created season

---

## Rollback Plan

If ANY step fails:
```bash
git reset --hard HEAD~1
pnpm test:run
```

Do NOT attempt to "fix forward" - just rollback and analyze.

---

## Time Estimate

- Phase 1 (Setup): 30 min
- Phase 2 (Group 1): 1 hour
- Phase 3 (Group 2): 30 min
- Phase 4 (Group 3): 45 min
- Phase 5 (Group 4): 1 hour
- Phase 6 (Group 5): 2 hours

**Total**: ~6 hours (spread over multiple sessions)

---

## Success Criteria

✅ All useState hooks converted to useReducer
✅ All 17 automated tests passing
✅ Manual testing complete
✅ No regressions in functionality
✅ Code is more maintainable

---

## Notes

- **DO NOT** rush this migration
- **DO NOT** skip testing steps
- **DO NOT** migrate multiple states in one commit
- **ALWAYS** commit after each successful migration
- **ALWAYS** run tests before moving to next state
- If unsure, STOP and ask for help

---

*This is a HIGH-RISK refactoring. Be patient and methodical.*
