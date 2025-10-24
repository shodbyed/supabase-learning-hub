# Team Building Wizard - Test Plan

## Overview
This test plan ensures the team building wizard refactoring maintains all existing functionality while implementing new patterns and components.

## Test Strategy

### Test Levels
1. **Unit Tests** - Individual components and utilities
2. **Integration Tests** - Component interactions and workflows
3. **Smoke Tests** - Basic rendering and critical paths

### Test Framework
- **Vitest** - Test runner
- **React Testing Library** - Component testing
- **@testing-library/user-event** - User interaction simulation

## Test Coverage

### 1. CapitalizeInput Component (Unit Tests)
**File:** `src/components/ui/__tests__/capitalize-input.test.tsx`

#### Test Cases:
- [ ] Renders with default props
- [ ] Displays label when provided
- [ ] Shows input field with placeholder
- [ ] Shows checkbox toggle when `hideCheckbox={false}`
- [ ] Hides checkbox toggle when `hideCheckbox={true}`
- [ ] Checkbox is checked by default when `defaultCapitalize={true}`
- [ ] User can type into input field
- [ ] Pressing Enter formats text when auto-capitalize is on
- [ ] Pressing Enter does nothing when auto-capitalize is off
- [ ] onChange callback receives raw value during typing
- [ ] onChange callback receives formatted value on Enter
- [ ] Checkbox toggle changes auto-capitalize state
- [ ] Error state displays error message
- [ ] Disabled state disables input and checkbox
- [ ] Custom formatFunction is used when provided
- [ ] getValue() returns formatted value when auto-capitalize on
- [ ] getValue() returns raw value when auto-capitalize off

### 2. TeamEditorModal Component (Integration Tests)
**File:** `src/operator/__tests__/TeamEditorModal.test.tsx`

#### Test Cases:
- [ ] Renders modal with "Add New Team" title when creating
- [ ] Renders modal with "Edit Team" title when editing
- [ ] Displays close button
- [ ] Close button calls onCancel
- [ ] ESC key closes modal
- [ ] Team name field uses CapitalizeInput component
- [ ] Team name field allows bypass (has checkbox)
- [ ] Captain field uses MemberCombobox
- [ ] Captain field is disabled in captain variant
- [ ] Home venue field uses shadcn Select
- [ ] Roster player fields use MemberCombobox
- [ ] Shows "Player 2-8" for 8-man teams
- [ ] Shows "Player 2-5" for 5-man teams
- [ ] Validation: Team name required
- [ ] Validation: Captain required
- [ ] Validation: Cannot select same player twice
- [ ] Validation: Captain cannot be in roster
- [ ] Validation: Player already on another team
- [ ] Success: Creates team with valid data
- [ ] Success: Updates team with valid data
- [ ] Loading state: Disables buttons while saving
- [ ] Error display: Shows error messages

### 3. TeamManagement Component (Integration Tests)
**File:** `src/operator/__tests__/TeamManagement.test.tsx`

#### Test Cases:
- [ ] Renders with loading state initially
- [ ] Displays error state when data fetch fails
- [ ] Shows "Back to League" button
- [ ] Setup summary card displays correct stats
- [ ] Venue list displays operator's venues
- [ ] Venue checkboxes use shadcn Checkbox
- [ ] Select All checkbox works correctly
- [ ] Individual venue toggle works
- [ ] Limit button opens VenueLimitModal
- [ ] "Add Team" button disabled when no venues
- [ ] "Add Team" button enabled when venues assigned
- [ ] Team cards display correctly
- [ ] Team expand/collapse works
- [ ] Edit team opens modal with data
- [ ] Delete team shows confirmation
- [ ] Import from previous season works
- [ ] AllPlayersRosterCard displays all players
- [ ] Save & Continue button navigates correctly
- [ ] Save & Exit button navigates correctly

### 4. VenueCreationModal Component (Integration Tests)
**File:** `src/components/operator/__tests__/VenueCreationModal.test.tsx`

#### Test Cases:
- [ ] Renders modal with title
- [ ] Venue name uses CapitalizeInput with optional bypass
- [ ] Street address uses CapitalizeInput with forced capitalization
- [ ] City uses CapitalizeInput with forced capitalization
- [ ] State field uses regular Input (not CapitalizeInput)
- [ ] Validation: All required fields must be filled
- [ ] Success: Creates venue and calls onSuccess
- [ ] Cancel button calls onCancel

### 5. Custom Hooks Tests (Unit Tests)
**File:** `src/hooks/__tests__/useRosterEditor.test.ts`

