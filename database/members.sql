-- Members Table
-- Represents user profiles for all system users (players, operators, developers)
-- Central table for user information and identity

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('player', 'league_operator', 'developer');

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  -- Primary identification
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Personal information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  nickname VARCHAR(12),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,

  -- Address
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  date_of_birth DATE NOT NULL,

  -- Role and player identification
  role user_role DEFAULT 'player',

  -- Player numbers for identification/display
  system_player_number SERIAL UNIQUE NOT NULL, -- Our internal ID (e.g., P-00001)
  bca_member_number VARCHAR(20) UNIQUE, -- Official BCA number (when available)

  -- Membership status
  membership_paid_date DATE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);
CREATE INDEX IF NOT EXISTS idx_members_state ON members(state);
CREATE INDEX IF NOT EXISTS idx_members_system_number ON members(system_player_number);
CREATE INDEX IF NOT EXISTS idx_members_bca_number ON members(bca_member_number);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_members_updated_at();

-- Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own records"
  ON members FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own records"
  ON members FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own member record during registration
CREATE POLICY "Users can insert their own member record"
  ON members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Operators can view members in their state (for captain selection)
CREATE POLICY "Operators can view members in same state"
  ON members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members AS op_member ON league_operators.member_id = op_member.id
      WHERE op_member.user_id = auth.uid()
      AND op_member.state = members.state
    )
  );

-- Policy: Public can view basic info for active players (for discovery)
-- Future: May want to restrict this further
CREATE POLICY "Public can view active members"
  ON members FOR SELECT
  USING (role IS NOT NULL);

-- Comments for documentation
COMMENT ON TABLE members IS 'User profiles for all system users (players, operators, developers)';
COMMENT ON COLUMN members.system_player_number IS 'System-generated player number (e.g., P-00001) - always assigned, never changes. Used for display when BCA number not available.';
COMMENT ON COLUMN members.bca_member_number IS 'Official BCA member number - null until assigned/discovered. Takes precedence over system number when displayed.';
COMMENT ON COLUMN members.role IS 'User role: player (default), league_operator (can create leagues), developer (system admin)';
COMMENT ON COLUMN members.membership_paid_date IS 'Date when membership dues were last paid';
