/**
 * @fileoverview RLS Policy Tests for Reporting System
 *
 * These tests verify that Row Level Security policies work correctly for:
 * - user_reports table
 * - report_actions table
 * - report_updates table
 *
 * Tests cover:
 * - Users can only view their own reports
 * - Operators can view reports for players in their leagues
 * - Developers can view all reports
 * - Reports are immutable (cannot be deleted)
 * - Action tracking and audit trail
 *
 * HOW TO RUN:
 * 1. Make sure your local Supabase is running: supabase status
 * 2. Run this file: psql -h localhost -p 54322 -U postgres -d postgres -f database/tests/test_reporting_rls.sql
 * 3. Check output for any FAILED tests
 */

BEGIN;

-- Create a test reporting function
CREATE OR REPLACE FUNCTION assert_equals(expected anyelement, actual anyelement, test_name text)
RETURNS void AS $$
BEGIN
  IF expected IS DISTINCT FROM actual THEN
    RAISE EXCEPTION 'TEST FAILED: % - Expected: %, Got: %', test_name, expected, actual;
  ELSE
    RAISE NOTICE '✓ PASSED: %', test_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SETUP: Create test users and data
-- ============================================================================

RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE 'Setting up test data...';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

DO $$
DECLARE
  -- Auth user IDs
  reporter_auth_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  reported_auth_id UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  other_user_auth_id UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  operator_auth_id UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  developer_auth_id UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

  -- Member IDs
  reporter_member_id UUID;
  reported_member_id UUID;
  other_user_member_id UUID;
  operator_member_id UUID;
  developer_member_id UUID;

  -- Other IDs
  operator_id UUID;
  league_id UUID;
  season_id UUID;
  team_id UUID;
  report_id UUID;
