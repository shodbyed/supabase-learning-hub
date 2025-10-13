-- Venue Owners Table (FUTURE FEATURE)
-- Represents bar/poolhall owners who can manage their venue and approve/deny operators
-- Not implemented yet - table structure prepared for future permission system

CREATE TABLE IF NOT EXISTS venue_owners (
  -- Primary identification
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Links to auth system (venue owner creates account)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Business information
  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_venue_owners_user ON venue_owners(user_id);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_venue_owners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER venue_owners_updated_at
  BEFORE UPDATE ON venue_owners
  FOR EACH ROW
  EXECUTE FUNCTION update_venue_owners_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE venue_owners ENABLE ROW LEVEL SECURITY;

-- Policy: Venue owners can view their own profile
CREATE POLICY "Venue owners can view own profile"
  ON venue_owners FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Venue owners can create their own profile
CREATE POLICY "Venue owners can create profile"
  ON venue_owners FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Venue owners can update their own profile
CREATE POLICY "Venue owners can update own profile"
  ON venue_owners FOR UPDATE
  USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE venue_owners IS 'FUTURE: Bar/poolhall owner accounts for venue permission management';
COMMENT ON COLUMN venue_owners.business_name IS 'Name of the bar/poolhall business';
