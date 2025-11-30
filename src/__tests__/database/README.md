# Database Integration Tests for RLS

These tests verify that Row Level Security (RLS) policies don't break existing functionality.

## Test Strategy

1. **Baseline (No RLS)**: Run tests against current database WITHOUT RLS
   - All tests should PASS ✅
   - This establishes what currently works

2. **With RLS**: Apply RLS migration and run tests again
   - Tests should still PASS ✅
   - If tests FAIL ❌, fix the RLS policy

3. **Incremental**: Add RLS policies one table at a time
   - Test after each table
   - Safe, controlled rollout

## Running Tests

### Prerequisites

```bash
# 1. Make sure local Supabase is running
supabase status

# 2. If not running, start it
supabase start
```

### Run All Database Tests

```bash
# Run all database integration tests
pnpm test:run src/__tests__/database

# Run with coverage
pnpm test:coverage -- src/__tests__/database
```

### Run Specific Table Tests

```bash
# Test matches table only
pnpm test:run src/__tests__/database/matches.rls.test.ts

# Test teams table only
pnpm test:run src/__tests__/database/teams.rls.test.ts

# Test operator features only
pnpm test:run src/__tests__/database/operator.rls.test.ts
```

### Watch Mode (During Development)

```bash
# Re-run tests on file changes
pnpm test -- src/__tests__/database --watch
```

## Test Files

### `matches.rls.test.ts`
Tests match operations:
- ✅ SELECT: Viewing all matches, filtering by season
- ✅ UPDATE: Updating match status, scores, timestamps, lineup refs
- ✅ INSERT: Creating new matches
- ✅ DELETE: Removing matches

### `matchGames.rls.test.ts`
Tests scorekeeping operations (CRITICAL - players use this):
- ✅ SELECT: Viewing game scores with player joins
- ✅ UPDATE: Recording winners, confirmations, break/run, golden break, vacate requests
- ✅ INSERT: Creating tiebreaker games (single and bulk)
- ✅ DELETE: Removing games

### `matchLineups.rls.test.ts`
Tests lineup management:
- ✅ SELECT: Viewing lineups for matches with player info
- ✅ UPDATE: Assigning players to lineup slots, updating positions, substitute flags
- ✅ INSERT: Manually creating lineup entries
- ✅ DELETE: Removing lineup entries
- ✅ Preferences: Creating/updating league preferences and operator blackouts

### `teams.rls.test.ts`
Tests team and roster management:
- ✅ SELECT: Viewing teams and rosters with captain info
- ✅ UPDATE: Team captains updating team name, venue, status
- ✅ INSERT: Adding teams, adding players to rosters with skill levels
- ✅ DELETE: Removing teams, removing players from rosters

### `operator.rls.test.ts`
Tests organization/league/season management:
- ✅ SELECT: Viewing organizations, leagues, seasons, staff
- ✅ UPDATE: Modifying organization/league/season details, contact info
- ✅ INSERT: Creating new orgs/leagues/seasons, adding staff
- ✅ DELETE: Removing staff members

### `members.rls.test.ts`
Tests member profile operations:
- ✅ SELECT: Viewing all members, searching by name, BCA membership
- ✅ UPDATE: Updating contact info, address, nickname, profanity filter, BCA info
- ✅ INSERT: Creating new members (registration)
- ✅ DELETE: Removing members

### `venues.rls.test.ts`
Tests venue management:
- ✅ SELECT: Viewing all venues, searching by location
- ✅ UPDATE: Updating venue name, address, contact info, table count
- ✅ INSERT: Creating new venues, assigning venues to leagues
- ✅ DELETE: Removing venues, removing venue assignments

### `messaging.rls.test.ts`
Tests messaging system (conversations, messages, participants):
- ✅ SELECT: Viewing conversations (DM/group/announcement), messages, participants
- ✅ UPDATE: Editing messages, marking deleted, updating read receipts, unread counts
- ✅ INSERT: Creating conversations, sending messages, adding participants
- ✅ DELETE: Deleting conversations, messages, removing participants

### `championshipPreferences.rls.test.ts`
Tests championship preferences system (critical for scheduling):
- ✅ SELECT: Viewing championship dates by organization (BCA/APA), filtering dev-verified
- ✅ UPDATE: Incrementing vote counts, marking dev-verified, updating dates, toggling preferences
- ✅ INSERT: Creating championship date options, setting blackout/ignore preferences
- ✅ DELETE: Removing championship dates and preferences
- ✅ Integration: Full workflow (create championship → set preference → query with joins)
- ✅ Constraints: Validates date ranges, vote counts, required fields

## Test Utilities

### `dbTestUtils.ts`
Helper functions for database testing:
- `createTestClient()` - Create Supabase client for testing
- `createAuthenticatedClient(role)` - Login as specific user type
- `getCurrentMemberId(client)` - Get member ID for auth user
- `expectQueryToSucceed(promise)` - Assert query succeeds
- `expectQueryToFail(promise)` - Assert query fails (for permission tests)

## Adding RLS Step-by-Step

### Step 1: Run Baseline Tests (No RLS)

```bash
# All should pass
pnpm test:run src/__tests__/database
```

### Step 2: Apply RLS Migration

```bash
# Apply the RLS migration
supabase db reset
```

### Step 3: Run Tests Again

```bash
# Check what broke
pnpm test:run src/__tests__/database
```

### Step 4: Fix Failing Tests

If tests fail, the RLS policy is too restrictive. Options:
1. Adjust the RLS policy in the migration
2. Update the function to use SECURITY DEFINER
3. Change the query to work with RLS

### Step 5: Iterate

Keep fixing until all tests pass, then you know RLS is safe!

## Understanding Test Results

### ✅ All Tests Pass
RLS policies are correct and don't break functionality!

### ❌ Some Tests Fail

Check the error message:
- `new row violates row-level security policy` - INSERT policy too restrictive
- `insufficient privilege` - User doesn't have permission
- `PGRST116` or `406` - SELECT policy blocking read

Fix the RLS policy and re-run tests.

## Current Test Coverage

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| matches | ✅ | ✅ | ✅ | ✅ |
| match_games | ✅ | ✅ | ✅ | ✅ |
| match_lineups | ✅ | ✅ | ✅ | ✅ |
| teams | ✅ | ✅ | ✅ | ✅ |
| team_players | ✅ | ✅ | ✅ | ✅ |
| organizations | ✅ | ✅ | ✅ | ⚠️ |
| leagues | ✅ | ✅ | ✅ | ⚠️ |
| seasons | ✅ | ✅ | ✅ | ⚠️ |
| organization_staff | ✅ | ✅ | ⚠️ | ✅ |
| members | ✅ | ✅ | ✅ | ✅ |
| venues | ✅ | ✅ | ✅ | ✅ |
| league_venues | ✅ | ✅ | ⚠️ | ✅ |
| messages | ✅ | ✅ | ✅ | ✅ |
| conversations | ✅ | ✅ | ✅ | ✅ |
| conversation_participants | ✅ | ✅ | ✅ | ✅ |
| preferences | ✅ | ✅ | ✅ | ✅ |
| operator_blackout_preferences | ✅ | ✅ | ✅ | ⚠️ |

✅ = Covered (200+ tests!)
⚠️ = Partial coverage or intentionally skipped (DELETE operations on critical tables)

## Next Steps

1. **Run baseline tests** to establish what works
2. **Add more tests** for uncovered tables (messages, venues, etc.)
3. **Apply RLS incrementally** - one table at a time
4. **Verify with tests** after each RLS addition
5. **Deploy confidently** knowing RLS won't break production