BEGIN
  -- Clean up any existing test data
  DELETE FROM report_actions WHERE report_id IN (
    SELECT id FROM user_reports WHERE reporter_id IN (
      SELECT id FROM members WHERE user_id IN (reporter_auth_id, reported_auth_id, other_user_auth_id, operator_auth_id, developer_auth_id)
    )
  );
  DELETE FROM report_updates WHERE report_id IN (
    SELECT id FROM user_reports WHERE reporter_id IN (
      SELECT id FROM members WHERE user_id IN (reporter_auth_id, reported_auth_id, other_user_auth_id, operator_auth_id, developer_auth_id)
    )
  );
  DELETE FROM user_reports WHERE reporter_id IN (
    SELECT id FROM members WHERE user_id IN (reporter_auth_id, reported_auth_id, other_user_auth_id, operator_auth_id, developer_auth_id)
  );
  DELETE FROM team_players WHERE member_id IN (
    SELECT id FROM members WHERE user_id IN (reporter_auth_id, reported_auth_id, other_user_auth_id, operator_auth_id, developer_auth_id)
  );
  DELETE FROM members WHERE user_id IN (reporter_auth_id, reported_auth_id, other_user_auth_id, operator_auth_id, developer_auth_id);
  DELETE FROM auth.users WHERE id IN (reporter_auth_id, reported_auth_id, other_user_auth_id, operator_auth_id, developer_auth_id);

  -- Create auth users
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
    (reporter_auth_id, 'reporter@example.com', crypt('password', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
    (reported_auth_id, 'reported@example.com', crypt('password', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
    (other_user_auth_id, 'otheruser@example.com', crypt('password', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
    (operator_auth_id, 'operator@example.com', crypt('password', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
    (developer_auth_id, 'developer@example.com', crypt('password', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());

  -- Create member records
  INSERT INTO members (user_id, first_name, last_name, email, system_player_number, role)
  VALUES (reporter_auth_id, 'Test', 'Reporter', 'reporter@example.com', 'REP001', 'player')
  RETURNING id INTO reporter_member_id;

  INSERT INTO members (user_id, first_name, last_name, email, system_player_number, role)
  VALUES (reported_auth_id, 'Test', 'Reported', 'reported@example.com', 'REP002', 'player')
  RETURNING id INTO reported_member_id;

  INSERT INTO members (user_id, first_name, last_name, email, system_player_number, role)
  VALUES (other_user_auth_id, 'Test', 'OtherUser', 'otheruser@example.com', 'OTH001', 'player')
  RETURNING id INTO other_user_member_id;

  INSERT INTO members (user_id, first_name, last_name, email, system_player_number, role)
  VALUES (operator_auth_id, 'Test', 'Operator', 'operator@example.com', 'OPR001', 'league_operator')
  RETURNING id INTO operator_member_id;

  INSERT INTO members (user_id, first_name, last_name, email, system_player_number, role)
  VALUES (developer_auth_id, 'Test', 'Developer', 'developer@example.com', 'DEV001', 'developer')
  RETURNING id INTO developer_member_id;

  -- Create league operator record
  INSERT INTO league_operators (member_id, organization_name, status)
  VALUES (operator_member_id, 'Test League Operator', 'approved')
  RETURNING id INTO operator_id;

  -- Create league, season, and team so operator can see reports
  INSERT INTO leagues (name, operator_id, format_type)
  VALUES ('Test League', operator_id, '8-man')
  RETURNING id INTO league_id;

  INSERT INTO seasons (league_id, name, status, start_date, end_date)
  VALUES (league_id, 'Test Season', 'active', NOW(), NOW() + INTERVAL '3 months')
  RETURNING id INTO season_id;

  INSERT INTO teams (season_id, name)
  VALUES (season_id, 'Test Team')
  RETURNING id INTO team_id;

  -- Add reported user to the team (so operator can see reports about them)
  INSERT INTO team_players (team_id, member_id, position_number)
  VALUES (team_id, reported_member_id, 1);

  -- Create a test report
  INSERT INTO user_reports (
    reporter_id,
    reported_user_id,
    category,
    description,
    status,
    severity
  )
  VALUES (
    reporter_member_id,
    reported_member_id,
    'harassment',
    'Test harassment report',
    'pending',
    'medium'
  )
  RETURNING id INTO report_id;

  -- Store IDs in temp table for use in tests
  CREATE TEMP TABLE test_data (
    reporter_auth_id UUID,
    reported_auth_id UUID,
    other_user_auth_id UUID,
    operator_auth_id UUID,
    developer_auth_id UUID,
    reporter_member_id UUID,
    reported_member_id UUID,
    other_user_member_id UUID,
    operator_member_id UUID,
    developer_member_id UUID,
    operator_id UUID,
    league_id UUID,
    season_id UUID,
    team_id UUID,
    report_id UUID
  );

  INSERT INTO test_data VALUES (
    reporter_auth_id, reported_auth_id, other_user_auth_id, operator_auth_id, developer_auth_id,
    reporter_member_id, reported_member_id, other_user_member_id, operator_member_id, developer_member_id,
    operator_id, league_id, season_id, team_id, report_id
  );

  RAISE NOTICE 'Test data created successfully';
END $$;

-- ============================================================================
-- TEST: User Reports - Users can view their own reports
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE 'Testing USER_REPORTS table RLS policies';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

DO $$
DECLARE
  reporter_auth_id UUID;
  other_user_auth_id UUID;
  report_id UUID;
  result_count INT;
BEGIN
  SELECT t.reporter_auth_id, t.other_user_auth_id, t.report_id
  INTO reporter_auth_id, other_user_auth_id, report_id
  FROM test_data t;

  -- Test: Reporter can see their own report
  SET LOCAL role authenticated;
  SET LOCAL request.jwt.claims = json_build_object('sub', reporter_auth_id::text)::text;

  SELECT COUNT(*) INTO result_count
  FROM user_reports
  WHERE id = report_id;

  PERFORM assert_equals(1, result_count, 'Reporter can view their own report');

  -- Test: Other user CANNOT see the report
  SET LOCAL request.jwt.claims = json_build_object('sub', other_user_auth_id::text)::text;

  SELECT COUNT(*) INTO result_count
  FROM user_reports
  WHERE id = report_id;

  PERFORM assert_equals(0, result_count, 'Other user cannot view report they did not file');

  RESET role;
END $$;

-- ============================================================================
-- TEST: User Reports - Operators can view reports for their league players
-- ============================================================================

DO $$
DECLARE
  operator_auth_id UUID;
  report_id UUID;
  result_count INT;
BEGIN
  SELECT t.operator_auth_id, t.report_id
  INTO operator_auth_id, report_id
  FROM test_data t;

  -- Test: Operator can see reports for players in their leagues
  SET LOCAL role authenticated;
  SET LOCAL request.jwt.claims = json_build_object('sub', operator_auth_id::text)::text;

  SELECT COUNT(*) INTO result_count
  FROM user_reports
  WHERE id = report_id;

  PERFORM assert_equals(1, result_count, 'Operator can view reports for players in their league');

  RESET role;
END $$;

-- ============================================================================
-- TEST: User Reports - Developers can view all reports
-- ============================================================================

DO $$
DECLARE
  developer_auth_id UUID;
  report_id UUID;
  result_count INT;
BEGIN
  SELECT t.developer_auth_id, t.report_id
  INTO developer_auth_id, report_id
  FROM test_data t;

  -- Test: Developer can see all reports
  SET LOCAL role authenticated;
  SET LOCAL request.jwt.claims = json_build_object('sub', developer_auth_id::text)::text;

  SELECT COUNT(*) INTO result_count
  FROM user_reports
  WHERE id = report_id;

  PERFORM assert_equals(1, result_count, 'Developer can view all reports');

  RESET role;
END $$;

-- ============================================================================
-- TEST: User Reports - Reports are immutable (cannot be deleted)
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE 'Testing report immutability (no DELETE policy)...';

DO $$
DECLARE
  reporter_auth_id UUID;
  developer_auth_id UUID;
  report_id UUID;
  delete_succeeded BOOLEAN;
BEGIN
  SELECT t.reporter_auth_id, t.developer_auth_id, t.report_id
  INTO reporter_auth_id, developer_auth_id, report_id
  FROM test_data t;

  -- Test: Reporter CANNOT delete their own report
  SET LOCAL role authenticated;
  SET LOCAL request.jwt.claims = json_build_object('sub', reporter_auth_id::text)::text;

  BEGIN
    DELETE FROM user_reports WHERE id = report_id;
    GET DIAGNOSTICS delete_succeeded = ROW_COUNT;
    delete_succeeded := (delete_succeeded > 0);
  EXCEPTION WHEN OTHERS THEN
    delete_succeeded := FALSE;
  END;

  PERFORM assert_equals(FALSE, delete_succeeded, 'Reporter cannot delete their own report');

  -- Test: Even developer CANNOT delete reports
  SET LOCAL request.jwt.claims = json_build_object('sub', developer_auth_id::text)::text;

  BEGIN
    DELETE FROM user_reports WHERE id = report_id;
    GET DIAGNOSTICS delete_succeeded = ROW_COUNT;
    delete_succeeded := (delete_succeeded > 0);
  EXCEPTION WHEN OTHERS THEN
    delete_succeeded := FALSE;
  END;

  PERFORM assert_equals(FALSE, delete_succeeded, 'Developer cannot delete reports (immutable)');

  RESET role;
END $$;

-- ============================================================================
-- TEST: User Reports - Users can create reports
-- ============================================================================

DO $$
DECLARE
  reporter_auth_id UUID;
  reporter_member_id UUID;
  reported_member_id UUID;
  new_report_id UUID;
  insert_succeeded BOOLEAN;
BEGIN
  SELECT t.reporter_auth_id, t.reporter_member_id, t.reported_member_id
  INTO reporter_auth_id, reporter_member_id, reported_member_id
  FROM test_data t;

  -- Test: User can create a report
  SET LOCAL role authenticated;
  SET LOCAL request.jwt.claims = json_build_object('sub', reporter_auth_id::text)::text;

  BEGIN
    INSERT INTO user_reports (
      reporter_id,
      reported_user_id,
      category,
      description,
      status,
      severity
    )
    VALUES (
      reporter_member_id,
      reported_member_id,
      'cheating',
      'Test cheating report',
      'pending',
      'high'
    )
    RETURNING id INTO new_report_id;
    insert_succeeded := TRUE;
  EXCEPTION WHEN OTHERS THEN
    insert_succeeded := FALSE;
  END;

  PERFORM assert_equals(TRUE, insert_succeeded, 'User can create a report');

  -- Cleanup the test report
  IF new_report_id IS NOT NULL THEN
    -- Use superuser to delete test report since users can't delete
    RESET role;
    DELETE FROM user_reports WHERE id = new_report_id;
  END IF;

  RESET role;
END $$;

-- ============================================================================
-- TEST: User Reports - Operators can update reports
-- ============================================================================

DO $$
DECLARE
  operator_auth_id UUID;
  report_id UUID;
  update_succeeded BOOLEAN;
BEGIN
  SELECT t.operator_auth_id, t.report_id
  INTO operator_auth_id, report_id
  FROM test_data t;

  -- Test: Operator can update report status
  SET LOCAL role authenticated;
  SET LOCAL request.jwt.claims = json_build_object('sub', operator_auth_id::text)::text;

  BEGIN
    UPDATE user_reports
    SET status = 'under_review'
    WHERE id = report_id;
    GET DIAGNOSTICS update_succeeded = ROW_COUNT;
    update_succeeded := (update_succeeded > 0);
  EXCEPTION WHEN OTHERS THEN
    update_succeeded := FALSE;
  END;

  PERFORM assert_equals(TRUE, update_succeeded, 'Operator can update report status');

  RESET role;
END $$;

-- ============================================================================
-- TEST: Report Actions - Only operators and developers can create actions
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE 'Testing REPORT_ACTIONS table RLS policies';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

DO $$
DECLARE
  reporter_auth_id UUID;
  operator_auth_id UUID;
  operator_member_id UUID;
  report_id UUID;
  insert_succeeded BOOLEAN;
  action_id UUID;
BEGIN
  SELECT t.reporter_auth_id, t.operator_auth_id, t.operator_member_id, t.report_id
  INTO reporter_auth_id, operator_auth_id, operator_member_id, report_id
  FROM test_data t;

  -- Test: Regular user CANNOT create report action
  SET LOCAL role authenticated;
  SET LOCAL request.jwt.claims = json_build_object('sub', reporter_auth_id::text)::text;

  BEGIN
    INSERT INTO report_actions (
      report_id,
      actor_id,
      actor_role,
      action_type,
      action_notes
    )
    VALUES (
      report_id,
      (SELECT reporter_member_id FROM test_data),
      'operator',
      'warning',
      'Test warning'
    );
    insert_succeeded := TRUE;
  EXCEPTION WHEN OTHERS THEN
    insert_succeeded := FALSE;
  END;

  PERFORM assert_equals(FALSE, insert_succeeded, 'Regular user cannot create report action');

  -- Test: Operator CAN create report action
  SET LOCAL request.jwt.claims = json_build_object('sub', operator_auth_id::text)::text;

  BEGIN
    INSERT INTO report_actions (
      report_id,
      actor_id,
      actor_role,
      action_type,
      action_notes
    )
    VALUES (
      report_id,
      operator_member_id,
      'operator',
      'warning',
      'Test warning from operator'
    )
    RETURNING id INTO action_id;
    insert_succeeded := TRUE;
  EXCEPTION WHEN OTHERS THEN
    insert_succeeded := FALSE;
  END;

  PERFORM assert_equals(TRUE, insert_succeeded, 'Operator can create report action');

  RESET role;
END $$;

-- ============================================================================
-- TEST: Report Actions - Users can view actions on their reports
-- ============================================================================

DO $$
DECLARE
  reporter_auth_id UUID;
  other_user_auth_id UUID;
  result_count INT;
BEGIN
  SELECT t.reporter_auth_id, t.other_user_auth_id
  INTO reporter_auth_id, other_user_auth_id
  FROM test_data t;

  -- Test: Reporter can view actions on their report
  SET LOCAL role authenticated;
  SET LOCAL request.jwt.claims = json_build_object('sub', reporter_auth_id::text)::text;

  SELECT COUNT(*) INTO result_count
  FROM report_actions
  WHERE report_id = (SELECT report_id FROM test_data);

  PERFORM assert_equals(1, result_count, 'Reporter can view actions on their report');

  -- Test: Other user CANNOT view actions
  SET LOCAL request.jwt.claims = json_build_object('sub', other_user_auth_id::text)::text;

  SELECT COUNT(*) INTO result_count
  FROM report_actions
  WHERE report_id = (SELECT report_id FROM test_data);

  PERFORM assert_equals(0, result_count, 'Other user cannot view report actions');

  RESET role;
END $$;

-- ============================================================================
-- CLEANUP
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE 'Cleaning up test data...';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

DO $$
DECLARE
  reporter_auth_id UUID;
  reported_auth_id UUID;
  other_user_auth_id UUID;
  operator_auth_id UUID;
  developer_auth_id UUID;
BEGIN
  SELECT t.reporter_auth_id, t.reported_auth_id, t.other_user_auth_id, t.operator_auth_id, t.developer_auth_id
  INTO reporter_auth_id, reported_auth_id, other_user_auth_id, operator_auth_id, developer_auth_id
  FROM test_data t;

  DELETE FROM report_actions WHERE report_id IN (
    SELECT id FROM user_reports WHERE reporter_id IN (
      SELECT id FROM members WHERE user_id IN (reporter_auth_id, reported_auth_id, other_user_auth_id, operator_auth_id, developer_auth_id)
    )
  );
  DELETE FROM report_updates WHERE report_id IN (
    SELECT id FROM user_reports WHERE reporter_id IN (
      SELECT id FROM members WHERE user_id IN (reporter_auth_id, reported_auth_id, other_user_auth_id, operator_auth_id, developer_auth_id)
    )
  );
  DELETE FROM user_reports WHERE reporter_id IN (
    SELECT id FROM members WHERE user_id IN (reporter_auth_id, reported_auth_id, other_user_auth_id, operator_auth_id, developer_auth_id)
  );
  DELETE FROM team_players WHERE member_id IN (
    SELECT id FROM members WHERE user_id IN (reporter_auth_id, reported_auth_id, other_user_auth_id, operator_auth_id, developer_auth_id)
  );
  DELETE FROM members WHERE user_id IN (reporter_auth_id, reported_auth_id, other_user_auth_id, operator_auth_id, developer_auth_id);
  DELETE FROM auth.users WHERE id IN (reporter_auth_id, reported_auth_id, other_user_auth_id, operator_auth_id, developer_auth_id);

  DROP TABLE IF EXISTS test_data;
  DROP FUNCTION IF EXISTS assert_equals;

  RAISE NOTICE 'Cleanup complete';
END $$;

RAISE NOTICE '';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE '✓ ALL REPORTING RLS TESTS COMPLETE';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

ROLLBACK;
