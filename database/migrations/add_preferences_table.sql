-- Migration: Add preferences table for organization and league settings
-- Created: 2025-11-24
-- Purpose: Single flexible table to store both organization defaults and league-specific overrides
--
-- Design Pattern:
-- - One row per organization (entity_type='organization', entity_id=operator_id)
-- - One row per league with custom settings (entity_type='league', entity_id=league_id)
-- - Leagues inherit organization defaults for any NULL columns
-- - System defaults used if both organization and league are NULL

-- Create preferences table
CREATE TABLE IF NOT EXISTS preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('organization', 'league')),
  entity_id UUID NOT NULL,

  -- Handicap Settings
  handicap_variant TEXT CHECK (handicap_variant IN ('standard', 'reduced', 'none')),
  team_handicap_variant TEXT CHECK (team_handicap_variant IN ('standard', 'reduced', 'none')),
  game_history_limit INTEGER CHECK (game_history_limit >= 50 AND game_history_limit <= 500),

  -- Format Settings
  team_format TEXT CHECK (team_format IN ('5_man', '8_man')),

  -- Match Rules
  golden_break_counts_as_win BOOLEAN,

  -- Future settings can be added as columns here
  -- Examples:
  -- allow_substitute_after_week_n INTEGER,
  -- require_captain_approval_for_scores BOOLEAN,
  -- forfeit_penalty_points INTEGER,
  -- etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one row per entity
  UNIQUE(entity_type, entity_id)
);

-- Add indexes for fast lookups
CREATE INDEX idx_preferences_entity ON preferences(entity_type, entity_id);
CREATE INDEX idx_preferences_organization ON preferences(entity_type, entity_id) WHERE entity_type = 'organization';
CREATE INDEX idx_preferences_league ON preferences(entity_type, entity_id) WHERE entity_type = 'league';

-- Add comments
COMMENT ON TABLE preferences IS 'Stores both organization-level defaults and league-level overrides. NULL values cascade to next level (league → organization → system default).';
COMMENT ON COLUMN preferences.entity_type IS 'Type of entity: organization (defaults for all leagues) or league (overrides for specific league)';
COMMENT ON COLUMN preferences.entity_id IS 'ID of the entity: operator_id for organization, league_id for league';
COMMENT ON COLUMN preferences.handicap_variant IS 'Player handicap calculation method. NULL = use next level default';
COMMENT ON COLUMN preferences.team_handicap_variant IS 'Team bonus calculation method. NULL = use next level default';
COMMENT ON COLUMN preferences.game_history_limit IS 'Number of recent games for handicap calculation. NULL = use next level default (system default: 200)';
COMMENT ON COLUMN preferences.team_format IS 'Default team format for new leagues. NULL = use next level default (system default: 5_man)';
COMMENT ON COLUMN preferences.golden_break_counts_as_win IS 'Whether golden breaks count as wins. NULL = use next level default (system default: true)';

-- Create trigger to automatically create organization preferences when operator is created
CREATE OR REPLACE FUNCTION create_default_org_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO preferences (entity_type, entity_id)
  VALUES ('organization', NEW.id)
  ON CONFLICT (entity_type, entity_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_org_preferences
  AFTER INSERT ON league_operators
  FOR EACH ROW
  EXECUTE FUNCTION create_default_org_preferences();

-- Backfill organization preferences for existing operators
INSERT INTO preferences (entity_type, entity_id)
SELECT 'organization', id FROM league_operators
ON CONFLICT (entity_type, entity_id) DO NOTHING;

-- Create trigger to automatically create league preferences when league is created
-- Creates empty preference row (NULLs) - only populated when league wants to override org defaults
CREATE OR REPLACE FUNCTION create_default_league_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO preferences (entity_type, entity_id)
  VALUES ('league', NEW.id)
  ON CONFLICT (entity_type, entity_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_league_preferences
  AFTER INSERT ON leagues
  FOR EACH ROW
  EXECUTE FUNCTION create_default_league_preferences();

-- Backfill league preferences for existing leagues
-- Creates empty rows (NULLs) - leagues use values from leagues table, not preferences
INSERT INTO preferences (entity_type, entity_id)
SELECT 'league', id FROM leagues
ON CONFLICT (entity_type, entity_id) DO NOTHING;

-- Create helper view for resolved league settings (with fallback chain)
CREATE OR REPLACE VIEW resolved_league_preferences AS
SELECT
  l.id as league_id,
  l.operator_id,

  -- Handicap settings with fallback chain: league → org → system default
  COALESCE(league_prefs.handicap_variant, org_prefs.handicap_variant, l.handicap_variant, 'standard') as handicap_variant,
  COALESCE(league_prefs.team_handicap_variant, org_prefs.team_handicap_variant, org_prefs.handicap_variant, l.handicap_variant, 'standard') as team_handicap_variant,
  COALESCE(league_prefs.game_history_limit, org_prefs.game_history_limit, 200) as game_history_limit,

  -- Format settings
  COALESCE(league_prefs.team_format, org_prefs.team_format, l.team_format) as team_format,

  -- Match rules
  COALESCE(league_prefs.golden_break_counts_as_win, org_prefs.golden_break_counts_as_win, l.golden_break_counts_as_win, true) as golden_break_counts_as_win

FROM leagues l
LEFT JOIN preferences org_prefs
  ON org_prefs.entity_type = 'organization'
  AND org_prefs.entity_id = l.operator_id
LEFT JOIN preferences league_prefs
  ON league_prefs.entity_type = 'league'
  AND league_prefs.entity_id = l.id;

COMMENT ON VIEW resolved_league_preferences IS 'Convenience view showing final resolved preferences for each league with full fallback chain applied.';
