-- ============================================================================
-- PLAYOFF CONFIGURATIONS MIGRATION
-- ============================================================================
--
-- Creates the playoff_configurations table for storing playoff bracket
-- configurations at three levels: global, organization, and league.
--
-- Global templates are system-provided (read-only for operators).
-- Organization configs serve as defaults for all leagues in that org.
-- League configs override organization settings for specific leagues.
--
-- Key design decisions:
-- 1. entity_type + entity_id pattern (like preferences table)
-- 2. Global uses nil UUID '00000000-0000-0000-0000-000000000000'
-- 3. Stores SETTINGS, not actual matchups
-- 4. week_matchup_styles array stores template names per week
--
-- The matchup generation logic lives in usePlayoffSettingsReducer.ts:
--   generateMatchupPairs(bracketSize, style) → Array<[homeSeed, awaySeed]>
--
-- ============================================================================

CREATE TABLE IF NOT EXISTS playoff_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- === Entity Ownership ===
    -- Determines the scope/level of this configuration
    entity_type TEXT NOT NULL CHECK (entity_type IN ('global', 'organization', 'league')),

    -- The entity this configuration belongs to:
    -- - global: '00000000-0000-0000-0000-000000000000' (nil UUID)
    -- - organization: the organization's UUID
    -- - league: the league's UUID
    entity_id UUID NOT NULL,

    -- === Configuration Metadata ===
    name TEXT NOT NULL,                          -- e.g., "Standard Single Elimination", "Double Elimination"
    description TEXT,                            -- Optional description of what this configuration does

    -- Is this the default config for this entity?
    -- For global: marks the recommended default template
    -- For organization: the org's default for new leagues
    -- For league: not used (league only has one config)
    is_default BOOLEAN DEFAULT false,

    -- === Qualification Settings ===
    -- These determine how many teams make it into the bracket

    qualification_type TEXT NOT NULL DEFAULT 'all'
        CHECK (qualification_type IN ('all', 'fixed', 'percentage')),

    -- For 'fixed' type: exactly this many teams qualify
    fixed_team_count INTEGER DEFAULT 4 CHECK (fixed_team_count >= 2),

    -- For 'percentage' type: this percentage of teams qualify
    qualifying_percentage INTEGER DEFAULT 50 CHECK (qualifying_percentage BETWEEN 1 AND 100),
    percentage_min INTEGER DEFAULT 4 CHECK (percentage_min >= 2),  -- Minimum teams even if % is lower
    percentage_max INTEGER DEFAULT NULL,                           -- Maximum cap (NULL = no limit)

    -- === Playoff Structure ===

    playoff_weeks INTEGER NOT NULL DEFAULT 1 CHECK (playoff_weeks >= 1),

    -- Matchup style for each week (array index = week number - 1)
    -- Valid values: 'seeded', 'ranked', 'random', 'bracket'
    -- Week 1 typically 'seeded', subsequent weeks typically 'bracket'
    week_matchup_styles TEXT[] NOT NULL DEFAULT ARRAY['seeded']::TEXT[],

    -- Wildcard spots replace the last N bracket positions with random selection
    -- 0 = disabled, all spots determined by standings
    wildcard_spots INTEGER NOT NULL DEFAULT 0 CHECK (wildcard_spots >= 0),

    -- Payment method for additional playoff weeks
    payment_method TEXT NOT NULL DEFAULT 'automatic'
        CHECK (payment_method IN ('automatic', 'manual')),

    -- === Generation Control ===

    -- When true: System automatically creates playoff matches when regular season ends
    -- When false: Operator must manually trigger playoff generation from the league page
    -- Defaults to false so new operators can verify the system works as expected first
    auto_generate BOOLEAN NOT NULL DEFAULT false,

    -- === Timestamps ===
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- === Constraints ===
    -- Ensure global records use the nil UUID
    CONSTRAINT valid_global_entity CHECK (
        (entity_type = 'global' AND entity_id = '00000000-0000-0000-0000-000000000000') OR
        (entity_type != 'global' AND entity_id != '00000000-0000-0000-0000-000000000000')
    ),

    -- Each entity can only have one config with a given name
    CONSTRAINT unique_entity_config_name UNIQUE (entity_type, entity_id, name)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Fast lookup by entity
