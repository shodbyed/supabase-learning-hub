/**
 * @fileoverview Match Verification Columns Migration
 *
 * Adds columns to track which team members verified match scores.
 * This enables end-of-match verification flow where both teams must
 * confirm final scores before the match is officially complete.
 *
 * Changes:
 * - home_team_verified_by: UUID of member who verified for home team
 * - away_team_verified_by: UUID of member who verified for away team
 * - match_status: Updated constraint to include 'awaiting_verification'
 *
 * Usage: Run this SQL in Supabase SQL Editor
 */

-- Add verification columns to matches table
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS home_team_verified_by UUID REFERENCES public.members(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS away_team_verified_by UUID REFERENCES public.members(id) ON DELETE SET NULL;

-- Update match_status constraint to include awaiting_verification
ALTER TABLE public.matches
DROP CONSTRAINT IF EXISTS matches_status_check;

ALTER TABLE public.matches
ADD CONSTRAINT matches_status_check
CHECK (status IN ('scheduled', 'in_progress', 'awaiting_verification', 'completed', 'forfeited', 'postponed'));

-- Add comments for documentation
COMMENT ON COLUMN public.matches.home_team_verified_by IS 'Member ID of home team player who verified final scores';
COMMENT ON COLUMN public.matches.away_team_verified_by IS 'Member ID of away team player who verified final scores';
COMMENT ON CONSTRAINT matches_status_check ON public.matches IS 'Match status lifecycle: scheduled → in_progress → awaiting_verification → completed';
