# Testing Infrastructure Setup Plan

## Goal
Set up a comprehensive testing suite to safely refactor the Season Creation Wizard

---

## Testing Stack

### Core Testing Libraries
1. **Vitest** - Fast unit test runner (better than Jest for Vite projects)
2. **React Testing Library** - Component testing
3. **@testing-library/user-event** - Simulate user interactions
4. **@testing-library/jest-dom** - Custom matchers for DOM
5. **MSW (Mock Service Worker)** - API mocking
6. **happy-dom** or **jsdom** - DOM environment for tests

---

## Installation Steps

### Step 1: Install Dependencies
```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom msw
```

### Step 2: Configure Vitest
Create `vitest.config.ts` in project root

### Step 3: Set up Test Utilities
Create `src/test/setup.ts` - global test setup
Create `src/test/utils.tsx` - custom render helpers

### Step 4: Configure TypeScript
Update `tsconfig.json` to include test types

---

## Test Structure

```
src/
├── __tests__/              # Test files
│   ├── unit/              # Unit tests for utilities
│   │   ├── scheduleUtils.test.ts
│   │   ├── tournamentUtils.test.ts
│   │   └── conflictDetection.test.ts
│   ├── integration/       # Integration tests for components
│   │   ├── SeasonCreationWizard.test.tsx
│   │   └── ScheduleReview.test.tsx
│   └── fixtures/          # Test data
│       ├── mockLeague.ts
│       └── mockSeasons.ts
└── test/                   # Test utilities
    ├── setup.ts           # Global test setup
    ├── utils.tsx          # Custom render functions
    └── mocks/             # MSW handlers
        └── handlers.ts    # API mock handlers
```

---

## What to Test First

### Priority 1: Utility Functions (Easiest, Highest Value)
These are pure functions - easy to test, no dependencies

1. **scheduleUtils.ts**
   - `generateSchedule()` - Test with various inputs
   - `calculateEndDate()` - Date math validation
   - Test edge cases: leap years, year boundaries

2. **tournamentUtils.ts**
   - `fetchChampionshipDateOptions()` - Mock Supabase calls
   - `submitChampionshipDates()` - Verify correct data sent

3. **conflictDetectionUtils.ts**
   - `detectScheduleConflicts()` - Holiday/championship conflicts
   - Test various conflict scenarios

4. **holidayUtils.ts**
   - `fetchHolidaysForSeason()` - Date range filtering
   - Test different time zones

### Priority 2: Component Logic (Medium Complexity)
Test components in isolation with mocked dependencies

1. **ScheduleReview Component**
   - Adding/removing blackout dates
   - Schedule regeneration
   - Conflict detection display
   - localStorage persistence

2. **SeasonStatusCard Component**
   - Display correct data
   - Edit button navigation
   - Conditional rendering

### Priority 3: Full Wizard Flow (Most Complex)
End-to-end testing of complete user flows

1. **Complete Season Creation**
   - Navigate through all steps
   - Fill in valid data
   - Submit successfully
   - Verify database calls

2. **Edit Existing Season**
   - Load existing data
   - Modify schedule
   - Save changes

3. **Championship Preferences**
   - Skip steps with saved preferences
   - Custom date entry
   - Ignore functionality

---

## Example Test Files

### Unit Test Example: scheduleUtils.test.ts
```typescript
import { describe, it, expect } from 'vitest';
import { generateSchedule } from '@/utils/scheduleUtils';

describe('generateSchedule', () => {
  it('should generate 16 weeks for a standard season', () => {
    const startDate = new Date('2025-01-01');
    const schedule = generateSchedule(startDate, 16, 'wednesday', []);

    expect(schedule).toHaveLength(16);
    expect(schedule[0].date).toBe('2025-01-01');
  });

  it('should skip blackout dates', () => {
    const startDate = new Date('2025-01-01');
    const blackouts = [{ date: '2025-01-08', name: 'Holiday' }];
    const schedule = generateSchedule(startDate, 16, 'wednesday', blackouts);

    expect(schedule.some(w => w.date === '2025-01-08')).toBe(false);
  });
});
```

