-- =====================================================
-- FIX VENUE PERSISTENCE
-- =====================================================
-- Purpose: Make venues persist even when the operator who created them is deleted
-- Date: 2025-01-07
--
-- Changes:
-- 1. Make venues.created_by_operator_id nullable
-- 2. Change ON DELETE CASCADE to ON DELETE SET NULL
-- 3. Add helper function to find duplicate venues
-- 4. Add helper view to track venue usage by organization
--
-- Why: Venues are physical locations that should persist regardless of operator status.
-- Multiple operators may use the same venue. Deleting an organization shouldn't delete
-- the venue, only remove the organization's association with it.
-- =====================================================

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE venues
  DROP CONSTRAINT IF EXISTS venues_created_by_operator_id_fkey;

-- Step 2: Make the column nullable (allow venues to exist without original operator)
ALTER TABLE venues
  ALTER COLUMN created_by_operator_id DROP NOT NULL;

-- Step 3: Re-add foreign key with SET NULL instead of CASCADE
ALTER TABLE venues
  ADD CONSTRAINT venues_created_by_operator_id_fkey
  FOREIGN KEY (created_by_operator_id)
  REFERENCES league_operators(id)
  ON DELETE SET NULL;

-- Step 4: Create function to find potential duplicate venues
-- Helps operators check if venue already exists before creating new one
CREATE OR REPLACE FUNCTION find_duplicate_venues(
  p_street_address VARCHAR(255),
  p_city VARCHAR(100),
  p_state VARCHAR(2),
  p_zip_code VARCHAR(10)
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  street_address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  phone VARCHAR(20),
  total_tables INT,
  created_by_operator_name VARCHAR(255),
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.name,
    v.street_address,
    v.city,
    v.state,
    v.zip_code,
    v.phone,
    v.total_tables,
    lo.organization_name as created_by_operator_name,
    v.is_active
  FROM venues v
  LEFT JOIN league_operators lo ON v.created_by_operator_id = lo.id
  WHERE
    -- Match address components (case insensitive, trimmed)
    LOWER(TRIM(v.street_address)) = LOWER(TRIM(p_street_address))
    AND LOWER(TRIM(v.city)) = LOWER(TRIM(p_city))
    AND UPPER(TRIM(v.state)) = UPPER(TRIM(p_state))
    AND REPLACE(v.zip_code, '-', '') = REPLACE(p_zip_code, '-', ''); -- Normalize zip format
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create view to track which organizations use which venues
-- Shows current usage and last match date
CREATE OR REPLACE VIEW venue_organization_usage AS
SELECT DISTINCT
  v.id as venue_id,
  v.name as venue_name,
  v.street_address,
  v.city,
  v.state,
  lo.id as operator_id,
  lo.organization_name,
  lv.added_at as first_authorized_at,
  lv.updated_at as last_authorized_update,
  (
    SELECT MAX(m.match_date)
    FROM matches m
    JOIN teams t ON (m.home_team_id = t.id OR m.away_team_id = t.id)
    WHERE (m.scheduled_venue_id = v.id OR m.actual_venue_id = v.id)
    AND t.league_id = l.id
  ) as last_match_date,
  COUNT(DISTINCT l.id) as leagues_using_venue
FROM venues v
LEFT JOIN league_venues lv ON v.id = lv.venue_id
LEFT JOIN leagues l ON lv.league_id = l.id
LEFT JOIN league_operators lo ON l.operator_id = lo.id
GROUP BY
  v.id, v.name, v.street_address, v.city, v.state,
  lo.id, lo.organization_name,
  lv.added_at, lv.updated_at;

-- Step 6: Add comments
COMMENT ON FUNCTION find_duplicate_venues IS 'Helper function to check if a venue already exists before creating a duplicate. Returns matching venues based on normalized address.';
COMMENT ON VIEW venue_organization_usage IS 'Tracks which organizations are using which venues, when they were authorized, and when last used for a match.';

-- Step 7: Update table comment to reflect new behavior
COMMENT ON COLUMN venues.created_by_operator_id IS 'Operator who first created this venue - can be NULL if original operator deleted. Venue persists independently.';

-- =====================================================
-- VERIFICATION QUERIES (Run these to verify changes)
-- =====================================================

-- Check the new foreign key constraint
-- SELECT conname, confdeltype
-- FROM pg_constraint
-- WHERE conname = 'venues_created_by_operator_id_fkey';
-- Should show confdeltype = 'n' (SET NULL)

-- Test duplicate detection
-- SELECT * FROM find_duplicate_venues('123 Main St', 'Springfield', 'IL', '62701');

-- Check venue usage by organization
-- SELECT * FROM venue_organization_usage WHERE venue_id = '<some-venue-id>';
