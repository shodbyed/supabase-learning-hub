# Season Creation Wizard - Refactoring Plan

## ⚠️ CRITICAL: This wizard is fragile - we've fixed/broken it many times
**Strategy: One small change → Test → Commit → Next change**

---

## Current State Analysis

### File Stats
- **File**: `src/operator/SeasonCreationWizard.tsx`
- **Lines**: 1,114 lines
- **Complexity**: Very High
- **Responsibilities**: 10+ different concerns

### What's Working (DO NOT TOUCH)
✅ Schedule generation with blackout dates
✅ Championship date preferences
✅ Day of week validation
✅ localStorage persistence
✅ Edit existing season mode
✅ ScheduleReview integration

---

## Identified Issues

### 1. ❌ Duplicate Championship Preference Fetching
**Location**: Lines 126-155 and 292-322
**Risk Level**: LOW
**Impact**: Code duplication, harder to maintain
**Fix**: Extract to reusable function

### 2. ❌ Complex Schedule Generation useEffect
**Location**: Lines 223-368 (150+ lines in one useEffect)
**Risk Level**: MEDIUM
**Impact**: Hard to test, hard to understand
**Fix**: Extract to custom hook

### 3. ❌ Too Many useState Hooks (13+)
**Location**: Lines 47-88
**Risk Level**: HIGH - Could break everything
**Impact**: State management complexity
**Fix**: Consider useReducer (SKIP FOR NOW - too risky)

### 4. ❌ Inline Step Handlers in JSX
**Location**: Lines 934-969
**Risk Level**: LOW
**Impact**: Harder to test
**Fix**: Extract to named function

---

## Refactoring Plan - Phase by Phase

### Phase 1: Extract Duplicate Championship Logic (SAFEST)
**Risk**: 🟢 LOW
**Time**: 15 minutes
**Files to modify**: 1 file

#### Step 1.1: Extract fetchChampionshipPreferences function
- [ ] Create new function `fetchChampionshipPreferences(operatorId: string)` at top of component
- [ ] Replace first occurrence (lines 126-155) with function call
- [ ] **TEST**: Run build, verify no TypeScript errors
- [ ] **TEST**: Manual test - create new season, check championship steps
- [ ] **COMMIT**: "Extract fetchChampionshipPreferences function"

#### Step 1.2: Replace second occurrence
- [ ] Replace second occurrence (lines 292-322) with same function call
- [ ] **TEST**: Run build, verify no TypeScript errors
- [ ] **TEST**: Manual test - create season, toggle blackout dates
- [ ] **COMMIT**: "Remove duplicate championship fetching logic"

**Success Criteria**:
- ✅ Build passes
- ✅ Can create new season
- ✅ Championship preferences load correctly
- ✅ BCA/APA steps work
- ✅ No console errors

---

### Phase 2: Extract Step Handler Function (SAFE)
**Risk**: 🟢 LOW
**Time**: 10 minutes
**Files to modify**: 1 file

#### Step 2.1: Extract handleEdit function
- [ ] Move `handleEdit` function (lines 939-949) outside the inline IIFE
- [ ] Make it a proper function in component body
- [ ] **TEST**: Run build
- [ ] **TEST**: Manual test - click "Edit" buttons on SeasonStatusCard
- [ ] **COMMIT**: "Extract handleEdit function from inline JSX"

**Success Criteria**:
- ✅ Build passes
- ✅ Edit buttons navigate to correct step
- ✅ Form data persists

---

### Phase 3: STOP HERE FOR NOW ⛔

We should NOT proceed with Phase 3 (extracting the complex useEffect) until:
1. We have automated tests in place
2. We've verified Phases 1 and 2 work perfectly
3. We have a full database backup

**Why stop here?**
- The schedule generation useEffect is the CORE of the wizard
- It's been broken and fixed multiple times
- Without tests, refactoring it is extremely risky
- Better to leave working code alone until we have test coverage

---

## Testing Strategy (TO BE IMPLEMENTED)

### Unit Tests Needed
1. **Championship Preference Fetching**
   - Test with valid operatorId
   - Test with no preferences saved
   - Test with BCA only
   - Test with APA only
   - Test with both ignored

2. **Schedule Generation Logic**
   - Test with 16-week season
   - Test with blackout dates
   - Test with championship dates
   - Test with season end break

3. **Date Validation**
   - Test day of week changes
   - Test start date validation
   - Test championship date conflicts

### Integration Tests Needed
1. **Full Wizard Flow**
   - Complete new season creation
   - Edit existing season
   - Skip championship steps with saved preferences
   - Add blackout dates
   - Remove blackout dates

### React Testing Library Tests
1. **Step Navigation**
   - Next button behavior
   - Previous button behavior
   - Step validation

2. **Form Persistence**
   - localStorage saving
   - localStorage restoration
   - Clear form button

---

## Rollback Plan

If ANY phase breaks functionality:

1. **Immediate Rollback**
   ```bash
   git reset --hard HEAD~1
   ```

2. **Document What Broke**
   - Add to this file under "Failed Attempts"
   - Note exact error and steps to reproduce

3. **Pause Refactoring**
   - Do NOT attempt to fix forward
   - Review what went wrong
   - Adjust plan

---

## Success Metrics

### Phase 1 Complete ✅
- [ ] Code duplication reduced by ~30 lines
- [ ] Build passes
- [ ] Manual testing passes
- [ ] No console errors
- [ ] Git commits are clean and descriptive

### Phase 2 Complete ✅
- [ ] Step handlers are testable
- [ ] Build passes
- [ ] Edit functionality works
- [ ] No regressions

---

## Notes

- **DO NOT** attempt to refactor the schedule generation useEffect without tests
- **DO NOT** convert to useReducer without extensive testing
- **DO NOT** extract components without careful consideration
- **ALWAYS** test after each small change
- **ALWAYS** commit working code before next change

---

## Failed Attempts (Historical Record)

### Attempt 1: [Date]
**What**: [Description]
**Result**: [What broke]
**Lesson**: [What we learned]

---

## Next Steps After This Refactor

1. **Set up testing infrastructure**
   - Install React Testing Library
   - Install MSW for API mocking
   - Create test utilities

2. **Write tests for existing functionality**
   - Start with unit tests for utils
   - Add integration tests for wizard flow
   - Add E2E tests with Playwright/Cypress

3. **Only then**: Continue with deeper refactoring

---

*Last Updated: [Current Date]*
*Status: Planning Phase*
*Current Phase: None (Waiting for approval)*
