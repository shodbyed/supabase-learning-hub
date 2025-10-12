-- =====================================================
-- SEED TEST USERS - DEVELOPMENT ONLY
-- =====================================================
-- Creates test users for development and testing
-- All test users have password: TestPassword123!
-- Run this AFTER rebuild_all_tables.sql
-- =====================================================

-- NOTE: This inserts into auth.users which requires specific Supabase setup
-- You'll need to use Supabase Dashboard to create users with these emails:
--
-- Test Players:
--   testplayer1@test.com - John Smith (Florida)
--   testplayer2@test.com - Jane Doe (Florida)
--   testplayer3@test.com - Mike Johnson (Florida)
--   testplayer4@test.com - Sarah Williams (Florida)
--   testplayer5@test.com - Tom Brown (California)
--
-- Test Operators:
--   testoperator1@test.com - Bob Operator (Florida)
--   testoperator2@test.com - Alice Manager (California)
--
-- Password for all: TestPassword123!
--
-- After creating users in Supabase Auth, run the SQL below to create member records

-- =====================================================
-- SEED MEMBER DATA (run after creating auth users)
-- =====================================================

-- This assumes you've created the auth users manually in Supabase Dashboard
-- Replace the UUIDs below with actual user_id values from auth.users table

-- Example usage:
-- 1. Create users in Supabase Dashboard Auth section
-- 2. Get their user_id from auth.users table: SELECT id, email FROM auth.users;
-- 3. Replace 'REPLACE-WITH-USER-ID' below with actual UUIDs
-- 4. Run this script

