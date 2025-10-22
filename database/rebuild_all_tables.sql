-- =====================================================
-- REBUILD ALL TABLES - DEVELOPMENT ONLY
-- =====================================================
-- WARNING: This will DROP ALL TABLES and recreate them
-- Only use in local development environment
-- All data will be lost
-- =====================================================

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS team_players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS league_venues CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS venue_owners CASCADE;
DROP TABLE IF EXISTS season_weeks CASCADE;
DROP TABLE IF EXISTS seasons CASCADE;
DROP TABLE IF EXISTS operator_blackout_preferences CASCADE;
DROP TABLE IF EXISTS championship_date_options CASCADE;
DROP TABLE IF EXISTS leagues CASCADE;
DROP TABLE IF EXISTS league_operators CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TYPE IF EXISTS preference_type CASCADE;
DROP TYPE IF EXISTS preference_action CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- =====================================================
-- 1. MEMBERS TABLE
-- =====================================================

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('player', 'league_operator', 'developer');

-- Create members table
CREATE TABLE members (
  -- Primary identification
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Personal information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  nickname VARCHAR(12) NOT NULL, -- Auto-generated if user doesn't provide one
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

-- Indexes
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_role ON members(role);
CREATE INDEX idx_members_state ON members(state);
CREATE INDEX idx_members_system_number ON members(system_player_number);
CREATE INDEX idx_members_bca_number ON members(bca_member_number);

-- Trigger
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

-- RLS - Basic policies only (operator policy added after league_operators table created)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own records"
  ON members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own records"
  ON members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own member record"
  ON members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view active members"
  ON members FOR SELECT
  USING (role IS NOT NULL);

-- =====================================================
-- 2. LEAGUE OPERATORS TABLE
-- =====================================================

CREATE TABLE league_operators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,

  -- Organization information
  organization_name VARCHAR(255) NOT NULL,
  organization_address VARCHAR(255) NOT NULL,
  organization_city VARCHAR(100) NOT NULL,
  organization_state VARCHAR(2) NOT NULL,
  organization_zip_code VARCHAR(10) NOT NULL,

  -- Contact
  contact_disclaimer_acknowledged BOOLEAN NOT NULL DEFAULT false,
  league_email VARCHAR(255) NOT NULL,
  email_visibility VARCHAR(20) NOT NULL DEFAULT 'in_app_only' CHECK (email_visibility IN (
    'in_app_only', 'my_organization', 'my_team_captains', 'my_teams', 'anyone'
  )),
  league_phone VARCHAR(20) NOT NULL,
  phone_visibility VARCHAR(20) NOT NULL DEFAULT 'in_app_only' CHECK (phone_visibility IN (
    'in_app_only', 'my_organization', 'my_team_captains', 'my_teams', 'anyone'
  )),

  -- Payment
  stripe_customer_id VARCHAR(100) NOT NULL,
  payment_method_id VARCHAR(100) NOT NULL,
  card_last4 VARCHAR(4) NOT NULL,
  card_brand VARCHAR(20) NOT NULL,
  expiry_month INTEGER NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
  expiry_year INTEGER NOT NULL CHECK (expiry_year >= 2025),
  billing_zip VARCHAR(10) NOT NULL,
  payment_verified BOOLEAN NOT NULL DEFAULT false,

  -- Championship Preferences (auto-skip if saved and still valid)
  preferred_bca_championship_id UUID REFERENCES championship_date_options(id) ON DELETE SET NULL,
  preferred_apa_championship_id UUID REFERENCES championship_date_options(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_league_operators_member_id ON league_operators(member_id);
CREATE INDEX idx_league_operators_org_name ON league_operators(organization_name);
CREATE INDEX idx_league_operators_stripe_customer ON league_operators(stripe_customer_id);
CREATE INDEX idx_league_operators_preferred_bca ON league_operators(preferred_bca_championship_id);
CREATE INDEX idx_league_operators_preferred_apa ON league_operators(preferred_apa_championship_id);

CREATE OR REPLACE FUNCTION update_league_operators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER league_operators_updated_at
  BEFORE UPDATE ON league_operators
  FOR EACH ROW
  EXECUTE FUNCTION update_league_operators_updated_at();

ALTER TABLE league_operators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators can manage their own profile" ON league_operators
  FOR ALL
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can view their own profile" ON league_operators
  FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 3. LEAGUES TABLE
-- =====================================================

CREATE TABLE leagues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID NOT NULL REFERENCES league_operators(id) ON DELETE CASCADE,

  game_type VARCHAR(20) NOT NULL CHECK (game_type IN ('eight_ball', 'nine_ball', 'ten_ball')),
  day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  division VARCHAR(50),
  team_format VARCHAR(20) NOT NULL CHECK (team_format IN ('5_man', '8_man')),

  league_start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned'))
);

CREATE INDEX idx_leagues_operator_id ON leagues(operator_id);
CREATE INDEX idx_leagues_status ON leagues(status);
CREATE INDEX idx_leagues_day_of_week ON leagues(day_of_week);

CREATE OR REPLACE FUNCTION update_leagues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leagues_updated_at_trigger
  BEFORE UPDATE ON leagues
  FOR EACH ROW
  EXECUTE FUNCTION update_leagues_updated_at();

ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators can view own leagues"
  ON leagues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members ON members.id = league_operators.member_id
      WHERE league_operators.id = operator_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can create own leagues"
  ON leagues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members ON members.id = league_operators.member_id
      WHERE league_operators.id = operator_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can update own leagues"
  ON leagues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members ON members.id = league_operators.member_id
      WHERE league_operators.id = operator_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can delete own leagues"
  ON leagues FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members ON members.id = league_operators.member_id
      WHERE league_operators.id = operator_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active leagues"
  ON leagues FOR SELECT
  USING (status = 'active');

-- =====================================================
-- 4. CHAMPIONSHIP DATE OPTIONS TABLE
-- =====================================================

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

-- =====================================================
-- 5. OPERATOR BLACKOUT PREFERENCES TABLE
-- =====================================================

-- Create custom types for preferences
CREATE TYPE preference_type AS ENUM ('holiday', 'championship', 'custom');
CREATE TYPE preference_action AS ENUM ('blackout', 'ignore');

CREATE TABLE operator_blackout_preferences (
  -- Primary identification
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Which operator owns this preference
  operator_id UUID NOT NULL REFERENCES league_operators(id) ON DELETE CASCADE,

  -- What type of preference is this
  preference_type preference_type NOT NULL,

  -- What action should be taken (blackout week or ignore conflict)
  preference_action preference_action NOT NULL,

  -- For type = 'holiday'
  holiday_name TEXT,

  -- For type = 'championship'
  championship_id UUID REFERENCES championship_date_options(id) ON DELETE SET NULL,

  -- For type = 'custom'
  custom_name TEXT,
  custom_start_date DATE,
  custom_end_date DATE,

  -- Should this be automatically applied when creating new seasons
  auto_apply BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Validation constraints
  CONSTRAINT valid_holiday_preference CHECK (
    preference_type != 'holiday' OR holiday_name IS NOT NULL
  ),
  CONSTRAINT valid_championship_preference CHECK (
    preference_type != 'championship' OR championship_id IS NOT NULL
  ),
  CONSTRAINT valid_custom_preference CHECK (
    preference_type != 'custom' OR (
      custom_name IS NOT NULL AND
      custom_start_date IS NOT NULL AND
      custom_end_date IS NOT NULL AND
      custom_end_date >= custom_start_date
    )
  )
);

-- Indexes
CREATE INDEX idx_operator_blackout_preferences_operator_id
ON operator_blackout_preferences(operator_id);

CREATE INDEX idx_operator_blackout_preferences_type_action
ON operator_blackout_preferences(preference_type, preference_action);

CREATE INDEX idx_operator_blackout_preferences_championship_id
ON operator_blackout_preferences(championship_id)
WHERE championship_id IS NOT NULL;

-- Trigger for updated_at
CREATE FUNCTION update_operator_blackout_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER operator_blackout_preferences_updated_at_trigger
  BEFORE UPDATE ON operator_blackout_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_operator_blackout_preferences_updated_at();

-- RLS Policies
ALTER TABLE operator_blackout_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators can view their own preferences"
  ON operator_blackout_preferences FOR SELECT
  USING (
    operator_id IN (
      SELECT id FROM league_operators WHERE member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Operators can insert their own preferences"
  ON operator_blackout_preferences FOR INSERT
  WITH CHECK (
    operator_id IN (
      SELECT id FROM league_operators WHERE member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Operators can update their own preferences"
  ON operator_blackout_preferences FOR UPDATE
  USING (
    operator_id IN (
      SELECT id FROM league_operators WHERE member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Operators can delete their own preferences"
  ON operator_blackout_preferences FOR DELETE
  USING (
    operator_id IN (
      SELECT id FROM league_operators WHERE member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- =====================================================
-- 6. SEASONS TABLE
-- =====================================================

CREATE TABLE seasons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  season_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  season_length INTEGER NOT NULL CHECK (season_length >= 10 AND season_length <= 52),
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming',
  season_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_seasons_league_id ON seasons(league_id);
CREATE INDEX idx_seasons_status ON seasons(status);
CREATE INDEX idx_seasons_dates ON seasons(start_date, end_date);

CREATE OR REPLACE FUNCTION update_seasons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seasons_updated_at
  BEFORE UPDATE ON seasons
  FOR EACH ROW
  EXECUTE FUNCTION update_seasons_updated_at();

ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators can view own league seasons"
  ON seasons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can create seasons for own leagues"
  ON seasons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can update own league seasons"
  ON seasons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can delete own league seasons"
  ON seasons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active seasons"
  ON seasons FOR SELECT
  USING (status = 'active');

-- =====================================================
-- 6. SEASON WEEKS TABLE
-- =====================================================

CREATE TABLE season_weeks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,

  scheduled_date DATE NOT NULL,
  week_name TEXT NOT NULL,
  week_type VARCHAR(20) NOT NULL CHECK (week_type IN ('regular', 'blackout', 'playoffs', 'season_end_break')),
  week_completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_season_date UNIQUE (season_id, scheduled_date)
);

CREATE INDEX idx_season_weeks_season_id ON season_weeks(season_id);
CREATE INDEX idx_season_weeks_date ON season_weeks(scheduled_date);
CREATE INDEX idx_season_weeks_type ON season_weeks(week_type);
CREATE INDEX idx_season_weeks_completed ON season_weeks(week_completed);

CREATE OR REPLACE FUNCTION update_season_weeks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER season_weeks_updated_at
  BEFORE UPDATE ON season_weeks
  FOR EACH ROW
  EXECUTE FUNCTION update_season_weeks_updated_at();

ALTER TABLE season_weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators can view own league season weeks"
  ON season_weeks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM seasons
      JOIN leagues ON seasons.league_id = leagues.id
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE seasons.id = season_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can create season weeks for own leagues"
  ON season_weeks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM seasons
      JOIN leagues ON seasons.league_id = leagues.id
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE seasons.id = season_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can update own league season weeks"
  ON season_weeks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM seasons
      JOIN leagues ON seasons.league_id = leagues.id
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE seasons.id = season_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can delete own league season weeks"
  ON season_weeks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM seasons
      JOIN leagues ON seasons.league_id = leagues.id
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE seasons.id = season_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active season weeks"
  ON season_weeks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM seasons
      WHERE seasons.id = season_id
      AND seasons.status = 'active'
    )
  );

-- =====================================================
-- 7. VENUE OWNERS TABLE (FUTURE)
-- =====================================================

CREATE TABLE venue_owners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_venue_owners_user ON venue_owners(user_id);

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

ALTER TABLE venue_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Venue owners can view own profile"
  ON venue_owners FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Venue owners can create profile"
  ON venue_owners FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Venue owners can update own profile"
  ON venue_owners FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 8. VENUES TABLE
-- =====================================================

CREATE TABLE venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by_operator_id UUID NOT NULL REFERENCES league_operators(id) ON DELETE CASCADE,
  venue_owner_id UUID REFERENCES venue_owners(id) ON DELETE SET NULL,

  -- Required
  name VARCHAR(255) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  bar_box_tables INT NOT NULL DEFAULT 0 CHECK (bar_box_tables >= 0),
  regulation_tables INT NOT NULL DEFAULT 0 CHECK (regulation_tables >= 0),
  total_tables INT GENERATED ALWAYS AS (bar_box_tables + regulation_tables) STORED,

  -- Optional
  proprietor_name VARCHAR(255),
  proprietor_phone VARCHAR(20),
  league_contact_name VARCHAR(255),
  league_contact_phone VARCHAR(20),
  league_contact_email VARCHAR(255),
  website VARCHAR(500),
  business_hours TEXT,
  notes TEXT,

  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT venue_must_have_tables CHECK (total_tables > 0)
);

CREATE INDEX idx_venues_operator ON venues(created_by_operator_id);
CREATE INDEX idx_venues_active ON venues(is_active);
CREATE INDEX idx_venues_city_state ON venues(city, state);

CREATE OR REPLACE FUNCTION update_venues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_venues_updated_at();

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators can view all venues"
  ON venues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members ON league_operators.member_id = members.id
      WHERE members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can create venues"
  ON venues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members ON league_operators.member_id = members.id
      WHERE league_operators.id = created_by_operator_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can update own venues"
  ON venues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members ON league_operators.member_id = members.id
      WHERE league_operators.id = created_by_operator_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can delete own venues"
  ON venues FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM league_operators
      JOIN members ON league_operators.member_id = members.id
      WHERE league_operators.id = created_by_operator_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active venues"
  ON venues FOR SELECT
  USING (is_active = true);

-- =====================================================
-- 9. LEAGUE VENUES TABLE
-- =====================================================

CREATE TABLE league_venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,

  available_bar_box_tables INT NOT NULL DEFAULT 0 CHECK (available_bar_box_tables >= 0),
  available_regulation_tables INT NOT NULL DEFAULT 0 CHECK (available_regulation_tables >= 0),
  available_total_tables INT GENERATED ALWAYS AS (available_bar_box_tables + available_regulation_tables) STORED,

  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(league_id, venue_id),
  CONSTRAINT league_venue_must_have_tables CHECK (available_total_tables > 0)
);

CREATE INDEX idx_league_venues_league ON league_venues(league_id);
CREATE INDEX idx_league_venues_venue ON league_venues(venue_id);

CREATE OR REPLACE FUNCTION update_league_venues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER league_venues_updated_at
  BEFORE UPDATE ON league_venues
  FOR EACH ROW
  EXECUTE FUNCTION update_league_venues_updated_at();

ALTER TABLE league_venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators can view own league venues"
  ON league_venues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can add venues to own leagues"
  ON league_venues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can update own league venues"
  ON league_venues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can remove venues from own leagues"
  ON league_venues FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active league venues"
  ON league_venues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = league_id
      AND leagues.status = 'active'
    )
  );

-- =====================================================
-- 10. TEAMS TABLE
-- =====================================================

CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  captain_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  home_venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,

  team_name VARCHAR(100) NOT NULL,
  roster_size INT NOT NULL CHECK (roster_size IN (5, 8)),

  wins INT DEFAULT 0 CHECK (wins >= 0),
  losses INT DEFAULT 0 CHECK (losses >= 0),
  ties INT DEFAULT 0 CHECK (ties >= 0),
  points INT DEFAULT 0 CHECK (points >= 0),
  games_won INT DEFAULT 0 CHECK (games_won >= 0),
  games_lost INT DEFAULT 0 CHECK (games_lost >= 0),

  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'forfeited')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_teams_season ON teams(season_id);
CREATE INDEX idx_teams_league ON teams(league_id);
CREATE INDEX idx_teams_captain ON teams(captain_id);
CREATE INDEX idx_teams_venue ON teams(home_venue_id);
CREATE INDEX idx_teams_status ON teams(status);

CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_teams_updated_at();

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators can view own league teams"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can create teams in own leagues"
  ON teams FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can update own league teams"
  ON teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Captains can update their team"
  ON teams FOR UPDATE
  USING (
    captain_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can delete own league teams"
  ON teams FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE leagues.id = league_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active league teams"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = league_id
      AND leagues.status = 'active'
    )
  );