CREATE INDEX IF NOT EXISTS idx_playoff_configurations_entity
    ON playoff_configurations(entity_type, entity_id);

-- Find global templates quickly
CREATE INDEX IF NOT EXISTS idx_playoff_configurations_global
    ON playoff_configurations(entity_type)
    WHERE entity_type = 'global';

-- Find default config for an entity
CREATE INDEX IF NOT EXISTS idx_playoff_configurations_default
    ON playoff_configurations(entity_type, entity_id)
    WHERE is_default = true;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_playoff_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_playoff_configurations_updated_at
    BEFORE UPDATE ON playoff_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_playoff_configurations_updated_at();

-- Ensure only one default per entity
CREATE OR REPLACE FUNCTION ensure_single_default_playoff_config()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE playoff_configurations
        SET is_default = false
        WHERE entity_type = NEW.entity_type
          AND entity_id = NEW.entity_id
          AND id != NEW.id
          AND is_default = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default_playoff_config
    BEFORE INSERT OR UPDATE ON playoff_configurations
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_playoff_config();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- RLS policies intentionally left blank for development speed.
-- TODO: Add proper policies before production deployment.

ALTER TABLE playoff_configurations ENABLE ROW LEVEL SECURITY;

-- Allow all operations during development
CREATE POLICY "Dev: Allow all operations"
    ON playoff_configurations
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE playoff_configurations IS
    'Stores playoff bracket configurations at three levels: global (system templates), organization (org defaults), and league (overrides).';

COMMENT ON COLUMN playoff_configurations.entity_type IS
    'Level of this config: global (system template), organization (org default), or league (override)';

COMMENT ON COLUMN playoff_configurations.entity_id IS
    'UUID of the entity. For global: nil UUID (00000000-0000-0000-0000-000000000000). For org/league: their respective UUIDs.';

COMMENT ON COLUMN playoff_configurations.name IS
    'Display name for this configuration (required). Used in template picker menus.';

COMMENT ON COLUMN playoff_configurations.description IS
    'Optional description explaining what this configuration does. Helpful for operators choosing templates.';

COMMENT ON COLUMN playoff_configurations.qualification_type IS
    'How teams qualify: all (everyone plays), fixed (specific count), percentage (% of league)';

COMMENT ON COLUMN playoff_configurations.week_matchup_styles IS
    'Array of matchup styles per week. Values: seeded (1v8,2v7), ranked (1v2,3v4), random, bracket (winner vs winner)';

COMMENT ON COLUMN playoff_configurations.wildcard_spots IS
    'Number of bracket spots filled by random selection from non-qualifying teams. 0 = disabled.';

COMMENT ON COLUMN playoff_configurations.payment_method IS
    'How additional playoff week fees are handled: automatic (system charges) or manual (operator collects)';

COMMENT ON COLUMN playoff_configurations.auto_generate IS
    'When true, playoff matches are created automatically when regular season ends. When false, operator must manually trigger from league page.';

-- ============================================================================
-- SEED DATA: Global Templates
-- ============================================================================

INSERT INTO playoff_configurations (
    entity_type,
    entity_id,
    name,
    description,
    is_default,
    qualification_type,
    fixed_team_count,
    playoff_weeks,
    week_matchup_styles,
    wildcard_spots,
    auto_generate
) VALUES
-- 1. Money Round (default global template)
(
    'global',
    '00000000-0000-0000-0000-000000000000',
    'Money Round',
    'Standard single last round. Best used for in-house (single venue) leagues to gather all teams for prize pool winner presentations. Can put a small prize on each table giving all teams a chance at some winnings.',
    true,
    'all',
    NULL,
    1,
    ARRAY['seeded']::TEXT[],
    0,
    false
),
-- 2. Money Round (Wildcard)
(
    'global',
    '00000000-0000-0000-0000-000000000000',
    'Money Round (Wildcard)',
    'Standard single last round with odd number of teams. Wildcard allows last place team a chance to play. Best used for in-house (single venue) leagues to gather all teams for prize pool winner presentations. Can put a small prize on each table giving all teams a chance at some winnings.',
    false,
    'all',
    NULL,
    1,
    ARRAY['seeded']::TEXT[],
    1,
    false
),
-- 3. Standard Playoffs (Wildcard)
(
    'global',
    '00000000-0000-0000-0000-000000000000',
    'Standard Playoffs (Wildcard)',
    'Standard semi-finals style to determine 1st-4th place for prize pool determinations. 1st vs wildcard and 2nd vs 3rd in first round. Winners vs winners, losers vs losers in second round. Wildcard is randomly picked team from teams not in top 3.',
    false,
    'fixed',
    4,
    2,
    ARRAY['seeded', 'bracket']::TEXT[],
    1,
    false
),
-- 4. Standard Playoffs
(
    'global',
    '00000000-0000-0000-0000-000000000000',
    'Standard Playoffs',
    'Standard semi-finals style to determine 1st-4th place for prize pool determinations. 1st vs 4th and 2nd vs 3rd in first round. Winners vs winners, losers vs losers in second round. Only top 4 teams play.',
    false,
    'fixed',
    4,
    2,
    ARRAY['seeded', 'bracket']::TEXT[],
    0,
    false
);

