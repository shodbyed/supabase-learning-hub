/**
 * @fileoverview Create Special Substitute Members
 *
 * Creates placeholder member records for home and away substitutes.
 * These allow us to track substitute wins/losses in match games
 * without needing actual member IDs.
 *
 * Usage:
 * - When a team has a substitute, use the appropriate substitute member ID
 * - Stats will accumulate under these substitute IDs
 * - UI can detect these special IDs and display "Substitute" instead of a name
 */

-- Insert special substitute members (using fixed UUIDs for consistency)
-- These won't have user_id (not real users) but can be used as player references

INSERT INTO members (
  id,
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
  user_id
)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Home',
    'Substitute',
    'Sub (Home)',
    '000-000-0001',
    'sub.home@placeholder.local',
    'N/A',
    'N/A',
    'NA',
    '00000',
    '1900-01-01',
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Away',
    'Substitute',
    'Sub (Away)',
    '000-000-0002',
    'sub.away@placeholder.local',
    'N/A',
    'N/A',
    'NA',
    '00000',
    '1900-01-01',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- Add comment explaining these special records
COMMENT ON TABLE members IS
  'Player/member records. Includes two special substitute members with fixed UUIDs:
  - 00000000-0000-0000-0000-000000000001: Home team substitute placeholder
  - 00000000-0000-0000-0000-000000000002: Away team substitute placeholder
  These allow tracking substitute wins/losses in match games.';