-- =====================================================
-- 11. TEAM PLAYERS TABLE
-- =====================================================

CREATE TABLE team_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,

  is_captain BOOLEAN DEFAULT FALSE,

  individual_wins INT DEFAULT 0 CHECK (individual_wins >= 0),
  individual_losses INT DEFAULT 0 CHECK (individual_losses >= 0),
  skill_level INT CHECK (skill_level >= 1 AND skill_level <= 9),

  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'dropped')),

  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(team_id, member_id)
);

CREATE INDEX idx_team_players_team ON team_players(team_id);
CREATE INDEX idx_team_players_member ON team_players(member_id);
CREATE INDEX idx_team_players_season ON team_players(season_id);
CREATE INDEX idx_team_players_captain ON team_players(team_id, is_captain);

CREATE OR REPLACE FUNCTION update_team_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_players_updated_at
  BEFORE UPDATE ON team_players
  FOR EACH ROW
  EXECUTE FUNCTION update_team_players_updated_at();

ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators can view own league team players"
  ON team_players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN leagues ON teams.league_id = leagues.id
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE teams.id = team_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can add players to own league teams"
  ON team_players FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      JOIN leagues ON teams.league_id = leagues.id
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE teams.id = team_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can update own league team players"
  ON team_players FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN leagues ON teams.league_id = leagues.id
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE teams.id = team_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can remove players from own league teams"
  ON team_players FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN leagues ON teams.league_id = leagues.id
      JOIN league_operators ON leagues.operator_id = league_operators.id
      JOIN members ON league_operators.member_id = members.id
      WHERE teams.id = team_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Captains can add players to their team"
  ON team_players FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      JOIN members ON teams.captain_id = members.id
      WHERE teams.id = team_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Captains can remove players from their team"
  ON team_players FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN members AS captain ON teams.captain_id = captain.id
      JOIN members AS player ON team_players.member_id = player.id
      WHERE teams.id = team_id
      AND captain.user_id = auth.uid()
      AND player.id != captain.id
    )
  );

