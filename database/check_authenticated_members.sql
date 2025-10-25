-- Check which members have authentication (user_id is not null)
SELECT
  id,
  user_id,
  first_name,
  last_name,
  system_player_number,
  email
FROM members
WHERE user_id IS NOT NULL
ORDER BY created_at DESC;

-- Also check the specific sender having issues
SELECT
  id,
  user_id,
  first_name,
  last_name,
  system_player_number
FROM members
WHERE id = '5a5eb3dd-f9d0-40f3-9977-4775e220cacf';
