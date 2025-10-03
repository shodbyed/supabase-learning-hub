-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('player', 'league_operator', 'developer');

-- Create members table (simplified single table approach)
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  nickname VARCHAR(12),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  date_of_birth DATE NOT NULL,
  role user_role DEFAULT 'player',
  pool_hall_ids JSON DEFAULT '[]',
  league_operator_ids JSON DEFAULT '[]',
  membership_paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can manage their own records
CREATE POLICY "Users can manage their own records" ON members
  FOR ALL USING (auth.uid() = user_id);

-- Create policy: Users can view their own records
CREATE POLICY "Users can view their own records" ON members
  FOR SELECT USING (auth.uid() = user_id);