CREATE POLICY "Public can view active league team players"
  ON team_players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN leagues ON teams.league_id = leagues.id
      WHERE teams.id = team_id
      AND leagues.status = 'active'
      AND team_players.status = 'active'
    )
  );

-- =====================================================
-- 12. MATCHES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  season_week_id UUID NOT NULL REFERENCES public.season_weeks(id) ON DELETE CASCADE,
  home_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE, -- Null if BYE week
  away_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE, -- Null if BYE week
  scheduled_venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL, -- Original venue
  actual_venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL, -- If venue changed
  match_number INTEGER NOT NULL, -- Order on the night (1, 2, 3...)
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'forfeited', 'postponed')),

  -- Score tracking (nullable until completed)
  home_team_score INTEGER,
  away_team_score INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_matches_season_id ON matches(season_id);
CREATE INDEX idx_matches_season_week_id ON matches(season_week_id);
CREATE INDEX idx_matches_home_team_id ON matches(home_team_id);
CREATE INDEX idx_matches_away_team_id ON matches(away_team_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_scheduled_venue_id ON matches(scheduled_venue_id);
CREATE INDEX idx_matches_actual_venue_id ON matches(actual_venue_id);

CREATE OR REPLACE FUNCTION update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_matches_updated_at();

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are viewable by everyone"
  ON matches FOR SELECT
  USING (true);

CREATE POLICY "League operators can insert matches"
  ON matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM seasons s
      JOIN leagues l ON s.league_id = l.id
      JOIN league_operators lo ON l.operator_id = lo.id
      JOIN members m ON lo.member_id = m.id
      WHERE s.id = season_id
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "League operators can update their league matches"
  ON matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM seasons s
      JOIN leagues l ON s.league_id = l.id
      JOIN league_operators lo ON l.operator_id = lo.id
      JOIN members m ON lo.member_id = m.id
      WHERE s.id = season_id
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "League operators can delete their league matches"
  ON matches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM seasons s
      JOIN leagues l ON s.league_id = l.id
      JOIN league_operators lo ON l.operator_id = lo.id
      JOIN members m ON lo.member_id = m.id
      WHERE s.id = season_id
      AND m.user_id = auth.uid()
    )
  );

-- =====================================================
-- ADDITIONAL RLS POLICIES (require other tables to exist)
-- =====================================================

-- Members: Allow operators to view members in same state (for captain selection)
-- NOTE: This policy is disabled to avoid infinite recursion
-- TODO: Implement this functionality using a different approach (e.g., application-level filtering)
-- CREATE POLICY "Operators can view members in same state"
--   ON members FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM league_operators
--       WHERE league_operators.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
--       AND (SELECT state FROM members WHERE id = league_operators.member_id LIMIT 1) = members.state
--     )
--   );

-- =====================================================
-- REBUILD COMPLETE
-- =====================================================
-- All tables have been recreated with correct structure
-- You can now register users, create operators, and set up leagues
-- =====================================================
