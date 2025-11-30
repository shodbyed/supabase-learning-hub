/**
 * Data Migration: Copy existing league_operator to new structure
 *
 * Migrates the single existing league operator:
 * - operator_id: 179e8f3d-9856-47bc-98e6-2b22e809f3f2
 * - member_id: 0cf4b3d9-108c-43aa-92a4-90961dc9e76b
 *
 * Steps:
 * 1. Copy league_operators record → organizations table (preserving ID)
 * 2. Create organization_staff record (member as 'owner')
 * 3. Verify the migration
 */

-- Step 1: Copy league_operator data to organizations table
-- Using the same ID so foreign keys in other tables still work
-- Visibility values (my_organization, my_teams, public) are preserved as-is
INSERT INTO organizations (
  id,
  organization_name,
  organization_address,
  organization_city,
  organization_state,
  organization_zip_code,
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
  payment_verified,
  profanity_filter_enabled,
  created_by,
  created_at,
  updated_at
)
SELECT
  id,
  organization_name,
  organization_address,
  organization_city,
  organization_state,
  organization_zip_code,
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
  payment_verified,
  profanity_filter_enabled,
  member_id,  -- The member who created it becomes created_by
  created_at,
  updated_at
FROM league_operators
WHERE id = '179e8f3d-9856-47bc-98e6-2b22e809f3f2';

-- Step 2: Create organization_staff record
-- The trigger will automatically create this when organization is inserted above
-- But we can verify it exists:

-- Verify owner staff record was created
DO $$
DECLARE
  staff_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO staff_count
  FROM organization_staff
  WHERE organization_id = '179e8f3d-9856-47bc-98e6-2b22e809f3f2'
    AND member_id = '0cf4b3d9-108c-43aa-92a4-90961dc9e76b'
    AND position = 'owner';

  IF staff_count = 0 THEN
    RAISE EXCEPTION 'Owner staff record was not created by trigger!';
  END IF;

  RAISE NOTICE 'Migration successful! Owner staff record exists.';
END $$;

-- Step 3: Verification queries
-- Show what was migrated
SELECT
  o.id AS organization_id,
  o.organization_name,
  os.member_id,
  os.position,
  os.added_at
FROM organizations o
JOIN organization_staff os ON os.organization_id = o.id
WHERE o.id = '179e8f3d-9856-47bc-98e6-2b22e809f3f2';