#### Test Cases:
- [ ] Initializes with empty roster
- [ ] Loads existing roster when editing
- [ ] handlePlayerChange updates player at index
- [ ] Validates duplicate players
- [ ] Validates captain in roster
- [ ] Validates player on another team
- [ ] getAllPlayerIds includes captain
- [ ] clearRosterError clears error state

**File:** `src/hooks/__tests__/useTeamManagement.test.ts`

#### Test Cases:
- [ ] Fetches all data on mount
- [ ] Handles loading state
- [ ] Handles error state
- [ ] refreshTeams refetches team data
- [ ] Returns all expected data fields

### 6. Smoke Tests (Critical Path)
**File:** `src/__tests__/integration/TeamManagement.smoke.test.tsx`

#### Test Cases:
- [ ] TeamManagement renders without crashing
- [ ] No JavaScript errors on mount
- [ ] Basic UI elements present
- [ ] Can open team editor modal
- [ ] Can close team editor modal

## Mock Strategy

### Supabase Client Mock
```typescript
vi.mock('@/supabaseClient', () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    })),
  },
}));
```

### React Router Mock
```typescript
vi.mock('react-router-dom', () => ({
  ...actualReactRouter,
  useParams: () => ({ leagueId: 'test-league-id' }),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));
```

### Custom Hooks Mock
```typescript
vi.mock('@/hooks/useOperatorId', () => ({
  useOperatorId: () => ({
    operatorId: 'test-operator-id',
    loading: false,
    error: null,
  }),
}));
```

## Test Data Fixtures

### Mock Venue
```typescript
const mockVenue = {
  id: 'venue-1',
  name: 'Test Venue',
  bar_box_tables: 2,
  regulation_tables: 2,
  total_tables: 4,
  created_by_operator_id: 'test-operator-id',
  is_active: true,
};
```

### Mock Team
```typescript
const mockTeam = {
  id: 'team-1',
  team_name: 'Test Team',
  captain_id: 'captain-1',
  home_venue_id: 'venue-1',
  roster_size: 8,
  season_id: 'season-1',
  league_id: 'league-1',
};
```

### Mock Member
```typescript
const mockMember = {
  id: 'member-1',
  first_name: 'John',
  last_name: 'Doe',
  player_number: 12345,
  email: 'john@example.com',
};
```

## Running Tests

### Commands
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test

# Run specific test file
pnpm test TeamEditorModal

# Run with coverage
pnpm test:coverage

# Run with UI
pnpm test:ui
```

### Test Execution Order
1. Run unit tests first (fastest, most isolated)
2. Run integration tests (component interactions)
3. Run smoke tests (critical paths)

## Success Criteria

### Before Refactoring
- [ ] All tests written and passing with current implementation
- [ ] Coverage meets minimum threshold (80%+)
- [ ] All critical paths tested

### After Each Refactoring Step
- [ ] All existing tests still pass
- [ ] No new console errors or warnings
- [ ] Visual regression testing (manual)

### After Complete Refactoring
- [ ] 100% of tests passing
- [ ] No functionality regression
- [ ] All new patterns tested

## Testing Workflow

### Before Making Changes
1. Write tests for current behavior
2. Run tests to ensure they pass
3. Commit tests

### During Refactoring
1. Make small, incremental changes
2. Run tests after each change
3. Fix any failing tests immediately
4. Commit working code

### After Refactoring
1. Run full test suite
2. Check coverage report
3. Add any missing tests
4. Document any behavior changes

## Known Testing Challenges

### 1. Supabase Mocking
- Need to mock chainable query builder
- Must handle both `.select()` and `.from().select()` patterns
- Mock should support all query methods used

### 2. localStorage Persistence
- Clear localStorage in beforeEach
- Mock localStorage if needed
- Test persistence behavior explicitly

### 3. Modal Testing
- Modals render in portals (outside component tree)
- Use `screen` instead of container queries
- Test backdrop clicks and ESC key

### 4. Async Operations
- Use `waitFor` for async state changes
- Increase timeouts for slow operations
- Mock timer functions if needed

## Continuous Integration

### Pre-commit Hook
```bash
# Run tests before commit
pnpm test:run
```

### GitHub Actions (if applicable)
```yaml
- name: Run tests
  run: pnpm test:run
```

## Notes
- Keep tests simple and focused
- Test behavior, not implementation
- Use descriptive test names
- Group related tests with describe blocks
- Mock external dependencies
- Don't test third-party libraries

---

**Created:** 2025-10-24
**Status:** Ready for Implementation