-- ============================================================================
-- RESOLVED PLAYOFF CONFIGURATION VIEW
-- ============================================================================
-- For each league, returns the effective playoff configuration using priority:
-- 1. League-specific config (if exists and is_default = true)
-- 2. Organization default config (if exists and is_default = true)
-- 3. Global default config (fallback)
--
-- Unlike preferences (which merge individual columns), this returns ONE complete
-- configuration record. Playoff settings are interdependent and used as a unit.
-- ============================================================================

CREATE OR REPLACE VIEW resolved_league_playoff_config AS
SELECT
    l.id AS league_id,
    l.organization_id,
    -- Include source info so UI can show "Using: Organization Default" or "Using: League Custom"
    CASE
        WHEN league_config.id IS NOT NULL THEN 'league'
        WHEN org_config.id IS NOT NULL THEN 'organization'
        ELSE 'global'
    END AS config_source,
    -- Return the effective configuration (coalesce picks first non-null)
    COALESCE(league_config.id, org_config.id, global_config.id) AS config_id,
    COALESCE(league_config.name, org_config.name, global_config.name) AS name,
    COALESCE(league_config.description, org_config.description, global_config.description) AS description,
    COALESCE(league_config.qualification_type, org_config.qualification_type, global_config.qualification_type) AS qualification_type,
    COALESCE(league_config.fixed_team_count, org_config.fixed_team_count, global_config.fixed_team_count) AS fixed_team_count,
    COALESCE(league_config.qualifying_percentage, org_config.qualifying_percentage, global_config.qualifying_percentage) AS qualifying_percentage,
    COALESCE(league_config.percentage_min, org_config.percentage_min, global_config.percentage_min) AS percentage_min,
    COALESCE(league_config.percentage_max, org_config.percentage_max, global_config.percentage_max) AS percentage_max,
    COALESCE(league_config.playoff_weeks, org_config.playoff_weeks, global_config.playoff_weeks) AS playoff_weeks,
    COALESCE(league_config.week_matchup_styles, org_config.week_matchup_styles, global_config.week_matchup_styles) AS week_matchup_styles,
    COALESCE(league_config.wildcard_spots, org_config.wildcard_spots, global_config.wildcard_spots) AS wildcard_spots,
    COALESCE(league_config.payment_method, org_config.payment_method, global_config.payment_method) AS payment_method,
    COALESCE(league_config.auto_generate, org_config.auto_generate, global_config.auto_generate) AS auto_generate
FROM leagues l
-- League-specific config (entity_type = 'league', entity_id = league.id)
LEFT JOIN playoff_configurations league_config
    ON league_config.entity_type = 'league'
    AND league_config.entity_id = l.id
    AND league_config.is_default = true
-- Organization default config (entity_type = 'organization', entity_id = org.id)
LEFT JOIN playoff_configurations org_config
    ON org_config.entity_type = 'organization'
    AND org_config.entity_id = l.organization_id
    AND org_config.is_default = true
-- Global default config (entity_type = 'global', is_default = true)
LEFT JOIN playoff_configurations global_config
    ON global_config.entity_type = 'global'
    AND global_config.entity_id = '00000000-0000-0000-0000-000000000000'
    AND global_config.is_default = true;

COMMENT ON VIEW resolved_league_playoff_config IS
    'Returns the effective playoff configuration for each league. Priority: league config → org default → global default. Returns complete configuration record, not merged columns.';
