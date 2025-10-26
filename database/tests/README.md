# Database RLS Tests

This directory contains comprehensive tests for Row Level Security (RLS) policies in the messaging and reporting systems.

## Overview

These tests ensure that:
- Users can only access data they're authorized to see
- Security policies prevent unauthorized data access
- Immutability constraints work correctly
- Audit trails are properly maintained

## Test Files

### `test_messaging_rls.sql`
Tests RLS policies for the messaging system:
- ✅ Conversations - participants can view their conversations
- ✅ Messages - participants can view/send messages in their conversations
- ✅ Blocked users - users can only manage their own blocks
- ✅ Read receipts - users can only update their own read status
- ✅ Privacy - users cannot see conversations they're not part of

### `test_reporting_rls.sql`
Tests RLS policies for the reporting system:
- ✅ User reports - users can view their own reports
- ✅ Operator access - operators can view reports for their league players
- ✅ Developer access - developers can view all reports
- ✅ Immutability - reports cannot be deleted (audit trail)
- ✅ Report actions - only operators/developers can take actions
- ✅ Action visibility - users can view actions on their reports

## Prerequisites

1. **Local Supabase Running**
   ```bash
   supabase status
   ```
   You should see your local instance running on port 54322.

2. **psql Client Installed**
   - macOS: Usually pre-installed
   - Linux: `sudo apt-get install postgresql-client`
   - Windows: Install PostgreSQL or use WSL

## How to Run Tests

### Run All Tests
```bash
# From project root
cd database/tests

# Run messaging tests
psql -h localhost -p 54322 -U postgres -d postgres -f test_messaging_rls.sql

# Run reporting tests
psql -h localhost -p 54322 -U postgres -d postgres -f test_reporting_rls.sql
```

### Run Tests with Colored Output
```bash
psql -h localhost -p 54322 -U postgres -d postgres -f test_messaging_rls.sql 2>&1 | grep -E "PASSED|FAILED|━|Testing|Setting up|Cleaning|COMPLETE"
```

### Alternative: Run via Supabase CLI
```bash
supabase db test --db-url postgresql://postgres:postgres@localhost:54322/postgres --file database/tests/test_messaging_rls.sql
```

## Understanding Test Output

### Successful Test Run
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Setting up test data...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOTICE:  Test data created successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Testing CONVERSATIONS table RLS policies
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOTICE:  ✓ PASSED: User1 can view their own conversation
NOTICE:  ✓ PASSED: User3 cannot view conversation they are not in

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ ALL MESSAGING RLS TESTS COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLLBACK
```

### Failed Test Run
```
ERROR:  TEST FAILED: User3 cannot view conversation they are not in - Expected: 0, Got: 1
```

## Test Design

### Isolation
- Each test file uses a transaction with `BEGIN` and `ROLLBACK`
- All test data is cleaned up after tests complete
- Tests do not affect your actual database data

### Test Users
Tests create temporary auth users with predictable IDs:
- `test_user1@example.com` - Regular user
- `test_user2@example.com` - Regular user
- `test_user3@example.com` - Unauthorized user
- `operator@example.com` - League operator
- `developer@example.com` - Developer/admin

### Security Context
Tests use PostgreSQL's `request.jwt.claims` to simulate different authenticated users:
```sql
SET LOCAL role authenticated;
SET LOCAL request.jwt.claims = json_build_object('sub', user_id::text)::text;
```

## Adding New Tests

To add a new test case:

1. **Add test logic within a DO block:**
```sql
DO $$
DECLARE
  user_auth_id UUID;
  result_count INT;
BEGIN
  SELECT t.user1_auth_id INTO user_auth_id FROM test_data t;

  -- Set user context
  SET LOCAL role authenticated;
  SET LOCAL request.jwt.claims = json_build_object('sub', user_auth_id::text)::text;

  -- Run query
  SELECT COUNT(*) INTO result_count
  FROM your_table
  WHERE your_condition;

  -- Assert result
  PERFORM assert_equals(expected_value, result_count, 'Test description');

  RESET role;
END $$;
```

2. **Use the assert_equals function:**
```sql
PERFORM assert_equals(expected, actual, 'Test name');
```

## Troubleshooting

### Connection Refused
```
psql: error: connection to server at "localhost", port 54322 failed
```
**Solution:** Make sure Supabase is running: `supabase start`

### Permission Denied
```
ERROR:  permission denied for table auth.users
```
**Solution:** You may need to run as postgres superuser:
```bash
psql -h localhost -p 54322 -U postgres -d postgres
```

### Tests Hang
**Solution:** Kill the psql process and check for uncommitted transactions:
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'postgres';
```

### Test Data Conflicts
If you see unique constraint violations:
```bash
# Reset your local database
supabase db reset
```

## CI/CD Integration

You can integrate these tests into your CI/CD pipeline:

```bash
# GitHub Actions example
- name: Run RLS Tests
  run: |
    supabase start
    psql -h localhost -p 54322 -U postgres -d postgres -f database/tests/test_messaging_rls.sql
    psql -h localhost -p 54322 -U postgres -d postgres -f database/tests/test_reporting_rls.sql
```

## Test Coverage

### Messaging System
- ✅ 10 test cases
- ✅ 4 tables tested (conversations, messages, conversation_participants, blocked_users)
- ✅ 3 user roles tested (participant, non-participant, blocked user)

### Reporting System
- ✅ 12 test cases
- ✅ 3 tables tested (user_reports, report_actions, report_updates)
- ✅ 4 user roles tested (reporter, reported user, operator, developer)

## Maintenance

These tests should be updated when:
- New RLS policies are added
- Existing policies are modified
- New tables are added to the messaging/reporting systems
- User roles or permissions change

## Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Security Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Testing Best Practices](https://supabase.com/docs/guides/database/testing)
