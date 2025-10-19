-- Add championship preference columns to league_operators table
-- This allows operators to save their preferred championship dates
-- so they don't have to re-enter them for every season

-- Add columns for BCA championship preference
ALTER TABLE public.league_operators
ADD COLUMN IF NOT EXISTS preferred_bca_championship_id UUID REFERENCES public.championship_date_options(id) ON DELETE SET NULL;

-- Add columns for APA championship preference
ALTER TABLE public.league_operators
ADD COLUMN IF NOT EXISTS preferred_apa_championship_id UUID REFERENCES public.championship_date_options(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_league_operators_preferred_bca
  ON public.league_operators(preferred_bca_championship_id);

CREATE INDEX IF NOT EXISTS idx_league_operators_preferred_apa
  ON public.league_operators(preferred_apa_championship_id);

-- Comments
COMMENT ON COLUMN public.league_operators.preferred_bca_championship_id IS 'Operator preferred BCA championship dates - auto-selected for future seasons if dates are still valid';
COMMENT ON COLUMN public.league_operators.preferred_apa_championship_id IS 'Operator preferred APA championship dates - auto-selected for future seasons if dates are still valid';
