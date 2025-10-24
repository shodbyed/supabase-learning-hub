-- Championship Date Options Table
-- Stores community-submitted and dev-verified championship dates for BCA and APA nationals
-- Used in season creation wizard to help operators avoid scheduling conflicts

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Championship dates are viewable by everyone" ON championship_date_options;
DROP POLICY IF EXISTS "Operators can submit championship dates" ON championship_date_options;
DROP POLICY IF EXISTS "Operators can update championship dates" ON championship_date_options;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS championship_date_options_updated_at_trigger ON championship_date_options;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_championship_date_options_updated_at();

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS unique_dates_per_org_year;
DROP INDEX IF EXISTS idx_championship_org_year;
DROP INDEX IF EXISTS idx_championship_end_date;
DROP INDEX IF EXISTS idx_championship_dev_verified;

-- Drop the table if it exists (WARNING: This will delete all data!)
DROP TABLE IF EXISTS championship_date_options;

-- Create the table
CREATE TABLE championship_date_options (
  -- Primary identification
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Tournament identification
  organization TEXT NOT NULL CHECK (organization IN ('BCA', 'APA')),
  year INTEGER NOT NULL CHECK (year >= 2024 AND year <= 2050),

  -- Date range for the championship
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Community verification
  vote_count INTEGER NOT NULL DEFAULT 1 CHECK (vote_count >= 1),
  dev_verified BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Validation: end_date must be after start_date
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Prevent duplicate date entries for same organization/year
CREATE UNIQUE INDEX unique_dates_per_org_year
ON championship_date_options (organization, year, start_date, end_date);

-- Index for common queries (organization + year filtering)
CREATE INDEX idx_championship_org_year
ON championship_date_options (organization, year);

-- Index for filtering future dates
CREATE INDEX idx_championship_end_date
ON championship_date_options (end_date);

-- Index for finding dev-verified dates quickly
CREATE INDEX idx_championship_dev_verified
ON championship_date_options (organization, year, dev_verified);

-- Trigger to auto-update updated_at timestamp
CREATE FUNCTION update_championship_date_options_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER championship_date_options_updated_at_trigger
  BEFORE UPDATE ON championship_date_options
  FOR EACH ROW
  EXECUTE FUNCTION update_championship_date_options_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE championship_date_options ENABLE ROW LEVEL SECURITY;

-- Everyone can view championship dates (needed for season creation)
CREATE POLICY "Championship dates are viewable by everyone"
  ON championship_date_options FOR SELECT
  USING (true);

-- Authenticated operators can submit championship dates
CREATE POLICY "Operators can submit championship dates"
  ON championship_date_options FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated operators can update vote counts
-- (Typically done by incrementing vote_count when dates match user submission)
CREATE POLICY "Operators can update championship dates"
  ON championship_date_options FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Add table comment for documentation
COMMENT ON TABLE championship_date_options IS
'Stores championship tournament dates with community vote counts. Dev-verified dates are authoritative and bypass user selection.';

COMMENT ON COLUMN championship_date_options.organization IS
'Tournament organization: BCA or APA';

COMMENT ON COLUMN championship_date_options.year IS
'Championship year (used for cleanup of past dates)';

COMMENT ON COLUMN championship_date_options.vote_count IS
'Number of operators who have confirmed these dates';

COMMENT ON COLUMN championship_date_options.dev_verified IS
'When true, these dates are authoritative and can auto-fill in wizard';
