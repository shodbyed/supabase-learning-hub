-- Test what auth.uid() returns in the current session
SELECT
  auth.uid() as current_auth_uid,
  auth.role() as current_auth_role;

-- Check if any members exist with this auth.uid()
SELECT
  id as member_id,
  user_id,
  first_name,
  last_name,
  system_player_number
FROM members
WHERE user_id = auth.uid();
