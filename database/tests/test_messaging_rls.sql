/**
 * @fileoverview RLS Policy Tests for Messaging System
 *
 * These tests verify that Row Level Security policies work correctly for:
 * - conversations table
 * - conversation_participants table
 * - messages table
 * - blocked_users table
 *
 * Run these tests against your local Supabase instance to verify security.
 *
 * HOW TO RUN:
 * 1. Make sure your local Supabase is running: supabase status
 * 2. Run this file: psql -h localhost -p 54322 -U postgres -d postgres -f database/tests/test_messaging_rls.sql
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
-- SETUP: Create test users
-- ============================================================================

RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE 'Setting up test data...';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

-- Insert test auth users (these IDs will be used in RLS policies)
DO $$
DECLARE
  user1_auth_id UUID := '11111111-1111-1111-1111-111111111111';
  user2_auth_id UUID := '22222222-2222-2222-2222-222222222222';
  user3_auth_id UUID := '33333333-3333-3333-3333-333333333333';
  user1_member_id UUID;
  user2_member_id UUID;
  user3_member_id UUID;
  conv_id UUID;
  msg_id UUID;
BEGIN
  -- Clean up any existing test data
  DELETE FROM blocked_users WHERE blocker_id IN (
    SELECT id FROM members WHERE user_id IN (user1_auth_id, user2_auth_id, user3_auth_id)
  );
  DELETE FROM messages WHERE sender_id IN (
    SELECT id FROM members WHERE user_id IN (user1_auth_id, user2_auth_id, user3_auth_id)
  );
  DELETE FROM conversation_participants WHERE member_id IN (
    SELECT id FROM members WHERE user_id IN (user1_auth_id, user2_auth_id, user3_auth_id)
  );
  DELETE FROM conversations WHERE id IN (
    SELECT DISTINCT conversation_id FROM conversation_participants WHERE member_id IN (
      SELECT id FROM members WHERE user_id IN (user1_auth_id, user2_auth_id, user3_auth_id)
    )
  );
  DELETE FROM members WHERE user_id IN (user1_auth_id, user2_auth_id, user3_auth_id);
  DELETE FROM auth.users WHERE id IN (user1_auth_id, user2_auth_id, user3_auth_id);

  -- Create auth users
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
    (user1_auth_id, 'test_user1@example.com', crypt('password', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
    (user2_auth_id, 'test_user2@example.com', crypt('password', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
    (user3_auth_id, 'test_user3@example.com', crypt('password', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());

  -- Create member records
  INSERT INTO members (user_id, first_name, last_name, email, system_player_number)
  VALUES
    (user1_auth_id, 'Test', 'User1', 'test_user1@example.com', 'TEST001')
    RETURNING id INTO user1_member_id;

  INSERT INTO members (user_id, first_name, last_name, email, system_player_number)
  VALUES
    (user2_auth_id, 'Test', 'User2', 'test_user2@example.com', 'TEST002')
    RETURNING id INTO user2_member_id;

  INSERT INTO members (user_id, first_name, last_name, email, system_player_number)
  VALUES
    (user3_auth_id, 'Test', 'User3', 'test_user3@example.com', 'TEST003')
    RETURNING id INTO user3_member_id;

  -- Create a conversation between user1 and user2
  INSERT INTO conversations (created_at, updated_at)
  VALUES (NOW(), NOW())
  RETURNING id INTO conv_id;

  INSERT INTO conversation_participants (conversation_id, member_id, joined_at)
  VALUES
    (conv_id, user1_member_id, NOW()),
    (conv_id, user2_member_id, NOW());

  -- Create a message in the conversation
  INSERT INTO messages (conversation_id, sender_id, content, created_at)
  VALUES (conv_id, user1_member_id, 'Test message', NOW())
  RETURNING id INTO msg_id;

  -- Store IDs in temp table for use in tests
  CREATE TEMP TABLE test_data (
    user1_auth_id UUID,
    user2_auth_id UUID,
    user3_auth_id UUID,
    user1_member_id UUID,
    user2_member_id UUID,
    user3_member_id UUID,
    conv_id UUID,
    msg_id UUID
  );

  INSERT INTO test_data VALUES (
    user1_auth_id, user2_auth_id, user3_auth_id,
    user1_member_id, user2_member_id, user3_member_id,
    conv_id, msg_id
  );

  RAISE NOTICE 'Test data created successfully';
END $$;

-- ============================================================================
-- TEST: Conversations - Participants can view their conversations
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE 'Testing CONVERSATIONS table RLS policies';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

DO $$
DECLARE
  user1_auth_id UUID;
  user2_auth_id UUID;
  user3_auth_id UUID;
  conv_id UUID;
  result_count INT;
BEGIN
  SELECT * INTO user1_auth_id, user2_auth_id, user3_auth_id, conv_id
  FROM test_data
  LIMIT 1;

  -- Test: User1 can see the conversation they're part of
  SET LOCAL role authenticated;
  SET LOCAL request.jwt.claims = json_build_object('sub', user1_auth_id::text)::text;

  SELECT COUNT(*) INTO result_count
  FROM conversations
  WHERE id = conv_id;

  PERFORM assert_equals(1, result_count, 'User1 can view their own conversation');

  -- Test: User3 CANNOT see the conversation they're NOT part of
  SET LOCAL request.jwt.claims = json_build_object('sub', user3_auth_id::text)::text;

  SELECT COUNT(*) INTO result_count
  FROM conversations
  WHERE id = conv_id;

  PERFORM assert_equals(0, result_count, 'User3 cannot view conversation they are not in');

  RESET role;
END $$;

-- ============================================================================
-- TEST: Messages - Participants can view messages in their conversations
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE 'Testing MESSAGES table RLS policies';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

DO $$
DECLARE
  user1_auth_id UUID;
  user2_auth_id UUID;
  user3_auth_id UUID;
  msg_id UUID;
  result_count INT;
BEGIN
  SELECT t.user1_auth_id, t.user2_auth_id, t.user3_auth_id, t.msg_id
  INTO user1_auth_id, user2_auth_id, user3_auth_id, msg_id
  FROM test_data t;

  -- Test: User1 can see messages in their conversation
  SET LOCAL role authenticated;
  SET LOCAL request.jwt.claims = json_build_object('sub', user1_auth_id::text)::text;

  SELECT COUNT(*) INTO result_count
  FROM messages
  WHERE id = msg_id;

  PERFORM assert_equals(1, result_count, 'User1 can view messages in their conversation');

  -- Test: User2 can also see the message (they're a participant)
  SET LOCAL request.jwt.claims = json_build_object('sub', user2_auth_id::text)::text;

  SELECT COUNT(*) INTO result_count
  FROM messages
  WHERE id = msg_id;

  PERFORM assert_equals(1, result_count, 'User2 can view messages in their conversation');

  -- Test: User3 CANNOT see the message
  SET LOCAL request.jwt.claims = json_build_object('sub', user3_auth_id::text)::text;

  SELECT COUNT(*) INTO result_count
  FROM messages
  WHERE id = msg_id;

  PERFORM assert_equals(0, result_count, 'User3 cannot view messages in conversations they are not in');

  RESET role;
END $$;

-- ============================================================================
-- TEST: Messages - Users can only insert messages in their conversations
-- ============================================================================

DO $$
DECLARE
  user1_auth_id UUID;
  user3_auth_id UUID;
  user1_member_id UUID;
  conv_id UUID;
  test_msg_id UUID;
  insert_succeeded BOOLEAN;
BEGIN
  SELECT t.user1_auth_id, t.user3_auth_id, t.user1_member_id, t.conv_id
  INTO user1_auth_id, user3_auth_id, user1_member_id, conv_id
  FROM test_data t;

  -- Test: User1 CAN insert message in their conversation
  SET LOCAL role authenticated;
  SET LOCAL request.jwt.claims = json_build_object('sub', user1_auth_id::text)::text;

  BEGIN
    INSERT INTO messages (conversation_id, sender_id, content, created_at)
    VALUES (conv_id, user1_member_id, 'Another test message', NOW())
    RETURNING id INTO test_msg_id;
    insert_succeeded := TRUE;
  EXCEPTION WHEN OTHERS THEN
    insert_succeeded := FALSE;
  END;

  PERFORM assert_equals(TRUE, insert_succeeded, 'User1 can insert message in their conversation');

  -- Test: User3 CANNOT insert message in conversation they are not part of
  SET LOCAL request.jwt.claims = json_build_object('sub', user3_auth_id::text)::text;

  BEGIN
    INSERT INTO messages (conversation_id, sender_id, content, created_at)
    VALUES (conv_id, (SELECT user3_member_id FROM test_data), 'Unauthorized message', NOW());
    insert_succeeded := TRUE;
  EXCEPTION WHEN OTHERS THEN
    insert_succeeded := FALSE;
  END;

  PERFORM assert_equals(FALSE, insert_succeeded, 'User3 cannot insert message in conversation they are not in');

  RESET role;
END $$;

-- ============================================================================
-- TEST: Blocked Users - Users can only manage their own blocks
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE 'Testing BLOCKED_USERS table RLS policies';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

DO $$
DECLARE
  user1_auth_id UUID;
  user2_auth_id UUID;
  user1_member_id UUID;
  user2_member_id UUID;
  block_id UUID;
  result_count INT;
  insert_succeeded BOOLEAN;
BEGIN
  SELECT t.user1_auth_id, t.user2_auth_id, t.user1_member_id, t.user2_member_id
  INTO user1_auth_id, user2_auth_id, user1_member_id, user2_member_id
  FROM test_data t;

  -- Test: User1 can block User2
  SET LOCAL role authenticated;
  SET LOCAL request.jwt.claims = json_build_object('sub', user1_auth_id::text)::text;

  BEGIN
    INSERT INTO blocked_users (blocker_id, blocked_id, created_at)
    VALUES (user1_member_id, user2_member_id, NOW())
    RETURNING id INTO block_id;
    insert_succeeded := TRUE;
  EXCEPTION WHEN OTHERS THEN
    insert_succeeded := FALSE;
  END;

  PERFORM assert_equals(TRUE, insert_succeeded, 'User1 can block User2');

  -- Test: User1 can see their own blocks
  SELECT COUNT(*) INTO result_count
  FROM blocked_users
  WHERE blocker_id = user1_member_id;

  PERFORM assert_equals(1, result_count, 'User1 can view their own blocks');

  -- Test: User2 CANNOT see User1's blocks
  SET LOCAL request.jwt.claims = json_build_object('sub', user2_auth_id::text)::text;

  SELECT COUNT(*) INTO result_count
  FROM blocked_users
  WHERE blocker_id = user1_member_id;

  PERFORM assert_equals(0, result_count, 'User2 cannot view User1s blocks');

  -- Test: User1 can unblock User2
  SET LOCAL request.jwt.claims = json_build_object('sub', user1_auth_id::text)::text;

  DELETE FROM blocked_users WHERE id = block_id;

  SELECT COUNT(*) INTO result_count
  FROM blocked_users
  WHERE id = block_id;

  PERFORM assert_equals(0, result_count, 'User1 can unblock User2');

  RESET role;
END $$;

-- ============================================================================
-- TEST: Read Receipts - Users can update their own read status
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE 'Testing CONVERSATION_PARTICIPANTS read receipt policies';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

DO $$
DECLARE
  user1_auth_id UUID;
  user2_auth_id UUID;
  user1_member_id UUID;
  user2_member_id UUID;
  conv_id UUID;
  update_succeeded BOOLEAN;
BEGIN
  SELECT t.user1_auth_id, t.user2_auth_id, t.user1_member_id, t.user2_member_id, t.conv_id
  INTO user1_auth_id, user2_auth_id, user1_member_id, user2_member_id, conv_id
  FROM test_data t;

  -- Test: User2 can update their own last_read_at
  SET LOCAL role authenticated;
  SET LOCAL request.jwt.claims = json_build_object('sub', user2_auth_id::text)::text;

  BEGIN
    UPDATE conversation_participants
    SET last_read_at = NOW()
    WHERE conversation_id = conv_id AND member_id = user2_member_id;
    update_succeeded := TRUE;
  EXCEPTION WHEN OTHERS THEN
    update_succeeded := FALSE;
  END;

  PERFORM assert_equals(TRUE, update_succeeded, 'User2 can update their own read receipt');

  -- Test: User2 CANNOT update User1's last_read_at
  BEGIN
    UPDATE conversation_participants
    SET last_read_at = NOW()
    WHERE conversation_id = conv_id AND member_id = user1_member_id;
    GET DIAGNOSTICS update_succeeded = ROW_COUNT;
    update_succeeded := (update_succeeded > 0);
  EXCEPTION WHEN OTHERS THEN
    update_succeeded := FALSE;
  END;

  PERFORM assert_equals(FALSE, update_succeeded, 'User2 cannot update User1s read receipt');

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
  user1_auth_id UUID;
  user2_auth_id UUID;
  user3_auth_id UUID;
BEGIN
  SELECT t.user1_auth_id, t.user2_auth_id, t.user3_auth_id
  INTO user1_auth_id, user2_auth_id, user3_auth_id
  FROM test_data t;

  DELETE FROM blocked_users WHERE blocker_id IN (
    SELECT id FROM members WHERE user_id IN (user1_auth_id, user2_auth_id, user3_auth_id)
  );
  DELETE FROM messages WHERE sender_id IN (
    SELECT id FROM members WHERE user_id IN (user1_auth_id, user2_auth_id, user3_auth_id)
  );
  DELETE FROM conversation_participants WHERE member_id IN (
    SELECT id FROM members WHERE user_id IN (user1_auth_id, user2_auth_id, user3_auth_id)
  );
  DELETE FROM conversations WHERE id IN (
    SELECT DISTINCT conversation_id FROM conversation_participants WHERE member_id IN (
      SELECT id FROM members WHERE user_id IN (user1_auth_id, user2_auth_id, user3_auth_id)
    )
  );
  DELETE FROM members WHERE user_id IN (user1_auth_id, user2_auth_id, user3_auth_id);
  DELETE FROM auth.users WHERE id IN (user1_auth_id, user2_auth_id, user3_auth_id);

  DROP TABLE IF EXISTS test_data;
  DROP FUNCTION IF EXISTS assert_equals;

  RAISE NOTICE 'Cleanup complete';
END $$;

RAISE NOTICE '';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE '✓ ALL MESSAGING RLS TESTS COMPLETE';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

ROLLBACK;
