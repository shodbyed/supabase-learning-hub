-- =====================================================
-- MATCHES TABLE
-- =====================================================
-- Stores individual match/game records for each week
-- Links teams, venues, and season weeks
-- Tracks scores and match status
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

-- =====================================================
-- INDEXES
-- =====================================================

-- Find all matches for a season
CREATE INDEX IF NOT EXISTS idx_matches_season_id ON public.matches(season_id);

-- Find all matches for a specific week
CREATE INDEX IF NOT EXISTS idx_matches_season_week_id ON public.matches(season_week_id);

-- Find all matches for a team
CREATE INDEX IF NOT EXISTS idx_matches_home_team_id ON public.matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team_id ON public.matches(away_team_id);

-- Find matches by status (e.g., in_progress for scorekeeping)
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);

-- Find matches at a venue
CREATE INDEX IF NOT EXISTS idx_matches_scheduled_venue_id ON public.matches(scheduled_venue_id);
CREATE INDEX IF NOT EXISTS idx_matches_actual_venue_id ON public.matches(actual_venue_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION update_matches_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Anyone can view matches (public schedule info)
CREATE POLICY "Matches are viewable by everyone"
  ON public.matches
  FOR SELECT
  USING (true);

-- League operators can insert matches (schedule generation)
CREATE POLICY "League operators can insert matches"
  ON public.matches
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.seasons s
      JOIN public.leagues l ON s.league_id = l.id
      JOIN public.league_operators lo ON l.operator_id = lo.id
      JOIN public.members m ON lo.member_id = m.id
      WHERE s.id = season_id
      AND m.user_id = auth.uid()
    )
  );

-- League operators can update matches (reschedule, score entry)
CREATE POLICY "League operators can update their league matches"
  ON public.matches
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.seasons s
      JOIN public.leagues l ON s.league_id = l.id
      JOIN public.league_operators lo ON l.operator_id = lo.id
      JOIN public.members m ON lo.member_id = m.id
      WHERE s.id = season_id
      AND m.user_id = auth.uid()
    )
  );

-- League operators can delete matches (reschedule, regenerate)
CREATE POLICY "League operators can delete their league matches"
  ON public.matches
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.seasons s
      JOIN public.leagues l ON s.league_id = l.id
      JOIN public.league_operators lo ON l.operator_id = lo.id
      JOIN public.members m ON lo.member_id = m.id
      WHERE s.id = season_id
      AND m.user_id = auth.uid()
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.matches IS 'Individual matches between teams for each week of the season';
COMMENT ON COLUMN public.matches.match_number IS 'Order of match on the night (1, 2, 3...) for scheduling table assignments';
COMMENT ON COLUMN public.matches.scheduled_venue_id IS 'Originally scheduled venue (usually home team venue)';
COMMENT ON COLUMN public.matches.actual_venue_id IS 'Actual venue if different from scheduled (e.g., venue conflict)';
COMMENT ON COLUMN public.matches.status IS 'Match status: scheduled, in_progress, completed, forfeited, postponed';
