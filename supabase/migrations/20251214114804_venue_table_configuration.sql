/**
 * Migration: Venue Table Numbers as Arrays
 *
 * Simplifies table storage by using arrays of table numbers per size.
 * The array length provides the count, and values provide the table numbers.
 *
 * Example:
 *   bar_box_table_numbers = [1, 2, 3]      -- 3 bar box tables numbered 1, 2, 3
 *   eight_foot_table_numbers = [4, 5]      -- 2 eight foot tables numbered 4, 5
 *   regulation_table_numbers = [6, 7, 8]   -- 3 regulation tables numbered 6, 7, 8
 */

-- =============================================================================
-- VENUES TABLE: Add array columns for table numbers
-- =============================================================================

-- Add array columns for table numbers by size
ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS bar_box_table_numbers integer[] DEFAULT '{}';

ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS eight_foot_table_numbers integer[] DEFAULT '{}';

ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS regulation_table_numbers integer[] DEFAULT '{}';

-- Add comments explaining the columns
COMMENT ON COLUMN public.venues.bar_box_table_numbers IS
'Array of table numbers for 7-foot (bar box) tables. Example: {1, 2, 3}. Array length = count.';

COMMENT ON COLUMN public.venues.eight_foot_table_numbers IS
'Array of table numbers for 8-foot tables. Example: {4, 5}. Array length = count.';

COMMENT ON COLUMN public.venues.regulation_table_numbers IS
'Array of table numbers for 9-foot (regulation) tables. Example: {6, 7, 8}. Array length = count.';

-- =============================================================================
-- LEAGUE_VENUES TABLE: Add available table numbers array
-- =============================================================================

-- Add available_table_numbers array column if not exists
ALTER TABLE public.league_venues
ADD COLUMN IF NOT EXISTS available_table_numbers integer[] DEFAULT '{}';

-- Add capacity column for max home teams
ALTER TABLE public.league_venues
ADD COLUMN IF NOT EXISTS capacity integer;

-- Add comments explaining the columns
COMMENT ON COLUMN public.league_venues.available_table_numbers IS
'Array of table numbers from the venue that are available for this league. Example: {1, 2, 5, 6}. The table sizes are determined by the venue table number arrays.';

COMMENT ON COLUMN public.league_venues.capacity IS
'Maximum number of home teams that can use this venue. Can be set lower than the number of available tables. Used to limit team assignment to venues. NULL means unlimited (defaults to available table count).';

-- =============================================================================
-- INDEXES for array operations
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_venues_bar_box_table_numbers ON public.venues USING gin (bar_box_table_numbers);
CREATE INDEX IF NOT EXISTS idx_venues_eight_foot_table_numbers ON public.venues USING gin (eight_foot_table_numbers);
CREATE INDEX IF NOT EXISTS idx_venues_regulation_table_numbers ON public.venues USING gin (regulation_table_numbers);
CREATE INDEX IF NOT EXISTS idx_league_venues_available_table_numbers ON public.league_venues USING gin (available_table_numbers);

-- =============================================================================
-- LEAGUE_VENUES TABLE: Remove legacy constraints
-- =============================================================================
-- The old system required available_bar_box_tables and available_regulation_tables
-- to calculate available_total_tables. Now we use available_table_numbers array
-- instead, so we remove these constraints and make the legacy columns optional.

-- Drop the constraint that requires at least one table (based on computed column)
ALTER TABLE public.league_venues
DROP CONSTRAINT IF EXISTS league_venue_must_have_tables;

-- Drop the check constraints on legacy columns
ALTER TABLE public.league_venues
DROP CONSTRAINT IF EXISTS league_venues_available_bar_box_tables_check;

ALTER TABLE public.league_venues
DROP CONSTRAINT IF EXISTS league_venues_available_regulation_tables_check;

-- Make legacy columns nullable with defaults (so they can be ignored)
ALTER TABLE public.league_venues
ALTER COLUMN available_bar_box_tables DROP NOT NULL,
ALTER COLUMN available_bar_box_tables SET DEFAULT 0;

ALTER TABLE public.league_venues
ALTER COLUMN available_regulation_tables DROP NOT NULL,
ALTER COLUMN available_regulation_tables SET DEFAULT 0;

-- Add comment explaining the new structure
COMMENT ON TABLE public.league_venues IS
'League-venue relationships. Uses available_table_numbers array as source of truth for which tables are available. Legacy columns (available_bar_box_tables, available_regulation_tables, available_total_tables) are kept for backwards compatibility but ignored.';
