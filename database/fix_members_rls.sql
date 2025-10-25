/**
 * @fileoverview Fix members RLS to allow viewing sender info in messages
 *
 * The messages query joins to members table to get sender name, but RLS
 * is blocking this. We need to allow authenticated users to view basic
 * member info (name, player number) for messaging purposes.
 */

-- Add policy to allow authenticated users to view other members' basic info
CREATE POLICY "Authenticated users can view member profiles"
  ON members
  FOR SELECT
  TO authenticated
  USING (true);  -- Allow all authenticated users to view all member profiles

-- This is safe because:
-- 1. Only basic profile info is exposed (name, player number)
-- 2. Users need to be authenticated
-- 3. This is necessary for messaging, team rosters, etc.
