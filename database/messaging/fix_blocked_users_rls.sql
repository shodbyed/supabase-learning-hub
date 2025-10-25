/**
 * @fileoverview Fix RLS Policies for blocked_users table
 *
 * BUG FIX: The original RLS policies compared auth.uid() with blocker_id directly,
 * but blocker_id is a member.id (UUID) while auth.uid() is from auth.users.
 * The members table has a user_id field that links to auth.users.
 *
 * FIX: Update policies to lookup the user_id from members table and compare that
 * with auth.uid().
 *
 * ERROR: "new row violates row-level security policy for table blocked_users"
 *
 * Run this SQL in your Supabase SQL editor to fix the blocking functionality.
 */

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own blocks" ON blocked_users;
DROP POLICY IF EXISTS "Users can block others" ON blocked_users;
DROP POLICY IF EXISTS "Users can unblock others" ON blocked_users;

-- Recreate policies with correct logic

-- Policy: Users can view who they've blocked
CREATE POLICY "Users can view their own blocks"
  ON blocked_users
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = blocker_id
    )
  );

-- Policy: Users can block other users
CREATE POLICY "Users can block others"
  ON blocked_users
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = blocker_id
    )
  );

-- Policy: Users can unblock others
CREATE POLICY "Users can unblock others"
  ON blocked_users
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = blocker_id
    )
  );