/*
-- Test Player 1: John Smith (Florida)
INSERT INTO members (
  user_id,
  first_name,
  last_name,
  nickname,
  phone,
  email,
  address,
  city,
  state,
  zip_code,
  date_of_birth,
  role
) VALUES (
  'REPLACE-WITH-USER-ID',  -- Get from auth.users where email = 'testplayer1@test.com'
  'John',
  'Smith',
  'Johnny',
  '555-0101',
  'testplayer1@test.com',
  '123 Main St',
  'Miami',
  'FL',
  '33101',
  '1990-01-15',
  'player'
);

-- Test Player 2: Jane Doe (Florida)
INSERT INTO members (
  user_id,
  first_name,
  last_name,
  phone,
  email,
  address,
  city,
  state,
  zip_code,
  date_of_birth,
  role
) VALUES (
  'REPLACE-WITH-USER-ID',  -- Get from auth.users where email = 'testplayer2@test.com'
  'Jane',
  'Doe',
  '555-0102',
  'testplayer2@test.com',
  '456 Oak Ave',
  'Tampa',
  'FL',
  '33602',
  '1992-03-22',
  'player'
);

-- Test Player 3: Mike Johnson (Florida)
INSERT INTO members (
  user_id,
  first_name,
  last_name,
  phone,
  email,
  address,
  city,
  state,
  zip_code,
  date_of_birth,
  role
) VALUES (
  'REPLACE-WITH-USER-ID',  -- Get from auth.users where email = 'testplayer3@test.com'
  'Mike',
  'Johnson',
  '555-0103',
  'testplayer3@test.com',
  '789 Pine Rd',
  'Orlando',
  'FL',
  '32801',
  '1988-07-10',
  'player'
);

-- Test Player 4: Sarah Williams (Florida)
INSERT INTO members (
  user_id,
  first_name,
  last_name,
  nickname,
  phone,
  email,
  address,
  city,
  state,
  zip_code,
  date_of_birth,
  role
) VALUES (
  'REPLACE-WITH-USER-ID',  -- Get from auth.users where email = 'testplayer4@test.com'
  'Sarah',
  'Williams',
  'Sar',
  '555-0104',
  'testplayer4@test.com',
  '321 Elm St',
  'Jacksonville',
  'FL',
  '32099',
  '1995-11-30',
  'player'
);

-- Test Player 5: Tom Brown (California - different state)
INSERT INTO members (
  user_id,
  first_name,
  last_name,
  phone,
  email,
  address,
  city,
  state,
  zip_code,
  date_of_birth,
  role
) VALUES (
  'REPLACE-WITH-USER-ID',  -- Get from auth.users where email = 'testplayer5@test.com'
  'Tom',
  'Brown',
  '555-0105',
  'testplayer5@test.com',
  '999 Beach Blvd',
  'Los Angeles',
  'CA',
  '90001',
  '1991-05-18',
  'player'
);

-- Test Operator 1: Bob Operator (Florida)
-- First create member record
INSERT INTO members (
  user_id,
  first_name,
  last_name,
  phone,
  email,
  address,
  city,
  state,
  zip_code,
  date_of_birth,
  role
) VALUES (
  'REPLACE-WITH-USER-ID',  -- Get from auth.users where email = 'testoperator1@test.com'
  'Bob',
  'Operator',
  '555-0201',
  'testoperator1@test.com',
  '111 Business St',
  'Miami',
  'FL',
  '33101',
  '1985-09-12',
  'league_operator'
);

-- Then create operator profile (replace member_id with the actual UUID from members table)
INSERT INTO league_operators (
  member_id,
  organization_name,
  organization_address,
  organization_city,
  organization_state,
  organization_zip_code,
  contact_disclaimer_acknowledged,
  league_email,
  email_visibility,
  league_phone,
  phone_visibility,
  stripe_customer_id,
  payment_method_id,
  card_last4,
  card_brand,
  expiry_month,
  expiry_year,
  billing_zip,
  payment_verified
) VALUES (
  'REPLACE-WITH-MEMBER-ID',  -- Get from members where email = 'testoperator1@test.com'
  'Florida Pool League',
  '111 Business St',
  'Miami',
  'FL',
  '33101',
  true,
  'bob@floridapool.com',
  'my_teams',
  '555-0201',
  'my_teams',
  'cus_test_bob123456',
  'pm_test_bob123456',
  '4242',
  'visa',
  12,
  2026,
  '33101',
  true
);

-- Test Operator 2: Alice Manager (California)
INSERT INTO members (
  user_id,
  first_name,
  last_name,
  phone,
  email,
  address,
  city,
  state,
  zip_code,
  date_of_birth,
  role
) VALUES (
  'REPLACE-WITH-USER-ID',  -- Get from auth.users where email = 'testoperator2@test.com'
  'Alice',
  'Manager',
  '555-0202',
  'testoperator2@test.com',
  '222 League Ave',
  'Los Angeles',
  'CA',
  '90001',
  '1987-04-25',
  'league_operator'
);

INSERT INTO league_operators (
  member_id,
  organization_name,
  organization_address,
  organization_city,
  organization_state,
  organization_zip_code,
  contact_disclaimer_acknowledged,
  league_email,
  email_visibility,
  league_phone,
  phone_visibility,
  stripe_customer_id,
  payment_method_id,
  card_last4,
  card_brand,
  expiry_month,
  expiry_year,
  billing_zip,
  payment_verified
) VALUES (
  'REPLACE-WITH-MEMBER-ID',  -- Get from members where email = 'testoperator2@test.com'
  'California Billiards Association',
  '222 League Ave',
  'Los Angeles',
  'CA',
  '90001',
  true,
  'alice@cabilliards.com',
  'anyone',
  '555-0202',
  'anyone',
  'cus_test_alice123456',
  'pm_test_alice123456',
  '5555',
  'mastercard',
  6,
  2027,
  '90001',
  true
);
*/

-- =====================================================
-- MANUAL STEPS REQUIRED
-- =====================================================
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" for each test user
-- 3. Use emails above with password: TestPassword123!
-- 4. After creating, run: SELECT id, email FROM auth.users;
-- 5. Copy user IDs and replace REPLACE-WITH-USER-ID in SQL above
-- 6. Get member IDs: SELECT id, email FROM members;
-- 7. Replace REPLACE-WITH-MEMBER-ID in operator inserts
-- 8. Run the uncommented SQL sections
-- =====================================================
