-- Verification queries for league_operators table drop migration

-- 1. Confirm league_operators table is gone
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'league_operators')
    THEN '❌ FAILED: league_operators still exists'
    ELSE '✅ SUCCESS: league_operators table dropped'
  END as table_status;

-- 2. Check leagues table has organization_id column
SELECT
  COUNT(*) as league_count,
  COUNT(organization_id) as leagues_with_org_id,
  CASE
    WHEN COUNT(*) = COUNT(organization_id) THEN '✅ All leagues have organization_id'
    ELSE '❌ Some leagues missing organization_id'
  END as status
FROM leagues;

-- 3. Check operator_blackout_preferences has organization_id
SELECT
  COUNT(*) as preference_count,
  COUNT(organization_id) as prefs_with_org_id,
  CASE
    WHEN COUNT(*) = COUNT(organization_id) THEN '✅ All preferences have organization_id'
    ELSE '❌ Some preferences missing organization_id'
  END as status
FROM operator_blackout_preferences;

-- 4. Check venues table (created_by_organization_id can be NULL, that's OK)
SELECT
  COUNT(*) as venue_count,
  COUNT(created_by_organization_id) as venues_with_creator,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ Venues table intact'
    ELSE '❌ No venues found'
  END as status
FROM venues;

-- 5. Verify foreign key constraints exist and point to organizations
SELECT
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as references_table
FROM pg_constraint
WHERE confrelid = 'organizations'::regclass
  AND contype = 'f'
ORDER BY conrelid::regclass::text;

-- 6. Sample data check - show a few leagues with their organization names
SELECT
  l.id,
  l.organization_id,
  o.organization_name,
  l.game_type,
  l.day_of_week
FROM leagues l
JOIN organizations o ON l.organization_id = o.id
LIMIT 5;