### Integration Test Example: SeasonCreationWizard.test.tsx
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeasonCreationWizard } from '@/operator/SeasonCreationWizard';

describe('SeasonCreationWizard', () => {
  it('should complete season creation flow', async () => {
    const user = userEvent.setup();
    render(<SeasonCreationWizard />);

    // Step 1: Select start date
    await user.click(screen.getByText('2025-01-01'));
    await user.click(screen.getByText('Next'));

    // Step 2: Enter season length
    await user.type(screen.getByPlaceholderText('16'), '16');
    await user.click(screen.getByText('Next'));

    // ... continue through steps

    // Verify season created
    await waitFor(() => {
      expect(screen.getByText('Season created successfully')).toBeInTheDocument();
    });
  });
});
```

---

## Running Tests

### Commands to Add to package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

### Usage
- `pnpm test` - Run tests in watch mode
- `pnpm test:ui` - Open Vitest UI in browser
- `pnpm test:coverage` - Generate coverage report
- `pnpm test:run` - Run tests once (CI mode)

---

## Success Criteria (Updated - ROI Focused)

**COMPLETED:**
- [x] ✅ scheduleUtils.ts unit tests (9 tests passing)
- [x] ✅ Test infrastructure setup complete
- [x] ✅ Tests are fast (< 5 seconds)
- [x] ✅ Smoke test for wizard (renders without crashing) - 4 tests
- [x] ✅ Critical path test (create season with blackout date) - 4 tests

**TOTAL TEST COVERAGE: 17 tests in 3 files**
- Unit tests: 9 tests (scheduleUtils.ts)
- Integration smoke tests: 4 tests (wizard renders)
- Integration critical path tests: 4 tests (schedule generation logic)

**READY TO REFACTOR:** ✅ All tests passing, build successful

**SKIP FOR NOW (Low ROI):**
- ❌ Testing every UI interaction
- ❌ Form validation message tests
- ❌ 100% code coverage
- ❌ Mocking all Supabase calls

---

## Detailed Test Plans

### 1. Smoke Test for SeasonCreationWizard

**Purpose**: Verify the wizard renders without crashing and basic navigation works

**File**: `src/__tests__/integration/SeasonCreationWizard.smoke.test.tsx`

**Test Cases**:
1. ✅ Wizard renders successfully
2. ✅ "Back to League" button is present
3. ✅ Current step indicator is visible
4. ✅ Form fields render for the current step
5. ✅ No JavaScript errors on mount

**Estimated Time**: 15-20 minutes

**What to Mock**:
- Mock Supabase client (don't make real DB calls)
- Mock UserContext (logged in user)
- Mock React Router (useParams returns test leagueId)

---

### 2. Critical Path Test

**Purpose**: Test the most common user flow end-to-end

**File**: `src/__tests__/integration/SeasonCreationWizard.critical.test.tsx`

**Test Flow**:
1. ✅ Render wizard for league
2. ✅ Fill in season name
3. ✅ Select start date
4. ✅ Enter season length (16 weeks)
5. ✅ Select league day (Wednesday)
6. ✅ Add one blackout date
7. ✅ Verify schedule generates correctly
8. ✅ Verify schedule has 16 regular weeks + 1 break + 1 playoff

**Estimated Time**: 30-40 minutes

**What to Mock**:
- Supabase insert/update calls (return success)
- Championship preferences fetch (return empty/default)

---

## Benefits of This Approach

1. **Safety Net** - Catch regressions immediately
2. **Documentation** - Tests show how code should work
3. **Confidence** - Refactor without fear
4. **Faster Development** - Find bugs before manual testing
5. **Better Design** - Testable code is better code

---

## Next Steps

1. Install dependencies
2. Configure Vitest
3. Write first test (simplest utility function)
4. Expand test coverage gradually
5. Once coverage is good → Start refactoring with confidence

---

*Let's build this test suite before touching any wizard code!*
