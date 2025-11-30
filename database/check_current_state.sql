-- Check current state of database before dropping league_operators

-- Check if operator_id or organization_id exists in leagues table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'leagues'
  AND column_name IN ('operator_id', 'organization_id')
ORDER BY column_name;

-- Check existing foreign key constraints on leagues
SELECT conname as constraint_name
FROM pg_constraint
WHERE conrelid = 'leagues'::regclass
  AND contype = 'f'
  AND conname LIKE '%operator%' OR conname LIKE '%organization%';

-- Check if league_operators table still exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_name = 'league_operators'
) as league_operators_exists;
